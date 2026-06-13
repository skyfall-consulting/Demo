# Demo Flow — Skyfall Sky end-to-end

This is the moment-by-moment script for running a live demo of Skyfall's
monitor-to-fix loop against this app. Keep [`BUGS.md`](./BUGS.md) closed
while presenting — it spoils the punchline.

---

## Pre-flight (do this once, before the demo)

| Step | Action |
|------|--------|
| 1    | Skyfall workspace exists and has **Sentry**, **Linear**, **GitHub**, and **Slack** integrations connected. |
| 2    | The Sentry project's DSN is set in this app's `VITE_SENTRY_DSN`. |
| 3    | This repo (`skyfall-consulting/Demo`) is the linked GitHub repo on the Skyfall workspace's project (or wherever Skyfall's `repo_url` lives for Engineer delegations). |
| 4    | The app is deployed (Vercel) at a public URL you can hit during the demo, or running locally on `npm run dev`. |
| 5    | You can DM the Skyfall bot in Slack. |
| 6    | Browser DevTools open in a separate window so you can show Sentry events being sent. |

If any of (1)–(5) are missing, the loop will break at the point that one's responsible for.

---

## The loop, step by step

### Step 1 — trigger a bug

Open the deployed Skyfall Sky app. Pick one of the five buggy controls
(start with **"Drop one"** clicked 5 times — it's the most legible). The
app's error boundary surfaces the failure, and `@sentry/react` ships the
event to Sentry within ~1 second.

> **Say:** "I'm a user, the app just broke. I didn't tell anyone."

### Step 2 — Sentry → Skyfall → Slack

A few seconds later, Skyfall posts to your Slack DM:

> *"New unresolved Sentry issue: `TypeError: Cannot read properties of undefined (reading 'id')` in `useFallingObjects.ts`. Want me to draft a Linear ticket?"*

(The exact phrasing depends on the Concierge prompt, but the shape is:
issue summary + offer to draft a ticket.)

> **Say:** "Sentry caught the error. Skyfall noticed and is asking what I want to do."

### Step 3 — draft the ticket

Reply in Slack:

> *yes, draft a ticket*

Concierge calls `read_sentry_issue` to get the full stack trace + repro
details, then calls `draft_linear_ticket`. A draft card appears in the
Slack thread with the proposed title, description (auto-filled with the
Sentry repro), and priority.

> **Say:** "Skyfall pulled the stack trace, drafted a Linear ticket with
> reproduction details, and is waiting for me to file."

### Step 4 — file the ticket

Click **File ticket** on the Slack card. Linear receives the ticket and
opens it in your Linear inbox.

> **Say:** "One click and the ticket is live in Linear, fully formed."

### Step 5 — nudge Skyfall to fix it

Reply in Slack (paste the Linear ticket URL or reference it by ID):

> *take a look at the new Linear ticket and fix it*

Concierge reads the ticket, confirms it understands the scope, and offers
to delegate to **Engineer**.

> *"This is a single-line off-by-one in `useFallingObjects.ts`. Want me to
> delegate to Engineer?"*

Reply *yes*.

> **Say:** "Skyfall sees the ticket, understands the bug, and is asking
> permission to fix it."

### Step 6 — Engineer ships the fix

Engineer clones the repo (`skyfall-consulting/Demo`), reads the code,
makes the fix on a fresh branch, opens a draft PR. This takes ~30–90
seconds. Skyfall posts the PR link to your Slack thread.

> **Say:** "Engineer opened a PR. Real diff, real branch, real commit.
> Let me review it."

Show the PR in the GitHub UI. Walk through the diff (it should be small —
one or two lines).

### Step 7 — merge + redeploy

Merge the PR. Vercel auto-deploys. ~60 seconds later the new build is
live.

Reload the demo app. The bug is gone — clicking **"Drop one"** five times
no longer throws.

> **Say:** "From error in production to merged fix in under five minutes.
> Without me writing any code."

### Step 8 — loop with a different bug

Click a different buggy control (e.g., the **snow** weather toggle). The
loop runs again, with a completely different bug class (simulated 5xx
instead of a TypeError). Run the demo through Steps 1–7 a second time if
you have the audience's attention.

---

## What to call out during the demo

These are the moments that land if you point them out explicitly:

- **Step 2:** "I didn't even know about the error yet. Skyfall surfaced it
  before my support team would have."
- **Step 3:** "Notice the ticket description is auto-filled with the actual
  stack trace and repro path. I didn't type any of that."
- **Step 5:** "Skyfall didn't just acknowledge — it understood the bug
  scope and recommended a path."
- **Step 6:** "This is a real PR against a real repo. The engineer agent
  cloned it, modified it, and pushed a branch. There's nothing fake in the
  diff."
- **Step 7:** "From production error to merged fix, no human typed any
  code."

---

## Known imperfections (acknowledge if asked)

- **Linear watching isn't autonomous yet.** Step 5 requires a user nudge
  in Slack to point Skyfall at the new ticket; Skyfall doesn't poll Linear
  on its own today. We're transparent about this in the script — it's a
  one-sentence nudge, not autonomous polling.
- **The bugs are intentional.** This is a controlled demo, not a snapshot
  of an organic production app. The point is that the *loop* is real, even
  if the *source* of bugs is contrived.
- **PR review still requires a human.** Engineer opens a draft PR. The
  merge button is yours. That's by design.

---

## Recovery if something doesn't fire

| Symptom | Likely cause | Quick fix |
|--------|--------------|-----------|
| Sentry never sees the event | `VITE_SENTRY_DSN` is unset, or wrong project | Check `.env.local` / Vercel env vars |
| Sentry sees it but Skyfall doesn't post to Slack | Sentry integration not connected on the Skyfall workspace | Reconnect via Skyfall's Integrations page |
| Slack message arrives but no draft offer | Concierge prompt isn't routing Sentry alerts | Check the workspace's Sentry routing config |
| Engineer can't find the repo | `repo_url` not set on the project Skyfall is delegating from | Update the project's `repo_url` to `https://github.com/skyfall-consulting/Demo` |
| Engineer opens a PR but on the wrong branch | Stale `main` on the repo's local clone in Engineer's runtime | Re-run the delegation — Engineer re-clones each time |
