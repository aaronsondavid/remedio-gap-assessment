# Brief for Claude — author the funnel content

You are picking up an in-progress portfolio piece: **The Gap Assessment** for Remedio. It's a public marketing self-qualifier. The engine is built. Your job is to author the funnel copy into the JSON logic files so the tool goes from "sample content proving the pattern" to "genuinely persuasive positioning."

**Repo:** `~/Documents/Claude/Projects/remedio-gap-assessment/`

Read these three files first, in this order:
1. `README.md` — what the tool is, how it's structured, why it exists
2. `logic/copy.json` — the shared overstory + hero + microcopy
3. `logic/tracks.json` — the four tracks (Sidecar, Displace, Category, Overstory), their signals, their output copy

Also load these context anchors from David's memory (not in this repo):
- The ABM one-pager: `~/Library/Mobile Documents/com~apple~CloudDocs/Claude Apps/Career/Resume Builder/custom/remedio/Remedio-Funnel-ABM-OnePager.html`
- Mike McLaughlin's positioning notes (paste them in as a system prompt when you start): "Prioritization is Dead," "Remedio : VM :: Crowd : signature AV," philosophy = fix everything, only two prioritization metrics = severity + known exploit, Matt Rowe's leggo blocks (misconfig, AI Gov, Vuln finding+patching for OS, App Control w/o patching, Custom compliance mapping, MitreATT&CK prioritization, Browser ext misconfig, dependency mapping + one-click rollback; EOY = App patching + Attack Surface; coup = Full Kill Chain Analysis)
- Remedio's public messaging: https://remedio.io + https://remedio.io/resources/
- David's edit: "Finding risk solves nothing. Fixing everything solves everything." + "New category = Vulnerability Solutions"

## Voice rules

- No em dashes. Use commas, colons, or period+start-new-sentence.
- Editorial, not corporate. "Here's what your day looks like" not "Enable your security posture."
- Short sentences beat long ones. Fragments are fine when they land harder.
- Never sell. Position. The reader decides.
- Never say "we" or "our team." Say what the tool does.

## Deliverables

Edit four JSON files. Do not touch anything outside `logic/`.

### 1. `logic/pain-sentences.json`

The behavior-segmentation menu. Each sentence carries `signals` that the router uses to route toward a track.

**Your job:**
- Rewrite each `text` so it sounds like something a security leader would actually mutter to themselves at 4pm on Wednesday, not marketing copy.
- Add 4-6 more sentences if you find gaps. Common signals to cover: backlog volume, IT/security handoff friction, board reporting, incumbent renewal, new CISO, active audit, no-scanner-yet, shadow AI, and "just curious."
- **Keep the `signals` array intact** (or extend it consistently). The router reads those, not the text.
- Each sentence should carry 1-2 signals. Rarely 3.

**Signal vocabulary:**
- `backlog` — queue is growing / unresolved findings
- `fault_line` — handoff between security and IT is broken
- `board` — board-level reporting on time-to-fix or coverage
- `renewal` — incumbent scanner or hardening tool renews in ~6 months
- `new_ciso` — leadership change in last 12 months
- `audit` — active audit, compliance push
- `no_scanner` — greenfield or minimal existing stack
- `curious` — just reading, no active project
- `shadow_ai` — AI usage concerns, ungoverned AI tools

### 2. `logic/tracks.json`

Four tracks. Each has: `tag`, `headline`, `lede`, `stats_template` (3 numbers for the output card), `next_steps` (3 items), and two CTAs.

**Your job:**
- Rewrite each track's `headline`, `lede`, and `next_steps` so a CISO reading it thinks "yes, this is my situation." Do NOT be generic.
- Keep the `stats_template` keys stable; adjust values if you have better anchor numbers to use as placeholders (until the calc engine computes them).
- **Sidecar** is the default land. Voice = pragmatic, incremental, fast-cycle. Champion is the remediation owner (probably IT ops or head of vuln mgmt, not the CISO).
- **Displace** is qualified-in on signal (renewal, new CISO, audit). Voice = strategic, consolidation-economics, board-story. Champion is the CISO with CFO air cover.
- **Category** is greenfield or category-shift adopter. Voice = future-facing, "you skip the whole cycle." Champion is a newer CISO or an org designing a security program.
- **Overstory** is just-reading. Voice = respectful, low-friction, honest. Don't nurture-spam.
- **Router weights** (in `routing.weights`) can be adjusted if pain-sentence signal mixes shift. Higher weight = signal pulls harder toward that track.

### 3. `logic/leggo-map.json`

Matt Rowe's leggo blocks. Which Remedio modules ship today, which come EOY, and the moat (Full Kill Chain Analysis).

**Your job:**
- Verify the `modules` are accurate as of the current Remedio product state. Add any that were missed. Correct any misstated ones.
- Populate `displaces` with the specific incumbent tools each leggo replaces. Be specific ("Tenable scanner side," not just "Tenable"). This is what future consolidation math will hang off of.
- The `moat_note` on `Kill Chain` is the 2-year barrier-to-entry claim. Sharpen it or leave it.
- `category_shift.old` / `.new` / `.philosophy` / `.analog` — sharpen the copy. This is the framing the tool leans on throughout.

### 4. `logic/copy.json`

Shared copy: overstory pillars, hero, hard-input labels, share microcopy.

**Your job:**
- The overstory's three pillars should mirror the one-pager exactly, or improve them if you find sharper phrasing.
- `gap_assessment.step_pain_headline` and `step_pain_subtitle` should make clicking sentences feel natural, not like a survey.
- `hard_inputs.current_stack.hint` is a small line that carries a big story ("the freelancing that killed the last web version. Not this one."). Preserve or improve.

## What NOT to do

- Do not edit HTML, CSS, or JS. Content and logic only.
- Do not add em dashes.
- Do not add tracking, forms, or account-capture. The share link is the only artifact carrying state.
- Do not compare Remedio to specific competitors by name in the marketing tool (Sidecar and Category tracks). The **Displace** track can name incumbents by category ("your scanner," "your hardening tool") but do not do brand-vs-brand copy on the public page. Named displacement lives in `leggo-map.json`, which is consumed by future deeper tooling, not the public marketing tool.
- Do not sneak product-launch news into the marketing tool. If Attack Surface or App Patching isn't shipping yet, do not promise it in the public copy. Roadmap language stays in `leggo-map.json` under `status: eoy`.

## When you're done

Hand back to David with a short note: "here are the four JSON files, here's what changed, here's what I'd tune next if I had another hour."

David hands it to Claude Code (a parallel session) to wire up, test the routing on the new signals, and deploy to GitHub Pages under his account.

## Two questions David wants your opinion on

1. **Should there be a fifth track for Shadow AI specifically?** The `shadow_ai` signal exists but currently rolls into Sidecar/Displace. Given Remedio AI Govern is a full module, a dedicated **AI Govern** track might land better with certain personas.
2. **Should the marketing tool ask for role directly, or continue to infer from pain sentences?** Inferring is smarter but slower to converge. Asking is one more question but produces a cleaner segment. David leans "infer" (behavior-segments-better-than-forms is the whole thesis) but he wants your read.

Answer those two in your handback note.
