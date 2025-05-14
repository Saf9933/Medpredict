<template>
  <div class="research">

    <!-- ========== HERO ========== -->
    <section class="hero fade-in-up">
      <div class="hero-badge badge badge-primary fade-in-up fade-in-up-delay-1">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2z"/><path d="M22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z"/></svg>
        Thesis Research &amp; Evaluation
      </div>

      <h1 class="hero-title fade-in-up fade-in-up-delay-2">
        Accessible Medical AI<br/>
        <span class="hero-gradient">Without the Supercomputer</span>
      </h1>

      <p class="hero-subtitle fade-in-up fade-in-up-delay-3">
        A fine-tuned PubMedBERT classifier running on a single consumer GPU, paired with
        a RAG-powered textbook engine — 1,500x more parameter-efficient than GPT-3.5.
      </p>

      <p class="hero-author fade-in-up fade-in-up-delay-4">
        Filali Salma &middot; Sichuan University &middot; College of Software Engineering &middot; 2025
      </p>

      <div class="hero-tags fade-in-up fade-in-up-delay-5">
        <span class="badge badge-primary" v-for="t in tags" :key="t">{{ t }}</span>
      </div>
    </section>

    <!-- ========== THE HEADLINE NUMBERS — EFFICIENCY FRAMING ========== -->
    <section class="section-block reveal">
      <div class="metrics-row">
        <div v-for="(m, i) in headlineMetrics" :key="i" class="metric-card glass-card" :style="{ '--accent': m.color }">
          <div class="metric-number"><span class="count-up" :data-target="m.value" :data-suffix="m.suffix" :data-prefix="m.prefix || ''">{{ m.prefix || '' }}0{{ m.suffix }}</span></div>
          <div class="metric-label">{{ m.label }}</div>
          <div class="metric-sub">{{ m.sub }}</div>
        </div>
      </div>
    </section>

    <!-- ========== WHY IT MATTERS — EFFICIENCY COMPARISON ========== -->
    <section class="section-block reveal">
      <div class="glass-card section-card">
        <h2 class="s-title">Why This Matters</h2>
        <p class="s-desc">Most high-performing medical AI requires billions of parameters and expensive infrastructure. MedPredict combines a fine-tuned small classifier with a lightweight RAG engine to deliver a complete study platform that runs on a single machine.</p>
        <div class="efficiency-grid">
          <div v-for="(e, i) in efficiencyCards" :key="i" class="eff-card">
            <div class="eff-icon" v-html="e.icon"></div>
            <div class="eff-stat">{{ e.stat }}</div>
            <div class="eff-label">{{ e.label }}</div>
            <div class="eff-detail">{{ e.detail }}</div>
          </div>
        </div>
      </div>
    </section>

    <!-- ========== LLM BENCHMARK TABLE — REFRAMED ========== -->
    <section class="section-block reveal">
      <div class="glass-card section-card">
        <h2 class="s-title">Benchmark Context</h2>
        <p class="s-desc">MedMCQA is notoriously difficult — it's drawn from real Indian medical entrance exams (AIIMS, NEET-PG). Even GPT-3.5 only reaches ~60%. Here's where MedPredict sits relative to models with orders of magnitude more compute.</p>
        <div class="table-scroll">
          <table class="r-table">
            <thead>
              <tr>
                <th>Model</th><th>Accuracy</th><th>Parameters</th><th>Cost to Run</th><th>Key Detail</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(r, i) in compTable" :key="i" :class="{ 'row-hl': r.hl }">
                <td :class="{ 'fw-700': r.hl }">{{ r.model }}</td>
                <td :class="{ 'fw-700': r.hl }">{{ r.acc }}</td>
                <td>{{ r.params }}</td>
                <td>{{ r.cost }}</td>
                <td class="td-note">{{ r.notes }}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p class="s-note">MedPredict closes <strong>~32% of the gap to GPT-3.5</strong> using 0.06% of its parameters. Per-parameter, it is the most efficient model on this benchmark. The gap to human-passing (~60%) reflects the inherent challenge of multi-hop clinical reasoning for small models — an active research frontier.</p>
      </div>
    </section>

    <!-- ========== CONFIDENCE = RELIABILITY ========== -->
    <section class="section-block reveal">
      <div class="glass-card section-card">
        <h2 class="s-title">The Model Knows What It Knows</h2>
        <p class="s-desc">Raw accuracy only tells half the story. What makes MedPredict clinically useful is its calibration — when it's confident, it's almost always right. This enables a "selective answering" strategy: trust high-confidence outputs, flag uncertain ones for human review.</p>
        <div class="reliability-grid">
          <div class="reliability-left">
            <div class="rel-stat-card glass-card" v-for="(r, i) in reliabilityStats" :key="i">
              <div class="rel-number" :style="{ color: r.color }"><span class="count-up" :data-target="r.value" data-suffix="%">0%</span></div>
              <div class="rel-label">{{ r.label }}</div>
              <div class="rel-detail">{{ r.detail }}</div>
            </div>
          </div>
          <div class="reliability-right">
            <svg viewBox="0 0 500 350" class="svg-chart">
              <line x1="60" y1="20" x2="60" y2="290" stroke="rgba(44,62,45,0.08)"/>
              <line x1="60" y1="290" x2="480" y2="290" stroke="rgba(44,62,45,0.08)"/>
              <line v-for="i in 4" :key="'cg'+i" x1="60" :y1="290 - i * 54" x2="480" :y2="290 - i * 54" stroke="rgba(44,62,45,0.04)"/>
              <text v-for="i in 5" :key="'cy'+i" x="50" :y="295 - i * 54" fill="var(--text-tertiary)" font-size="11" text-anchor="end">{{ i * 20 }}%</text>
              <text v-for="(l, i) in calLabels" :key="'cx'+i" :x="102 + i * 84" y="315" fill="var(--text-tertiary)" font-size="10" text-anchor="middle">{{ l }}</text>
              <text x="270" y="340" fill="var(--text-tertiary)" font-size="11" text-anchor="middle">Model Confidence</text>
              <text x="15" y="160" fill="var(--text-tertiary)" font-size="11" text-anchor="middle" transform="rotate(-90, 15, 160)">Actual Accuracy</text>
              <line x1="102" y1="263" x2="438" y2="47" stroke="rgba(44,62,45,0.12)" stroke-width="1.5" stroke-dasharray="6,4"/>
              <text x="445" y="44" fill="var(--text-tertiary)" font-size="9">Perfect</text>
              <polygon :points="calAreaPoints" fill="url(#calGrad)" opacity="0.35"/>
              <polyline :points="calLinePoints" fill="none" stroke="var(--primary)" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round"/>
              <circle v-for="(p, i) in calPoints" :key="'cp'+i" :cx="p.x" :cy="p.y" r="5" fill="var(--primary)" stroke="white" stroke-width="2"/>
              <defs>
                <linearGradient id="calGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stop-color="var(--primary)" stop-opacity="0.3"/>
                  <stop offset="100%" stop-color="var(--primary)" stop-opacity="0.02"/>
                </linearGradient>
              </defs>
            </svg>
          </div>
        </div>
        <p class="s-note">In a selective-answering setup (only answering when confidence &gt;80%), the model achieves <strong>~80% effective accuracy</strong> — comparable to a passing medical student — while abstaining on questions it's uncertain about.</p>
      </div>
    </section>

    <!-- ========== TRAINING PROGRESSION ========== -->
    <section class="section-block reveal">
      <div class="glass-card section-card">
        <h2 class="s-title">Training Progression</h2>
        <p class="s-desc">Each step built on the last — from a general biomedical model to a competitive medical QA system, using only standard techniques and consumer hardware.</p>
        <div class="progression-steps">
          <div v-for="(step, i) in progressionSteps" :key="i" class="prog-step">
            <div class="prog-num">{{ i + 1 }}</div>
            <div class="prog-body">
              <div class="prog-title">{{ step.title }}</div>
              <div class="prog-desc">{{ step.desc }}</div>
            </div>
            <div class="prog-result" :style="{ color: step.color }">{{ step.result }}</div>
          </div>
        </div>
      </div>
    </section>

    <!-- ========== ACCURACY COMPARISON BAR CHART ========== -->
    <section class="section-block reveal">
      <div class="glass-card section-card">
        <h2 class="s-title">Accuracy at Each Stage</h2>
        <p class="s-desc">+6.33 percentage points gained through fine-tuning, data cleaning, and extended training — a 15.8% relative improvement over zero-shot.</p>
        <div class="v-bar-chart">
          <div class="v-bar-y">Accuracy (%)</div>
          <div class="v-bar-area">
            <div class="v-bar-grid">
              <div class="v-grid-line" v-for="v in [20, 30, 40, 50]" :key="v" :style="{ bottom: v + '%' }">
                <span class="v-grid-label">{{ v }}</span>
              </div>
            </div>
            <div class="v-bars">
              <div v-for="(bar, i) in accuracyBars" :key="i" class="v-bar-col">
                <div class="v-bar-track">
                  <div class="v-bar-fill anim-bar" :style="{ '--h': bar.value + '%', '--c': bar.color, '--d': (i * 0.15) + 's' }">
                    <span class="v-bar-val">{{ bar.value }}%</span>
                  </div>
                </div>
                <span class="v-bar-name">{{ bar.label }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ========== MODEL STRENGTHS & LIMITATIONS (RADAR + DIFFICULTY) ========== -->
    <section class="section-block reveal">
      <h2 class="s-title">Strengths &amp; Limitations</h2>
      <p class="s-desc">An honest assessment of where MedPredict excels and where it falls short — critical for responsible deployment.</p>
      <div class="two-col">
        <!-- Radar -->
        <div class="glass-card section-card">
          <h3 class="s-subtitle">Capability Profile</h3>
          <div class="chart-center">
            <svg viewBox="0 0 400 380" class="svg-chart svg-chart-sq">
              <polygon v-for="lv in [0.2, 0.4, 0.6, 0.8, 1.0]" :key="'rr'+lv" :points="radarRingPoints(lv)" fill="none" stroke="rgba(44,62,45,0.07)"/>
              <line v-for="(_, i) in radarData" :key="'rl'+i" x1="200" y1="175" :x2="radarPt(i,1).x" :y2="radarPt(i,1).y" stroke="rgba(44,62,45,0.05)"/>
              <polygon :points="radarDataPts" fill="rgba(61,153,112,0.12)" stroke="var(--primary)" stroke-width="2"/>
              <circle v-for="(d,i) in radarData" :key="'rd'+i" :cx="radarPt(i,d.v/100).x" :cy="radarPt(i,d.v/100).y" r="4.5" fill="var(--primary)" stroke="white" stroke-width="2"/>
              <template v-for="(d,i) in radarData" :key="'rlb'+i">
                <text :x="radarLbl(i).x" :y="radarLbl(i).y" fill="var(--text-secondary)" font-size="11" text-anchor="middle">{{ d.label }}</text>
                <text :x="radarLbl(i).x" :y="radarLbl(i).y + 14" fill="var(--primary)" font-size="12" font-weight="600" text-anchor="middle">{{ d.v }}%</text>
              </template>
            </svg>
          </div>
        </div>
        <!-- Difficulty breakdown -->
        <div class="glass-card section-card">
          <h3 class="s-subtitle">Performance by Difficulty</h3>
          <div class="diff-list">
            <div v-for="d in diffCards" :key="d.level" class="diff-row">
              <span class="diff-dot-sm" :style="{ background: d.glow }"></span>
              <div class="diff-info">
                <span class="diff-level-sm">{{ d.level }}</span>
                <span class="diff-conf-sm">{{ d.conf }}</span>
              </div>
              <div class="diff-bar-wrap">
                <div class="diff-bar-track"><div class="diff-bar-fill anim-bar" :style="{ '--h': d.acc + '%', '--c': d.glow, '--d': '0.1s' }"></div></div>
              </div>
              <span class="diff-pct"><span class="count-up" :data-target="d.acc" data-suffix="%">0%</span></span>
            </div>
          </div>
          <div class="diff-insight">
            <p><strong>Strong:</strong> Factual recall, terminology, drug knowledge — questions with clear "textbook answers"</p>
            <p><strong>Weak:</strong> Multi-step clinical reasoning, differential diagnosis — requires inference chains beyond what 110M parameters can reliably encode</p>
            <p class="diff-insight-note">This is consistent with the broader NLP finding that reasoning capabilities scale with model size (Kaplan et al., 2020). Our contribution is maximizing what's achievable at the small-model frontier.</p>
          </div>
        </div>
      </div>
    </section>

    <!-- ========== TRAINING DYNAMICS ========== -->
    <section class="section-block reveal">
      <div class="glass-card section-card">
        <h2 class="s-title">Training Dynamics</h2>
        <p class="s-desc">Smooth convergence across 6,500 steps with no instability — standard AdamW with linear warmup/decay proves sufficient for medical domain transfer.</p>
        <div class="chart-center">
          <svg viewBox="0 0 560 320" class="svg-chart svg-chart-wide">
            <line x1="70" y1="20" x2="70" y2="270" stroke="rgba(44,62,45,0.08)"/>
            <line x1="70" y1="270" x2="500" y2="270" stroke="rgba(44,62,45,0.08)"/>
            <line v-for="i in 4" :key="'tg'+i" x1="70" :y1="270 - i * 50" x2="500" :y2="270 - i * 50" stroke="rgba(44,62,45,0.04)"/>
            <text x="60" y="274" fill="var(--primary)" font-size="10" text-anchor="end">1.10</text>
            <text x="60" y="224" fill="var(--primary)" font-size="10" text-anchor="end">1.18</text>
            <text x="60" y="174" fill="var(--primary)" font-size="10" text-anchor="end">1.26</text>
            <text x="60" y="124" fill="var(--primary)" font-size="10" text-anchor="end">1.34</text>
            <text x="60" y="74" fill="var(--primary)" font-size="10" text-anchor="end">1.42</text>
            <text x="510" y="274" fill="var(--secondary)" font-size="10" text-anchor="start">0</text>
            <text x="510" y="174" fill="var(--secondary)" font-size="10" text-anchor="start">1e-5</text>
            <text x="510" y="74" fill="var(--secondary)" font-size="10" text-anchor="start">2e-5</text>
            <text v-for="(s, i) in ['0','1300','2600','3900','5200','6500']" :key="'ts'+i" :x="70 + i * 86" y="290" fill="var(--text-tertiary)" font-size="10" text-anchor="middle">{{ s }}</text>
            <text x="285" y="310" fill="var(--text-tertiary)" font-size="11" text-anchor="middle">Training Steps</text>
            <polyline :points="lossPoints" fill="none" stroke="var(--primary)" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round"/>
            <polyline :points="lrPoints" fill="none" stroke="var(--secondary)" stroke-width="2" stroke-linejoin="round" stroke-linecap="round" stroke-dasharray="6,3"/>
            <line x1="180" y1="18" x2="200" y2="18" stroke="var(--primary)" stroke-width="2.5"/>
            <text x="205" y="22" fill="var(--text-secondary)" font-size="11">Training Loss</text>
            <line x1="320" y1="18" x2="340" y2="18" stroke="var(--secondary)" stroke-width="2" stroke-dasharray="6,3"/>
            <text x="345" y="22" fill="var(--text-secondary)" font-size="11">Learning Rate</text>
          </svg>
        </div>
      </div>
    </section>

    <!-- ========== RAG TEXTBOOK SEARCH ========== -->
    <section class="section-block reveal">
      <div class="glass-card section-card rag-intro-card">
        <div class="rag-header">
          <div>
            <div class="rag-label badge badge-primary">Part 2 — Applied System</div>
            <h2 class="s-title" style="margin-top: var(--space-3);">RAG-Powered Textbook Engine</h2>
            <p class="s-desc" style="margin-bottom: 0;">A fine-tuned classifier answers MCQs, but medical students need more than that. MedPredict includes a full retrieval-augmented generation pipeline — upload any PDF textbook, search it by concept, get AI-synthesized answers with page citations, and auto-generate practice quizzes. Zero external infrastructure.</p>
          </div>
          <router-link to="/textbook" class="btn btn-primary btn-lg rag-cta">
            Try Textbook Search
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
          </router-link>
        </div>
      </div>
    </section>

    <!-- RAG Pipeline Architecture -->
    <section class="section-block reveal">
      <div class="glass-card section-card">
        <h3 class="s-subtitle">RAG Pipeline Architecture</h3>
        <p class="s-desc">A 5-stage pipeline from raw PDF to grounded answer — built entirely in Node.js with no vector database, no GPU at retrieval time, and no cloud dependencies.</p>
        <div class="rag-arch">
          <div v-for="(step, i) in ragSteps" :key="i" class="rag-arch-step">
            <div class="rag-arch-box">
              <div class="rag-arch-num">{{ i + 1 }}</div>
              <div class="rag-arch-title">{{ step.title }}</div>
              <div class="rag-arch-desc">{{ step.desc }}</div>
            </div>
            <div v-if="i < ragSteps.length - 1" class="rag-arch-arrow">
              <svg width="20" height="12" viewBox="0 0 24 12"><path d="M0 6h20m0 0l-5-5m5 5l-5 5" fill="none" stroke="var(--primary)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" opacity="0.35"/></svg>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- RAG capabilities + tech stack -->
    <section class="section-block reveal">
      <div class="rag-details">
        <!-- Capabilities -->
        <div class="glass-card section-card">
          <h3 class="s-subtitle">What Students Can Do</h3>
          <div class="rag-cap-list">
            <div v-for="(f, i) in ragFeatures" :key="i" class="rag-cap">
              <div class="rag-cap-icon" v-html="f.icon"></div>
              <div>
                <div class="rag-cap-title">{{ f.title }}</div>
                <div class="rag-cap-desc">{{ f.desc }}</div>
              </div>
            </div>
          </div>
        </div>
        <!-- Tech stack + decisions -->
        <div class="glass-card section-card">
          <h3 class="s-subtitle">Technical Stack</h3>
          <div class="config-list">
            <div v-for="(c,i) in ragStack" :key="i" class="config-row">
              <span class="config-key">{{ c.key }}</span>
              <span class="config-val">{{ c.val }}</span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Design philosophy -->
    <section class="section-block reveal">
      <div class="glass-card section-card">
        <h3 class="s-subtitle">Why This Architecture?</h3>
        <p class="s-desc">Every decision was driven by one question: can a student run this on their own laptop without paying for cloud APIs?</p>
        <div class="rag-why-grid">
          <div v-for="(d, i) in ragDecisions" :key="i" class="rag-why-card">
            <div class="rag-why-title">{{ d.title }}</div>
            <div class="rag-why-desc">{{ d.desc }}</div>
          </div>
        </div>
        <p class="s-note">The entire RAG system — from PDF parsing to BM25 retrieval to LLM answer generation — runs in a <strong>single Node.js process</strong> alongside the Express API server. No Docker, no microservices, no cloud orchestration. This is intentional: the system should be as easy to deploy as <code style="font-size: 0.8em; background: rgba(44,62,45,0.06); padding: 2px 6px; border-radius: 4px;">npm start</code>.</p>
      </div>
    </section>

    <!-- ========== DATASET & CONFIG ========== -->
    <section class="section-block reveal">
      <h2 class="s-title">Dataset &amp; Configuration</h2>
      <p class="s-desc">Full reproducibility details — everything needed to replicate this work.</p>
      <div class="two-col">
        <!-- Dataset -->
        <div class="glass-card section-card">
          <h3 class="s-subtitle">MedMCQA Dataset</h3>
          <div class="donut-wrap">
            <svg viewBox="0 0 200 200" width="180" height="180">
              <circle cx="100" cy="100" r="70" fill="none" stroke="rgba(44,62,45,0.06)" stroke-width="26"/>
              <circle cx="100" cy="100" r="70" fill="none" stroke="var(--primary)" stroke-width="26" stroke-dasharray="416.2 23.7" stroke-dashoffset="0" transform="rotate(-90,100,100)"/>
              <circle cx="100" cy="100" r="70" fill="none" stroke="var(--secondary)" stroke-width="26" stroke-dasharray="14 425.9" stroke-dashoffset="-416.2" transform="rotate(-90,100,100)"/>
              <circle cx="100" cy="100" r="70" fill="none" stroke="var(--info)" stroke-width="26" stroke-dasharray="9.5 430.4" stroke-dashoffset="-430.2" transform="rotate(-90,100,100)"/>
              <text x="100" y="96" text-anchor="middle" fill="var(--text-primary)" font-size="17" font-weight="700" font-family="var(--font-heading)">193,155</text>
              <text x="100" y="112" text-anchor="middle" fill="var(--text-tertiary)" font-size="10">Total Questions</text>
            </svg>
            <div class="donut-legend">
              <span class="legend-item"><span class="legend-dot" style="background:var(--primary)"></span>Train: 182,822</span>
              <span class="legend-item"><span class="legend-dot" style="background:var(--secondary)"></span>Val: 6,150</span>
              <span class="legend-item"><span class="legend-dot" style="background:var(--info)"></span>Test: 4,183</span>
            </div>
            <div class="dataset-facts">
              <span>21 medical subjects</span>
              <span>4-option MCQ format</span>
              <span>AIIMS &amp; NEET-PG source</span>
            </div>
          </div>
        </div>
        <!-- Config -->
        <div class="glass-card section-card">
          <h3 class="s-subtitle">Training Configuration</h3>
          <div class="config-list">
            <div v-for="(c,i) in config" :key="i" class="config-row">
              <span class="config-key">{{ c.key }}</span>
              <span class="config-val">{{ c.val }}</span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ========== ARCHITECTURE ========== -->
    <section class="section-block reveal">
      <div class="glass-card section-card">
        <h2 class="s-title">Classifier Architecture</h2>
        <p class="s-desc">The MCQA classifier uses a straightforward fine-tuning approach — PubMedBERT with a linear classification head. The RAG pipeline (above) handles open-ended textbook queries separately.</p>
        <div class="arch-flow">
          <div v-for="(step, i) in archSteps" :key="i" class="arch-step">
            <div class="arch-box" :style="{ borderColor: step.border }">
              <span class="arch-icon" v-html="step.icon"></span>
              <span class="arch-label" v-html="step.label"></span>
            </div>
            <div v-if="i < archSteps.length - 1" class="arch-arrow">
              <svg width="24" height="12" viewBox="0 0 24 12"><path d="M0 6h20m0 0l-5-5m5 5l-5 5" fill="none" stroke="var(--primary)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" opacity="0.4"/></svg>
            </div>
          </div>
        </div>
        <p class="s-note">The classifier is intentionally simple — a strong small-model baseline. The RAG pipeline extends the platform beyond multiple-choice into open-ended learning. Future work: knowledge distillation, ensemble methods, and connecting RAG retrieval directly to the classifier for retrieval-augmented answering.</p>
      </div>
    </section>

    <!-- ========== PART 3 — ENGINEERING ========== -->

    <!-- ========== SYSTEM ARCHITECTURE DIAGRAM ========== -->
    <section class="section-block reveal">
      <div class="glass-card section-card">
        <div class="badge badge-primary" style="margin-bottom:var(--space-4)">Part 3 &mdash; Engineering</div>
        <h2 class="s-title">System Architecture</h2>
        <p class="s-desc">Three-tier design — a Vue SPA communicates with an Express API layer that orchestrates AI services, search, and persistence.</p>

        <div class="sysarch-diagram">
          <!-- Frontend Tier -->
          <div class="sysarch-tier">
            <div class="sysarch-tier-label">Frontend</div>
            <div class="sysarch-boxes">
              <div v-for="b in archFrontend" :key="b.title" class="sysarch-box">
                <span class="sysarch-icon" v-html="b.icon"></span>
                <span class="sysarch-title">{{ b.title }}</span>
                <span class="sysarch-sub">{{ b.sub }}</span>
              </div>
            </div>
          </div>
          <div class="sysarch-arrow"><svg width="24" height="28" viewBox="0 0 24 28"><path d="M12 2v20m0 0l-6-6m6 6l6-6" fill="none" stroke="var(--primary)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" opacity="0.45"/></svg><span class="sysarch-arrow-label">REST</span></div>
          <!-- API Layer Tier -->
          <div class="sysarch-tier">
            <div class="sysarch-tier-label">API Layer</div>
            <div class="sysarch-boxes">
              <div v-for="b in archApi" :key="b.title" class="sysarch-box">
                <span class="sysarch-icon" v-html="b.icon"></span>
                <span class="sysarch-title">{{ b.title }}</span>
                <span class="sysarch-sub">{{ b.sub }}</span>
              </div>
            </div>
          </div>
          <div class="sysarch-arrow"><svg width="24" height="28" viewBox="0 0 24 28"><path d="M12 2v20m0 0l-6-6m6 6l6-6" fill="none" stroke="var(--primary)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" opacity="0.45"/></svg><span class="sysarch-arrow-label">REST</span></div>
          <!-- Services Tier -->
          <div class="sysarch-tier">
            <div class="sysarch-tier-label">Services</div>
            <div class="sysarch-boxes">
              <div v-for="b in archServices" :key="b.title" class="sysarch-box">
                <span class="sysarch-icon" v-html="b.icon"></span>
                <span class="sysarch-title">{{ b.title }}</span>
                <span class="sysarch-sub">{{ b.sub }}</span>
              </div>
            </div>
          </div>
        </div>
        <p class="s-note">Single-command deployment via <code>docker-compose up</code> — frontend, API, and database launch together.</p>
      </div>
    </section>

    <!-- ========== PLATFORM ENGINEERING ========== -->
    <section class="section-block reveal">
      <div class="glass-card section-card">
        <h2 class="s-title">Platform Engineering</h2>
        <p class="s-desc">Production-grade practices baked into the codebase from day one — auth, testing, validation, rate limiting, containerization, and a centralized API layer.</p>
        <div class="eng-grid">
          <div v-for="c in engineeringCards" :key="c.title" class="eng-card">
            <span class="eng-icon" v-html="c.icon"></span>
            <div class="eng-body">
              <span class="eng-indicator" :style="{ background: c.color }">{{ c.indicator }}</span>
              <h3 class="eng-title">{{ c.title }}</h3>
              <p class="eng-desc">{{ c.desc }}</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ========== TECH STACK FLOATING CARDS ========== -->
    <section class="section-block reveal">
      <div class="glass-card section-card">
        <h2 class="s-title">Tech Stack</h2>
        <p class="s-desc">Every library and service used across the platform — grouped by layer.</p>
        <div class="tstack-cloud">
          <template v-for="(cat, ci) in techStackCategories">
            <div
              v-for="(t, ti) in cat.items"
              :key="cat.name + '-' + t"
              class="tstack-card"
              :style="{
                '--float-delay': ((ci * 7 + ti * 3) % 24) * 0.25 + 's',
                '--float-duration': (3 + ((ci + ti) % 4)) + 's',
                '--accent': cat.color
              }"
            >
              <span class="tstack-card-dot" :style="{ background: cat.color }"></span>
              <span class="tstack-card-name">{{ t }}</span>
              <span class="tstack-card-cat">{{ cat.name }}</span>
            </div>
          </template>
        </div>
      </div>
    </section>

    <!-- ========== RESEARCH FOOTER ========== -->
    <section class="section-block research-footer fade-in-up">
      <p class="rf-main">Research conducted at Sichuan University, 2025</p>
      <div class="rf-links">
        <a href="https://github.com/saf9933/Medpredict" target="_blank" rel="noopener">View on GitHub</a>
        <span class="rf-dot">&middot;</span>
        <a href="#" @click.prevent>Read Full Thesis</a>
        <span class="rf-dot">&middot;</span>
        <router-link to="/classifier">Try MedPredict</router-link>
      </div>
      <p class="rf-tech">Model: PubMedBERT &middot; Dataset: MedMCQA &middot; Framework: PyTorch + HuggingFace</p>
    </section>

  </div>
</template>

<script>
export default {
  name: 'ResearchPage',
  data() {
    return {
      tags: ['PubMedBERT', 'MedMCQA', '110M params', 'BM25 + RAG', 'Single GPU'],
      headlineMetrics: [
        { value: 1500, suffix: 'x', label: 'More Parameter-Efficient', sub: 'vs GPT-3.5 at 175B params', color: '#3d9970' },
        { value: 91, suffix: '%', label: 'High-Confidence Accuracy', sub: 'When model confidence >80%', color: '#2d7a56' },
        { value: 46.3, suffix: '%', label: 'Best Test Accuracy', sub: '+15.8% relative vs zero-shot', color: '#5a8fa8' },
        { value: 16, suffix: 'GB', label: 'GPU Memory Required', sub: 'Runs on a single NVIDIA T4', color: '#c8a96e' },
      ],
      efficiencyCards: [
        { icon: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>', stat: '~2 hours', label: 'Total training time', detail: 'On a single T4 GPU — a fraction of the weeks required for large models' },
        { icon: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 2v20M2 12h20"/></svg>', stat: '110M', label: 'Parameters', detail: 'vs 175B (GPT-3.5) or undisclosed billions (Med-PaLM 2)' },
        { icon: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a4 4 0 00-8 0v2"/></svg>', stat: '$0', label: 'API cost per query', detail: 'Self-hosted model — no per-token charges, full data privacy' },
        { icon: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>', stat: '<50ms', label: 'Inference latency', detail: 'Real-time predictions vs seconds-per-query for LLM APIs' },
      ],
      compTable: [
        { model: 'PubMedBERT (zero-shot)', acc: '~40%', params: '110M', cost: 'Free (local)', notes: 'Baseline — no fine-tuning', hl: false },
        { model: 'MedPredict (ours)', acc: '42.7 — 46.3%', params: '110M', cost: 'Free (local)', notes: 'Fine-tuned classifier + RAG platform', hl: true },
        { model: 'GPT-3.5', acc: '~60%', params: '175B', cost: '~$0.002/query', notes: '1,500x more params, RLHF + web data', hl: false },
        { model: 'Med-PaLM 2 (Google)', acc: '72.3%', params: 'Undisclosed', cost: 'Not public', notes: 'Retrieval-augmented, proprietary', hl: false },
        { model: 'Human (passing)', acc: '~60%', params: '—', cost: '—', notes: 'USMLE / NEET-PG pass threshold', hl: false },
        { model: 'Human (expert)', acc: '85 — 90%', params: '—', cost: '—', notes: 'Top-percentile clinicians', hl: false },
      ],
      reliabilityStats: [
        { value: 91, label: 'Accuracy when >80% confident', detail: 'Near-expert reliability on its most confident predictions', color: '#3d9970' },
        { value: 80, label: 'Accuracy on "easy" questions', detail: 'Factual recall and terminology — the bread and butter of medical study', color: '#2d7a56' },
        { value: 25, label: 'Accuracy on "hard" questions', detail: 'Multi-hop reasoning remains a challenge — flagged for human review', color: '#c0503a' },
      ],
      calLabels: ['0-20%', '20-40%', '40-60%', '60-80%', '80-100%'],
      calData: [8, 22, 41, 68, 91],
      progressionSteps: [
        { title: 'PubMedBERT Zero-Shot', desc: 'Base model pre-trained on PubMed abstracts — strong biomedical language understanding, but no task-specific training.', result: '~40%', color: '#8a9b8a' },
        { title: 'Fine-tune on MedMCQA (3 epochs)', desc: 'Standard supervised fine-tuning on 182K training questions. AdamW optimizer, linear warmup, FP16 mixed precision.', result: '42.7%', color: '#5a8fa8' },
        { title: 'Data Cleaning & Curation', desc: 'Removed duplicate, mislabeled, and ambiguous questions. Quality > quantity — a smaller, cleaner dataset outperforms the raw one.', result: '45.0%', color: '#3d9970' },
        { title: 'Extended Training (5 epochs)', desc: 'Continued training with careful learning rate scheduling to extract remaining signal without overfitting.', result: '46.3%', color: '#2d7a56' },
      ],
      accuracyBars: [
        { label: 'Zero-Shot', value: 40, color: '#8a9b8a' },
        { label: '3 Epochs', value: 42.7, color: '#5a8fa8' },
        { label: 'Clean Data', value: 45, color: '#3d9970' },
        { label: '5 Epochs', value: 46.33, color: '#2d7a56' },
      ],
      radarData: [
        { label: 'Factual Recall', v: 80 },
        { label: 'Drug Knowledge', v: 72 },
        { label: 'Medical Terms', v: 85 },
        { label: 'Clinical Reasoning', v: 35 },
        { label: 'Multi-hop Logic', v: 25 },
        { label: 'Differential Dx', v: 40 },
      ],
      diffCards: [
        { level: 'Easy', conf: 'conf >90%', acc: 80, glow: '#3d9970' },
        { level: 'Medium', conf: '60-90%', acc: 45, glow: '#d4a030' },
        { level: 'Hard', conf: '<60%', acc: 25, glow: '#c0503a' },
      ],
      config: [
        { key: 'Base Model', val: 'PubMedBERT-base-uncased' },
        { key: 'Epochs', val: '3 (primary) / 5 (extended)' },
        { key: 'Learning Rate', val: '2e-5' },
        { key: 'Batch Size', val: '8 (eff. 16 w/ grad accum)' },
        { key: 'Max Seq Length', val: '512 tokens' },
        { key: 'Optimizer', val: 'AdamW' },
        { key: 'Precision', val: 'FP16 mixed' },
        { key: 'Hardware', val: 'NVIDIA T4 16GB' },
        { key: 'Training Time', val: '~2 hours' },
      ],
      ragSteps: [
        { title: 'PDF Upload & Extraction', desc: 'User uploads a medical textbook (up to 10MB). Text is extracted page-by-page using pdf-parse.' },
        { title: 'Chunking', desc: 'Text is split into overlapping passages (200 words, 50-word overlap) preserving page boundaries for citation.' },
        { title: 'BM25 Indexing', desc: 'A BM25 index is built in-memory — term frequencies, document frequencies, and IDF scores computed across all chunks.' },
        { title: 'Query & Retrieval', desc: 'User query is tokenized, stop words removed, then scored against all chunks. Top 5 passages returned ranked by relevance.' },
        { title: 'LLM Answer Generation', desc: 'Retrieved passages are sent as context to Mistral-7B (via OpenRouter). The model generates an answer grounded in the textbook content.' },
      ],
      ragDecisions: [
        { title: 'BM25 over vector embeddings', desc: 'Classical term-matching is fast, interpretable, and requires zero GPU at retrieval time. For keyword-heavy medical text, BM25 performs comparably to dense retrieval without the infrastructure cost.' },
        { title: 'In-memory storage with auto-expiry', desc: '1-hour TTL keeps the server lightweight. No database to manage — uploaded textbooks live in RAM and are garbage-collected automatically.' },
        { title: 'Open-source LLM via API', desc: 'Mistral-7B through OpenRouter gives strong generative quality at a fraction of GPT-4 costs, while keeping the option to self-host later.' },
        { title: 'Zero external dependencies', desc: 'No vector database, no embedding model, no cloud storage. The entire RAG pipeline runs in a single Node.js process.' },
      ],
      ragStack: [
        { key: 'Text Extraction', val: 'pdf-parse' },
        { key: 'Chunking', val: 'Sliding window (200w / 50w overlap)' },
        { key: 'Retrieval', val: 'BM25 (k1=1.5, b=0.75)' },
        { key: 'Generation', val: 'Mistral-7B-Instruct' },
        { key: 'API Provider', val: 'OpenRouter' },
        { key: 'Storage', val: 'In-memory (1hr TTL)' },
        { key: 'File Upload', val: 'Multer (10MB max)' },
      ],
      ragFeatures: [
        { title: 'Semantic Search', desc: 'Search any uploaded textbook by concept, not just exact keywords. Results include page numbers and relevance scores.', icon: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>' },
        { title: 'AI-Powered Answers', desc: 'Ask a question about your textbook and get an answer synthesized from the most relevant passages — with source references.', icon: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>' },
        { title: 'Quiz Generation', desc: 'Auto-generate 5 MCQs from your uploaded material — optionally filtered by topic. Practice what you just read.', icon: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>' },
      ],
      archSteps: [
        { label: 'Input Question<br/><small>+ 4 Options</small>', border: 'rgba(61,153,112,0.25)', icon: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>' },
        { label: 'Tokenizer<br/><small>WordPiece</small>', border: 'rgba(90,143,168,0.3)', icon: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><polyline points="4 7 4 4 20 4 20 7"/><line x1="9" y1="20" x2="15" y2="20"/><line x1="12" y1="4" x2="12" y2="20"/></svg>' },
        { label: 'PubMedBERT<br/><small>12-layer encoder</small>', border: 'rgba(107,143,91,0.3)', icon: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="4" y="4" width="16" height="16" rx="2"/><line x1="4" y1="10" x2="20" y2="10"/><line x1="10" y1="4" x2="10" y2="20"/></svg>' },
        { label: '[CLS]<br/><small>Pooled repr.</small>', border: 'rgba(200,169,110,0.3)', icon: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="10"/><path d="M8 12l2 2 4-4"/></svg>' },
        { label: 'Classifier<br/><small>Linear + Softmax</small>', border: 'rgba(90,143,168,0.3)', icon: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M18 20V10"/><path d="M12 20V4"/><path d="M6 20v-6"/></svg>' },
        { label: 'A / B / C / D<br/><small>+ Confidence</small>', border: 'rgba(61,153,112,0.35)', icon: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><polyline points="20 6 9 17 4 12"/></svg>' },
      ],
      /* ---- System Architecture Diagram ---- */
      archFrontend: [
        { title: 'Vue 3 SPA', sub: 'Composition-ready', icon: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><polygon points="12 2 22 8.5 22 15.5 12 22 2 15.5 2 8.5 12 2"/></svg>' },
        { title: 'Vue Router', sub: 'SPA navigation', icon: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M9 18l6-6-6-6"/></svg>' },
        { title: 'Axios Client', sub: 'HTTP layer', icon: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 19V5m0 0l-7 7m7-7l7 7"/></svg>' },
      ],
      archApi: [
        { title: 'Express.js', sub: 'REST framework', icon: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>' },
        { title: 'JWT Auth', sub: 'Token-based', icon: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>' },
        { title: 'Joi Validation', sub: 'Schema checks', icon: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>' },
        { title: 'Rate Limiting', sub: 'Abuse prevention', icon: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>' },
      ],
      archServices: [
        { title: 'OpenRouter API', sub: 'LLM gateway', icon: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>' },
        { title: 'PubMedBERT', sub: 'Fine-tuned model', icon: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="4" y="4" width="16" height="16" rx="2"/><line x1="4" y1="10" x2="20" y2="10"/><line x1="10" y1="4" x2="10" y2="20"/></svg>' },
        { title: 'SQLite + Sequelize', sub: 'Persistence', icon: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/></svg>' },
        { title: 'BM25 + RAG', sub: 'Retrieval pipeline', icon: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>' },
      ],
      /* ---- Platform Engineering Cards ---- */
      engineeringCards: [
        { title: 'JWT Authentication', desc: 'Token-based auth with httpOnly cookies, expiry rotation, and middleware-guarded routes.', indicator: 'Secure', color: '#3d9970', icon: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>' },
        { title: '19 Passing Tests', desc: 'Jest + Supertest smoke tests covering every API route — runs in CI before each deploy.', indicator: '19/19', color: '#3d9970', icon: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>' },
        { title: 'Input Validation', desc: 'Joi schemas on every endpoint — type-checked payloads, length limits, pattern enforcement.', indicator: '10 Schemas', color: '#5a8fa8', icon: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/></svg>' },
        { title: 'Rate Limiting', desc: 'Two-tier express-rate-limit — strict on auth routes, relaxed on read-only endpoints.', indicator: 'Two-tier', color: '#c8a96e', icon: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>' },
        { title: 'Docker Ready', desc: 'Multi-stage Dockerfile + docker-compose — frontend, API, and database in one command.', indicator: 'Deployed', color: '#5a8fa8', icon: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>' },
        { title: 'Centralized API Layer', desc: 'Single api.js service module — every frontend call routes through one configurable Axios instance.', indicator: 'Single Source', color: '#6b8f5b', icon: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="3"/><path d="M12 1v4m0 14v4m-9.2-5.8l2.8-2.8m12.8-4.8l2.8-2.8M1 12h4m14 0h4M4.2 4.2l2.8 2.8m12.8 4.8l-2.8 2.8"/></svg>' },
      ],
      /* ---- Tech Stack ---- */
      techStackCategories: [
        { name: 'Frontend', color: '#3d9970', items: ['Vue 3', 'Vue Router', 'Axios', 'CSS3 Custom Properties', 'IntersectionObserver API'] },
        { name: 'Backend', color: '#c8a96e', items: ['Node.js', 'Express.js', 'Sequelize ORM', 'SQLite', 'Multer', 'CORS'] },
        { name: 'AI / ML', color: '#5a8fa8', items: ['PubMedBERT', 'PyTorch', 'HuggingFace Transformers', 'OpenRouter API', 'Mistral-7B', 'BM25 Retrieval'] },
        { name: 'DevOps & Quality', color: '#6b8f5b', items: ['Docker', 'docker-compose', 'Jest', 'Supertest', 'Joi', 'JWT', 'express-rate-limit'] },
      ],
    }
  },
  computed: {
    calPoints() {
      return this.calData.map((v, i) => ({ x: 102 + i * 84, y: 290 - (v / 100) * 270 }))
    },
    calLinePoints() {
      return this.calPoints.map(p => `${p.x},${p.y}`).join(' ')
    },
    calAreaPoints() {
      const pts = this.calPoints.map(p => `${p.x},${p.y}`).join(' ')
      return `${pts} ${this.calPoints[4].x},290 ${this.calPoints[0].x},290`
    },
    lossPoints() {
      const s = [0,200,500,1000,1500,2000,2600,3200,3900,4500,5200,5800,6500]
      const l = [1.42,1.39,1.36,1.33,1.31,1.29,1.27,1.25,1.23,1.21,1.19,1.17,1.16]
      return s.map((v,i) => `${70+(v/6500)*430},${270-((l[i]-1.1)/0.32)*200}`).join(' ')
    },
    lrPoints() {
      const s = [0,325,650,1300,2600,3900,5200,6500]
      const l = [0,1e-5,2e-5,2e-5,1.5e-5,1e-5,0.5e-5,0]
      return s.map((v,i) => `${70+(v/6500)*430},${270-(l[i]/2e-5)*200}`).join(' ')
    },
    radarDataPts() {
      return this.radarData.map((d,i) => { const p = this.radarPt(i, d.v/100); return `${p.x},${p.y}` }).join(' ')
    },
  },
  methods: {
    radarPt(i, f) {
      const a = (Math.PI * 2 * i) / this.radarData.length - Math.PI / 2
      return { x: 200 + 130 * f * Math.cos(a), y: 175 + 130 * f * Math.sin(a) }
    },
    radarRingPoints(lv) {
      return this.radarData.map((_, i) => { const p = this.radarPt(i, lv); return `${p.x},${p.y}` }).join(' ')
    },
    radarLbl(i) {
      const a = (Math.PI * 2 * i) / this.radarData.length - Math.PI / 2
      return { x: 200 + 155 * Math.cos(a), y: 175 + 155 * Math.sin(a) }
    },
    countUp(el) {
      const target = parseFloat(el.dataset.target)
      const suffix = el.dataset.suffix || ''
      const prefix = el.dataset.prefix || ''
      const dur = 1600, start = performance.now(), dec = target % 1 !== 0
      const tick = (now) => {
        const p = Math.min((now - start) / dur, 1)
        const e = 1 - Math.pow(1 - p, 3)
        el.textContent = prefix + (dec ? (target * e).toFixed(1) : Math.round(target * e)) + suffix
        if (p < 1) requestAnimationFrame(tick)
      }
      requestAnimationFrame(tick)
    },
    setupObservers() {
      const obs = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('revealed')
            entry.target.querySelectorAll('.count-up:not(.counted)').forEach(el => {
              el.classList.add('counted')
              this.countUp(el)
            })
            entry.target.querySelectorAll('.anim-bar:not(.bar-go)').forEach(el => {
              el.classList.add('bar-go')
            })
          }
        })
      }, { threshold: 0.1 })
      this.$nextTick(() => {
        this.$el.querySelectorAll('.reveal').forEach(el => obs.observe(el))
      })
      this._obs = obs
    },
  },
  mounted() { this.setupObservers() },
  beforeUnmount() { if (this._obs) this._obs.disconnect() },
}
</script>

<style scoped>
/* ========== LAYOUT ========== */
.research { padding-bottom: var(--space-8); }
.section-block { margin-top: var(--space-12); }

/* ========== REVEAL ========== */
.reveal {
  opacity: 0;
  transform: translateY(24px);
  transition: opacity 0.6s var(--ease-out), transform 0.6s var(--ease-out);
}
.reveal.revealed { opacity: 1; transform: translateY(0); }

/* ========== GLASS CARD ========== */
.glass-card {
  background: var(--glass-white-md);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-2xl);
  box-shadow: var(--glass-shadow);
  transition: transform var(--duration-normal) var(--ease-out), box-shadow var(--duration-normal) var(--ease-out);
}
.glass-card:hover { transform: translateY(-3px); box-shadow: var(--glass-shadow-hover); }
.section-card { padding: var(--space-8); }

/* ========== TYPOGRAPHY ========== */
.s-title {
  font-family: var(--font-heading);
  font-weight: 700;
  font-size: var(--text-2xl);
  color: var(--text-primary);
  margin-bottom: var(--space-2);
  letter-spacing: -0.02em;
}
.s-subtitle {
  font-family: var(--font-heading);
  font-weight: 600;
  font-size: var(--text-lg);
  color: var(--text-primary);
  margin-bottom: var(--space-5);
}
.s-desc {
  font-size: var(--text-sm);
  color: var(--text-secondary);
  margin-bottom: var(--space-6);
  line-height: 1.7;
  max-width: 700px;
}
.s-note {
  margin-top: var(--space-5);
  padding-top: var(--space-4);
  border-top: 1px solid var(--glass-border);
  font-size: var(--text-sm);
  color: var(--text-tertiary);
  line-height: 1.6;
}
.s-note strong { color: var(--primary); font-weight: 600; }

/* ========== HERO ========== */
.hero { text-align: center; padding: var(--space-16) 0 var(--space-8); }
.hero-title {
  font-family: var(--font-heading);
  font-size: clamp(2rem, 5vw, var(--text-5xl));
  font-weight: 800;
  letter-spacing: -0.03em;
  line-height: 1.15;
  color: var(--text-primary);
  margin-bottom: var(--space-5);
}
.hero-gradient {
  background: linear-gradient(135deg, var(--primary), var(--sage), var(--secondary));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}
.hero-subtitle {
  font-size: var(--text-base);
  color: var(--text-secondary);
  max-width: 640px;
  margin: 0 auto var(--space-4);
  line-height: 1.7;
}
.hero-author { font-size: var(--text-sm); color: var(--text-tertiary); margin-bottom: var(--space-5); }
.hero-tags { display: flex; flex-wrap: wrap; justify-content: center; gap: var(--space-2); }

/* ========== HEADLINE METRICS ========== */
.metrics-row { display: grid; grid-template-columns: repeat(4, 1fr); gap: var(--space-4); }
.metric-card { padding: var(--space-6); text-align: center; border-top: 2.5px solid var(--accent); }
.metric-number {
  font-family: var(--font-heading);
  font-size: var(--text-4xl);
  font-weight: 800;
  color: var(--text-primary);
  letter-spacing: -0.03em;
  margin-bottom: var(--space-1);
}
.metric-label { font-size: var(--text-sm); color: var(--text-primary); font-weight: 600; margin-bottom: var(--space-1); }
.metric-sub { font-size: var(--text-xs); color: var(--text-tertiary); line-height: 1.4; }

/* ========== EFFICIENCY GRID ========== */
.efficiency-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: var(--space-5); }
.eff-card { text-align: center; }
.eff-icon { display: flex; justify-content: center; color: var(--primary); margin-bottom: var(--space-3); }
.eff-stat {
  font-family: var(--font-heading);
  font-size: var(--text-2xl);
  font-weight: 800;
  color: var(--text-primary);
  margin-bottom: var(--space-1);
}
.eff-label { font-size: var(--text-sm); font-weight: 600; color: var(--text-secondary); margin-bottom: var(--space-2); }
.eff-detail { font-size: var(--text-xs); color: var(--text-tertiary); line-height: 1.5; }

/* ========== TABLE ========== */
.table-scroll { overflow-x: auto; }
.r-table { width: 100%; border-collapse: separate; border-spacing: 0; font-size: var(--text-sm); }
.r-table th {
  padding: var(--space-3) var(--space-4);
  font-family: var(--font-heading);
  font-weight: 600;
  font-size: var(--text-xs);
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--text-tertiary);
  text-align: left;
  border-bottom: 1px solid rgba(44,62,45,0.1);
}
.r-table td { padding: var(--space-3) var(--space-4); color: var(--text-secondary); border-bottom: 1px solid rgba(44,62,45,0.05); }
.row-hl td { background: var(--primary-bg); }
.row-hl td:first-child { border-left: 3px solid var(--primary); }
.fw-700 { font-weight: 700; color: var(--text-primary); }
.td-note { font-size: var(--text-xs); color: var(--text-tertiary); }

/* ========== RELIABILITY SECTION ========== */
.reliability-grid { display: grid; grid-template-columns: 280px 1fr; gap: var(--space-6); align-items: start; }
.reliability-left { display: flex; flex-direction: column; gap: var(--space-3); }
.rel-stat-card { padding: var(--space-4) var(--space-5); }
.rel-number { font-family: var(--font-heading); font-size: var(--text-2xl); font-weight: 800; }
.rel-label { font-size: var(--text-sm); font-weight: 600; color: var(--text-primary); margin-top: var(--space-1); }
.rel-detail { font-size: var(--text-xs); color: var(--text-tertiary); margin-top: var(--space-1); line-height: 1.4; }
.reliability-right { min-width: 0; }
.svg-chart { width: 100%; max-width: 520px; }
.svg-chart-wide { max-width: 580px; }
.svg-chart-sq { max-width: 400px; }
.chart-center { display: flex; justify-content: center; margin-top: var(--space-2); }

/* ========== PROGRESSION STEPS ========== */
.progression-steps { display: flex; flex-direction: column; gap: 0; }
.prog-step {
  display: flex;
  align-items: center;
  gap: var(--space-5);
  padding: var(--space-5) var(--space-4);
  border-bottom: 1px solid rgba(44,62,45,0.06);
}
.prog-step:last-child { border-bottom: none; }
.prog-num {
  flex-shrink: 0;
  width: 32px; height: 32px;
  border-radius: 50%;
  background: var(--primary-bg);
  color: var(--primary);
  font-family: var(--font-heading);
  font-weight: 700;
  font-size: var(--text-sm);
  display: flex;
  align-items: center;
  justify-content: center;
}
.prog-body { flex: 1; min-width: 0; }
.prog-title { font-family: var(--font-heading); font-weight: 600; color: var(--text-primary); margin-bottom: var(--space-1); }
.prog-desc { font-size: var(--text-sm); color: var(--text-tertiary); line-height: 1.5; }
.prog-result {
  flex-shrink: 0;
  font-family: var(--font-heading);
  font-size: var(--text-xl);
  font-weight: 800;
  min-width: 60px;
  text-align: right;
}

/* ========== BAR CHART ========== */
.v-bar-chart { display: flex; gap: var(--space-2); margin-top: var(--space-4); }
.v-bar-y { writing-mode: vertical-rl; transform: rotate(180deg); font-size: var(--text-xs); color: var(--text-tertiary); display: flex; align-items: center; }
.v-bar-area { flex: 1; position: relative; height: 260px; }
.v-bar-grid { position: absolute; inset: 0; }
.v-grid-line { position: absolute; left: 0; right: 0; border-top: 1px solid rgba(44,62,45,0.06); }
.v-grid-label { position: absolute; left: 0; top: -16px; font-size: 0.65rem; color: var(--text-tertiary); }
.v-bars { position: absolute; bottom: 0; left: 32px; right: 0; top: 0; display: flex; align-items: flex-end; gap: var(--space-4); padding: 0 var(--space-4); }
.v-bar-col { flex: 1; display: flex; flex-direction: column; align-items: center; }
.v-bar-track { width: 100%; max-width: 72px; height: 220px; display: flex; align-items: flex-end; justify-content: center; }
.v-bar-fill {
  width: 100%; height: 0;
  background: var(--c);
  border-radius: var(--radius-sm) var(--radius-sm) 2px 2px;
  position: relative;
  transition: height 1s var(--ease-out);
  transition-delay: var(--d);
  opacity: 0.8;
}
.v-bar-fill:hover { opacity: 1; }
.v-bar-fill.bar-go { height: calc(var(--h) * 2.2); }
.v-bar-val { position: absolute; top: -22px; left: 50%; transform: translateX(-50%); font-family: var(--font-heading); font-size: var(--text-xs); font-weight: 700; color: var(--text-primary); white-space: nowrap; }
.v-bar-name { margin-top: var(--space-2); font-size: 0.7rem; color: var(--text-tertiary); text-align: center; line-height: 1.3; }

/* ========== TWO COL ========== */
.two-col { display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-6); }

/* ========== RADAR ========== */

/* ========== DIFFICULTY (compact) ========== */
.diff-list { display: flex; flex-direction: column; gap: var(--space-3); margin-bottom: var(--space-5); }
.diff-row { display: flex; align-items: center; gap: var(--space-3); }
.diff-dot-sm { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
.diff-info { flex-shrink: 0; width: 80px; }
.diff-level-sm { display: block; font-family: var(--font-heading); font-weight: 600; font-size: var(--text-sm); color: var(--text-primary); }
.diff-conf-sm { font-size: var(--text-xs); color: var(--text-tertiary); }
.diff-bar-wrap { flex: 1; }
.diff-bar-track { height: 20px; background: rgba(44,62,45,0.04); border-radius: var(--radius-sm); overflow: hidden; }
.diff-bar-fill { height: 100%; width: 0; background: var(--c); border-radius: var(--radius-sm); transition: width 1s var(--ease-out); transition-delay: var(--d); }
.diff-bar-fill.bar-go { width: var(--h); }
.diff-pct { flex-shrink: 0; width: 40px; font-family: var(--font-heading); font-size: var(--text-sm); font-weight: 700; color: var(--text-primary); text-align: right; }

.diff-insight { padding: var(--space-4); background: rgba(44,62,45,0.03); border-radius: var(--radius-lg); }
.diff-insight p { font-size: var(--text-sm); color: var(--text-secondary); line-height: 1.6; margin-bottom: var(--space-2); }
.diff-insight p:last-child { margin-bottom: 0; }
.diff-insight strong { color: var(--text-primary); }
.diff-insight-note { font-size: var(--text-xs) !important; color: var(--text-tertiary) !important; font-style: italic; }

/* ========== DONUT ========== */
.donut-wrap { display: flex; flex-direction: column; align-items: center; gap: var(--space-4); }
.donut-legend { display: flex; flex-direction: column; gap: var(--space-2); }
.legend-item { display: flex; align-items: center; gap: var(--space-2); font-size: var(--text-sm); color: var(--text-secondary); }
.legend-dot { width: 10px; height: 10px; border-radius: 50%; flex-shrink: 0; }
.dataset-facts {
  display: flex; gap: var(--space-4); flex-wrap: wrap; justify-content: center;
  padding-top: var(--space-3);
  border-top: 1px solid var(--glass-border);
}
.dataset-facts span { font-size: var(--text-xs); color: var(--text-tertiary); }

/* ========== CONFIG ========== */
.config-list { display: flex; flex-direction: column; }
.config-row {
  display: flex; justify-content: space-between; align-items: center;
  padding: var(--space-3) var(--space-4);
  border-bottom: 1px solid rgba(44,62,45,0.05);
}
.config-row:nth-child(odd) { background: rgba(44,62,45,0.02); }
.config-key { font-size: var(--text-sm); color: var(--text-secondary); }
.config-val { font-size: var(--text-sm); color: var(--text-primary); font-weight: 600; text-align: right; }

/* ========== RAG SECTION ========== */
.rag-intro-card { border-left: 3px solid var(--primary); }
.rag-label { margin-bottom: var(--space-1); }
.rag-header { display: flex; align-items: flex-start; justify-content: space-between; gap: var(--space-6); }
.rag-cta { flex-shrink: 0; align-self: center; white-space: nowrap; }

/* Pipeline architecture */
.rag-arch {
  display: flex; align-items: flex-start; justify-content: center;
  flex-wrap: wrap; gap: 0; margin-top: var(--space-4);
}
.rag-arch-step { display: flex; align-items: center; }
.rag-arch-box {
  background: var(--glass-white); border: 1px solid var(--glass-border);
  border-radius: var(--radius-lg); padding: var(--space-4);
  min-width: 130px; max-width: 160px; text-align: center;
  transition: transform 0.2s, box-shadow 0.2s;
}
.rag-arch-box:hover { transform: translateY(-2px); box-shadow: var(--glass-shadow); }
.rag-arch-num {
  width: 24px; height: 24px; border-radius: 50%;
  background: var(--primary-bg); color: var(--primary);
  font-family: var(--font-heading); font-weight: 700; font-size: var(--text-xs);
  display: flex; align-items: center; justify-content: center;
  margin: 0 auto var(--space-2);
}
.rag-arch-title { font-family: var(--font-heading); font-weight: 600; font-size: var(--text-xs); color: var(--text-primary); margin-bottom: var(--space-1); }
.rag-arch-desc { font-size: 0.65rem; color: var(--text-tertiary); line-height: 1.4; }
.rag-arch-arrow { display: flex; align-items: center; padding: 0 var(--space-1); }

/* Capabilities */
.rag-cap-list { display: flex; flex-direction: column; gap: var(--space-5); }
.rag-cap { display: flex; gap: var(--space-4); align-items: flex-start; }
.rag-cap-icon { flex-shrink: 0; color: var(--primary); margin-top: 2px; }
.rag-cap-title { font-family: var(--font-heading); font-weight: 600; color: var(--text-primary); margin-bottom: var(--space-1); }
.rag-cap-desc { font-size: var(--text-sm); color: var(--text-tertiary); line-height: 1.5; }

.rag-details { display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-6); }

/* Design decisions */
.rag-why-grid { display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-4); }
.rag-why-card {
  padding: var(--space-4); background: rgba(44,62,45,0.02);
  border-radius: var(--radius-lg); border: 1px solid rgba(44,62,45,0.04);
}
.rag-why-title { font-family: var(--font-heading); font-weight: 600; color: var(--text-primary); margin-bottom: var(--space-1); font-size: var(--text-sm); }
.rag-why-desc { font-size: var(--text-sm); color: var(--text-tertiary); line-height: 1.5; }

/* ========== ARCHITECTURE ========== */
.arch-flow { display: flex; align-items: center; justify-content: center; flex-wrap: wrap; gap: 0; margin-top: var(--space-6); padding: var(--space-4) 0; }
.arch-step { display: flex; align-items: center; }
.arch-box {
  background: var(--glass-white); border: 1.5px solid; border-radius: var(--radius-lg);
  padding: var(--space-4) var(--space-3); text-align: center; font-size: var(--text-xs);
  color: var(--text-primary); line-height: 1.4; min-width: 88px;
  transition: transform 0.2s, box-shadow 0.2s;
}
.arch-box:hover { transform: translateY(-2px); box-shadow: var(--glass-shadow); }
.arch-box small { font-size: 0.65rem; color: var(--text-tertiary); }
.arch-icon { display: flex; justify-content: center; margin-bottom: var(--space-2); color: var(--primary); }
.arch-arrow { display: flex; align-items: center; padding: 0 var(--space-1); }

/* ========== SYSTEM ARCHITECTURE DIAGRAM ========== */
.sysarch-diagram { display: flex; flex-direction: column; align-items: center; gap: 0; margin-top: var(--space-6); }
.sysarch-tier { width: 100%; }
.sysarch-tier-label {
  font-family: var(--font-heading); font-weight: 700; font-size: var(--text-xs);
  color: var(--text-tertiary); text-transform: uppercase; letter-spacing: 0.08em;
  text-align: center; margin-bottom: var(--space-3);
}
.sysarch-boxes { display: flex; justify-content: center; gap: var(--space-3); flex-wrap: wrap; }
.sysarch-box {
  display: flex; flex-direction: column; align-items: center; gap: var(--space-1);
  background: var(--glass-white); border: 1px solid var(--glass-border);
  border-radius: var(--radius-lg); padding: var(--space-4) var(--space-3);
  min-width: 110px; text-align: center;
  transition: transform 0.2s, box-shadow 0.2s;
}
.sysarch-box:hover { transform: translateY(-2px); box-shadow: var(--glass-shadow); }
.sysarch-icon { color: var(--primary); display: flex; }
.sysarch-title { font-family: var(--font-heading); font-weight: 600; font-size: var(--text-xs); color: var(--text-primary); }
.sysarch-sub { font-size: 0.65rem; color: var(--text-tertiary); }
.sysarch-arrow { display: flex; flex-direction: column; align-items: center; padding: var(--space-2) 0; }
.sysarch-arrow-label { font-size: 0.6rem; font-weight: 600; color: var(--text-tertiary); letter-spacing: 0.06em; text-transform: uppercase; }

/* ========== PLATFORM ENGINEERING ========== */
.eng-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: var(--space-4); margin-top: var(--space-6); }
.eng-card {
  display: flex; gap: var(--space-3); align-items: flex-start;
  background: var(--glass-white); border: 1px solid var(--glass-border);
  border-radius: var(--radius-lg); padding: var(--space-4);
  transition: transform 0.2s, box-shadow 0.2s;
}
.eng-card:hover { transform: translateY(-2px); box-shadow: var(--glass-shadow); }
.eng-icon { flex-shrink: 0; color: var(--primary); margin-top: 2px; }
.eng-body { display: flex; flex-direction: column; gap: var(--space-1); }
.eng-indicator {
  display: inline-block; align-self: flex-start;
  font-size: 0.6rem; font-weight: 700; letter-spacing: 0.04em;
  color: #fff; padding: 2px 8px; border-radius: 9999px;
}
.eng-title { font-family: var(--font-heading); font-weight: 600; font-size: var(--text-sm); color: var(--text-primary); }
.eng-desc { font-size: var(--text-xs); color: var(--text-tertiary); line-height: 1.5; }

/* ========== TECH STACK FLOATING CARDS ========== */
.tstack-cloud {
  display: flex; flex-wrap: wrap; justify-content: center;
  gap: var(--space-3); margin-top: var(--space-6); padding: var(--space-4) 0;
}
.tstack-card {
  display: flex; align-items: center; gap: var(--space-2);
  background: var(--glass-white); border: 1px solid var(--glass-border);
  border-radius: var(--radius-lg); padding: var(--space-3) var(--space-4);
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);
  cursor: default; white-space: nowrap;
  animation: tstack-float var(--float-duration, 4s) ease-in-out var(--float-delay, 0s) infinite;
  transition: transform 0.2s, box-shadow 0.2s, border-color 0.2s;
}
.tstack-card:hover {
  transform: translateY(-4px) scale(1.04);
  box-shadow: 0 8px 20px rgba(0,0,0,0.08);
  border-color: var(--accent, var(--glass-border));
  animation-play-state: paused;
}
.tstack-card-dot {
  width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0;
}
.tstack-card-name {
  font-family: var(--font-heading); font-weight: 600;
  font-size: var(--text-xs); color: var(--text-primary);
}
.tstack-card-cat {
  font-size: 0.6rem; color: var(--text-tertiary);
  border-left: 1px solid var(--glass-border);
  padding-left: var(--space-2); margin-left: var(--space-1);
}
@keyframes tstack-float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-6px); }
}

/* ========== FOOTER ========== */
.research-footer { text-align: center; margin-top: var(--space-16); padding-top: var(--space-8); border-top: 1px solid var(--glass-border); }
.rf-main { font-size: var(--text-sm); color: var(--text-secondary); margin-bottom: var(--space-3); }
.rf-links { display: flex; justify-content: center; align-items: center; gap: var(--space-3); margin-bottom: var(--space-3); }
.rf-links a { color: var(--primary); text-decoration: none; font-size: var(--text-sm); font-weight: 500; transition: color 0.2s; }
.rf-links a:hover { color: var(--primary-dark); }
.rf-dot { color: var(--text-tertiary); }
.rf-tech { font-size: var(--text-xs); color: var(--text-tertiary); }

/* ========== RESPONSIVE ========== */
@media (max-width: 860px) {
  .metrics-row { grid-template-columns: repeat(2, 1fr); }
  .efficiency-grid { grid-template-columns: repeat(2, 1fr); }
  .two-col { grid-template-columns: 1fr; }
  .reliability-grid { grid-template-columns: 1fr; }
  .v-bars { gap: var(--space-2); padding: 0 var(--space-2); }
  .arch-flow { flex-direction: column; }
  .arch-step { flex-direction: column; }
  .arch-arrow { transform: rotate(90deg); padding: var(--space-1) 0; }
  .rag-details { grid-template-columns: 1fr; }
  .rag-why-grid { grid-template-columns: 1fr; }
  .rag-header { flex-direction: column; }
  .rag-arch { flex-direction: column; align-items: center; }
  .rag-arch-step { flex-direction: column; }
  .rag-arch-arrow { transform: rotate(90deg); padding: var(--space-1) 0; }
  .rag-arch-box { max-width: 100%; min-width: 200px; }
  .prog-step { flex-direction: column; align-items: flex-start; gap: var(--space-3); }
  .prog-result { text-align: left; }
  .sysarch-boxes { flex-direction: column; align-items: center; }
  .sysarch-box { min-width: 200px; }
  .eng-grid { grid-template-columns: repeat(2, 1fr); }
  .tstack-cloud { gap: var(--space-2); }
}

@media (max-width: 480px) {
  .hero { padding-top: var(--space-8); }
  .hero-title { font-size: var(--text-3xl); }
  .metrics-row { grid-template-columns: 1fr; }
  .efficiency-grid { grid-template-columns: 1fr; }
  .metric-number { font-size: var(--text-3xl); }
  .section-card { padding: var(--space-5); }
  .section-block { margin-top: var(--space-8); }
  .eng-grid { grid-template-columns: 1fr; }
}
</style>
