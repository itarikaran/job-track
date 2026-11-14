import { useState } from "react";
import { z } from "zod";

const companyTypes = ["Product", "Service", "Consulting", "Startup", "MNC", "Other"];
const districts = ["Colombo", "Gampaha", "Kalutara", "Kandy", "Galle", "Jaffna", "Other"];
const initialValues = { name: "", district: "", address: "", additionalAddress: "", website: "", contactPerson: "", contactNumber: "", email: "", companyType: "Other", notes: "" };
const companySchema = z.object({
  name: z.string().trim().min(1, "Company name is required").max(100),
  district: z.string().trim().min(1, "District is required").max(50),
  address: z.string().trim().max(200), additionalAddress: z.string().trim().max(200), website: z.string().trim().max(100),
  contactPerson: z.string().trim().max(50), contactNumber: z.string().trim().max(20),
  email: z.string().trim().max(100).refine((value) => !value || z.email().safeParse(value).success, "Invalid email"),
  companyType: z.enum(companyTypes), notes: z.string().trim().max(1000),
});
const inputClass = "w-full rounded-md border border-slate-300 px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500";

export default function CompanyForm({ initialData, onSubmit, submitLabel, submitting }) {
  const [values, setValues] = useState({ ...initialValues, ...initialData });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const change = ({ target: { name, value } }) => { setValues((current) => ({ ...current, [name]: value })); setErrors((current) => ({ ...current, [name]: undefined })); setServerError(""); };
  const submit = async (event) => {
    event.preventDefault();
    const result = companySchema.safeParse(values);
    if (!result.success) { const fieldErrors = {}; result.error.issues.forEach((issue) => { fieldErrors[issue.path[0]] = issue.message; }); setErrors(fieldErrors); return; }
    try { await onSubmit(result.data); } catch (error) {
      const fieldErrors = {};
      (error.response?.data?.errors || []).forEach((issue) => { const field = issue.field?.replace("body.", ""); if (field) fieldErrors[field] = issue.message; });
      setErrors(fieldErrors); setServerError(error.response?.data?.message || "Unable to save the company. Please try again.");
    }
  };
  const field = (label, name, type = "text", extra = {}) => <div><label className="mb-1 block text-sm font-medium text-slate-700" htmlFor={name}>{label}</label><input id={name} name={name} type={type} value={values[name]} onChange={change} className={`${inputClass} ${errors[name] ? "border-red-500" : ""}`} {...extra} />{errors[name] && <p className="mt-1 text-xs text-red-600">{errors[name]}</p>}</div>;
  return <form onSubmit={submit} className="space-y-5" noValidate>
    {serverError && <div className="rounded border border-red-200 bg-red-50 p-3 text-sm text-red-700">{serverError}</div>}
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      {field(<>Company Name <span className="text-red-500">*</span></>, "name")}
      <div><label className="mb-1 block text-sm font-medium text-slate-700" htmlFor="district">District <span className="text-red-500">*</span></label><select id="district" name="district" value={values.district} onChange={change} className={`${inputClass} bg-white ${errors.district ? "border-red-500" : ""}`}><option value="">Select district</option>{districts.map((district) => <option key={district}>{district}</option>)}</select>{errors.district && <p className="mt-1 text-xs text-red-600">{errors.district}</p>}</div>
      <div className="md:col-span-2">{field("Address", "address")}</div><div className="md:col-span-2">{field("Additional Address / Branch Details", "additionalAddress")}</div><div className="md:col-span-2">{field("Website", "website", "url", { placeholder: "https://example.com" })}</div>
      {field("Contact Person", "contactPerson")}{field("Contact Number", "contactNumber", "tel")}{field("Email", "email", "email")}
      <div><label className="mb-1 block text-sm font-medium text-slate-700" htmlFor="companyType">Company Type</label><select id="companyType" name="companyType" value={values.companyType} onChange={change} className={`${inputClass} bg-white`}>{companyTypes.map((companyType) => <option key={companyType}>{companyType}</option>)}</select></div>
      <div className="md:col-span-2"><label className="mb-1 block text-sm font-medium text-slate-700" htmlFor="notes">Notes</label><textarea id="notes" name="notes" rows="4" value={values.notes} onChange={change} className={`${inputClass} ${errors.notes ? "border-red-500" : ""}`} />{errors.notes && <p className="mt-1 text-xs text-red-600">{errors.notes}</p>}</div>
    </div>
    <div className="flex justify-end"><button type="submit" disabled={submitting} className="rounded bg-indigo-600 px-5 py-2 font-medium text-white transition-colors hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50">{submitting ? "Saving..." : submitLabel}</button></div>
  </form>;
}