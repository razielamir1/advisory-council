# Performance Optimizer Memory

This file tracks performance benchmarks, optimization history, and known bottlenecks.

## Benchmarks

### Baseline (2026-03-29 — pre-optimization)
- Bundle: 280 kB JS / 86 kB gzip, 40 kB CSS / 7.6 kB gzip, 42 modules, single chunk
- Re-renders/sec during streaming (estimated): ~100 (all context consumers, no memoization)
- `APPEND_TOKEN` reducer: O(n) over all messages per token event
- Forced layout reflow: 1 per token (scroll useEffect on messages array reference)
- Server memory: discussions Map unbounded, no TTL

## Optimizations Applied
<!-- None yet — audit complete, awaiting PROCEED to implement -->

## Known Bottlenecks

### CRITICAL (not yet fixed)
1. **DiscussionContext single value object** — `{ state, dispatch }` inline → full tree re-render on every token. Fix: split into DispatchContext + StateContext.
2. **No React.memo** on Character, DiscussionPanel, ProgressBar, SpeechBubble — all re-render every token even when not speaking.

### HIGH (not yet fixed)
3. **APPEND_TOKEN O(n)** — `messages.map()` on every token. O(1) fast path available (check last message id first).
4. **Scroll useEffect on messages array reference** — forces layout reflow per token. Fix: depend on `messages.length`.
5. **discussions Map unbounded** — no TTL, memory leak in production. Fix: 1h setTimeout cleanup.
6. **Phase 1 + Phase 7 AI calls sequential** — could be parallelized with Promise.all (no referencePrior).
7. **Summary prompt = full transcript** — can be 10–15k tokens. Fix: truncate to last 2–3 sentences per message.

### MEDIUM (not yet fixed)
8. `lighten`/`darken` color math in Character render — use useMemo on member.color
9. `activeMessage` find in OfficeScene — use useMemo
10. `getMember` linear find in DiscussionPanel/SummaryView — convert to Map
11. `groupedMessages` recomputed every render — use useMemo
12. Floor grid backgroundImage inline style — move to static CSS class
13. Character animations on wrapper div affect text children — apply to SVG directly
14. Typing cursor always animated — conditional on isStreaming prop
15. SSE no reconnect backoff — implement exponential backoff
16. No code splitting — React.lazy for SummaryView, ExecutionPlan, LaunchPad

### LOW (not yet fixed)
17. generateId duplicated in 2 server files
18. No rollupOptions.manualChunks for vendor splitting
19. cors() unrestricted origin
20. SpeechBubble position clamping inline in style

## Architecture Notes
- App: React 19 + Vite 8 + TailwindCSS v4 + react-router-dom v7
- Server: Express 5 + GoogleGenerativeAI (Gemini 2.0 Flash)
- SSE streaming: native EventSource, server fires token events individually
- State: single useReducer in DiscussionContext, no selector pattern
- No virtualization used anywhere (messages list is small enough not to need it yet)
- No image assets to optimize (all visuals are SVG + emoji + CSS)
