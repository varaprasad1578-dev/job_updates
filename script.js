const $ = (selector) => document.querySelector(selector);
const safe = (value) => String(value ?? "").replace(/[&<>"']/g, (c) => ({
  "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
}[c]));

function dateText(value) {
  if (!value) return "Not specified";
  const date = new Date(`${value}T00:00:00`);
  return Number.isNaN(date.getTime())
    ? safe(value)
    : date.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

async function getJobs() {
  const response = await fetch("./jobs.json", { cache: "no-store" });
  if (!response.ok) throw new Error(`jobs.json request failed (${response.status})`);
  const payload = await response.json();
  const jobs = Array.isArray(payload) ? payload : payload.jobs;
  if (!Array.isArray(jobs)) throw new Error("jobs.json must contain a jobs array.");
  return jobs;
}

const isActive = (job) => job.status !== "inactive";

function typeLabel(type) {
  if (type === "government") return "Government Job";
  if (type === "private") return "Private Job";
  return "Internship";
}

function renderCard(job) {
  return `<article class="job-card">
    <div class="card-top">
      <span class="type-tag ${safe(job.type)}">${typeLabel(job.type)}</span>
      <span class="new-tag">● JOB UPDATE</span>
    </div>
    <h3>${safe(job.role)}</h3>
    <div class="company">${safe(job.organization)}</div>
    <div class="job-meta">
      <span>Qualification: ${safe(job.qualification || "See notification")}</span>
      <span>Salary: ${safe(job.salary || "As per notification")}</span>
      <span class="deadline">Last Date: ${dateText(job.lastDate)}</span>
    </div>
    <a class="details-link" href="job-details.html?id=${encodeURIComponent(job.id)}">View Job Details →</a>
  </article>`;
}

function renderHome(jobs) {
  const latest = $("#latestJobs");
  const closing = $("#closingJobs");
  if (!latest || !closing) return;

  const active = jobs.filter(isActive).sort((a, b) =>
    String(b.postedDate || "").localeCompare(String(a.postedDate || ""))
  );

  latest.innerHTML = active.slice(0, 8).map(renderCard).join("") ||
    '<div class="empty">No latest job notifications have been published yet.</div>';

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const closingSoon = active
    .filter((job) => job.lastDate)
    .map((job) => ({
      ...job,
      daysLeft: Math.ceil((new Date(`${job.lastDate}T00:00:00`) - today) / 86400000)
    }))
    .filter((job) => job.daysLeft >= 0 && job.daysLeft <= 14)
    .sort((a, b) => a.daysLeft - b.daysLeft);

  closing.innerHTML = closingSoon.slice(0, 8).map(renderCard).join("") ||
    '<div class="empty">No active jobs are closing within the next 14 days.</div>';
}

function renderDetails(jobs) {
  const target = $("#jobDetail");
  if (!target) return;

  const id = new URLSearchParams(window.location.search).get("id");
  const job = jobs.find((item) => String(item.id) === id && isActive(item));

  if (!job) {
    target.innerHTML = '<div class="empty">Job not found or no longer active. Return to Latest Jobs and choose another listing.</div>';
    return;
  }

  const notification = job.notificationLink
    ? `<p><a class="button primary" href="${safe(job.notificationLink)}" target="_blank" rel="noopener noreferrer">View Official Notification ↗</a></p>`
    : "";
  const apply = job.applyLink
    ? `<a class="button primary" href="${safe(job.applyLink)}" target="_blank" rel="noopener noreferrer">Apply on Official Website ↗</a>`
    : '<p class="disclaimer">Official application link has not been added yet.</p>';

  target.innerHTML = `<article class="detail-card">
    <span class="type-tag ${safe(job.type)}">${typeLabel(job.type)}</span>
    <h1>${safe(job.role)}</h1>
    <b>${safe(job.organization)}</b>
    <p><b>Qualification:</b> ${safe(job.qualification || "See official notification")}</p>
    <p><b>Salary / Stipend:</b> ${safe(job.salary || "As mentioned in notification")}</p>
    <p><b>Last date:</b> ${dateText(job.lastDate)}</p>
    <p>${safe(job.description || "Refer to the official notification for full details.")}</p>
    ${notification}
    ${apply}
    <p class="disclaimer">Please verify eligibility, dates and all other details on the official recruiting website before applying.</p>
  </article>`;
}

async function init() {
  const year = $("#year");
  if (year) year.textContent = new Date().getFullYear();

  try {
    const jobs = await getJobs();
    renderHome(jobs);
    renderDetails(jobs);
  } catch (error) {
    console.error("JOBUPDATES could not load job data:", error);
    const detail = $("#jobDetail");
    if (detail) {
      detail.innerHTML = '<div class="empty">We could not load the job information. Please check that jobs.json is in the same folder as this page, then refresh.</div>';
    }
    const latest = $("#latestJobs");
    const closing = $("#closingJobs");
    if (latest) latest.innerHTML = '<div class="empty">Unable to load jobs.json. Check the project folder and refresh.</div>';
    if (closing) closing.innerHTML = '<div class="empty">Unable to load jobs.json. Check the project folder and refresh.</div>';
  }
}

init();
