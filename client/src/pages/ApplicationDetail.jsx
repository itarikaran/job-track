import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { applicationService } from "../services/applicationService";
import { ConfirmDialog } from "../components/ui/ConfirmDialog";
import { Toast } from "../components/ui/Toast";

const STATUSES = ["Interested", "Applied", "Assessment", "Shortlisted", "Interview Scheduled", "Interview Completed", "Selected", "Rejected", "Offer Received", "Offer Accepted", "Offer Declined", "Withdrawn"];

export default function ApplicationDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [application, setApplication] = useState(null);
  const [status, setStatus] = useState("");
  const [statusNotes, setStatusNotes] = useState("");
  const [loading, setLoading] = useState(true);
  const [savingStatus, setSavingStatus] = useState(false);
  const [error, setError] = useState("");
  const [toast, setToast] = useState(location.state?.toast ? { type: "success", message: location.state.toast } : null);
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  const loadApplication = () => applicationService.getApplication(id).then((response) => {
    setApplication(response.data);
    setStatus(response.data.status);
  }).catch((err) => setError(err.response?.data?.message || "Unable to load application")).finally(() => setLoading(false));
  useEffect(() => { loadApplication(); }, [id]);

  const saveStatus = async (event) => {
    event.preventDefault();
    setSavingStatus(true);
    try {
      const response = await applicationService.updateStatus(id, { status, notes: statusNotes });
      setApplication(response.data);
      setStatusNotes("");
      setToast({ type: "success", message: "Application status updated" });
    } catch (err) {
      setToast({ type: "error", message: err.response?.data?.message || "Unable to update status" });
    } finally {
      setSavingStatus(false);
    }
  };
  const deleteApplication = async () => {
    try {
      await applicationService.deleteApplication(id);
      navigate("/applications", { state: { toast: "Application deleted successfully" } });
    } catch (err) {
      setToast({ type: "error", message: err.response?.data?.message || "Unable to delete application" });
    } finally {
      setConfirmingDelete(false);
    }
  };

  if (loading) return <div className="flex min-h-screen items-center justify-center bg-slate-50 text-slate-600">Loading application...</div>;
  if (error || !application) return <main className="min-h-screen bg-slate-50 p-6"><div className="mx-auto max-w-3xl rounded border border-red-200 bg-red-50 p-4 text-red-700">{error || "Application not found"}</div></main>;
  return <main className="min-h-screen bg-slate-50 px-4 py-6"><Toast toast={toast} onRemove={() => setToast(null)} /><div className="mx-auto max-w-4xl"><Link to="/applications" className="text-sm font-medium text-indigo-600 hover:underline">← Back to applications</Link>
    <section className="mt-4 rounded-lg border border-slate-200 bg-white p-6 shadow"><div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start"><div><p className="text-sm text-indigo-600">{application.companyId?.district}</p><h1 className="text-2xl font-bold text-slate-900">{application.jobRole}</h1><p className="mt-1 text-slate-600">{application.companyId?.name}</p></div><div className="flex gap-2"><Link to={`/applications/${id}/edit`} className="rounded border border-slate-300 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50">Edit</Link><button onClick={() => setConfirmingDelete(true)} className="rounded bg-red-600 px-4 py-2 text-sm text-white hover:bg-red-700">Delete</button></div></div>
      <dl className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2">{[["Applied date", application.appliedDate], ["Job type", application.jobType], ["Source", application.applicationSource], ["Salary", application.salary], ["Interview date", application.interviewDate], ["Interview mode", application.interviewMode], ["Interview location", application.interviewLocation]].map(([label, value]) => value && <div key={label}><dt className="text-sm text-slate-500">{label}</dt><dd className="mt-1 text-slate-900">{label.toLowerCase().includes("date") ? new Date(value).toLocaleDateString() : value}</dd></div>)}</dl>
      {application.jobDescription && <div className="mt-8 border-t border-slate-200 pt-6"><h2 className="font-semibold text-slate-900">Job description</h2><p className="mt-2 whitespace-pre-wrap text-slate-700">{application.jobDescription}</p></div>}
      {application.notes && <div className="mt-6"><h2 className="font-semibold text-slate-900">Notes</h2><p className="mt-2 whitespace-pre-wrap text-slate-700">{application.notes}</p></div>}
    </section>
    <section className="mt-6 rounded-lg border border-slate-200 bg-white p-6 shadow"><h2 className="text-lg font-semibold text-slate-900">Update status</h2><form onSubmit={saveStatus} className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end"><div className="flex-1"><label className="mb-1 block text-sm text-slate-600" htmlFor="status">Status</label><select id="status" value={status} onChange={(e) => setStatus(e.target.value)} className="w-full rounded border border-slate-300 bg-white px-3 py-2">{STATUSES.map((item) => <option key={item}>{item}</option>)}</select></div><div className="flex-1"><label className="mb-1 block text-sm text-slate-600" htmlFor="statusNotes">Change notes</label><input id="statusNotes" value={statusNotes} onChange={(e) => setStatusNotes(e.target.value)} className="w-full rounded border border-slate-300 px-3 py-2" placeholder="Optional note" /></div><button disabled={savingStatus} className="rounded bg-indigo-600 px-4 py-2 text-white disabled:opacity-50">{savingStatus ? "Saving..." : "Update"}</button></form></section>
    <section className="mt-6 rounded-lg border border-slate-200 bg-white p-6 shadow"><h2 className="text-lg font-semibold text-slate-900">Status history</h2><ol className="mt-5 space-y-5 border-l border-slate-200 pl-5">{[...(application.statusHistory || [])].reverse().map((entry, index) => <li key={`${entry.changedDate}-${index}`} className="relative"><span className="absolute -left-[25px] top-1 h-3 w-3 rounded-full bg-indigo-600" /><p className="font-medium text-slate-900">{entry.newStatus}{entry.previousStatus && <span className="font-normal text-slate-500"> from {entry.previousStatus}</span>}</p><p className="text-xs text-slate-500">{new Date(entry.changedDate).toLocaleString()} · {entry.changedBy?.name || "You"}</p>{entry.notes && <p className="mt-1 text-sm text-slate-600">{entry.notes}</p>}</li>)}</ol></section>
    </div><ConfirmDialog isOpen={confirmingDelete} onConfirm={deleteApplication} onCancel={() => setConfirmingDelete(false)} title="Delete application" message="Are you sure you want to delete this application?" confirmText="Delete" /></main>;
}
