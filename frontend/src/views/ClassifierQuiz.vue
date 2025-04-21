<template>
  <div class="classifier-quiz">
    <!-- ======== Input Card ======== -->
    <div class="quiz-card glass-card fade-in-up">
      <div class="card-header">
        <h1 class="quiz-title">Can You Guess The Answer?</h1>
        <p class="quiz-subtitle">An AI-powered assistant for medical multiple-choice questions</p>
      </div>

      <!-- Question textarea -->
      <div class="form-group fade-in-up fade-in-up-delay-1">
        <label class="form-label">Enter a Question</label>
        <textarea
          v-model="question"
          rows="4"
          class="textarea-glass"
          placeholder="Type your clinical MCQ here..."
        ></textarea>
      </div>

      <!-- 2x2 choice grid -->
      <div class="form-group fade-in-up fade-in-up-delay-2">
        <label class="form-label">Enter Choices</label>
        <div class="choices-grid">
          <div class="choice-item">
            <span class="choice-badge">A</span>
            <input v-model="choices.A" class="input-glass" placeholder="Choice A" />
          </div>
          <div class="choice-item">
            <span class="choice-badge">B</span>
            <input v-model="choices.B" class="input-glass" placeholder="Choice B" />
          </div>
          <div class="choice-item">
            <span class="choice-badge">C</span>
            <input v-model="choices.C" class="input-glass" placeholder="Choice C" />
          </div>
          <div class="choice-item">
            <span class="choice-badge">D</span>
            <input v-model="choices.D" class="input-glass" placeholder="Choice D" />
          </div>
        </div>
      </div>

      <!-- Buttons -->
      <div class="button-row fade-in-up fade-in-up-delay-3">
        <button
          class="btn btn-primary btn-lg"
          @click="submit"
          :disabled="loading || !isComplete"
        >
          <span v-if="loading" class="spinner"></span>
          {{ loading ? 'Predicting...' : 'Get Prediction' }}
        </button>
        <button class="btn btn-ghost" @click="clearAll">Clear</button>
      </div>
    </div>

    <!-- Error Banner -->
    <transition name="slide">
      <div v-if="errorMessage" class="error-banner">
        {{ errorMessage }}
        <button class="error-dismiss" @click="errorMessage = ''">&times;</button>
      </div>
    </transition>

    <!-- ======== Answer Picker (appears after prediction, before full results) ======== -->
    <transition name="slide">
      <div v-if="showAnswerPicker && !userAnswer" class="answer-picker glass-card fade-in-up">
        <h2 class="picker-heading">What is your answer?</h2>
        <p class="picker-sub">Select one option below to see how you compare to the model.</p>
        <div class="picker-buttons">
          <button
            v-for="letter in ['A', 'B', 'C', 'D']"
            :key="letter"
            class="picker-btn"
            @click="selectAnswer(letter)"
          >
            <span class="picker-btn-letter">{{ letter }}</span>
            <span class="picker-btn-text">{{ choices[letter] }}</span>
          </button>
        </div>
      </div>
    </transition>

    <!-- ======== Results Panel ======== -->
    <transition name="slide">
      <div v-if="result && userAnswer" class="results-section">
        <!-- Prediction card -->
        <div class="glass-card result-card fade-in-up">
          <h2 class="result-heading">Model Prediction</h2>

          <div class="prediction-hero">
            <div class="prediction-letter-circle">
              <span class="prediction-letter">{{ result.predicted }}</span>
            </div>
            <div class="prediction-details">
              <p class="prediction-answer">{{ result.pred_text }}</p>
              <p class="prediction-confidence">
                Confidence: <strong>{{ (result.confidence * 100).toFixed(2) }}%</strong>
              </p>
              <span
                :class="[
                  'badge',
                  result.confidence > 0.9
                    ? 'badge-primary'
                    : result.confidence > 0.6
                      ? 'badge-warning'
                      : 'badge-danger'
                ]"
              >
                {{ classifyDifficulty(result.confidence) }}
              </span>
            </div>
          </div>
        </div>

        <!-- Confidence breakdown card -->
        <div class="glass-card bars-card fade-in-up fade-in-up-delay-2">
          <h3 class="section-label">Confidence Breakdown</h3>
          <div class="bars-list">
            <div
              v-for="(value, key) in result.breakdown"
              :key="key"
              class="bar-row"
            >
              <span class="bar-option-badge">{{ key }}</span>
              <div class="bar-track">
                <div
                  class="bar-fill bar-fill-animate"
                  :style="{ width: (value * 100) + '%' }"
                >
                  <span class="bar-value">{{ (value * 100).toFixed(1) }}%</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Your answer & time card -->
        <div class="glass-card meta-card fade-in-up fade-in-up-delay-4">
          <div class="meta-grid">
            <div v-if="userAnswer" class="meta-item">
              <span class="meta-label">Your Answer</span>
              <span class="meta-value">
                {{ userAnswer }}
                <span
                  :class="userAnswer === result.predicted ? 'result-correct' : 'result-incorrect'"
                >
                  {{ userAnswer === result.predicted ? 'Correct' : 'Incorrect' }}
                </span>
              </span>
            </div>
            <div class="meta-item">
              <span class="meta-label">Time Taken</span>
              <span class="meta-value">{{ timeTaken.toFixed(1) }}s</span>
            </div>
          </div>

          <!-- Export buttons -->
          <div class="export-row">
            <button class="btn btn-ghost btn-sm" @click="exportJSON">Export JSON</button>
            <button class="btn btn-ghost btn-sm" @click="exportCSV">Export CSV</button>
          </div>
        </div>

        <!-- ======== Attention Heatmap Card ======== -->
        <div v-if="result && result.attention" class="glass-card heatmap-card fade-in-up fade-in-up-delay-4">
          <h3 class="section-label">Model Attention Heatmap</h3>
          <p class="heatmap-desc">Token importance based on PubMedBERT's last attention layer (averaged across {{ result.attention.num_heads }} heads)</p>
          <div class="heatmap-tokens">
            <span
              v-for="(token, idx) in result.attention.tokens"
              :key="idx"
              class="heatmap-token"
              :style="{ backgroundColor: getAttentionColor(result.attention.weights[idx]) }"
              :title="`${cleanToken(token)}: ${(result.attention.weights[idx] * 100).toFixed(1)}%`"
            >{{ cleanToken(token) }}</span>
          </div>
          <div class="heatmap-legend">
            <span class="heatmap-legend-label">Low</span>
            <div class="heatmap-gradient"></div>
            <span class="heatmap-legend-label">High</span>
          </div>
        </div>

        <!-- ======== RAG Bridge Card ======== -->
        <div v-if="showRagBridge" class="glass-card rag-bridge-card fade-in-up fade-in-up-delay-4">
          <div class="rag-bridge-header">
            <span class="badge badge-warning">Low Confidence</span>
            <h3 class="rag-bridge-title">Need more context?</h3>
          </div>
          <p class="rag-bridge-desc">
            The model's confidence is low on this question. Search your uploaded textbook for relevant context.
          </p>

          <div v-if="textbookAvailable" class="rag-bridge-actions">
            <button
              class="btn btn-primary"
              @click="searchTextbookForContext"
              :disabled="ragSearching"
            >
              <span v-if="ragSearching" class="spinner"></span>
              {{ ragSearching ? 'Searching...' : 'Search Textbook' }}
            </button>
          </div>
          <div v-else class="rag-bridge-actions">
            <p class="rag-bridge-hint">No textbook uploaded yet.</p>
            <button class="btn btn-secondary" @click="goToTextbookSearch">
              Upload Textbook
            </button>
          </div>

          <!-- Inline RAG Results -->
          <div v-if="ragAnswer" class="rag-inline-results">
            <div class="rag-answer-block">
              <h4 class="rag-answer-title">AI Answer from Textbook</h4>
              <div class="rag-answer-body" v-html="formatRagAnswer(ragAnswer)"></div>
            </div>
            <div v-if="ragResults.length" class="rag-sources">
              <h4 class="rag-sources-title">Sources</h4>
              <div v-for="(src, i) in ragResults" :key="i" class="rag-source-item">
                <span class="result-page-badge">Page {{ src.page }}</span>
                <p class="rag-source-text">{{ src.text }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script>
import { classifyMCQ, searchTextbook, askTextbook } from '@/services/api'

export default {
  name: 'ClassifierQuiz',
  data() {
    return {
      question: '',
      choices: { A: '', B: '', C: '', D: '' },
      userAnswer: '',
      result: null,
      loading: false,
      timeTaken: 0,
      showAnswerPicker: false,
      errorMessage: '',
      // RAG Bridge state
      textbookAvailable: false,
      textbookFileId: null,
      ragSearching: false,
      ragResults: [],
      ragAnswer: '',
      showRagBridge: false,
    }
  },
  mounted() {
    this.checkTextbookAvailability()
  },
  computed: {
    isComplete() {
      return this.question && this.choices.A && this.choices.B && this.choices.C && this.choices.D
    }
  },
  methods: {
    async submit() {
      this.loading = true
      this.errorMessage = ''
      this.showAnswerPicker = false
      this.userAnswer = ''
      const start = performance.now()

      try {
        const response = await classifyMCQ({
          question: this.question,
          choices: [this.choices.A, this.choices.B, this.choices.C, this.choices.D],
          include_attention: true
        })

        this.result = response.data
        this.timeTaken = (performance.now() - start) / 1000
        this.showAnswerPicker = true
      } catch (err) {
        this.errorMessage = "Prediction failed. Please check your inputs and try again."
      } finally {
        this.loading = false
      }
    },
    selectAnswer(letter) {
      this.userAnswer = letter
      this.showAnswerPicker = false
      // Trigger RAG bridge if confidence is low
      if (this.result && this.result.confidence <= 0.6) {
        this.checkTextbookAvailability()
        this.showRagBridge = true
      }
    },
    classifyDifficulty(conf) {
      if (conf > 0.9) return 'Easy'
      if (conf > 0.6) return 'Medium'
      return 'Hard'
    },
    getDiffClass(conf) {
      if (conf > 0.9) return 'easy'
      if (conf > 0.6) return 'medium'
      return 'hard'
    },
    clearAll() {
      this.question = ''
      this.choices = { A: '', B: '', C: '', D: '' }
      this.result = null
      this.timeTaken = 0
      this.userAnswer = ''
      this.showAnswerPicker = false
      this.errorMessage = ''
      this.showRagBridge = false
      this.ragResults = []
      this.ragAnswer = ''
      this.ragSearching = false
    },
    exportJSON() {
      const blob = new Blob([JSON.stringify(this.result, null, 2)], { type: 'application/json' })
      const link = document.createElement('a')
      link.href = URL.createObjectURL(blob)
      link.download = 'mcq_prediction.json'
      link.click()
    },
    exportCSV() {
      const data = this.result.breakdown
      const csv = `Option,Probability\n${Object.entries(data).map(([k, v]) => `${k},${(v * 100).toFixed(2)}%`).join('\n')}`
      const blob = new Blob([csv], { type: 'text/csv' })
      const link = document.createElement('a')
      link.href = URL.createObjectURL(blob)
      link.download = 'mcq_prediction.csv'
      link.click()
    },

    // ─── RAG Bridge Methods ────────────────────────────
    checkTextbookAvailability() {
      try {
        const stored = JSON.parse(localStorage.getItem('medpredict_textbook'))
        if (stored && stored.fileId && (Date.now() - stored.timestamp < 60 * 60 * 1000)) {
          this.textbookAvailable = true
          this.textbookFileId = stored.fileId
        } else {
          this.textbookAvailable = false
          this.textbookFileId = null
          if (stored) localStorage.removeItem('medpredict_textbook')
        }
      } catch (e) {
        this.textbookAvailable = false
        this.textbookFileId = null
      }
    },
    async searchTextbookForContext() {
      if (!this.textbookFileId || !this.question) return
      this.ragSearching = true
      this.ragResults = []
      this.ragAnswer = ''

      try {
        const [searchRes, askRes] = await Promise.all([
          searchTextbook(this.textbookFileId, this.question),
          askTextbook(this.textbookFileId, this.question)
        ])

        this.ragResults = searchRes.data.results || []
        this.ragAnswer = askRes.data.answer || ''
      } catch (err) {
        this.ragAnswer = 'Failed to search textbook. It may have expired — try re-uploading.'
      } finally {
        this.ragSearching = false
      }
    },
    goToTextbookSearch() {
      this.$router.push('/textbook-search')
    },
    formatRagAnswer(text) {
      return text
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\n/g, '<br>')
    },

    // ─── Attention Heatmap Methods ─────────────────────
    getAttentionColor(weight) {
      const opacity = Math.max(0.05, weight)
      return `rgba(61, 153, 112, ${opacity})`
    },
    cleanToken(token) {
      if (!token) return ''
      return token.replace(/^##/, '')
    }
  }
}
</script>

<style scoped>
/* ============================================================
   ClassifierQuiz — Glassmorphic Redesign
   ============================================================ */

/* ---- Page wrapper ---- */
.classifier-quiz {
  max-width: 800px;
  margin: 0 auto;
  padding: var(--space-12) var(--space-4) var(--space-20);
  font-family: var(--font-body);
}

/* ---- Card header ---- */
.card-header {
  text-align: center;
  margin-bottom: var(--space-8);
}

.quiz-title {
  font-family: var(--font-heading);
  font-size: var(--text-4xl);
  font-weight: 800;
  color: var(--text-primary);
  line-height: 1.15;
  margin: 0 0 var(--space-2);
}

.quiz-subtitle {
  font-family: var(--font-body);
  font-size: var(--text-lg);
  color: var(--text-secondary);
  margin: 0;
}

/* ---- Form groups ---- */
.form-group {
  margin-bottom: var(--space-6);
}

.form-label {
  display: block;
  font-family: var(--font-heading);
  font-weight: 600;
  font-size: var(--text-sm);
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.04em;
  margin-bottom: var(--space-2);
}

/* ---- 2x2 choice grid ---- */
.choices-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-4);
}

.choice-item {
  display: flex;
  align-items: center;
  gap: var(--space-3);
}

.choice-badge {
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: var(--radius-full);
  background: linear-gradient(135deg, var(--primary), var(--primary-dark));
  color: var(--text-white);
  font-family: var(--font-heading);
  font-weight: 700;
  font-size: var(--text-sm);
  box-shadow: 0 4px 12px var(--primary-glow);
}

.choice-item .input-glass {
  flex: 1;
  min-width: 0;
}

/* ---- Buttons ---- */
.button-row {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-4);
  margin-top: var(--space-8);
}

.button-row .btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

/* ---- Results section ---- */
.results-section {
  margin-top: var(--space-10);
  display: flex;
  flex-direction: column;
  gap: var(--space-6);
}

/* ---- Result card ---- */
.result-card {
  text-align: center;
}

.result-heading {
  font-family: var(--font-heading);
  font-size: var(--text-xl);
  font-weight: 700;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.06em;
  margin: 0 0 var(--space-6);
}

.prediction-hero {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-8);
}

.prediction-letter-circle {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 96px;
  height: 96px;
  border-radius: var(--radius-full);
  background: linear-gradient(135deg, var(--primary), var(--primary-dark));
  box-shadow:
    0 0 0 8px var(--primary-bg),
    0 8px 32px var(--primary-glow);
  animation: pulseGlowGreen 2.5s ease-in-out infinite;
}

@keyframes pulseGlowGreen {
  0%, 100% { box-shadow: 0 0 0 8px var(--primary-bg), 0 8px 32px var(--primary-glow); }
  50%      { box-shadow: 0 0 0 12px var(--primary-bg), 0 12px 48px rgba(61, 153, 112, 0.45); }
}

.prediction-letter {
  font-family: var(--font-heading);
  font-weight: 800;
  font-size: var(--text-5xl);
  color: var(--text-white);
  line-height: 1;
}

.prediction-details {
  text-align: left;
}

.prediction-answer {
  font-family: var(--font-body);
  font-size: var(--text-lg);
  font-weight: 500;
  color: var(--text-primary);
  margin: 0 0 var(--space-1);
}

.prediction-confidence {
  font-size: var(--text-sm);
  color: var(--text-secondary);
  margin: 0 0 var(--space-3);
}

/* ---- Bars card ---- */
.bars-card {
  padding: var(--space-8);
}

.section-label {
  font-family: var(--font-heading);
  font-size: var(--text-base);
  font-weight: 700;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.04em;
  margin: 0 0 var(--space-6);
}

.bars-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.bar-row {
  display: flex;
  align-items: center;
  gap: var(--space-3);
}

.bar-option-badge {
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: var(--radius-full);
  background: var(--primary-bg);
  color: var(--primary);
  font-family: var(--font-heading);
  font-weight: 700;
  font-size: var(--text-sm);
}

.bar-track {
  flex: 1;
  height: 36px;
  border-radius: var(--radius-full);
  background: var(--glass-white);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  border: 1px solid var(--glass-border);
  overflow: hidden;
  position: relative;
}

.bar-fill {
  height: 100%;
  border-radius: var(--radius-full);
  background: linear-gradient(90deg, var(--primary), var(--primary-light));
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding-right: var(--space-3);
  min-width: 48px;
  position: relative;
  transition: width var(--duration-slower) var(--ease-out);
}

.bar-value {
  font-family: var(--font-heading);
  font-size: var(--text-xs);
  font-weight: 700;
  color: var(--text-white);
  white-space: nowrap;
}

/* ---- Meta card ---- */
.meta-card {
  padding: var(--space-6) var(--space-8);
}

.meta-grid {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-10);
  margin-bottom: var(--space-6);
  flex-wrap: wrap;
}

.meta-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-1);
}

.meta-label {
  font-family: var(--font-heading);
  font-size: var(--text-xs);
  font-weight: 600;
  color: var(--text-tertiary);
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

.meta-value {
  font-family: var(--font-heading);
  font-size: var(--text-2xl);
  font-weight: 700;
  color: var(--text-primary);
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

.result-correct {
  font-size: var(--text-sm);
  font-weight: 600;
  color: var(--success);
  background: var(--success-bg);
  padding: var(--space-1) var(--space-3);
  border-radius: var(--radius-full);
}

.result-incorrect {
  font-size: var(--text-sm);
  font-weight: 600;
  color: var(--danger);
  background: var(--danger-bg);
  padding: var(--space-1) var(--space-3);
  border-radius: var(--radius-full);
}

/* ---- Export row ---- */
.export-row {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-3);
}

/* ---- Error Banner ---- */
.error-banner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: var(--space-4);
  padding: var(--space-3) var(--space-5);
  background: rgba(192, 80, 58, 0.1);
  border: 1px solid rgba(192, 80, 58, 0.25);
  border-radius: var(--radius-xl);
  color: var(--danger);
  font-size: var(--text-sm);
}

.error-dismiss {
  background: none;
  border: none;
  color: var(--danger);
  font-size: 1.3rem;
  cursor: pointer;
  padding: 0 0 0 var(--space-3);
  line-height: 1;
}

/* ---- Answer Picker ---- */
.answer-picker {
  margin-top: var(--space-8);
  text-align: center;
}

.picker-heading {
  font-family: var(--font-heading);
  font-size: var(--text-xl);
  font-weight: 700;
  color: var(--text-primary);
  margin: 0 0 var(--space-2);
}

.picker-sub {
  font-size: var(--text-sm);
  color: var(--text-secondary);
  margin: 0 0 var(--space-6);
}

.picker-buttons {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-3);
}

.picker-btn {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-3) var(--space-5);
  border: 2px solid var(--primary);
  border-radius: var(--radius-xl);
  background: var(--glass-white);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  cursor: pointer;
  transition:
    background var(--duration-normal) var(--ease-out),
    transform var(--duration-fast) var(--ease-out),
    box-shadow var(--duration-normal) var(--ease-out);
  text-align: left;
}

.picker-btn:hover {
  background: var(--primary-bg);
  transform: translateY(-2px);
  box-shadow: 0 4px 16px var(--primary-glow);
}

.picker-btn:active {
  transform: scale(0.97);
}

.picker-btn-letter {
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: var(--radius-full);
  background: linear-gradient(135deg, var(--primary), var(--primary-dark));
  color: var(--text-white);
  font-family: var(--font-heading);
  font-weight: 700;
  font-size: var(--text-sm);
}

.picker-btn-text {
  font-family: var(--font-body);
  font-size: var(--text-sm);
  font-weight: 500;
  color: var(--text-primary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* ---- Attention Heatmap ---- */
.heatmap-card {
  padding: var(--space-6) var(--space-8);
}

.heatmap-desc {
  font-size: var(--text-xs);
  color: var(--text-tertiary);
  margin: 0 0 var(--space-4);
}

.heatmap-tokens {
  display: flex;
  flex-wrap: wrap;
  gap: 3px;
  padding: var(--space-3);
  background: var(--glass-white);
  border-radius: var(--radius-lg);
  border: 1px solid var(--glass-border);
}

.heatmap-token {
  display: inline-block;
  padding: 2px 6px;
  border-radius: var(--radius-sm, 4px);
  font-family: 'Courier New', monospace;
  font-size: var(--text-xs);
  font-weight: 500;
  color: var(--text-primary);
  cursor: default;
  transition: transform 0.15s ease;
}

.heatmap-token:hover {
  transform: scale(1.15);
  z-index: 1;
}

.heatmap-legend {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  margin-top: var(--space-4);
  justify-content: center;
}

.heatmap-legend-label {
  font-size: var(--text-xs);
  color: var(--text-tertiary);
  font-weight: 600;
}

.heatmap-gradient {
  width: 120px;
  height: 12px;
  border-radius: var(--radius-full);
  background: linear-gradient(90deg, rgba(61, 153, 112, 0.05), rgba(61, 153, 112, 1));
}

/* ---- RAG Bridge Card ---- */
.rag-bridge-card {
  padding: var(--space-6) var(--space-8);
  border: 1px solid rgba(200, 169, 110, 0.3);
}

.rag-bridge-header {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  margin-bottom: var(--space-3);
}

.rag-bridge-title {
  font-family: var(--font-heading);
  font-size: var(--text-lg);
  font-weight: 700;
  color: var(--text-primary);
  margin: 0;
}

.rag-bridge-desc {
  font-size: var(--text-sm);
  color: var(--text-secondary);
  margin: 0 0 var(--space-4);
  line-height: 1.6;
}

.rag-bridge-actions {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  flex-wrap: wrap;
}

.rag-bridge-hint {
  font-size: var(--text-sm);
  color: var(--text-tertiary);
  margin: 0;
}

.rag-inline-results {
  margin-top: var(--space-6);
  padding-top: var(--space-5);
  border-top: 1px solid var(--glass-border);
}

.rag-answer-block {
  margin-bottom: var(--space-5);
}

.rag-answer-title {
  font-family: var(--font-heading);
  font-size: var(--text-base);
  font-weight: 700;
  color: var(--primary);
  margin: 0 0 var(--space-2);
}

.rag-answer-body {
  font-size: var(--text-sm);
  color: var(--text-primary);
  line-height: 1.75;
}

.rag-sources {
  margin-top: var(--space-4);
}

.rag-sources-title {
  font-family: var(--font-heading);
  font-size: var(--text-sm);
  font-weight: 700;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.04em;
  margin: 0 0 var(--space-3);
}

.rag-source-item {
  padding: var(--space-3) var(--space-4);
  background: var(--glass-white);
  border-radius: var(--radius-lg);
  border: 1px solid var(--glass-border);
  margin-bottom: var(--space-2);
}

.rag-source-item .result-page-badge {
  display: inline-block;
  font-family: var(--font-heading);
  font-size: var(--text-xs);
  font-weight: 700;
  color: var(--text-white, #fff);
  background: linear-gradient(135deg, var(--primary, #3d9970), var(--primary-dark, #2e7d5e));
  padding: 2px 10px;
  border-radius: var(--radius-full);
  margin-bottom: var(--space-2);
}

.rag-source-text {
  font-size: var(--text-xs);
  color: var(--text-secondary);
  line-height: 1.6;
  margin: 0;
}

/* ============================================================
   Responsive
   ============================================================ */

@media (max-width: 640px) {
  .classifier-quiz {
    padding: var(--space-6) var(--space-3) var(--space-12);
  }

  .quiz-title {
    font-size: var(--text-2xl);
  }

  .quiz-subtitle {
    font-size: var(--text-base);
  }

  .choices-grid,
  .picker-buttons {
    grid-template-columns: 1fr;
  }

  .prediction-hero {
    flex-direction: column;
    text-align: center;
  }

  .prediction-details {
    text-align: center;
  }

  .prediction-letter-circle {
    width: 80px;
    height: 80px;
  }

  .prediction-letter {
    font-size: var(--text-4xl);
  }

  .meta-grid {
    flex-direction: column;
    gap: var(--space-6);
  }

  .button-row {
    flex-direction: column;
  }

  .export-row {
    flex-direction: column;
  }
}
</style>
