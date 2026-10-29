
import { useEffect, useState } from "react";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000/api/jobs";

const emptyForm = {
  company: "",
  position: "",
  status: "Applied",
  location: "",
  jobType: "Full-time",
  jobUrl: "",
  notes: "",
};

const statusStyles = {
  Applied: "bg-blue-50 text-blue-700",
  Interview: "bg-amber-50 text-amber-700",
  Offer: "bg-green-50 text-green-700",
  Rejected: "bg-red-50 text-red-700",
};

export default function App() {
  const [jobs, setJobs] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function loadJobs() {
    setLoading(true);
    setError("");

    try {
      const res = await fetch(API);
      if (!res.ok) throw new Error("Failed to load applications");

      setJobs(await res.json());
    } catch (err) {
      setError(err.message || "Cannot connect to the server.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadJobs();
  }, []);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setError("");

    try {
      const res = await fetch(
        editingId ? `${API}/${editingId}` : API,
        {
          method: editingId ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        }
      );

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Request failed");

      setForm(emptyForm);
      setEditingId(null);
      await loadJobs();
    } catch (err) {
      setError(err.message || "Something went wrong.");
    } finally {
      setSaving(false);
    }
  }

  function handleEdit(job) {
    setForm({
      company: job.company || "",
      position: job.position || "",
      status: job.status || "Applied",
      location: job.location || "",
      jobType: job.jobType || "Full-time",
      jobUrl: job.jobUrl || "",
      notes: job.notes || "",
    });

    setEditingId(job._id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleDelete(id) {
    if (!window.confirm("Delete this job application?")) return;

    setError("");

    try {
      const res = await fetch(`${API}/${id}`, {
        method: "DELETE",
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Delete failed");

      if (editingId === id) {
        setEditingId(null);
        setForm(emptyForm);
      }

      await loadJobs();
    } catch (err) {
      setError(err.message || "Delete failed.");
    }
  }

  const stats = [
    { label: "Total Applications", value: jobs.length },
    { label: "Interviews", value: jobs.filter(j => j.status === "Interview").length },
    { label: "Offers", value: jobs.filter(j => j.status === "Offer").length },
    { label: "Rejected", value: jobs.filter(j => j.status === "Rejected").length },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-5">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              Job<span className="text-indigo-600">Track</span>
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Manage your job search in one place
            </p>
          </div>
          <span className="rounded-full bg-indigo-50 px-3 py-1 text-sm font-medium text-indigo-700">
            MERN Application
          </span>
        </div>
      </header>

      <main className="mx-auto max-w-7xl space-y-8 px-5 py-8">
        {error && (
          <div role="alert" className="flex items-center justify-between rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            <span>{error}</span>
            <button onClick={() => setError("")} className="font-semibold">
              Dismiss
            </button>
          </div>
        )}

        <section className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {stats.map(stat => (
            <div key={stat.label} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-sm text-slate-500">{stat.label}</p>
              <p className="mt-3 text-3xl font-bold">{stat.value}</p>
            </div>
          ))}
        </section>

        <section className="grid items-start gap-8 lg:grid-cols-[360px_1fr]">
          <form
            onSubmit={handleSubmit}
            className="space-y-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
          >
            <div>
              <h2 className="text-lg font-semibold">
                {editingId ? "Edit Application" : "Add Application"}
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Record a job you applied for.
              </p>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">Company *</label>
              <input
                name="company"
                value={form.company}
                onChange={handleChange}
                required
                placeholder="e.g. TCS"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">Position *</label>
              <input
                name="position"
                value={form.position}
                onChange={handleChange}
                required
                placeholder="e.g. Software Engineer"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-sm font-medium">Status</label>
                <select
                  name="status"
                  value={form.status}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-slate-300 bg-white px-2 py-2 text-sm"
                >
                  {["Applied", "Interview", "Offer", "Rejected"].map(s => (
                    <option key={s}>{s}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium">Job Type</label>
                <select
                  name="jobType"
                  value={form.jobType}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-slate-300 bg-white px-2 py-2 text-sm"
                >
                  {["Full-time", "Part-time", "Internship", "Contract"].map(t => (
                    <option key={t}>{t}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">Location</label>
              <input
                name="location"
                value={form.location}
                onChange={handleChange}
                placeholder="e.g. Chennai"
                className="w-full rounded-lg border border-slate-300 px-3 py-2"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">Job URL</label>
              <input
                name="jobUrl"
                type="url"
                value={form.jobUrl}
                onChange={handleChange}
                placeholder="https://..."
                className="w-full rounded-lg border border-slate-300 px-3 py-2"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">Notes</label>
              <textarea
                name="notes"
                value={form.notes}
                onChange={handleChange}
                rows={3}
                placeholder="Interview details, follow-up..."
                className="w-full rounded-lg border border-slate-300 px-3 py-2"
              />
            </div>

            <button
              disabled={saving}
              className="w-full rounded-lg bg-indigo-600 px-4 py-2.5 font-medium text-white hover:bg-indigo-700 disabled:opacity-60"
            >
              {saving ? "Saving..." : editingId ? "Update Application" : "Add Application"}
            </button>

            {editingId && (
              <button
                type="button"
                onClick={() => {
                  setEditingId(null);
                  setForm(emptyForm);
                }}
                className="w-full rounded-lg border border-slate-300 px-4 py-2.5 font-medium hover:bg-slate-50"
              >
                Cancel Edit
              </button>
            )}
          </form>

          <section className="min-w-0">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold">Your Applications</h2>
                <p className="mt-1 text-sm text-slate-500">
                  {jobs.length} application{jobs.length === 1 ? "" : "s"} tracked
                </p>
              </div>
              <button
                onClick={loadJobs}
                className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium hover:bg-slate-100"
              >
                Refresh
              </button>
            </div>

            {loading ? (
              <p className="rounded-xl border bg-white p-8 text-center text-slate-500">
                Loading applications...
              </p>
            ) : jobs.length === 0 ? (
              <div className="rounded-xl border border-dashed border-slate-300 bg-white p-10 text-center">
                <h3 className="font-semibold">No applications yet</h3>
                <p className="mt-2 text-sm text-slate-500">
                  Add your first job using the form.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {jobs.map(job => (
                  <article
                    key={job._id}
                    className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <h3 className="text-lg font-semibold">{job.position}</h3>
                        <p className="mt-1 font-medium text-indigo-600">
                          {job.company}
                        </p>
                        <p className="mt-2 text-sm text-slate-500">
                          {[job.location, job.jobType].filter(Boolean).join(" · ")}
                        </p>
                      </div>
                      <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusStyles[job.status] || "bg-slate-100 text-slate-700"}`}>
                        {job.status}
                      </span>
                    </div>

                    {job.notes && (
                      <p className="mt-4 whitespace-pre-wrap text-sm text-slate-600">
                        {job.notes}
                      </p>
                    )}

                    <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4">
                      <div className="flex flex-wrap gap-3 text-sm">
                        {job.jobUrl && (
                          <a
                            href={job.jobUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="font-medium text-indigo-600 hover:underline"
                          >
                            View Job
                          </a>
                        )}
                        <span className="text-slate-400">
                          {job.createdAt
                            ? new Date(job.createdAt).toLocaleDateString()
                            : ""}
                        </span>
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(job)}
                          className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium hover:bg-slate-50"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(job._id)}
                          className="rounded-lg border border-red-200 px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        </section>
      </main>
    </div>
  );
}
