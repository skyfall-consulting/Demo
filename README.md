# Skyfall Sky — Demo Playground

A small, interactive web app whose entire purpose is to **generate realistic
issues that Skyfall can find, triage, and fix end-to-end**.

It is the test bench for Skyfall's monitor-to-fix loop:

> Sentry catches an error → Skyfall reports it in Slack → user asks Skyfall
> to draft a Linear ticket → Skyfall drafts it → user files it → user asks
> Skyfall to take care of it → Engineer agent reads this repo, ships a fix
> on a new branch, opens a PR → user merges → loop again.

Each interactive feature in the app ships with a real, intentional bug that
fires to Sentry the moment a user touches it. Fixing each one is a single
small PR. See [`BUGS.md`](./BUGS.md) for the internal reference (don't show
this during a live demo — it spoils the magic trick).

For the moment-by-moment script you'll actually run during a demo, see
[`DEMO_FLOW.md`](./DEMO_FLOW.md).

---

## What's in the app

Five interactive controls layered over a "things falling from the sky"
canvas:

| Control            | What it does                                 | Bug class it surfaces           | Trigger              |
| ------------------ | -------------------------------------------- | -------------------------------- | -------------------- |
| **Drop one**       | Spawns one falling object                    | `TypeError` (off-by-one deref)   | One click            |
| **Weather toggle** | Switches rain / snow / stars                 | Simulated 5xx (snow mode)        | Click "snow" chip    |
| **⚡ Storm**        | Spawns 8 falling objects at once             | Unhandled promise rejection      | One click            |
| **Catch counter**  | Click falling objects to "catch" them        | Logic bug (counter inverted)     | Catch any object     |
| **Skyfall logo**   | Hover for a glow effect                      | TypeError on null deref           | Hover                |

All five fire to Sentry. Three of them throw and surface in the in-app
error boundary; two report silently in the background. That's intentional —
real production apps have both kinds, and Skyfall should handle both.

---

## Quick start (local)

```bash
# 1. Install deps
npm install

# 2. Copy the env template and add your Sentry DSN
cp .env.example .env.local
# then edit .env.local: VITE_SENTRY_DSN=https://...@oXXXX.ingest.sentry.io/XXXXXX

# 3. Run the dev server
npm run dev
```

Open the URL Vite prints (default `http://localhost:5173`).

The Sentry DSN must point at the project that's connected to the Skyfall
workspace you're using for the demo. Without it, errors are logged to the
browser console only and Skyfall sees nothing.

---

## Deploy (Vercel)

This repo is Vercel-ready out of the box. From the [Vercel dashboard][vercel]:

1. Import `skyfall-consulting/Demo`
2. Vercel auto-detects Vite — accept defaults
3. Set the env vars on the **Environment Variables** screen:
   - `VITE_SENTRY_DSN` — required
   - `VITE_SENTRY_ENVIRONMENT` — optional (defaults to `demo`)
   - `VITE_SENTRY_RELEASE` — optional (defaults to `skyfall-sky@dev`)
4. Deploy

`vercel.json` ships with a SPA rewrite so direct URLs always serve
`index.html`.

[vercel]: https://vercel.com/new

---

## How the demo loop works (one paragraph)

You open the deployed app, click one of the buggy controls, and Sentry
captures the resulting error. The Sentry project is wired into your Skyfall
workspace as an integration, so Skyfall sees the new issue and posts to
your Slack DM asking whether to draft a Linear ticket. You say yes. Skyfall
drafts the ticket (you click File in Slack). You then nudge Skyfall:
*"take a look at the new Linear ticket"*. Skyfall reads the ticket, asks if
you'd like Engineer to fix it, you say yes — Engineer clones this repo,
makes the fix on a branch, opens a draft PR, and Skyfall pings you in Slack
that the PR is ready. You review, merge, and the deployed app updates.
Then you click another buggy control and it starts over.

The full step-by-step lives in [`DEMO_FLOW.md`](./DEMO_FLOW.md).

---

## Repo layout

```
.
├── README.md              # this file
├── DEMO_FLOW.md           # step-by-step demo script
├── BUGS.md                # the intentional bugs (internal reference)
├── package.json
├── tsconfig*.json
├── vite.config.ts
├── vercel.json
├── index.html
├── .env.example
└── src/
    ├── main.tsx
    ├── App.tsx
    ├── sentry.ts
    ├── types.ts
    ├── styles.css
    ├── hooks/
    │   └── useFallingObjects.ts
    └── components/
        ├── Header.tsx
        ├── SkyCanvas.tsx
        ├── DropButton.tsx
        ├── StormButton.tsx
        ├── WeatherToggle.tsx
        └── CatchCounter.tsx
```

---

## Notes for the engineer fixing a bug

When Skyfall's Engineer agent picks up a ticket against this repo, it
should:

1. Read the linked Sentry issue summary for the stack trace
2. Locate the matching file/component in `src/`
3. Make the smallest correct change that resolves the bug
4. Open the PR with a title that references the Sentry issue id

The intentional bugs are all small (single-line or single-block fixes) and
each is annotated in the code with `// BUG #N (intentional): ...` so the
agent has a clear hint about scope and intent. Removing the bug comment
along with the fix is fine.
