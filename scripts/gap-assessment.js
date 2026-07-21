/* Gap Assessment marketing tool
 * Vanilla JS wizard: intro -> pain sentences -> hard inputs -> output.
 * All copy + logic loaded from ../logic/*.json so this file rarely changes.
 * Share link encodes state in the URL hash (base64-encoded JSON), no backend.
 */

const state = {
  step: 0,               // 0 intro, 1 pain, 2 hard inputs, 3 output
  selectedSentences: [], // ids from pain-sentences.json
  endpointBand: null,
  industry: null,
  stack: [],             // ids from copy.json.hard_inputs.current_stack.options
  customStack: [],       // freeform strings
  computedTrack: null,
};

let logic = { pain: null, tracks: null, leggo: null, copy: null, rubric: null };

// ---------- Load logic ----------

async function loadLogic() {
  const [pain, tracks, leggo, copy, rubric] = await Promise.all([
    fetch("logic/pain-sentences.json").then(r => r.json()),
    fetch("logic/tracks.json").then(r => r.json()),
    fetch("logic/leggo-map.json").then(r => r.json()),
    fetch("logic/copy.json").then(r => r.json()),
    fetch("logic/rubric.json").then(r => r.json()),
  ]);
  logic = { pain, tracks, leggo, copy, rubric };
}

// ---------- Backlog math (light) ----------

function estimateBacklog() {
  const r = logic.rubric;
  const endpoints = r.endpoint_band_midpoints[state.endpointBand] || null;
  const industryFactor = r.industry_incident_factor[state.industry] || 1.0;
  if (!endpoints) return null;
  const baseline = r.backlog_per_endpoint_baseline.value;
  const backlog = Math.round(endpoints * baseline * industryFactor);
  const q1Clear = Math.round(backlog * r.remedio_clear_rate.q1);
  const yr1Clear = Math.round(backlog * r.remedio_clear_rate.yr1);
  return { endpoints, industryFactor, backlog, q1Clear, yr1Clear };
}

function fmtNum(n) {
  if (n === null || n === undefined) return "—";
  return n.toLocaleString();
}

// ---------- URL state (share link) ----------

function encodeState() {
  const payload = {
    s: state.selectedSentences,
    b: state.endpointBand,
    i: state.industry,
    t: state.stack,
    c: state.customStack,
  };
  return btoa(unescape(encodeURIComponent(JSON.stringify(payload))));
}

function decodeState(hash) {
  try {
    const raw = decodeURIComponent(escape(atob(hash)));
    const p = JSON.parse(raw);
    state.selectedSentences = p.s || [];
    state.endpointBand = p.b || null;
    state.industry = p.i || null;
    state.stack = p.t || [];
    state.customStack = p.c || [];
    return true;
  } catch { return false; }
}

function shareUrl() {
  const base = window.location.href.split("#")[0];
  return `${base}#result=${encodeState()}`;
}

// ---------- Router ----------

function computeTrack() {
  const weights = logic.tracks.routing.weights;
  const priority = logic.tracks.routing.priority_order;
  const scores = Object.fromEntries(priority.map(t => [t, 0]));

  // Collect signals from selected sentences
  const signals = new Set();
  for (const sid of state.selectedSentences) {
    const sentence = logic.pain.sentences.find(x => x.id === sid);
    if (!sentence) continue;
    for (const s of sentence.signals) signals.add(s);
  }

  // Score each track
  for (const track of priority) {
    for (const sig of signals) {
      const w = weights[track][sig];
      if (w) scores[track] += w;
    }
  }

  // Hard-input boosts
  const hasScanner = state.stack.some(id => ["tenable","qualys","rapid7"].includes(id));
  const hasNoTools = state.stack.includes("none");
  if (hasScanner) { scores.Sidecar += 2; scores.Displace += 1; }
  if (hasNoTools) { scores.Category += 3; }
  if (state.customStack.length > 0) { scores.Sidecar += 1; }

  // Winner: highest score, ties break by priority order
  let winner = "Overstory";
  let best = -1;
  for (const t of priority) {
    if (scores[t] > best) { best = scores[t]; winner = t; }
  }
  return winner;
}

// ---------- Rendering ----------

function el(sel) { return document.querySelector(sel); }

function renderStep() {
  const container = el("#wizard-body");
  const progress = el("#progress");
  if (progress) {
    const steps = progress.querySelectorAll(".step");
    steps.forEach((s, i) => {
      s.classList.toggle("done", i < state.step);
      s.classList.toggle("current", i === state.step);
    });
  }

  container.innerHTML = "";
  if (state.step === 0) renderIntro(container);
  else if (state.step === 1) renderPain(container);
  else if (state.step === 2) renderHard(container);
  else if (state.step === 3) renderOutput(container);
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function renderIntro(c) {
  const overstory = logic.copy.overstory;
  const intro = logic.copy.gap_assessment;
  c.innerHTML = `
    <div class="section">
      <div class="band">
        <div class="eyebrow">${overstory.eyebrow}</div>
        <h2 style="margin-top: 8px;">${overstory.headline}</h2>
        <div class="pillars mt-16">
          ${overstory.pillars.map(p => `
            <div class="pillar">
              <span class="n">${p.n}</span>
              <p>${p.p}</p>
            </div>
          `).join("")}
        </div>
      </div>

      <div class="mt-32">
        <div class="eyebrow">${intro.intro_eyebrow}</div>
        <h2 style="margin-top: 8px;">${intro.intro_headline}</h2>
        <p class="lede" style="margin-top: 16px; max-width: 600px;">${intro.intro_lede}</p>
      </div>

      <div class="wizard-nav">
        <span></span>
        <button class="btn primary lg" data-action="next">Start →</button>
      </div>
    </div>
  `;
}

function renderPain(c) {
  const step = logic.copy.gap_assessment;
  c.innerHTML = `
    <div class="section">
      <div class="eyebrow">${step.step_pain_eyebrow}</div>
      <h2 style="margin-top: 8px;">${step.step_pain_headline}</h2>
      <p class="subtitle">${step.step_pain_subtitle}</p>

      <div class="chips">
        ${logic.pain.sentences.map(s => `
          <button class="chip ${state.selectedSentences.includes(s.id) ? "selected" : ""}"
                  data-toggle-sentence="${s.id}">
            ${s.text}
          </button>
        `).join("")}
      </div>

      <div class="wizard-nav">
        <button class="btn ghost" data-action="prev">← Back</button>
        <button class="btn primary" data-action="next">Next →</button>
      </div>
    </div>
  `;
}

function renderHard(c) {
  const step = logic.copy.gap_assessment;
  const inputs = logic.copy.hard_inputs;
  c.innerHTML = `
    <div class="section">
      <div class="eyebrow">${step.step_hard_eyebrow}</div>
      <h2 style="margin-top: 8px;">${step.step_hard_headline}</h2>
      <p class="subtitle">${step.step_hard_subtitle}</p>

      <div class="field">
        <label>${inputs.endpoint_band.label}</label>
        <div class="segments">
          ${inputs.endpoint_band.options.map(opt => `
            <button class="segment ${state.endpointBand === opt ? "selected" : ""}"
                    data-endpoint-band="${opt}">${opt}</button>
          `).join("")}
        </div>
      </div>

      <div class="field">
        <label>${inputs.industry.label}</label>
        <div class="segments">
          ${inputs.industry.options.map(opt => `
            <button class="segment ${state.industry === opt ? "selected" : ""}"
                    data-industry="${opt}">${opt}</button>
          `).join("")}
        </div>
      </div>

      <div class="field">
        <label>${inputs.current_stack.label}</label>
        <p class="hint">${inputs.current_stack.hint}</p>
        <div class="stack-grid">
          ${inputs.current_stack.options.map(o => `
            <label class="stack-item ${state.stack.includes(o.id) ? "selected" : ""}"
                   data-toggle-stack="${o.id}">
              <span class="check"></span>
              <span>${o.label}</span>
            </label>
          `).join("")}
        </div>
        <div class="stack-add">
          <input type="text" id="custom-stack-input" placeholder="Add a tool that isn't listed…" />
          <button class="btn ghost" data-action="add-custom">Add</button>
        </div>
        <div class="custom-chips">
          ${state.customStack.map((c, i) => `
            <span class="custom">${c}
              <button data-remove-custom="${i}" aria-label="Remove">×</button>
            </span>
          `).join("")}
        </div>
      </div>

      <div class="wizard-nav">
        <button class="btn ghost" data-action="prev">← Back</button>
        <button class="btn primary" data-action="next">See my play →</button>
      </div>
    </div>
  `;
}

function renderOutput(c) {
  const track = state.computedTrack;
  const t = logic.tracks.tracks[track];
  const step = logic.copy.gap_assessment;
  const share = shareUrl();

  // Reason mirror: show ALL the sentences the user clicked
  const clickedSentences = state.selectedSentences
    .map(id => logic.pain.sentences.find(x => x.id === id))
    .filter(Boolean);

  // Hide the internal track label; keep the eyebrow neutral
  c.innerHTML = `
    <div class="section">
      <div class="eyebrow">${step.step_output_eyebrow}</div>
      <h2 style="margin-top: 8px;">${step.step_output_headline}</h2>
      <p class="subtitle">${step.step_output_subtitle}</p>

      <div class="output-card">
        ${clickedSentences.length ? `
          <div class="reason-mirror">
            <div class="eyebrow" style="margin-bottom: 8px;">What you told us</div>
            <ul class="mirror-list">
              ${clickedSentences.map(s => `<li>"${s.text}"</li>`).join("")}
            </ul>
            <p class="reason-line">${t.reason_line || ""}</p>
          </div>
        ` : ""}

        <h2>${t.headline}</h2>
        <p class="lede">${t.lede}</p>

        <div class="stats">
          ${renderStatsFor(track, t)}
        </div>

        <div class="mt-32">
          <div class="eyebrow dk">What to read next</div>
          <div class="next" style="margin-top: 12px;">
            ${t.next_steps.map(s => `
              <div class="step"><b>${s.title}</b>${s.body}</div>
            `).join("")}
          </div>
        </div>

        <div class="final-cta">
          <a class="btn primary lg" href="${t.cta_primary.href}">${t.cta_primary.label}</a>
        </div>

        <div class="utility-row">
          <button class="btn link" data-action="download-pdf">Download PDF</button>
        </div>

        <div class="share">
          <span>🔗 ${logic.copy.share.note}</span>
          <input type="text" readonly value="${share}" id="share-input"/>
          <button class="btn sm ghost" data-action="copy-share">Copy</button>
        </div>
      </div>

      <div class="wizard-nav">
        <button class="btn ghost" data-action="restart">Start over</button>
        <span></span>
      </div>
    </div>
  `;
}

function renderStatsFor(track, t) {
  // Compose stats using the template + backlog math from user inputs.
  // Backlog math is hedged, marked as an estimate, not a promise.
  const s = t.stats_template;
  const b = estimateBacklog();
  const format = (k, v, n) => `
    <div class="stat">
      <span class="k">${k}</span>
      <span class="v">${v}</span>
      ${n ? `<span class="n">${n}</span>` : ""}
    </div>`;

  if (track === "Sidecar") {
    const q1Text = b ? `~${fmtNum(b.q1Clear)}` : `~${s.backlog_cleared_q1_pct}%`;
    const q1Note = b ? `of an est. ${fmtNum(b.backlog)} backlog` : "on your reported queue";
    return `
      ${format("Q1 cleared (est.)", q1Text, q1Note)}
      ${format("Time-to-fix", `${s.time_to_fix_reduction_pct}% faster`, "vs current handoff")}
      ${format("Budget cycle", s.budget_cycle, "no scanner disruption")}
    `;
  }
  if (track === "Displace") {
    const yr1Text = b ? `~${fmtNum(b.yr1Clear)}` : `${s.tools_displaced_yr1} tools`;
    const yr1Note = b ? `of an est. ${fmtNum(b.backlog)} backlog, Y1` : "displaced typical land";
    return `
      ${format("Y1 cleared (est.)", yr1Text, yr1Note)}
      ${format("Consolidated spend", `-${s.consolidated_spend_reduction_pct}%`, "yr-1 net")}
      ${format("Board report ready", s.board_report_ready, "post-cutover")}
    `;
  }
  if (track === "Category") return `
    ${format("Ahead of market", `${s.months_ahead_of_market} mo`, "on Vuln Solutions")}
    ${format("Legacy tools avoided", s.legacy_tools_avoided, "never buy them")}
    ${format("Greenfield deploy", `${s.greenfield_deploy_days} days`, "to first fix")}
  `;
  return `
    ${format("Read time", `${s.read_time_min} min`, "3 pieces")}
    ${format("Resources curated", s.resources_curated, "your role, your pain")}
    ${format("Next check-in", s.next_check_in, "no nurture spam")}
  `;
}

// ---------- Event handlers ----------

function bind() {
  document.addEventListener("click", (e) => {
    const t = e.target.closest("[data-action],[data-toggle-sentence],[data-endpoint-band],[data-industry],[data-toggle-stack],[data-remove-custom]");
    if (!t) return;

    if (t.dataset.action === "next") {
      if (state.step === 2) state.computedTrack = computeTrack();
      state.step = Math.min(3, state.step + 1);
      renderStep();
    } else if (t.dataset.action === "prev") {
      state.step = Math.max(0, state.step - 1);
      renderStep();
    } else if (t.dataset.action === "restart") {
      Object.assign(state, {
        step: 0, selectedSentences: [], endpointBand: null,
        industry: null, stack: [], customStack: [], computedTrack: null,
      });
      window.location.hash = "";
      renderStep();
    } else if (t.dataset.action === "add-custom") {
      const inp = el("#custom-stack-input");
      const v = (inp.value || "").trim();
      if (v && !state.customStack.includes(v)) state.customStack.push(v);
      renderStep();
    } else if (t.dataset.action === "copy-share") {
      const inp = el("#share-input");
      inp.select();
      document.execCommand("copy");
      t.textContent = "Copied";
      setTimeout(() => { t.textContent = "Copy"; }, 1500);
    } else if (t.dataset.action === "download-pdf") {
      window.print();
    } else if (t.dataset.toggleSentence) {
      const id = t.dataset.toggleSentence;
      const idx = state.selectedSentences.indexOf(id);
      if (idx === -1) state.selectedSentences.push(id);
      else state.selectedSentences.splice(idx, 1);
      renderStep();
    } else if (t.dataset.endpointBand) {
      state.endpointBand = t.dataset.endpointBand;
      renderStep();
    } else if (t.dataset.industry) {
      state.industry = t.dataset.industry;
      renderStep();
    } else if (t.dataset.toggleStack) {
      const id = t.dataset.toggleStack;
      const idx = state.stack.indexOf(id);
      if (idx === -1) state.stack.push(id);
      else state.stack.splice(idx, 1);
      renderStep();
    } else if (t.dataset.removeCustom) {
      state.customStack.splice(parseInt(t.dataset.removeCustom, 10), 1);
      renderStep();
    }
  });
}

// ---------- Init ----------

async function init() {
  await loadLogic();
  bind();

  // Deep-link support: if URL hash has state, restore + skip to output
  const h = window.location.hash;
  const m = h.match(/^#result=(.+)$/);
  if (m && decodeState(m[1])) {
    state.step = 3;
    state.computedTrack = computeTrack();
  }

  renderStep();
}

init();
