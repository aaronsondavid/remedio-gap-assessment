# The Gap Assessment

**"Finding was never the problem. Fixing is."**

A public marketing self-qualifier for Remedio. Runs on the prospect's own backlog. Behavior segments each account into one of four plays: **Sidecar**, **Displace**, **Category adopt**, or **Overstory**. Output is a champion's business case sketch, ready to forward. Share link carries the full state.

Prepared by [David Aaronson](https://linkedin.com/in/david-aaronson-spmm) as a portfolio piece and open gift to Remedio.

## Why it exists

Remedio's category story is unusually crisp. "Prioritization is dead. Fix everything." A public gap-assessment gate that runs on the prospect's own backlog does two jobs at once:

1. **Segments behaviorally** — no forms, no lead-qualification interrogation. Which sentences a prospect clicks tells you whether they're wired into their scanner or done with it.
2. **Writes the champion's business case** — the output is forwardable to CFO/CIO without a rep in the loop.

## Structure

```
remedio-gap-assessment/
├── index.html                    # The marketing tool (loads at root)
├── styles/
│   ├── tokens.css                # Design tokens (Remedio + one-pager blend)
│   ├── layout.css                # Page frame, hero, editorial bands
│   └── components.css            # Buttons, cards, wizard inputs, output artifacts
├── scripts/
│   └── gap-assessment.js         # Wizard state machine + router (vanilla JS, no build)
├── logic/                        # ← edit these to change content, not code
│   ├── pain-sentences.json       # Behavior-segmentation signals
│   ├── tracks.json               # Sidecar/Displace/Category/Overstory routing + copy
│   ├── leggo-map.json            # Matt's leggo blocks + Remedio module mapping
│   └── copy.json                 # Shared copy (overstory, headlines, microcopy)
├── BRIEF-FOR-CLAUDE.md           # What to author into the JSON files next
└── README.md
```

## Running locally

The tool loads JSON via `fetch()` which requires an HTTP server (won't work from `file://`). From this folder:

```bash
python3 -m http.server 8080
```

Then open http://localhost:8080/

## Editing content (no code changes needed)

All copy and logic live in `logic/*.json`. Marketing can:

- Add/remove/reword pain sentences in `logic/pain-sentences.json` (just keep the `signals` array so the router still works)
- Change track headlines, ledes, next steps, CTAs in `logic/tracks.json`
- Update the leggo-block roadmap in `logic/leggo-map.json`
- Reshape the overstory, hero copy, or hard-input labels in `logic/copy.json`

Router weights are also in `tracks.json` under `routing.weights` — tune how aggressively each signal pulls toward each track.

## Design language

Blend of Remedio's public brand (white bg, gold accent, flat modern) with David Aaronson's ABM one-pager (navy `#0F2036`, accent blue `#1F6FB2`, SF Mono eyebrows, editorial density). Tokens in `styles/tokens.css`. The tool frame feels like Remedio's resources page; the output card feels like David's editorial one-pager.

## Fork-friendly

Repo is under David Aaronson's name as portfolio. Structure is explicit and dependency-free (vanilla JS, no build step, no npm) so Remedio can fork, rebrand, and adopt without inheriting a build system. Every file has one job.

To adopt:
1. Fork the repo
2. Edit the four JSON files in `logic/`
3. Update `styles/tokens.css` if brand tokens change
4. Deploy to GitHub Pages (or any static host)

That's it. There is no server.

## Credits

- **Overstory + one-pager**: David Aaronson
- **Positioning source**: Mike McLaughlin (prioritization-is-dead framing, Crowd/AV analogy)
- **Leggo blocks**: Matt Rowe (CTO, Remedio)
- **ROI targets alignment**: Mor at Remedio
- **Design + build**: David Aaronson with Claude

## License

MIT for the code. Content and Remedio branding remain Remedio's property; David's authorial positioning remains his.
