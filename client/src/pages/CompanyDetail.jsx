import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { companyService } from "../services/companyService";
import { ConfirmDialog } from "../components/ui/ConfirmDialog";
import { Toast } from "../components/ui/Toast";
import { applicationService } from "../services/applicationService";

const fields = [
  ["District", "district"],
  ["Address", "address"],
  ["Additional address", "additionalAddress"],
  ["Website", "website"],
  ["Contact person", "contactPerson"],
  ["Contact number", "contactNumber"],
  ["Email", "email"],
  ["Company type", "companyType"],
];

export default function CompanyDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [toast, setToast] = useState(
    location.state?.toast ? { type: "success", message: location.state.toast } : null
  );
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [applications, setApplications] = useState([]);
  const [applicationTotal, setApplicationTotal] = useState(0);
  const [applicationsLoading, setApplicationsLoading] = useState(true);
  const [applicationsError, setApplicationsError] = useState("");

  useEffect(() => {
    companyService
      .getCompany(id)
      .then((response) => setCompany(response.data))
      .catch((err) => setError(err.response?.data?.message || "Unable to load company"))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    applicationService
      .getApplications({ companyId: id, limit: 100, sort: "appliedDate", order: "desc" })
      .then((response) => {
        setApplications(response.data || []);
        setApplicationTotal(response.total || 0);
      })
      .catch((err) => setApplicationsError(err.response?.data?.message || "Unable to load applications"))
      .finally(() => setApplicationsLoading(false));
  }, [id]);

  const deleteCompany = async () => {
    try {
      await companyService.deleteCompany(id);
      navigate("/companies", {
        state: { toast: "Company deleted successfully" },
      });
    } catch (err) {
      setToast({
        type: "error",
        message: err.response?.data?.message || "Unable to delete company",
      });
    } finally {
      setConfirmingDelete(false);
    }
  };

  if (loading) {
    return <div className="flex min-h-screen items-center justify-center bg-slate-50 text-slate-600">Loading company...</div>;
  }
  if (error || !company) {
    return <div className="min-h-screen bg-slate-50 p-6"><p className="mx-auto max-w-3xl rounded border border-red-200 bg-red-50 p-4 text-red-700">{error || "Company not found"}</p></div>;
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-6">
      <Toast toast={toast} onRemove={() => setToast(null)} />
      <div className="mx-auto max-w-4xl">
        <Link to="/companies" className="text-sm font-medium text-indigo-600 hover:underline">← Back to companies</Link>
        <section className="mt-4 rounded-lg border border-slate-200 bg-white p-6 shadow">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
            <div>
              <p className="text-sm font-medium uppercase tracking-wide text-indigo-600">{company.district}</p>
              <h1 className="mt-1 text-2xl font-bold text-slate-900">{company.name}</h1>
            </div>
            <div className="flex flex-wrap gap-2">
              <Link to={`/applications/create?companyId=${id}`} className="rounded bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700">Add Application</Link>
              <Link to={`/companies/${id}/edit`} className="rounded border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">Edit</Link>
              <button onClick={() => setConfirmingDelete(true)} className="rounded bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700">Delete</button>
            </div>
          </div>
          <dl className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2">
            {fields.map(([label, key]) => company[key] && <div key={key}><dt className="text-sm text-slate-500">{label}</dt><dd className="mt-1 text-slate-900">{key === "website" ? <a className="text-indigo-600 hover:underline" href={company[key]} target="_blank" rel="noreferrer">{company[key]}</a> : company[key]}</dd></div>)}
          </dl>
          {company.notes && <div className="mt-8 border-t border-slate-200 pt-6"><h2 className="font-semibold text-slate-900">Notes</h2><p className="mt-2 whitespace-pre-wrap text-slate-700">{company.notes}</p></div>}
          <div className="mt-8 border-t border-slate-200 pt-6"><div className="flex items-center justify-between"><h2 className="font-semibold text-slate-900">Linked job applications ({applicationTotal})</h2><Link to={`/applications/create?companyId=${id}`} className="text-sm font-medium text-indigo-600 hover:underline">Add application</Link></div>{applicationsLoading ? <p className="mt-3 text-sm text-slate-500">Loading applications...</p> : applicationsError ? <p className="mt-3 text-sm text-red-600">{applicationsError}</p> : applications.length === 0 ? <p className="mt-3 text-sm text-slate-500">No applications linked to this company yet.</p> : <div className="mt-3 divide-y divide-slate-200">{applications.map((application) => <Link key={application._id} to={`/applications/${application._id}`} className="flex flex-col gap-1 py-3 hover:bg-slate-50 sm:flex-row sm:items-center sm:justify-between"><span className="font-medium text-slate-900">{application.jobRole}</span><span className="text-sm text-slate-600">{new Date(application.appliedDate).toLocaleDateString()} · <span className="text-indigo-600">{application.status}</span></span></Link>)}</div>}</div>
          <p className="mt-8 text-xs text-slate-500">Created {new Date(company.createdAt).toLocaleString()} · Updated {new Date(company.updatedAt).toLocaleString()}</p>
        </section>
      </div>
      <ConfirmDialog isOpen={confirmingDelete} onConfirm={deleteCompany} onCancel={() => setConfirmingDelete(false)} title="Delete company" message="Are you sure you want to delete this company? This action cannot be undone." confirmText="Delete" />
    </main>
  );
}
