const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api/jobs";

async function request(path = "", options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, options);
  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(data?.message || `Request failed (${response.status})`);
  }

  return data;
}

export function getJobs() {
  return request();
}

export function createJob(job) {
  return request("", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(job),
  });
}

export function updateJob(id, job) {
  return request(`/${encodeURIComponent(id)}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(job),
  });
}

export function deleteJob(id) {
  return request(`/${encodeURIComponent(id)}`, { method: "DELETE" });
}
