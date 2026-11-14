const mongoose = require("mongoose");
const Application = require("../models/Application");
const Company = require("../models/Company");

const STATUSES = [
  "Interested",
  "Applied",
  "Assessment",
  "Shortlisted",
  "Interview Scheduled",
  "Interview Completed",
  "Selected",
  "Rejected",
  "Offer Received",
  "Offer Accepted",
  "Offer Declined",
  "Withdrawn",
];
const TERMINAL_STATUSES = [
  "Rejected",
  "Withdrawn",
  "Offer Declined",
  "Offer Accepted",
];

const monthStart = (date) => new Date(date.getFullYear(), date.getMonth(), 1);
const nextMonthStart = (date) => new Date(date.getFullYear(), date.getMonth() + 1, 1);
const monthKey = (date) =>
  `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}`;

const getStatusCounts = async (userId) => {
  const grouped = await Application.aggregate([
    { $match: { userId } },
    { $group: { _id: "$status", count: { $sum: 1 } } },
  ]);
  const counts = Object.fromEntries(STATUSES.map((status) => [status, 0]));
  grouped.forEach(({ _id, count }) => {
    if (_id in counts) counts[_id] = count;
  });
  return counts;
};

exports.getStats = async (req, res, next) => {
  try {
    const now = new Date();
    const start = monthStart(now);
    const end = nextMonthStart(now);
    const userId = new mongoose.Types.ObjectId(req.user._id);
    const [totalCompanies, totalApplications, companiesByDistrict, statusCounts, applicationsThisMonth, interviewsThisMonth, selectionCount, successfulApplications] =
      await Promise.all([
        Company.countDocuments({ userId }),
        Application.countDocuments({ userId }),
        Company.aggregate([
          { $match: { userId } },
          { $group: { _id: "$district", count: { $sum: 1 } } },
          { $project: { _id: 0, district: "$_id", count: 1 } },
          { $sort: { count: -1, district: 1 } },
        ]),
        getStatusCounts(userId),
        Application.countDocuments({ userId, appliedDate: { $gte: start, $lt: end } }),
        Application.countDocuments({ userId, interviewDate: { $gte: start, $lt: end } }),
        Application.countDocuments({ userId, status: "Selected" }),
        Application.countDocuments({
          userId,
          status: { $in: ["Selected", "Offer Received", "Offer Accepted"] },
        }),
      ]);

    res.status(200).json({
      success: true,
      data: {
        companies: { total: totalCompanies, byDistrict: companiesByDistrict },
        applications: {
          total: totalApplications,
          byStatus: statusCounts,
          thisMonth: applicationsThisMonth,
        },
        interviewsThisMonth,
        selectionCount,
        successRate: totalApplications
          ? Number(((successfulApplications / totalApplications) * 100).toFixed(1))
          : 0,
        successRateDefinition:
          "Successful applications are those with status Selected, Offer Received, or Offer Accepted, divided by all applications.",
      },
    });
  } catch (err) {
    next(err);
  }
};

exports.getRecent = async (req, res, next) => {
  try {
    const applications = await Application.find({ userId: req.user._id })
      .sort({ appliedDate: -1, createdAt: -1 })
      .limit(5)
      .populate({
        path: "companyId",
        select: "name district",
        match: { userId: req.user._id },
      })
      .lean();
    res.status(200).json({ success: true, data: applications });
  } catch (err) {
    next(err);
  }
};

exports.getUpcoming = async (req, res, next) => {
  try {
    const applications = await Application.find({
      userId: req.user._id,
      interviewDate: { $gte: new Date() },
      status: { $nin: TERMINAL_STATUSES },
    })
      .sort({ interviewDate: 1 })
      .limit(5)
      .populate({
        path: "companyId",
        select: "name district",
        match: { userId: req.user._id },
      })
      .lean();
    res.status(200).json({ success: true, data: applications });
  } catch (err) {
    next(err);
  }
};

exports.getCharts = async (req, res, next) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user._id);
    const now = new Date();
    const firstMonth = new Date(now.getFullYear(), now.getMonth() - 11, 1);
    const [monthly, statusDistribution, districtDistribution] = await Promise.all([
      Application.aggregate([
        { $match: { userId, appliedDate: { $gte: firstMonth } } },
        {
          $group: {
            _id: {
              $dateToString: { format: "%Y-%m", date: "$appliedDate", timezone: "UTC" },
            },
            count: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]),
      Application.aggregate([
        { $match: { userId } },
        { $group: { _id: "$status", count: { $sum: 1 } } },
        { $project: { _id: 0, status: "$_id", count: 1 } },
      ]),
      Company.aggregate([
        { $match: { userId } },
        { $group: { _id: "$district", count: { $sum: 1 } } },
        { $project: { _id: 0, district: "$_id", count: 1 } },
        { $sort: { count: -1, district: 1 } },
      ]),
    ]);

    const monthlyCounts = Object.fromEntries(monthly.map((item) => [item._id, item.count]));
    const applicationsOverTime = [];
    for (let index = 11; index >= 0; index -= 1) {
      const date = new Date(now.getFullYear(), now.getMonth() - index, 1);
      applicationsOverTime.push({
        month: monthKey(date),
        label: date.toLocaleString("en", { month: "short", year: "numeric" }),
        count: monthlyCounts[monthKey(date)] || 0,
      });
    }

    const statusCounts = Object.fromEntries(STATUSES.map((status) => [status, 0]));
    statusDistribution.forEach(({ status, count }) => {
      if (status in statusCounts) statusCounts[status] = count;
    });

    res.status(200).json({
      success: true,
      data: {
        applicationsOverTime,
        statusDistribution: STATUSES.map((status) => ({
          status,
          count: statusCounts[status],
        })),
        companiesByDistrict: districtDistribution,
      },
    });
  } catch (err) {
    next(err);
  }
};
