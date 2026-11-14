import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import CompanyForm from "../components/company/CompanyForm";
import { companyService } from "../services/companyService";

export default function AddCompany() {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const createCompany = async (data) => { setSubmitting(true); try { const response = await companyService.createCompany(data); navigate(`/companies/${response.data._id}`, { state: { toast: "Company created successfully" } }); } finally { setSubmitting(false); } };
  return <main className="min-h-screen bg-slate-50 px-4 py-6"><div className="mx-auto max-w-2xl"><Link to="/companies" className="text-sm font-medium text-indigo-600 hover:underline">← Back to companies</Link><section className="mt-4 rounded-lg border border-slate-200 bg-white p-6 shadow"><h1 className="mb-6 text-2xl font-bold text-slate-900">Add Company</h1><CompanyForm onSubmit={createCompany} submitLabel="Create Company" submitting={submitting} /></section></div></main>;
}
