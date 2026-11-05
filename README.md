# JOBUPDATES Mini Job Portal

This version restyles the public homepage as a compact job portal inspired by the reference website:
- Clean white navigation header
- Blue introduction/hero area
- Main job-news feed with a right-hand information sidebar
- Exactly two job sections: Latest Jobs and Closing Soon
- Job type remains a small badge on each listing; there are no category filters or separate category pages.

The existing `jobs.json`, `script.js`, `job-details.html`, and `admin/` CMS setup are retained.

## Local testing
1. Open this folder in VS Code.
2. Run `index.html` with Live Server.
3. For local CMS testing, keep `npx decap-server` running in a separate terminal and open `/admin/`.

The local CMS proxy is for local testing only. GitHub authentication and production deployment still need to be configured. Demo jobs are placeholders, not real vacancies.
