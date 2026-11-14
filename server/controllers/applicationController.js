const Application = require("../models/Application");
const Company = require("../models/Company");
const AppError = require("../utils/AppError");

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const userCompany = (companyId, userId) =>
  Company.findOne({ _id: companyId, userId }).select("_id name district");

const applicationData = (body) => {
  const allowed = [
    "companyId",
    "jobRole",
    "jobDescription",
    "jobType",
    "appliedDate",
    "applicationSource",
    "salary",
    "interviewDate",
    "interviewMode",
    "interviewLocation",
    "notes",
  ];
  return Object.fromEntries(
    allowed
      .filter((key) => body[key] !== undefined)
      .map((key) => [key, typeof body[key] === "string" ? body[key].trim() : body[key]])
  );
};

const getOwnedApplication = (id, userId) =>
  Application.findOne({ _id: id, userId });

exports.getApplications = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 10,
      sort = "appliedDate",
      order = "desc",
      search,
      district,
      companyId,
      status,
      jobType,
      appliedFrom,
      appliedTo,
    } = req.query;
    const filter = { userId: req.user._id };
    if (companyId) filter.companyId = companyId;
    if (status) filter.status = status;
    if (jobType) filter.jobType = jobType;
    if (appliedFrom || appliedTo) {
      filter.appliedDate = {};
      if (appliedFrom) filter.appliedDate.$gte = new Date(`${appliedFrom}T00:00:00.000Z`);
      if (appliedTo) filter.appliedDate.$lte = new Date(`${appliedTo}T23:59:59.999Z`);
    }
    if (district) {
      const districts = await Company.find({
        userId: req.user._id,
        district: { $regex: escapeRegex(district), $options: "i" },
      }).distinct("_id");
      if (filter.companyId) {
        filter.$and = [{ companyId: filter.companyId }, { companyId: { $in: districts } }];
        delete filter.companyId;
      } else {
        filter.companyId = { $in: districts };
      }
    }
    if (search) {
      const matchingCompanies = await Company.find({
        userId: req.user._id,
        name: { $regex: escapeRegex(search), $options: "i" },
      }).distinct("_id");
      filter.$or = [
        { jobRole: { $regex: escapeRegex(search), $options: "i" } },
        { companyId: { $in: matchingCompanies } },
      ];
    }

    const pageNumber = Math.max(1, Math.min(parseInt(page, 10), 100000));
    const pageSize = Math.min(parseInt(limit, 10), 100);
    const sortField = ["jobRole", "appliedDate", "status", "createdAt", "updatedAt"].includes(sort)
      ? sort
      : "appliedDate";
    const applications = await Application.find(filter)
      .populate({
        path: "companyId",
        select: "name district",
        match: { userId: req.user._id },
      })
      .sort({ [sortField]: order === "asc" ? 1 : -1 })
      .skip((pageNumber - 1) * pageSize)
      .limit(pageSize)
      .lean();
    const total = await Application.countDocuments(filter);

    res.status(200).json({
      success: true,
      count: applications.length,
      total,
      page: pageNumber,
      pages: Math.ceil(total / pageSize),
      data: applications,
    });
  } catch (err) {
    next(err);
  }
};

exports.getApplication = async (req, res, next) => {
  try {
    const application = await getOwnedApplication(req.params.id, req.user._id)
      .populate({
        path: "companyId",
        select: "name district address website",
        match: { userId: req.user._id },
      })
      .populate("statusHistory.changedBy", "name")
      .lean();
    if (!application) return next(new AppError("Application not found", 404));
    res.status(200).json({ success: true, data: application });
  } catch (err) {
    next(err);
  }
};

exports.createApplication = async (req, res, next) => {
  try {
    const company = await userCompany(req.body.companyId, req.user._id);
    if (!company) return next(new AppError("Company not found", 404));
    const data = applicationData(req.body);
    const status = req.body.status || "Interested";
    const application = await Application.create({
      ...data,
      userId: req.user._id,
      status,
      statusHistory: [
        {
          previousStatus: null,
          newStatus: status,
          notes: req.body.statusNotes || "",
          changedBy: req.user._id,
        },
      ],
    });
    await application.populate([
      { path: "companyId", select: "name district" },
      { path: "statusHistory.changedBy", select: "name" },
    ]);
    res.status(201).json({ success: true, data: application });
  } catch (err) {
    next(err);
  }
};

exports.updateApplication = async (req, res, next) => {
  try {
    const application = await getOwnedApplication(req.params.id, req.user._id);
    if (!application) return next(new AppError("Application not found", 404));
    if (req.body.companyId) {
      const company = await userCompany(req.body.companyId, req.user._id);
      if (!company) return next(new AppError("Company not found", 404));
    }
    Object.assign(application, applicationData(req.body));
    await application.save();
    await application.populate([
      { path: "companyId", select: "name district" },
      { path: "statusHistory.changedBy", select: "name" },
    ]);
    res.status(200).json({ success: true, data: application });
  } catch (err) {
    next(err);
  }
};

exports.updateApplicationStatus = async (req, res, next) => {
  try {
    const application = await getOwnedApplication(req.params.id, req.user._id);
    if (!application) return next(new AppError("Application not found", 404));
    if (application.status === req.body.status) {
      return res.status(200).json({ success: true, data: application });
    }
    application.statusHistory.push({
      previousStatus: application.status,
      newStatus: req.body.status,
      notes: req.body.notes || "",
      changedBy: req.user._id,
    });
    application.status = req.body.status;
    await application.save();
    await application.populate([
      { path: "companyId", select: "name district" },
      { path: "statusHistory.changedBy", select: "name" },
    ]);
    res.status(200).json({ success: true, data: application });
  } catch (err) {
    next(err);
  }
};

exports.deleteApplication = async (req, res, next) => {
  try {
    const application = await getOwnedApplication(req.params.id, req.user._id);
    if (!application) return next(new AppError("Application not found", 404));
    await application.deleteOne();
    res.status(200).json({ success: true, message: "Application deleted successfully" });
  } catch (err) {
    next(err);
  }
};
