# Intentional Bugs — Internal Reference

> **Do not open this file during a live demo.** It lists the planted bugs
> in plaintext, which spoils the "look how smart Skyfall is" moment. Use
> it as a reference when you're authoring fixes, debugging the demo
> infrastructure, or briefing a teammate.

Five bugs ship with the app. Each is annotated in source with a comment of
the form `// BUG #N (intentional): ...` so an engineer (human or agent)
hunting for it has a clear marker.

---

## BUG #1 — TypeError on 5th drop

- **File:** `src/hooks/useFallingObjects.ts`
- **Trigger:** Click the **Drop one** button five times.
- **What happens:** On the 5th drop, the code reads past the end of the
  `objects` array (`next[next.length + 1]`) and then accesses a property
  off the resulting `undefined`. A `TypeError: Cannot read properties of
  undefined (reading 'id')` is thrown.
- **Sentry capture path:** Global error handler (`window.onerror`).
- **Fix:** Remove the count-gated phantom-access block at the bottom of
  `dropOne`. The harmless version is:

```ts
const dropOne = useCallback(() => {
  setObjects((prev) => [...prev, makeObject(weather)]);
}, [makeObject, weather]);
```

- **Difficulty:** Trivial. One-block deletion.

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

## BUG #4 — Unhandled promise rejection at max intensity

- **File:** `src/hooks/useFallingObjects.ts` (`spawnMany`)
- **Trigger:** Drag the **intensity** slider to 10 (max).
- **What happens:** A `Promise.all` containing a rejecting promise is
  kicked off without `await` or `.catch`, producing an unhandled
  rejection. The browser surfaces it; Sentry's `onunhandledrejection`
  handler reports it.
- **Sentry capture path:** Sentry's default `BrowserClient` integration
  for `unhandledrejection`.
- **Fix:** Delete the `if (intensity >= 10) { void Promise.all([...]) }`
  block. Or, if you want to keep the "high intensity warning" semantics,
  attach a `.catch` that logs locally and does not re-raise.
- **Difficulty:** Trivial. One-block deletion.

---

## BUG #5 — Header hover race

- **File:** `src/components/Header.tsx`
- **Trigger:** Leave the page open for 30 seconds, then hover the Skyfall
  logo / header.
- **What happens:** After a 30s timer elapses, an interval starts wiping
  `stateRef.current` to null every 200ms. The `onHover` handler reads
  `stateRef.current!.glowIntensity` and throws a `TypeError` once the
  ref has been nulled.
- **Sentry capture path:** Explicit `Sentry.captureException` in the
  `try/catch` inside `onHover`, then re-thrown.
- **Fix:** Remove the second `useEffect` that nulls the ref. The
  `stateRef` should remain set throughout the component's lifetime.
  Alternative: guard the read with optional chaining
  (`stateRef.current?.glowIntensity ?? 1`).
- **Difficulty:** Easy. One small effect block to delete, or one line to
  add a `?.` guard.

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
