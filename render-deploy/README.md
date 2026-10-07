# Priority Dossier — Render deployment

A small Express app that serves the prioritization tool and stores
responses in a JSON file on disk (no Claude account, no third-party
service needed).

## What's in here
- `public/index.html` — the tool itself (unchanged visually/functionally from the Claude version)
- `public/data.json` — the 4 categories and 20 use cases. **Edit this file** to change content; both the page and the CSV export read from it.
- `server.js` — the API: saves responses, tallies results, exports CSV
- `responses.json` — created automatically on first submission (not checked into git)

## Deploy to Render

1. **Push this folder to a GitHub repo** (Render deploys from Git — drag-and-drop isn't supported for web services). If you don't already have one: create a new repo on GitHub, then from this folder:
   ```
   git init
   git add .
   git commit -m "Priority dossier"
   git branch -M main
   git remote add origin <your-new-repo-url>
   git push -u origin main
   ```
2. In Render: **New → Web Service** → connect that repo.
3. Render should auto-detect Node. Confirm:
   - **Build command:** `npm install`
   - **Start command:** `npm start`
4. Choose the Free instance type (fine for an internal async survey) and click **Create Web Service**.
5. Once deployed, Render gives you a URL like `https://priority-dossier.onrender.com`. That's the link to send to your 40+ people — no Claude account, no sign-in, works for anyone with the link.

## Two things worth knowing about the Free tier

- **Spin-down:** a free instance goes to sleep after ~15 minutes of no traffic and takes 20–50 seconds to wake back up on the next visit. Fine for an async survey; just don't expect instant load if it's been idle. Upgrade to a paid instance if you want it always warm.
- **Disk persistence:** `responses.json` lives on the instance's disk. It survives normal restarts/spin-downs, but a **new deploy** (e.g. pushing a content update) gives the service a fresh disk and responses collected so far will be lost. So:
  - Finish content edits *before* opening the survey to your 40+ people, or
  - Download the CSV (`api/export.csv`, also linked from the in-app results screen) before pushing any update, and re-import/communicate results separately if needed.

## Viewing results
- In the app: submit a response, then click **"View aggregate results so far"** for a live tally.
- As data: open `https://<your-app>.onrender.com/api/export.csv` any time for a per-person CSV (name, timestamp, their picks).
