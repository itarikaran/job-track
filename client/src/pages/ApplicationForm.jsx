import { useEffect, useState } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { applicationService } from "../services/applicationService";
import { companyService } from "../services/companyService";

const statuses = ["Interested", "Applied", "Assessment", "Shortlisted", "Interview Scheduled", "Interview Completed", "Selected", "Rejected", "Offer Received", "Offer Accepted", "Offer Declined", "Withdrawn"];
const jobTypes = ["Full-time", "Internship", "Contract", "Part-time", "Freelance"];
const sources = ["Company Website", "Naukri", "LinkedIn", "Indeed", "Referral", "Other"];
const modes = ["Online", "In-person", "Phone"];
const blank = { companyId: "", jobRole: "", jobDescription: "", jobType: "Full-time", appliedDate: new Date().toISOString().slice(0, 10), applicationSource: "Other", salary: "", interviewDate: "", interviewMode: "", interviewLocation: "", notes: "" };
const input = "w-full rounded border border-slate-300 px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500";

export default function ApplicationForm() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [values, setValues] = useState({ ...blank, companyId: searchParams.get("companyId") || "" });
  const [companies, setCompanies] = useState([]);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(!!id);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    Promise.all([
      companyService.getCompanies({ limit: 100, sort: "name", order: "asc" }),
      id ? applicationService.getApplication(id) : Promise.resolve(null),
    ]).then(([companyResponse, applicationResponse]) => {
      setCompanies(companyResponse.data || []);
      if (applicationResponse) {
        const application = applicationResponse.data;
        setValues({ ...blank, ...application, companyId: application.companyId?._id || application.companyId, appliedDate: application.appliedDate?.slice(0, 10) || blank.appliedDate, interviewDate: application.interviewDate?.slice(0, 10) || "" });
      }
    }).catch((err) => setServerError(err.response?.data?.message || "Unable to load application form")).finally(() => setLoading(false));
  }, [id, searchParams]);

  const change = ({ target: { name, value } }) => {
    setValues((current) => ({ ...current, [name]: value }));
    setErrors((current) => ({ ...current, [name]: "" }));
  };
  const submit = async (event) => {
    event.preventDefault();
    const nextErrors = {};
    if (!values.companyId) nextErrors.companyId = "Select a company";
    if (!values.jobRole.trim()) nextErrors.jobRole = "Job role is required";
    if (!values.appliedDate) nextErrors.appliedDate = "Applied date is required";
    if (Object.keys(nextErrors).length) { setErrors(nextErrors); return; }
    setSubmitting(true);
    setServerError("");
    try {
      const response = id ? await applicationService.updateApplication(id, values) : await applicationService.createApplication(values);
      navigate(`/applications/${response.data._id}`, { state: { toast: id ? "Application updated successfully" : "Application created successfully" } });
    } catch (err) {
      setServerError(err.response?.data?.message || "Unable to save application");
    } finally {
      setSubmitting(false);
    }
  };
  const field = (label, name, type = "text", extra = {}) => <div><label htmlFor={name} className="mb-1 block text-sm font-medium text-slate-700">{label}</label><input id={name} name={name} type={type} value={values[name] || ""} onChange={change} className={`${input} ${errors[name] ? "border-red-500" : ""}`} {...extra} />{errors[name] && <p className="mt-1 text-xs text-red-600">{errors[name]}</p>}</div>;
  if (loading) return <div className="flex min-h-screen items-center justify-center bg-slate-50 text-slate-600">Loading application...</div>;
  return <main className="min-h-screen bg-slate-50 px-4 py-6"><div className="mx-auto max-w-3xl"><Link to={id ? `/applications/${id}` : "/applications"} className="text-sm font-medium text-indigo-600 hover:underline">← Back</Link><section className="mt-4 rounded-lg border border-slate-200 bg-white p-6 shadow"><h1 className="mb-6 text-2xl font-bold text-slate-900">{id ? "Edit Application" : "Add Application"}</h1>{serverError && <div className="mb-5 rounded border border-red-200 bg-red-50 p-3 text-sm text-red-700">{serverError}</div>}<form onSubmit={submit} className="space-y-5" noValidate>
    <div><label htmlFor="companyId" className="mb-1 block text-sm font-medium text-slate-700">Company <span className="text-red-500">*</span></label><select id="companyId" name="companyId" value={values.companyId} onChange={change} className={`${input} bg-white ${errors.companyId ? "border-red-500" : ""}`}><option value="">Select an existing company</option>{companies.map((company) => <option key={company._id} value={company._id}>{company.name} — {company.district}</option>)}</select>{errors.companyId && <p className="mt-1 text-xs text-red-600">{errors.companyId}</p>}</div>
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">{field(<>Job role <span className="text-red-500">*</span></>, "jobRole")}{field("Applied date", "appliedDate", "date")}</div>
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2"><div><label className="mb-1 block text-sm font-medium text-slate-700" htmlFor="jobType">Job type</label><select id="jobType" name="jobType" value={values.jobType} onChange={change} className={`${input} bg-white`}>{jobTypes.map((type) => <option key={type}>{type}</option>)}</select></div><div><label className="mb-1 block text-sm font-medium text-slate-700" htmlFor="applicationSource">Application source</label><select id="applicationSource" name="applicationSource" value={values.applicationSource} onChange={change} className={`${input} bg-white`}>{sources.map((source) => <option key={source}>{source}</option>)}</select></div>{field("Salary", "salary")}{field("Interview date", "interviewDate", "date")}<div><label className="mb-1 block text-sm font-medium text-slate-700" htmlFor="interviewMode">Interview mode</label><select id="interviewMode" name="interviewMode" value={values.interviewMode} onChange={change} className={`${input} bg-white`}><option value="">Not scheduled</option>{modes.map((mode) => <option key={mode}>{mode}</option>)}</select></div>{field("Interview location", "interviewLocation")}</div>
    {!id && <div><label className="mb-1 block text-sm font-medium text-slate-700" htmlFor="status">Initial status</label><select id="status" name="status" value={values.status || "Interested"} onChange={change} className={`${input} bg-white`}>{statuses.map((status) => <option key={status}>{status}</option>)}</select></div>}
    <div><label className="mb-1 block text-sm font-medium text-slate-700" htmlFor="jobDescription">Job description</label><textarea id="jobDescription" name="jobDescription" rows="4" value={values.jobDescription || ""} onChange={change} className={input} /></div><div><label className="mb-1 block text-sm font-medium text-slate-700" htmlFor="notes">Notes</label><textarea id="notes" name="notes" rows="4" value={values.notes || ""} onChange={change} className={input} /></div>
    <div className="flex justify-end gap-3"><Link to={id ? `/applications/${id}` : "/applications"} className="rounded px-4 py-2 text-slate-600 hover:bg-slate-100">Cancel</Link><button disabled={submitting} className="rounded bg-indigo-600 px-5 py-2 font-medium text-white hover:bg-indigo-700 disabled:opacity-50">{submitting ? "Saving..." : id ? "Save changes" : "Create application"}</button></div>
  </form></section></div></main>;
}
