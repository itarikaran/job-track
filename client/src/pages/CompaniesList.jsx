import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { companyService } from "../services/companyService";
import { ConfirmDialog } from "../components/ui/ConfirmDialog";
import { Toast } from "../components/ui/Toast";
import { districts } from "../constants/districts";

const COMPANY_TYPES = [
  "Product",
  "Service",
  "Consulting",
  "Startup",
  "MNC",
  "Other",
];

export default function CompaniesList() {
  const navigate = useNavigate();
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState(null);

  // Filters
  const [filters, setFilters] = useState({
    search: "",
    district: "",
    address: "",
    companyType: "",
    page: 1,
    limit: 10,
    sort: "createdAt",
    order: "desc",
  });

  // Pagination state
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(0);

  // Delete confirmation
  const [deleteId, setDeleteId] = useState(null);
  const fetchCompanies = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await companyService.getCompanies({
        search: filters.search || undefined,
        district: filters.district || undefined,
        address: filters.address || undefined,
        companyType: filters.companyType || undefined,
        page: filters.page,
        limit: filters.limit,
        sort: filters.sort,
        order: filters.order,
      });
      setCompanies(response.data || []);
      setTotal(response.total || 0);
      setPages(response.pages || 0);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load companies");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompanies();
  }, [filters]);

  const handleDelete = (id) => {
    setDeleteId(id);
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    try {
      await companyService.deleteCompany(deleteId);
      setToast({ type: "success", message: "Company deleted successfully" });
      setDeleteId(null);
      fetchCompanies();
    } catch (err) {
      setToast({
        type: "error",
        message: err.response?.data?.message || "Failed to delete company",
      });
      setDeleteId(null);
    }
  };

  const handleSort = (field) => {
    if (filters.sort === field) {
      setFilters((prev) => ({ ...prev, order: prev.order === "asc" ? "desc" : "asc" }));
    } else {
      setFilters((prev) => ({ ...prev, sort: field, order: "desc" }));
    }
  };

  const handlePageChange = (page) => {
    setFilters((prev) => ({ ...prev, page }));
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-600">Loading companies...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Toast toast={toast} onRemove={() => setToast(null)} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {error && (
          <div className="mb-6 rounded border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Companies</h1>
            <p className="text-slate-600">
              Manage your company records. Track applications by district.
            </p>
          </div>
          <Link to="/companies/create">
            <button className="px-4 py-2 bg-indigo-600 text-white font-medium rounded hover:bg-indigo-700 transition-colors flex items-center gap-2">
              <span>+</span> Add Company
            </button>
          </Link>
        </div>
        <div className="bg-white p-6 rounded-lg shadow mb-6 border border-slate-200">
          <div className="flex flex-col md:flex-row gap-4 items-end">
            <div className="flex-1 min-w-[200px]">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Search by Name or Address
              </label>
              <input
                type="text"
                value={filters.search}
                onChange={(e) =>
                  setFilters({ ...filters, search: e.target.value, page: 1 })
                }
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                placeholder="Search company name or address..."
              />
            </div>
            <div className="flex-1 min-w-[200px]">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Address
              </label>
              <input
                type="text"
                value={filters.address}
                onChange={(e) =>
                  setFilters({ ...filters, address: e.target.value, page: 1 })
                }
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                placeholder="Filter by address..."
              />
            </div>
            <div className="flex-1 min-w-[200px]">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                District
              </label>
              <select
                value={filters.district}
                onChange={(e) =>
                  setFilters({ ...filters, district: e.target.value, page: 1 })
                }
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white"
              >
                <option value="">All Districts</option>
                {districts.map((district) => (
                  <option key={district} value={district}>{district}</option>
                ))}
              </select>
            </div>
            <div className="flex-1 min-w-[200px]">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Company Type
              </label>
              <select
                value={filters.companyType}
                onChange={(e) =>
                  setFilters({
                    ...filters,
                    companyType: e.target.value,
                    page: 1,
                  })
                }
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white"
              >
                <option value="">All Types</option>
                {COMPANY_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
            <button
              onClick={fetchCompanies}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
            >
              Apply Filters
            </button>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow border border-slate-200 overflow-hidden">
          {companies.length === 0 ? (
            <div className="p-8 text-center">
              <h3 className="text-lg font-medium text-slate-900 mb-2">
                No companies found
              </h3>
              <p className="text-slate-600 mb-4">
                {filters.search || filters.district || filters.address || filters.companyType
                  ? "Try adjusting your filters"
                  : "Get started by adding your first company"}
              </p>
              {!filters.search && !filters.district && !filters.address && !filters.companyType && (
                <Link to="/companies/create">
                  <button className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700">
                    Add Company
                  </button>
                </Link>
              )}
            </div>
          ) : (
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th
                    className="px-6 py-3 text-sm font-medium text-slate-600"
                    onClick={() => handleSort("name")}
                    style={{ cursor: "pointer" }}
                  >
                    Company Name{" "}
                    {filters.sort === "name" && (
                      filters.order === "asc" ? " \u25B2" : " \u25BC"
                    )}
                  </th>
                  <th
                    className="px-6 py-3 text-sm font-medium text-slate-600"
                    onClick={() => handleSort("district")}
                    style={{ cursor: "pointer" }}
                  >
                    District{" "}
                    {filters.sort === "district" && (
                      filters.order === "asc" ? " \u25B2" : " \u25BC"
                    )}
                  </th>
                  <th className="px-6 py-3 text-sm font-medium text-slate-600">
                    Contact
                  </th>
                  <th className="px-6 py-3 text-sm font-medium text-slate-600">
                    Type
                  </th>
                  <th className="px-6 py-3 text-sm font-medium text-slate-600">
                    Created
                  </th>
                  <th className="px-6 py-3 text-sm font-medium text-slate-600 text-right">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {companies.map((company) => (
                  <tr key={company._id} className="hover:bg-slate-50">
                    <td className="px-6 py-4">
                      <Link
                        to={`/companies/${company._id}`}
                        className="text-indigo-600 hover:underline font-medium"
                      >
                        {company.name}
                      </Link>
                    </td>
                    <td className="px-6 py-4 text-slate-700">
                      <span className="px-2 py-1 bg-indigo-100 text-indigo-800 text-xs rounded-full">
                        {company.district}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-700">
                      {company.contactPerson ||
                        company.contactNumber ||
                        "—"}
                    </td>
                    <td className="px-6 py-4 text-slate-700 capitalize">
                      {company.companyType}
                    </td>
                    <td className="px-6 py-4 text-slate-700">
                      {new Date(company.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link
                        to={`/companies/${company._id}`}
                        className="text-sm text-indigo-600 hover:underline mr-3"
                      >
                        View
                      </Link>
                      <button
                        onClick={() =>
                          navigate(`/companies/${company._id}/edit`)}
                        className="text-sm text-indigo-600 hover:underline mr-3"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(company._id)}
                        className="text-sm text-red-600 hover:underline"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
        {pages > 1 && (
          <div className="mt-6 flex items-center justify-between">
            <p className="text-sm text-slate-600">
              Page {filters.page} of {pages} ({total} total)
            </p>
            <div className="flex gap-2">
              <button
                onClick={() =>
                  filters.page > 1 && handlePageChange(filters.page - 1)
                }
                disabled={filters.page === 1}
                className="px-3 py-1 border border-slate-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Prev
              </button>
              <button
                onClick={() =>
                  filters.page < pages && handlePageChange(filters.page + 1)
                }
                disabled={filters.page === pages}
                className="px-3 py-1 border border-slate-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      <ConfirmDialog
        isOpen={!!deleteId}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteId(null)}
        title="Delete Company"
        message="Are you sure you want to delete this company? This action cannot be undone."
        confirmText="Delete"
      />
    </div>
  );
}