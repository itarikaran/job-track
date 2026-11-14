import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { applicationService } from "../services/applicationService";
import { companyService } from "../services/companyService";
import { ConfirmDialog } from "../components/ui/ConfirmDialog";
import { Toast } from "../components/ui/Toast";
import { districts } from "../constants/districts";

const STATUSES = ["Interested", "Applied", "Assessment", "Shortlisted", "Interview Scheduled", "Interview Completed", "Selected", "Rejected", "Offer Received", "Offer Accepted", "Offer Declined", "Withdrawn"];
const JOB_TYPES = ["Full-time", "Internship", "Contract", "Part-time", "Freelance"];

export default function ApplicationsList() {
  const [applications, setApplications] = useState([]);
  const [filters, setFilters] = useState({ search: "", district: "", companyId: "", status: "", jobType: "", appliedFrom: "", appliedTo: "", page: 1, limit: 10, sort: "appliedDate", order: "desc" });
  const [companies, setCompanies] = useState([]);
  const [pages, setPages] = useState(0);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [toast, setToast] = useState(null);
  const [deleteId, setDeleteId] = useState(null);

  useEffect(() => {
    companyService.getCompanies({ limit: 100, sort: "name", order: "asc" })
      .then((response) => setCompanies(response.data || []))
      .catch((err) => setError(err.response?.data?.message || "Unable to load companies"));
  }, []);

  const loadApplications = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await applicationService.getApplications({
        ...filters,
        search: filters.search || undefined,
        district: filters.district || undefined,
        status: filters.status || undefined,
        jobType: filters.jobType || undefined,
        companyId: filters.companyId || undefined,
        appliedFrom: filters.appliedFrom || undefined,
        appliedTo: filters.appliedTo || undefined,
      });
      setApplications(response.data || []);
      setPages(response.pages || 0);
      setTotal(response.total || 0);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load applications");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadApplications();
  }, [filters]);

  const updateFilter = (key, value) => setFilters((current) => ({ ...current, [key]: value, page: key === "page" ? value : 1 }));
  const sortBy = (field) => setFilters((current) => ({
    ...current,
    sort: field,
    order: current.sort === field && current.order === "asc" ? "desc" : "asc",
  }));
  const deleteApplication = async () => {
    try {
      await applicationService.deleteApplication(deleteId);
      setToast({ type: "success", message: "Application deleted successfully" });
      setDeleteId(null);
      loadApplications();
    } catch (err) {
      setToast({ type: "error", message: err.response?.data?.message || "Unable to delete application" });
    }
  };

  if (loading) return <div className="flex min-h-screen items-center justify-center bg-slate-50 text-slate-600">Loading applications...</div>;
  return (
    <main className="min-h-screen bg-slate-50 px-4 py-6">
      <Toast toast={toast} onRemove={() => setToast(null)} />
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div><h1 className="text-2xl font-bold text-slate-900">Applications</h1><p className="text-slate-600">Track every opportunity across your companies.</p></div>
          <Link to="/applications/create" className="rounded bg-indigo-600 px-4 py-2 text-center font-medium text-white hover:bg-indigo-700">Add Application</Link>
        </div>
        {error && <div className="mb-6 rounded border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>}
        <div className="mb-6 grid grid-cols-1 gap-3 rounded-lg border border-slate-200 bg-white p-5 md:grid-cols-4">
          <input value={filters.search} onChange={(e) => updateFilter("search", e.target.value)} placeholder="Search company or role..." className="rounded border border-slate-300 px-3 py-2" />
          <select value={filters.district} onChange={(e) => updateFilter("district", e.target.value)} className="rounded border border-slate-300 bg-white px-3 py-2"><option value="">All districts</option>{districts.map((district) => <option key={district}>{district}</option>)}</select>
          <select value={filters.companyId} onChange={(e) => updateFilter("companyId", e.target.value)} className="rounded border border-slate-300 bg-white px-3 py-2"><option value="">All companies</option>{companies.map((company) => <option key={company._id} value={company._id}>{company.name}</option>)}</select>
          <select value={filters.status} onChange={(e) => updateFilter("status", e.target.value)} className="rounded border border-slate-300 bg-white px-3 py-2"><option value="">All statuses</option>{STATUSES.map((status) => <option key={status}>{status}</option>)}</select>
          <select value={filters.jobType} onChange={(e) => updateFilter("jobType", e.target.value)} className="rounded border border-slate-300 bg-white px-3 py-2"><option value="">All job types</option>{JOB_TYPES.map((type) => <option key={type}>{type}</option>)}</select>
          <input type="date" value={filters.appliedFrom} onChange={(e) => updateFilter("appliedFrom", e.target.value)} aria-label="Applied from" className="rounded border border-slate-300 px-3 py-2" />
          <input type="date" value={filters.appliedTo} onChange={(e) => updateFilter("appliedTo", e.target.value)} aria-label="Applied to" className="rounded border border-slate-300 px-3 py-2" />
          <button onClick={loadApplications} className="rounded bg-slate-800 px-3 py-2 font-medium text-white hover:bg-slate-700">Refresh</button>
        </div>
        <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow">
          {applications.length === 0 ? <div className="p-10 text-center text-slate-600">No applications found. Add an application from an existing company.</div> : (
            <div className="overflow-x-auto"><table className="w-full text-left"><thead className="bg-slate-50 text-sm text-slate-600"><tr>
              <th className="cursor-pointer px-5 py-3" onClick={() => sortBy("jobRole")}>Job role</th><th className="px-5 py-3">Company</th><th className="px-5 py-3">District</th><th className="cursor-pointer px-5 py-3" onClick={() => sortBy("appliedDate")}>Applied date</th><th className="cursor-pointer px-5 py-3" onClick={() => sortBy("status")}>Status</th><th className="px-5 py-3 text-right">Actions</th>
            </tr></thead><tbody className="divide-y divide-slate-200">{applications.map((application) => <tr key={application._id} className="hover:bg-slate-50">
              <td className="px-5 py-4"><Link to={`/applications/${application._id}`} className="font-medium text-indigo-600 hover:underline">{application.jobRole}</Link></td>
              <td className="px-5 py-4 text-slate-700">{application.companyId?.name || "—"}</td><td className="px-5 py-4 text-slate-700">{application.companyId?.district || "—"}</td><td className="px-5 py-4 text-slate-700">{new Date(application.appliedDate).toLocaleDateString()}</td>
              <td className="px-5 py-4"><span className="rounded-full bg-indigo-100 px-2 py-1 text-xs text-indigo-800">{application.status}</span></td>
              <td className="px-5 py-4 text-right"><Link to={`/applications/${application._id}`} className="mr-3 text-sm text-indigo-600 hover:underline">View</Link><Link to={`/applications/${application._id}/edit`} className="mr-3 text-sm text-indigo-600 hover:underline">Edit</Link><button onClick={() => setDeleteId(application._id)} className="text-sm text-red-600 hover:underline">Delete</button></td>
            </tr>)}</tbody></table></div>
          )}
        </div>
        {pages > 1 && <div className="mt-5 flex items-center justify-between text-sm text-slate-600"><span>Page {filters.page} of {pages} ({total} total)</span><div className="flex gap-2"><button disabled={filters.page === 1} onClick={() => updateFilter("page", filters.page - 1)} className="rounded border px-3 py-1 disabled:opacity-40">Previous</button><button disabled={filters.page === pages} onClick={() => updateFilter("page", filters.page + 1)} className="rounded border px-3 py-1 disabled:opacity-40">Next</button></div></div>}
      </div>
      <ConfirmDialog isOpen={!!deleteId} onConfirm={deleteApplication} onCancel={() => setDeleteId(null)} title="Delete application" message="Are you sure you want to delete this application?" confirmText="Delete" />
    </main>
  );
}
