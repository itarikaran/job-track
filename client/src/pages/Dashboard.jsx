import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useAuth } from "../context/AuthContext";
import { dashboardService } from "../services/dashboardService";

const COLORS = ["#4f46e5", "#0ea5e9", "#14b8a6", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899", "#64748b"];
const STATUS_COLORS = {
  Interested: "#94a3b8",
  Applied: "#4f46e5",
  Assessment: "#f59e0b",
  Shortlisted: "#0ea5e9",
  "Interview Scheduled": "#8b5cf6",
  "Interview Completed": "#7c3aed",
  Selected: "#16a34a",
  Rejected: "#dc2626",
  "Offer Received": "#059669",
  "Offer Accepted": "#15803d",
  "Offer Declined": "#be123c",
  Withdrawn: "#64748b",
};

function LoadingCard() {
  return <div className="h-28 animate-pulse rounded-xl border border-slate-200 bg-white" />;
}

function EmptyState({ children }) {
  return <div className="flex min-h-48 items-center justify-center rounded-lg border border-dashed border-slate-300 text-sm text-slate-500">{children}</div>;
}

export default function Dashboard() {
  const { user, logout } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([
      dashboardService.getStats(),
      dashboardService.getRecent(),
      dashboardService.getUpcoming(),
      dashboardService.getCharts(),
    ]).then(([stats, recent, upcoming, charts]) => {
      setData({
        stats: stats.data,
        recent: recent.data || [],
        upcoming: upcoming.data || [],
        charts: charts.data,
      });
    }).catch((err) => {
      setError(err.response?.data?.message || "Unable to load dashboard data");
    }).finally(() => setLoading(false));
  }, []);

  const stats = data?.stats;
  const cards = [
    ["Total companies", stats?.companies.total ?? 0, "Manage your company records"],
    ["Total applications", stats?.applications.total ?? 0, "Across all companies"],
    ["Applications this month", stats?.applications.thisMonth ?? 0, "New opportunities"],
    ["Interviews this month", stats?.interviewsThisMonth ?? 0, "Scheduled this month"],
    ["Selected", stats?.selectionCount ?? 0, "Applications selected"],
    ["Success rate", `${stats?.successRate ?? 0}%`, "Selected or offer received"],
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <aside className="fixed inset-y-0 left-0 hidden w-64 border-r border-slate-200 bg-white lg:block">
        <div className="flex h-16 items-center border-b border-slate-200 px-6 text-xl font-bold text-indigo-600">JobTrack</div>
        <nav className="space-y-1 p-4">
          <Link to="/dashboard" className="block rounded-lg bg-indigo-50 px-4 py-3 font-medium text-indigo-700">Dashboard</Link>
          <Link to="/companies" className="block rounded-lg px-4 py-3 text-slate-600 hover:bg-slate-50">Companies</Link>
          <Link to="/applications" className="block rounded-lg px-4 py-3 text-slate-600 hover:bg-slate-50">Applications</Link>
        </nav>
      </aside>
      <div className="lg:pl-64">
        <header className="flex min-h-16 items-center justify-between border-b border-slate-200 bg-white px-4 sm:px-8">
          <div><p className="text-sm text-slate-500">Overview</p><h1 className="text-lg font-semibold">Dashboard</h1></div>
          <div className="flex items-center gap-3"><nav className="flex gap-3 text-sm lg:hidden"><Link to="/companies" className="text-slate-600 hover:text-indigo-600">Companies</Link><Link to="/applications" className="text-slate-600 hover:text-indigo-600">Applications</Link></nav><span className="hidden text-sm text-slate-600 sm:inline">Welcome, {user?.name}</span><button onClick={logout} className="rounded border border-slate-300 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50">Logout</button></div>
        </header>
        <main className="mx-auto max-w-7xl space-y-6 p-4 sm:p-8">
          {error && <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">{loading ? Array.from({ length: 6 }, (_, index) => <LoadingCard key={index} />) : cards.map(([label, value, description]) => <div key={label} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-sm font-medium text-slate-500">{label}</p><p className="mt-2 text-3xl font-bold text-slate-900">{value}</p><p className="mt-1 text-xs text-slate-500">{description}</p></div>)}</div>
          {!loading && data && <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
            <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"><h2 className="font-semibold">Applications over time</h2><div className="mt-4 h-72">{data.charts.applicationsOverTime.some((item) => item.count > 0) ? <ResponsiveContainer width="100%" height="100%"><LineChart data={data.charts.applicationsOverTime}><CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" /><XAxis dataKey="label" tick={{ fontSize: 11 }} /><YAxis allowDecimals={false} /><Tooltip /><Line type="monotone" dataKey="count" name="Applications" stroke="#4f46e5" strokeWidth={3} /></LineChart></ResponsiveContainer> : <EmptyState>No application history yet.</EmptyState>}</div></section>
            <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"><h2 className="font-semibold">Applications by status</h2><div className="mt-4 h-72">{data.charts.statusDistribution.some((item) => item.count > 0) ? <ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={data.charts.statusDistribution.filter((item) => item.count > 0)} dataKey="count" nameKey="status" innerRadius={65} outerRadius={100} paddingAngle={2}>{data.charts.statusDistribution.filter((item) => item.count > 0).map((item) => <Cell key={item.status} fill={STATUS_COLORS[item.status] || COLORS[0]} />)}</Pie><Tooltip /><Legend /></PieChart></ResponsiveContainer> : <EmptyState>No application statuses yet.</EmptyState>}</div></section>
            <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"><h2 className="font-semibold">Companies by district</h2><div className="mt-4 h-72">{data.charts.companiesByDistrict.length ? <ResponsiveContainer width="100%" height="100%"><BarChart data={data.charts.companiesByDistrict}><CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" /><XAxis dataKey="district" tick={{ fontSize: 11 }} /><YAxis allowDecimals={false} /><Tooltip /><Bar dataKey="count" name="Companies" fill="#0ea5e9" radius={[4, 4, 0, 0]} /></BarChart></ResponsiveContainer> : <EmptyState>No companies by district yet.</EmptyState>}</div></section>
            <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"><h2 className="font-semibold">Recent applications</h2><div className="mt-4">{data.recent.length ? <div className="divide-y divide-slate-200">{data.recent.map((application) => <Link key={application._id} to={`/applications/${application._id}`} className="flex items-center justify-between gap-3 py-3 hover:bg-slate-50"><div className="min-w-0"><p className="truncate font-medium text-slate-900">{application.jobRole}</p><p className="truncate text-sm text-slate-500">{application.companyId?.name} · {application.companyId?.district}</p></div><div className="shrink-0 text-right"><p className="text-xs text-slate-500">{new Date(application.appliedDate).toLocaleDateString()}</p><span className="text-xs font-medium text-indigo-600">{application.status}</span></div></Link>)}</div> : <EmptyState>No applications yet.</EmptyState>}<Link to="/applications" className="mt-4 block text-sm font-medium text-indigo-600 hover:underline">View all applications →</Link></div></section>
          </div>}
          {!loading && data && <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"><div className="flex items-center justify-between"><h2 className="font-semibold">Upcoming interviews</h2><Link to="/applications" className="text-sm font-medium text-indigo-600 hover:underline">View applications →</Link></div>{data.upcoming.length ? <div className="mt-4 overflow-x-auto"><table className="w-full text-left text-sm"><thead className="border-b border-slate-200 text-slate-500"><tr><th className="px-3 py-3">Company</th><th className="px-3 py-3">Role</th><th className="px-3 py-3">Interview date</th><th className="px-3 py-3">Mode</th><th className="px-3 py-3">Status</th></tr></thead><tbody className="divide-y divide-slate-200">{data.upcoming.map((application) => <tr key={application._id}><td className="px-3 py-3 font-medium">{application.companyId?.name}</td><td className="px-3 py-3">{application.jobRole}</td><td className="px-3 py-3">{new Date(application.interviewDate).toLocaleString()}</td><td className="px-3 py-3">{application.interviewMode || "—"}</td><td className="px-3 py-3 text-indigo-600">{application.status}</td></tr>)}</tbody></table></div> : <div className="mt-4"><EmptyState>No upcoming interviews scheduled.</EmptyState></div>}</section>}
          {stats?.successRateDefinition && <p className="text-xs text-slate-500">{stats.successRateDefinition}</p>}
        </main>
      </div>
    </div>
  );
}
