<template>
  <div class="textbook-search">
    <!-- Page Header -->
    <section class="page-header fade-in-up">
      <div class="header-badge badge badge-primary">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M4 19.5A2.5 2.5 0 016.5 17H20"/>
          <path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"/>
        </svg>
        RAG-Powered Search
      </div>
      <h1 class="page-title">Textbook Search</h1>
      <p class="page-subtitle">Upload a PDF textbook, search with hybrid BM25 + vector retrieval, and get AI-powered answers</p>
    </section>

    <!-- Error Banner -->
    <transition name="slide">
      <div v-if="errorMessage" class="error-banner">
        {{ errorMessage }}
        <button class="error-dismiss" @click="errorMessage = ''">&times;</button>
      </div>
    </transition>

    <!-- Main Glass Card -->
    <section class="main-card glass-card fade-in-up fade-in-up-delay-1">

      <!-- File Upload Zone -->
      <div
        class="upload-zone"
        :class="{ 'upload-zone--active': isDragging, 'upload-zone--has-file': fileId }"
        @dragover.prevent="isDragging = true"
        @dragleave.prevent="isDragging = false"
        @drop.prevent="handleDrop"
        @click="$refs.fileInput.click()"
      >
        <input
          ref="fileInput"
          type="file"
          accept=".pdf"
          class="upload-input-hidden"
          @change="handleFileSelect"
        />

        <div v-if="uploading" class="upload-placeholder">
          <div class="upload-icon-wrap">
            <span class="spinner spinner-lg"></span>
          </div>
          <p class="upload-text">Processing PDF...</p>
          <p class="upload-hint">Extracting text and building search index</p>
        </div>

        <div v-else-if="!fileId" class="upload-placeholder">
          <div class="upload-icon-wrap">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
              <polyline points="17 8 12 3 7 8"/>
              <line x1="12" y1="3" x2="12" y2="15"/>
            </svg>
          </div>
          <p class="upload-text">Drag & drop your PDF here</p>
          <p class="upload-hint">or click to browse files (max 10 MB)</p>
        </div>

        <div v-else class="upload-file-info">
          <div class="file-icon-wrap">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
              <polyline points="14 2 14 8 20 8"/>
              <line x1="16" y1="13" x2="8" y2="13"/>
              <line x1="16" y1="17" x2="8" y2="17"/>
              <polyline points="10 9 9 9 8 9"/>
            </svg>
          </div>
          <div class="file-details">
            <p class="file-name">{{ uploadedFileName }}</p>
            <p class="file-size">{{ chunkCount }} chunks &middot; {{ pageCount }} pages</p>
          </div>
          <button class="btn-remove" @click.stop="removeFile" title="Remove file">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
      </div>

      <!-- Search Input -->
      <div class="search-row">
        <div class="search-input-wrap">
          <svg class="search-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="11" cy="11" r="8"/>
            <line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input
            v-model="searchTerm"
            type="text"
            class="input-glass search-input"
            placeholder="Search for a medical concept or ask a question..."
            @keyup.enter="handleSearch"
          />
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="action-buttons">
        <button class="btn btn-primary" @click="handleSearch" :disabled="!canSearch || searching">
          <span v-if="searching" class="spinner"></span>
          <svg v-else width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="11" cy="11" r="8"/>
            <line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          {{ searching ? 'Searching...' : 'Search' }}
        </button>
        <button class="btn btn-secondary" @click="handleGenerateQuiz" :disabled="!fileId || generatingQuiz">
          <span v-if="generatingQuiz" class="spinner"></span>
          <svg v-else width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"/>
            <path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3"/>
            <line x1="12" y1="17" x2="12.01" y2="17"/>
          </svg>
          {{ generatingQuiz ? 'Generating...' : 'Generate Quiz' }}
        </button>
      </div>
    </section>

    <!-- AI Answer Section -->
    <transition name="slide">
      <section v-if="aiAnswer" class="ai-answer-section fade-in-up">
        <div class="glass-card ai-card">
          <h3 class="ai-card-title">AI Answer</h3>
          <div class="ai-card-divider"></div>
          <div class="ai-answer-body" v-html="formatAnswer(aiAnswer)"></div>
        </div>
      </section>
    </transition>

    <!-- Search Results Area -->
    <section class="results-section fade-in-up fade-in-up-delay-2">
      <div class="results-glass glass-card">
        <div class="results-header">
          <h3 class="results-title">Search Results</h3>
          <div class="results-badges" v-if="results.length">
            <span class="badge" :class="searchMethod === 'hybrid' ? 'badge-primary' : 'badge-warning'">
              {{ searchMethod === 'hybrid' ? 'Hybrid Search' : 'BM25 Only' }}
            </span>
            <span class="results-count badge">
              {{ results.length }} found
            </span>
          </div>
        </div>

        <!-- Empty State -->
        <div v-if="!results.length" class="results-empty">
          <div class="empty-icon-wrap">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1">
              <path d="M4 19.5A2.5 2.5 0 016.5 17H20"/>
              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"/>
              <line x1="9" y1="7" x2="16" y2="7"/>
              <line x1="9" y1="11" x2="14" y2="11"/>
              <line x1="9" y1="15" x2="12" y2="15"/>
            </svg>
          </div>
          <p class="empty-text">Upload a textbook and enter a search term to get started</p>
          <p class="empty-hint">Supported format: PDF</p>
        </div>

        <!-- Results List -->
        <div v-else class="results-list">
          <div
            v-for="(result, index) in results"
            :key="index"
            class="result-item glass"
          >
            <div class="result-meta">
              <span class="result-page-badge">Page {{ result.page }}</span>
              <span class="result-score">Score: {{ result.score }}</span>
            </div>
            <p class="result-text">{{ result.text }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Quiz Section -->
    <transition name="slide">
      <section v-if="quiz.length > 0" class="quiz-section fade-in-up">
        <div class="glass-card quiz-card">
          <h3 class="quiz-card-title">Textbook Quiz</h3>
          <div class="quiz-card-divider"></div>

          <div
            v-for="(q, qi) in quiz"
            :key="qi"
            class="quiz-question-block"
          >
            <p class="quiz-q-text">
              <strong>Q{{ qi + 1 }}.</strong> {{ q.question }}
            </p>
            <div class="quiz-options">
              <button
                v-for="(opt, oi) in q.options"
                :key="oi"
                class="quiz-option-btn"
                :class="{
                  'quiz-option--selected': quizAnswers[qi] === optionLetter(oi),
                  'quiz-option--correct': quizSubmitted && q.answer === optionLetter(oi),
                  'quiz-option--wrong': quizSubmitted && quizAnswers[qi] === optionLetter(oi) && q.answer !== optionLetter(oi)
                }"
                :disabled="quizSubmitted"
                @click="selectQuizAnswer(qi, optionLetter(oi))"
              >
                <span class="quiz-opt-letter">{{ optionLetter(oi) }}</span>
                <span class="quiz-opt-text">{{ opt }}</span>
              </button>
            </div>
          </div>

          <div class="quiz-actions">
            <button
              v-if="!quizSubmitted"
              class="btn btn-primary"
              :disabled="Object.keys(quizAnswers).length < quiz.length"
              @click="submitQuiz"
            >
              Submit Answers
            </button>
            <div v-else class="quiz-score-display">
              <span class="quiz-score-label">Score:</span>
              <span class="quiz-score-value">{{ quizScore }} / {{ quiz.length }}</span>
            </div>
            <button v-if="quizSubmitted" class="btn btn-ghost" @click="resetQuiz">
              Try Again
            </button>
          </div>
        </div>
      </section>
    </transition>
  </div>
</template>

<script>
import { uploadTextbook, searchTextbook, askTextbook, generateTextbookQuiz } from '@/services/api'

export default {
  name: 'TextbookSearch',
  data() {
    return {
      searchTerm: '',
      isDragging: false,
      errorMessage: '',
      // Upload state
      uploading: false,
      fileId: null,
      uploadedFileName: '',
      chunkCount: 0,
      pageCount: 0,
      // Search state
      searching: false,
      results: [],
      searchMethod: '',
      aiAnswer: '',
      // Quiz state
      generatingQuiz: false,
      quiz: [],
      quizAnswers: {},
      quizSubmitted: false,
    }
  },
  mounted() {
    // Restore textbook from localStorage if < 1hr old
    try {
      const stored = JSON.parse(localStorage.getItem('medpredict_textbook'))
      if (stored && stored.fileId && (Date.now() - stored.timestamp < 60 * 60 * 1000)) {
        this.fileId = stored.fileId
        this.uploadedFileName = stored.fileName || 'Restored PDF'
      } else if (stored) {
        localStorage.removeItem('medpredict_textbook')
      }
    } catch (e) { /* ignore parse errors */ }
  },
  computed: {
    canSearch() {
      return this.fileId && this.searchTerm.trim().length > 0
    },
    quizScore() {
      let score = 0
      for (let i = 0; i < this.quiz.length; i++) {
        if (this.quizAnswers[i] === this.quiz[i].answer) score++
      }
      return score
    }
  },
  methods: {
    async handleFileSelect(event) {
      const file = event.target.files[0]
      if (file && file.type === 'application/pdf') {
        await this.uploadFile(file)
      }
    },
    async handleDrop(event) {
      this.isDragging = false
      const file = event.dataTransfer.files[0]
      if (file && file.type === 'application/pdf') {
        await this.uploadFile(file)
      }
    },
    async uploadFile(file) {
      this.uploading = true
      this.errorMessage = ''
      this.fileId = null
      this.results = []
      this.aiAnswer = ''
      this.quiz = []
      this.quizAnswers = {}
      this.quizSubmitted = false

      try {
        const { data } = await uploadTextbook(file)
        this.fileId = data.fileId
        this.uploadedFileName = file.name
        this.chunkCount = data.chunkCount
        this.pageCount = data.pageCount

        // Persist to localStorage for cross-page access (RAG bridge)
        localStorage.setItem('medpredict_textbook', JSON.stringify({
          fileId: data.fileId,
          fileName: file.name,
          timestamp: Date.now()
        }))
      } catch (err) {
        this.errorMessage = err.message || 'Failed to upload PDF.'
      } finally {
        this.uploading = false
      }
    },
    removeFile() {
      this.fileId = null
      this.uploadedFileName = ''
      this.chunkCount = 0
      this.pageCount = 0
      this.results = []
      this.searchMethod = ''
      this.aiAnswer = ''
      this.quiz = []
      this.quizAnswers = {}
      this.quizSubmitted = false
      this.$refs.fileInput.value = ''
      localStorage.removeItem('medpredict_textbook')
    },
    async handleSearch() {
      if (!this.canSearch) return
      this.searching = true
      this.errorMessage = ''
      this.results = []
      this.searchMethod = ''
      this.aiAnswer = ''

      try {
        // Fire BM25 search and AI ask in parallel
        const [searchRes, askRes] = await Promise.all([
          searchTextbook(this.fileId, this.searchTerm),
          askTextbook(this.fileId, this.searchTerm),
        ])

        this.results = searchRes.data.results || []
        this.searchMethod = searchRes.data.method || 'bm25'
        this.aiAnswer = askRes.data.answer || ''
      } catch (err) {
        this.errorMessage = err.message || 'Search failed.'
      } finally {
        this.searching = false
      }
    },
    async handleGenerateQuiz() {
      if (!this.fileId) return
      this.generatingQuiz = true
      this.errorMessage = ''
      this.quiz = []
      this.quizAnswers = {}
      this.quizSubmitted = false

      try {
        const { data } = await generateTextbookQuiz(this.fileId, this.searchTerm || '')
        this.quiz = data.quiz || []
      } catch (err) {
        this.errorMessage = err.message || 'Failed to generate quiz.'
      } finally {
        this.generatingQuiz = false
      }
    },
    optionLetter(index) {
      return ['A', 'B', 'C', 'D'][index]
    },
    selectQuizAnswer(questionIndex, letter) {
      this.quizAnswers = { ...this.quizAnswers, [questionIndex]: letter }
    },
    submitQuiz() {
      this.quizSubmitted = true
    },
    resetQuiz() {
      this.quizAnswers = {}
      this.quizSubmitted = false
    },
    formatAnswer(text) {
      return text
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\n/g, '<br>')
    },
  }
}
</script>

<style scoped>
/* ========== PAGE LAYOUT ========== */

.textbook-search {
  max-width: 820px;
  margin: 0 auto;
  padding: var(--space-8) var(--space-4) var(--space-16);
}

/* ========== PAGE HEADER ========== */

.page-header {
  text-align: center;
  padding: var(--space-12) 0 var(--space-8);
}

.header-badge {
  display: inline-flex;
  gap: 6px;
  margin-bottom: var(--space-5);
  font-size: var(--text-xs);
}

.page-title {
  font-family: var(--font-heading);
  font-size: clamp(2rem, 5vw, var(--text-5xl));
  font-weight: 800;
  letter-spacing: -0.03em;
  line-height: 1.15;
  color: var(--text-primary);
  margin-bottom: var(--space-3);
}

.page-subtitle {
  font-family: var(--font-body);
  font-size: var(--text-lg);
  color: var(--text-secondary);
  max-width: 520px;
  margin: 0 auto;
  line-height: 1.6;
}

/* ========== ERROR BANNER ========== */

.error-banner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  max-width: 820px;
  margin: 0 auto var(--space-4);
  padding: var(--space-3) var(--space-5);
  background: rgba(192, 80, 58, 0.1);
  border: 1px solid rgba(192, 80, 58, 0.25);
  border-radius: var(--radius-xl);
  color: var(--danger, #c0503a);
  font-size: var(--text-sm);
}

.error-dismiss {
  background: none;
  border: none;
  color: var(--danger, #c0503a);
  font-size: 1.3rem;
  cursor: pointer;
  padding: 0 0 0 var(--space-3);
  line-height: 1;
}

/* ========== SPINNER ========== */

.spinner {
  display: inline-block;
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
  margin-right: 6px;
  vertical-align: middle;
}

.spinner-lg {
  width: 32px;
  height: 32px;
  border-width: 3px;
  border-color: rgba(61, 153, 112, 0.2);
  border-top-color: var(--primary, #3d9970);
  margin-right: 0;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* ========== MAIN GLASS CARD ========== */

.main-card {
  padding: var(--space-8);
}

/* ========== UPLOAD ZONE ========== */

.upload-zone {
  position: relative;
  border: 2px dashed var(--glass-border);
  border-radius: var(--radius-2xl);
  background: var(--glass-white);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  padding: var(--space-10) var(--space-6);
  text-align: center;
  cursor: pointer;
  transition:
    border-color var(--duration-normal) var(--ease-out),
    background var(--duration-normal) var(--ease-out),
    transform var(--duration-fast) var(--ease-out);
}

.upload-zone:hover {
  border-color: var(--primary-light);
  background: var(--primary-bg);
}

.upload-zone--active {
  border-color: var(--primary);
  background: rgba(61, 153, 112, 0.06);
  transform: scale(1.01);
}

.upload-zone--has-file {
  padding: var(--space-5) var(--space-6);
  border-style: solid;
  border-color: rgba(61, 153, 112, 0.25);
  background: var(--primary-bg);
}

.upload-zone--has-file:hover {
  border-color: var(--primary-light);
}

.upload-input-hidden {
  position: absolute;
  width: 0;
  height: 0;
  opacity: 0;
  pointer-events: none;
}

/* Upload Placeholder */

.upload-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-2);
}

.upload-icon-wrap {
  width: 72px;
  height: 72px;
  border-radius: var(--radius-xl);
  background: linear-gradient(135deg, var(--primary-bg), var(--sage-bg));
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--primary);
  margin-bottom: var(--space-3);
}

.upload-text {
  font-family: var(--font-heading);
  font-size: var(--text-base);
  font-weight: 600;
  color: var(--text-primary);
}

.upload-hint {
  font-family: var(--font-body);
  font-size: var(--text-sm);
  color: var(--text-tertiary);
}

/* Uploaded File Info */

.upload-file-info {
  display: flex;
  align-items: center;
  gap: var(--space-4);
}

.file-icon-wrap {
  width: 48px;
  height: 48px;
  border-radius: var(--radius-lg);
  background: linear-gradient(135deg, var(--primary-bg), var(--sage-bg));
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--primary);
  flex-shrink: 0;
}

.file-details {
  flex: 1;
  text-align: left;
  min-width: 0;
}

.file-name {
  font-family: var(--font-heading);
  font-size: var(--text-sm);
  font-weight: 600;
  color: var(--text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.file-size {
  font-family: var(--font-body);
  font-size: var(--text-xs);
  color: var(--text-tertiary);
  margin-top: var(--space-1);
}

.btn-remove {
  width: 36px;
  height: 36px;
  border-radius: var(--radius-lg);
  border: 1px solid var(--glass-border);
  background: var(--glass-white);
  color: var(--text-tertiary);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  flex-shrink: 0;
  transition:
    color var(--duration-fast),
    border-color var(--duration-fast),
    background var(--duration-fast);
}

.btn-remove:hover {
  color: var(--danger);
  border-color: rgba(192, 80, 58, 0.3);
  background: var(--danger-bg);
}

/* ========== SEARCH ROW ========== */

.search-row {
  margin-top: var(--space-6);
}

.search-input-wrap {
  position: relative;
}

.search-icon {
  position: absolute;
  left: var(--space-4);
  top: 50%;
  transform: translateY(-50%);
  color: var(--text-tertiary);
  pointer-events: none;
}

.search-input {
  padding-left: calc(var(--space-4) + 18px + var(--space-3));
}

/* ========== ACTION BUTTONS ========== */

.action-buttons {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-4);
  margin-top: var(--space-6);
  flex-wrap: wrap;
}

.action-buttons .btn:disabled {
  opacity: 0.45;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

/* ========== AI ANSWER SECTION ========== */

.ai-answer-section {
  margin-top: var(--space-6);
}

.ai-card {
  padding: var(--space-6) var(--space-8);
}

.ai-card-title {
  font-family: var(--font-heading);
  font-size: var(--text-lg);
  font-weight: 700;
  color: var(--primary);
  margin: 0 0 var(--space-3);
}

.ai-card-divider {
  height: 1px;
  background: linear-gradient(90deg, transparent, var(--primary), transparent);
  margin-bottom: var(--space-5);
}

.ai-answer-body {
  font-family: var(--font-body);
  font-size: var(--text-sm);
  color: var(--text-primary);
  line-height: 1.75;
}

/* ========== RESULTS SECTION ========== */

.results-section {
  margin-top: var(--space-8);
}

.results-glass {
  padding: var(--space-8);
}

.results-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--space-6);
}

.results-title {
  font-family: var(--font-heading);
  font-size: var(--text-xl);
  font-weight: 700;
  color: var(--text-primary);
}

.results-badges {
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

.results-count {
  font-size: var(--text-xs);
}

/* Empty State */

.results-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: var(--space-10) 0 var(--space-6);
  text-align: center;
}

.empty-icon-wrap {
  width: 88px;
  height: 88px;
  border-radius: var(--radius-2xl);
  background: linear-gradient(135deg, var(--glass-white-md), var(--primary-bg));
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-tertiary);
  margin-bottom: var(--space-5);
}

.empty-text {
  font-family: var(--font-heading);
  font-size: var(--text-base);
  font-weight: 600;
  color: var(--text-secondary);
  max-width: 360px;
  line-height: 1.5;
}

.empty-hint {
  font-family: var(--font-body);
  font-size: var(--text-sm);
  color: var(--text-tertiary);
  margin-top: var(--space-2);
}

/* Results List */

.results-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.result-item {
  padding: var(--space-5) var(--space-6);
  border-radius: var(--radius-xl);
}

.result-meta {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  margin-bottom: var(--space-2);
}

.result-page-badge {
  display: inline-block;
  font-family: var(--font-heading);
  font-size: var(--text-xs);
  font-weight: 700;
  color: var(--text-white, #fff);
  background: linear-gradient(135deg, var(--primary, #3d9970), var(--primary-dark, #2e7d5e));
  padding: 2px 10px;
  border-radius: var(--radius-full);
}

.result-score {
  font-family: var(--font-body);
  font-size: var(--text-xs);
  color: var(--text-tertiary);
}

.result-text {
  font-family: var(--font-body);
  font-size: var(--text-sm);
  color: var(--text-primary);
  line-height: 1.7;
}

/* ========== QUIZ SECTION ========== */

.quiz-section {
  margin-top: var(--space-8);
}

.quiz-card {
  padding: var(--space-8);
}

.quiz-card-title {
  font-family: var(--font-heading);
  font-size: var(--text-xl);
  font-weight: 700;
  color: var(--text-primary);
  text-align: center;
  margin: 0 0 var(--space-3);
}

.quiz-card-divider {
  height: 1px;
  background: linear-gradient(90deg, transparent, var(--glass-border), var(--secondary, #c8a96e), var(--glass-border), transparent);
  margin-bottom: var(--space-8);
}

.quiz-question-block {
  margin-bottom: var(--space-8);
}

.quiz-q-text {
  font-family: var(--font-body);
  font-size: var(--text-base);
  font-weight: 500;
  color: var(--text-primary);
  line-height: 1.6;
  margin-bottom: var(--space-4);
}

.quiz-options {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.quiz-option-btn {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-3) var(--space-4);
  border: 2px solid var(--glass-border);
  border-radius: var(--radius-xl);
  background: var(--glass-white);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  cursor: pointer;
  text-align: left;
  transition:
    border-color var(--duration-normal) var(--ease-out),
    background var(--duration-normal) var(--ease-out),
    transform var(--duration-fast) var(--ease-out);
}

.quiz-option-btn:hover:not(:disabled) {
  border-color: var(--primary);
  background: var(--primary-bg);
  transform: translateY(-1px);
}

.quiz-option-btn:disabled {
  cursor: default;
}

.quiz-option--selected {
  border-color: var(--primary);
  background: var(--primary-bg);
}

.quiz-option--correct {
  border-color: var(--success, #28a745) !important;
  background: rgba(40, 167, 69, 0.1) !important;
}

.quiz-option--wrong {
  border-color: var(--danger) !important;
  background: rgba(192, 80, 58, 0.1) !important;
}

.quiz-opt-letter {
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: var(--radius-full);
  background: var(--primary-bg);
  color: var(--primary);
  font-family: var(--font-heading);
  font-weight: 700;
  font-size: var(--text-xs);
}

.quiz-opt-text {
  font-family: var(--font-body);
  font-size: var(--text-sm);
  color: var(--text-primary);
  line-height: 1.5;
}

.quiz-actions {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-4);
  margin-top: var(--space-6);
}

.quiz-score-display {
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

.quiz-score-label {
  font-family: var(--font-heading);
  font-size: var(--text-lg);
  font-weight: 600;
  color: var(--text-secondary);
}

.quiz-score-value {
  font-family: var(--font-heading);
  font-size: var(--text-2xl);
  font-weight: 800;
  color: var(--primary);
}

/* ========== TRANSITIONS ========== */

.slide-enter-active,
.slide-leave-active {
  transition: all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1);
}

.slide-enter-from {
  opacity: 0;
  transform: translateY(16px);
}

.slide-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}

/* ========== RESPONSIVE ========== */

@media (max-width: 640px) {
  .textbook-search {
    padding: var(--space-4) var(--space-3) var(--space-12);
  }

  .page-header {
    padding: var(--space-8) 0 var(--space-6);
  }

  .page-title {
    font-size: var(--text-3xl);
  }

  .main-card,
  .results-glass,
  .quiz-card,
  .ai-card {
    padding: var(--space-5);
  }

  .upload-zone {
    padding: var(--space-8) var(--space-4);
  }

  .upload-zone--has-file {
    padding: var(--space-4);
  }

  .upload-file-info {
    gap: var(--space-3);
  }

  .action-buttons {
    flex-direction: column;
  }

  .action-buttons .btn {
    width: 100%;
  }
}
</style>
