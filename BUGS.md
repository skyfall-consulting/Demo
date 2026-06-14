# Intentional Bugs — Internal Reference

> **Do not open this file during a live demo.** It lists the planted bugs
> in plaintext, which spoils the "look how smart Skyfall is" moment. Use
> it as a reference when you're authoring fixes, debugging the demo
> infrastructure, or briefing a teammate.

Five bugs ship with the app. Each is annotated in source with a comment of
the form `// BUG #N (intentional): ...` so an engineer (human or agent)
hunting for it has a clear marker.

---

## BUG #1 — TypeError on Drop one (every click)

- **File:** `src/hooks/useFallingObjects.ts`
- **Trigger:** Click the **Drop one** button. Any click — the first is
  enough.
- **What happens:** On every drop, the code reads past the end of the
  `objects` array (`next[next.length + 1]`) and then accesses a property
  off the resulting `undefined`. A `TypeError: Cannot read properties of
  undefined (reading 'id')` is thrown.
- **Sentry capture path:** React ErrorBoundary in `main.tsx` (the throw
  happens inside a state setter, which React reports during render) +
  Sentry's global error handler.
- **Fix:** Remove the phantom-access lines at the bottom of `dropOne`'s
  setter. The harmless version is:

```ts
const dropOne = useCallback(() => {
  setObjects((prev) => [...prev, makeObject(weather)]);
}, [makeObject, weather]);
```

- **Difficulty:** Trivial. Two-line deletion.

---

## BUG #2 — Simulated 5xx on snow mode

- **File:** `src/components/WeatherToggle.tsx`
- **Trigger:** Click the **snow** chip in the weather toggle.
- **What happens:** Throws a labeled error (`WeatherService: failed to
  load snow assets (HTTP 500 from /api/weather?mode=snow)`) and reports
  it to Sentry before re-throwing. The error boundary catches it.
- **Sentry capture path:** Explicit `Sentry.captureException` call +
  re-throw caught by the React `ErrorBoundary` in `main.tsx`.
- **Fix:** Remove the `if (next === 'snow') { ... throw }` block. Snow
  mode should just call `onChange(next)` like the other modes.
- **Difficulty:** Trivial. One-block deletion.

---

## BUG #3 — Catch counter goes negative

- **File:** `src/App.tsx`
- **Trigger:** Click any falling object on the canvas.
- **What happens:** The `onCatch` handler in `App.tsx` calls
  `setCaughtCount((c) => c - 1)` instead of `c + 1`. After the first
  catch the counter is -1 and a `Sentry.captureException` fires from
  `CatchCounter.tsx` reporting "invariant broken: count went negative".
- **Sentry capture path:** `useEffect` in `CatchCounter.tsx` watches
  `value < 0` and reports once per breach.
- **Fix:** Change `c - 1` to `c + 1` in `App.tsx`'s `onCatch` prop. The
  invariant guard in `CatchCounter.tsx` is correct and should stay.
- **Difficulty:** Trivial. One-character flip.

---

## BUG #4 — Unhandled promise rejection on Storm

- **Files:**
  - `src/hooks/useFallingObjects.ts` (`spawnStorm`)
  - `src/components/StormButton.tsx` (the trigger)
- **Trigger:** Click the **⚡ Storm** button.
- **What happens:** `spawnStorm` kicks off a `Promise.all` containing a
  rejecting promise without `await` or `.catch`, producing an unhandled
  rejection. The 8 storm objects still spawn — the UI does NOT crash.
  Sentry's `onunhandledrejection` integration reports the error in the
  background.
- **Sentry capture path:** Sentry's default `BrowserClient` integration
  for `unhandledrejection`. Silent — no UI fallback.
- **Demo flavor:** "an error your users would never notice — but Skyfall
  catches it anyway."
- **Fix:** Delete the `void Promise.all([Promise.resolve, Promise.reject])`
  block from `spawnStorm`. Keep the rest (the spawn of 8 objects) so the
  Storm button still does something visible.
- **Difficulty:** Trivial. One-block deletion.

---

## BUG #5 — Header hover dereferences null ref

- **File:** `src/components/Header.tsx`
- **Trigger:** Hover the Skyfall logo (or anywhere on the header). First
  hover is enough.
- **What happens:** `stateRef` is initialized to `null`. The `onHover`
  handler reads `stateRef.current!.glowIntensity` and throws a
  `TypeError` because `current` is null. Realistic shape: the programmer
  forgot to initialize the ref before adding the handler that reads it.
- **Sentry capture path:** Explicit `Sentry.captureException` in the
  `try/catch` inside `onHover`, then re-thrown so the ErrorBoundary
  surfaces it.
- **Fix:** Two equally good options —
  1. Initialize the ref with a real value:
     `useRef<{ glowIntensity: number } | null>({ glowIntensity: 1 })`
  2. Guard the read with optional chaining:
     `const intensity = stateRef.current?.glowIntensity ?? 1;`
- **Difficulty:** Trivial. One-line change either way.

---

## Why these specific bugs

- **Diverse capture paths** — global error handler (#1, #5), explicit
  `captureException` (#2, #3, #5), and unhandled rejection (#4). Sentry
  surfaces all three categories; the demo exercises each.
- **Distinct stack traces** — every bug lives in a different file or
  function, so the Sentry "issues" list looks like a real production
  feed, not the same error five times.
- **Small fixes** — each is a single-block diff. Engineer can ship a fix
  in under a minute. Demos should not require waiting on a long agent
  run.
- **Visually distinct triggers** — each one is reachable by a different
  user action. Watching someone click through a demo and triggering
  varied errors is more compelling than watching them spam the same
  button.

---

## Reseeding the bugs after a fix lands

After Skyfall ships a fix and you merge the PR, the bug is gone. To run
the demo again with the *same* bug, revert the fix commit or cherry-pick
this repo's `main` from before the fix.

To run the demo with a *fresh* bug, pick another unfixed entry in this
file and click that control instead. After all five are fixed, this repo
is "done" and you can either:

1. **Reset to a tagged baseline** — tag the initial commit and reset
   `main` to it between demos.
2. **Plant a new bug** — author a new intentional-bug feature and add it
   here.

(Option 1 is the lower-effort default.)
