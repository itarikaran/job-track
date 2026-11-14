const Company = require("../models/Company");
const AppError = require("../utils/AppError");
const mongoose = require("mongoose");

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const normalizeCompanyData = (data) =>
  Object.fromEntries(
    Object.entries(data)
      .filter(([key]) =>
        [
          "name",
          "district",
          "address",
          "additionalAddress",
          "website",
          "contactPerson",
          "contactNumber",
          "email",
          "companyType",
          "notes",
        ].includes(key)
      )
      .map(([key, value]) => [
      key,
      typeof value === "string" ? value.trim() : value,
      ])
  );

// Helper: build filter object for user-scoped queries
const buildFilter = (userId, { search, district, address, companyType }) => {
  const filter = { userId };

  if (district) {
    filter.district = { $regex: escapeRegex(district), $options: "i" };
  }

  if (address) {
    filter.$and = [
      ...(filter.$and || []),
      {
        $or: [
          { address: { $regex: escapeRegex(address), $options: "i" } },
          {
            additionalAddress: {
              $regex: escapeRegex(address),
              $options: "i",
            },
          },
        ],
      },
    ];
  }

  if (companyType) {
    filter.companyType = companyType;
  }

  if (search) {
    filter.$or = [
      { name: { $regex: escapeRegex(search), $options: "i" } },
      { district: { $regex: escapeRegex(search), $options: "i" } },
      { address: { $regex: escapeRegex(search), $options: "i" } },
      { additionalAddress: { $regex: escapeRegex(search), $options: "i" } },
    ];
  }

  return filter;
};

// @desc    Get all companies for the authenticated user
// @route   GET /api/companies
// @access  Private
exports.getCompanies = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 10,
      sort = "createdAt",
      order = "desc",
      search,
      district,
      address,
      companyType,
    } = req.query;

    const filter = buildFilter(req.user._id, {
      search,
      district,
      address,
      companyType,
    });

    const allowedSortFields = ["name", "district", "companyType", "createdAt"];
    const sortField = allowedSortFields.includes(sort) ? sort : "createdAt";
    const sortOrder = order === "asc" ? 1 : -1;
    const sortObj = { [sortField]: sortOrder };

    const pageNumber = Math.max(1, Math.min(parseInt(page, 10), 100000));
    const pageSize = Math.min(parseInt(limit, 10), 100);
    const skip = (pageNumber - 1) * pageSize;

    const companies = await Company.find(filter)
      .sort(sortObj)
      .skip(skip)
      .limit(pageSize)
      .lean();

    const total = await Company.countDocuments(filter);

    res.status(200).json({
      success: true,
      count: companies.length,
      total,
      page: pageNumber,
      pages: Math.ceil(total / pageSize),
      data: companies,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get single company by ID
// @route   GET /api/companies/:id
// @access  Private
exports.getCompany = async (req, res, next) => {
  try {
    const company = await Company.findOne({
      _id: req.params.id,
      userId: req.user._id,
    }).lean();

    if (!company) {
      return next(new AppError("Company not found", 404));
    }

    res.status(200).json({
      success: true,
      data: company,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Create a new company
// @route   POST /api/companies
// @access  Private
exports.createCompany = async (req, res, next) => {
  try {
    const companyData = normalizeCompanyData(req.body);
    const { name } = companyData;

    // Duplicate detection: case-insensitive name per user
    const existingCompany = await Company.findOne({
      userId: req.user._id,
      name: { $regex: `^${escapeRegex(name)}$`, $options: "i" },
    });

    if (existingCompany) {
      return next(
        new AppError("A company with this name already exists", 409)
      );
    }

    const company = await Company.create({
      ...companyData,
      userId: req.user._id,
    });

    res.status(201).json({
      success: true,
      data: company,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update a company
// @route   PUT /api/companies/:id
// @access  Private
exports.updateCompany = async (req, res, next) => {
  try {
    const companyData = normalizeCompanyData(req.body);
    const { name } = companyData;

    // Check company exists and belongs to user
    let company = await Company.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!company) {
      return next(new AppError("Company not found", 404));
    }

    // Duplicate detection on name change (case-insensitive, excluding self)
    if (name && name.toLowerCase() !== company.name.toLowerCase()) {
      const existingCompany = await Company.findOne({
        userId: req.user._id,
        _id: { $ne: req.params.id },
        name: { $regex: `^${escapeRegex(name)}$`, $options: "i" },
      });

      if (existingCompany) {
        return next(
          new AppError("A company with this name already exists", 409)
        );
      }
    }

    company = await Company.findByIdAndUpdate(req.params.id, companyData, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      data: company,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete a company
// @route   DELETE /api/companies/:id
// @access  Private
exports.deleteCompany = async (req, res, next) => {
  try {
    const company = await Company.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!company) {
      return next(new AppError("Company not found", 404));
    }

    // The Application model is introduced in Phase 3. Once registered, retain
    // the linked-application guard; until then company deletion remains usable.
    const Application = mongoose.models.Application;
    const linkedApplications = Application
      ? await Application.countDocuments({
          companyId: req.params.id,
          userId: req.user._id,
        })
      : 0;

    if (linkedApplications > 0) {
      return next(
        new AppError(
          "Cannot delete company with linked applications. Remove applications first.",
          409
        )
      );
    }

    await Company.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: "Company deleted successfully",
    });
  } catch (err) {
    next(err);
  }
};