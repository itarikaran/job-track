import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import CompanyForm from "../components/company/CompanyForm";
import { companyService } from "../services/companyService";

export default function EditCompany() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [company, setCompany] = useState(null);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    companyService.getCompany(id)
      .then((response) => setCompany(response.data))
      .catch((requestError) => setError(requestError.response?.data?.message || "Unable to load this company."));
  }, [id]);

  const updateCompany = async (data) => {
    setSubmitting(true);
    try {
      await companyService.updateCompany(id, data);
      navigate(`/companies/${id}`, { state: { toast: "Company updated successfully" } });
    } finally {
      setSubmitting(false);
    }
  };

  if (error || !company) {
    return <main className="flex min-h-screen items-center justify-center bg-slate-50 text-slate-600">{error || "Loading company..."}</main>;
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-6">
      <div className="mx-auto max-w-2xl">
        <Link to={`/companies/${id}`} className="text-sm font-medium text-indigo-600 hover:underline">← Back to company</Link>
        <section className="mt-4 rounded-lg border border-slate-200 bg-white p-6 shadow">
          <h1 className="mb-6 text-2xl font-bold text-slate-900">Edit Company</h1>
          <CompanyForm initialData={company} onSubmit={updateCompany} submitLabel="Update Company" submitting={submitting} />
        </section>
      </div>
    </main>
  );
}