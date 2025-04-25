<template>
  <div class="flashcard-page">

    <!-- ===== COMPLETION OVERLAY ===== -->
    <transition name="fade">
      <div v-if="completionVisible" class="completion-overlay" @click.self="dismissCompletion">
        <div class="completion-card glass-heavy">
          <div class="completion-icon">
            <svg viewBox="0 0 48 48" fill="none" stroke="var(--primary)" stroke-width="3">
              <circle cx="24" cy="24" r="20" opacity="0.2" fill="var(--primary)"/>
              <path d="M15 25l6 6 12-14" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
          <h2 class="completion-title">All Cards Memorized!</h2>
          <p class="completion-stat">
            <span class="stat-number">{{ completionStats.total }}</span> cards in
            <span class="stat-number">{{ completionStats.rounds }}</span> round{{ completionStats.rounds > 1 ? 's' : '' }}
          </p>
          <p class="completion-time">
            <svg class="icon-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="13" r="8"/><path d="M12 9v4l2 2"/><path d="M9 2h6"/>
            </svg>
            {{ completionStats.time }}s
          </p>
          <button class="btn btn-primary btn-lg" @click="dismissCompletion">Continue</button>
        </div>
      </div>
    </transition>

    <!-- ===== ROUND BANNER ===== -->
    <transition name="slide-down">
      <div v-if="roundBanner" class="round-banner glass-md">
        <span class="round-banner-icon">&#x1f501;</span>
        Round {{ round }} — {{ flashcards.length }} card{{ flashcards.length !== 1 ? 's' : '' }} remaining
      </div>
    </transition>

    <!-- ===== INPUT PHASE ===== -->
    <section v-if="!sessionStarted && !completionVisible" class="input-section fade-in-up">
      <div class="glass-card input-card">
        <div class="card-icon">
          <svg viewBox="0 0 40 40" fill="none">
            <rect x="4" y="6" width="32" height="22" rx="4" stroke="var(--primary)" stroke-width="2.5" fill="var(--primary-bg)"/>
            <rect x="8" y="10" width="24" height="14" rx="2" stroke="var(--secondary)" stroke-width="1.5" fill="var(--secondary-bg)" transform="rotate(-3 20 17)"/>
            <line x1="12" y1="20" x2="28" y2="20" stroke="var(--text-tertiary)" stroke-width="1.5" stroke-linecap="round"/>
            <line x1="12" y1="24" x2="22" y2="24" stroke="var(--text-tertiary)" stroke-width="1.5" stroke-linecap="round"/>
          </svg>
        </div>
        <h1 class="page-title">Flashcard Studio</h1>
        <p class="page-subtitle">Create flashcards and study with spaced repetition</p>

        <div class="form-group">
          <label class="field-label" for="set-title">Set Title</label>
          <input
            id="set-title"
            v-model="setTitle"
            placeholder="e.g. Cardiology Terms"
            class="input-glass"
          />
        </div>

        <div class="form-group">
          <label class="field-label" for="raw-input">
            Cards
            <span class="field-hint">one per line — term ; definition</span>
          </label>
          <textarea
            id="raw-input"
            v-model="rawInput"
            placeholder="Hypertension ; Persistently elevated arterial blood pressure&#10;Bradycardia ; Heart rate below 60 bpm&#10;Tachypnea ; Abnormally rapid breathing"
            class="textarea-glass"
            rows="8"
          ></textarea>
        </div>

        <div class="input-footer">
          <span class="card-count-preview" v-if="parsedPreviewCount > 0">
            {{ parsedPreviewCount }} card{{ parsedPreviewCount !== 1 ? 's' : '' }} detected
          </span>
          <button
            class="btn btn-primary btn-lg"
            :disabled="parsedPreviewCount === 0 || !setTitle.trim()"
            @click="startSession"
          >
            <svg class="icon-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <polygon points="5,3 19,12 5,21"/>
            </svg>
            Start Studying
          </button>
        </div>
      </div>
    </section>

    <!-- ===== STUDY PHASE ===== -->
    <section v-if="sessionStarted" class="study-section fade-in-up">
      <!-- Top bar -->
      <div class="study-top-bar">
        <span class="badge badge-primary">Round {{ round }}</span>
        <span class="study-counter">{{ currentIndex + 1 }} / {{ flashcards.length }}</span>
        <span class="study-timer">
          <svg class="icon-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="13" r="8"/><path d="M12 9v4l2 2"/><path d="M9 2h6"/>
          </svg>
          {{ elapsedTime }}s
        </span>
      </div>

      <!-- Progress bar -->
      <div class="study-progress-track">
        <div class="study-progress-fill" :style="{ width: progressPercent + '%' }"></div>
      </div>

      <!-- Flashcard -->
      <div class="study-card glass-card" @click="handleCardClick">
        <div class="study-card-content" :class="{ flipped: showDefinition }">
          <!-- Front -->
          <div class="study-face study-front">
            <span class="face-label">Term</span>
            <h2 class="face-text">{{ currentCard.term }}</h2>
            <span class="tap-hint">tap to reveal</span>
          </div>
          <!-- Back -->
          <div class="study-face study-back">
            <span class="face-label face-label--def">Definition</span>
            <p class="face-text face-text--def">{{ currentCard.definition }}</p>
          </div>
        </div>
      </div>

      <!-- Action buttons -->
      <transition name="fade" mode="out-in">
        <div v-if="showDefinition" class="action-row" key="actions">
          <button class="btn btn-primary action-btn" @click="memorized(true)">
            <svg class="icon-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <path d="M20 6L9 17l-5-5"/>
            </svg>
            Got It
          </button>
          <button class="btn btn-ghost action-btn" @click="memorized(false)">
            <svg class="icon-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <path d="M1 4v6h6"/><path d="M3.51 15a9 9 0 105.64-8.36L1 10"/>
            </svg>
            Review Again
          </button>
        </div>
      </transition>

      <!-- Quit button -->
      <button class="btn-text quit-btn" @click="quitSession">End Session</button>
    </section>

    <!-- ===== SAVED SETS ===== -->
    <section v-if="savedSets.length && !sessionStarted && !completionVisible" class="saved-section fade-in-up delay-1">
      <h2 class="section-heading">Your Flashcard Sets</h2>

      <div class="sets-list">
        <div class="set-block glass-card" v-for="(set, si) in savedSets" :key="si">
          <div class="set-header">
            <div>
              <h3 class="set-title">{{ set.title }}</h3>
              <span class="set-meta">{{ set.cards.length }} cards</span>
            </div>
            <div class="set-actions">
              <button class="btn btn-primary btn-sm" @click="reStudy(si)">
                <svg class="icon-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                  <polygon points="5,3 19,12 5,21"/>
                </svg>
                Study
              </button>
              <button class="btn-icon delete-btn" @click="deleteSet(si)" title="Delete set">
                <svg class="icon-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M3 6h18"/><path d="M8 6V4h8v2"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6"/>
                </svg>
              </button>
            </div>
          </div>

          <!-- Mini card previews -->
          <div class="mini-cards">
            <div
              class="mini-card"
              v-for="(card, ci) in set.cards.slice(0, 6)"
              :key="ci"
              :class="{ 'mini-flipped': flippedMinis[si + '-' + ci] }"
              @click="toggleMini(si, ci)"
            >
              <div class="mini-inner">
                <div class="mini-front">
                  <span class="mini-label">Term</span>
                  <span class="mini-text">{{ card.term }}</span>
                </div>
                <div class="mini-back">
                  <span class="mini-label">Def</span>
                  <span class="mini-text">{{ card.definition }}</span>
                </div>
              </div>
            </div>
            <div v-if="set.cards.length > 6" class="mini-card mini-more">
              <span>+{{ set.cards.length - 6 }} more</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script>
export default {
  name: 'FlashcardGenerator',
  data() {
    return {
      setTitle: '',
      rawInput: '',
      flashcards: [],
      allCards: [],
      unmemorized: [],
      currentIndex: 0,
      showDefinition: false,
      sessionStarted: false,
      round: 1,
      startTime: null,
      elapsedTime: 0,
      timerInterval: null,
      savedSets: [],
      flippedMinis: {},
      completionVisible: false,
      completionStats: { total: 0, rounds: 0, time: '0' },
      roundBanner: false
    }
  },
  computed: {
    currentCard() {
      return this.flashcards[this.currentIndex] || { term: '', definition: '' }
    },
    progressPercent() {
      if (!this.flashcards.length) return 0
      return Math.round((this.currentIndex / this.flashcards.length) * 100)
    },
    parsedPreviewCount() {
      if (!this.rawInput.trim()) return 0
      return this.rawInput
        .split('\n')
        .filter(line => {
          const parts = line.split(';')
          return parts.length >= 2 && parts[0].trim() && parts[1].trim()
        })
        .length
    }
  },
  created() {
    this.loadSaved()
  },
  beforeUnmount() {
    this.stopTimer()
  },
  methods: {
    parseInput(raw) {
      return raw
        .split('\n')
        .map(line => {
          const parts = line.split(';')
          if (parts.length >= 2 && parts[0].trim() && parts[1].trim()) {
            return { term: parts[0].trim(), definition: parts.slice(1).join(';').trim() }
          }
          return null
        })
        .filter(Boolean)
    },

    startSession() {
      const cards = this.parseInput(this.rawInput)
      if (!cards.length || !this.setTitle.trim()) return

      this.allCards = [...cards]
      this.flashcards = [...cards]
      this.unmemorized = []
      this.currentIndex = 0
      this.showDefinition = false
      this.sessionStarted = true
      this.round = 1
      this.startTime = performance.now()
      this.elapsedTime = 0
      this.startTimer()
    },

    reStudy(index) {
      const set = this.savedSets[index]
      this.setTitle = set.title
      this.allCards = [...set.cards]
      this.flashcards = [...set.cards]
      this.unmemorized = []
      this.currentIndex = 0
      this.showDefinition = false
      this.sessionStarted = true
      this.round = 1
      this.startTime = performance.now()
      this.elapsedTime = 0
      this.startTimer()
    },

    startTimer() {
      this.timerInterval = setInterval(() => {
        this.elapsedTime = ((performance.now() - this.startTime) / 1000).toFixed(1)
      }, 100)
    },

    stopTimer() {
      clearInterval(this.timerInterval)
      this.timerInterval = null
    },

    handleCardClick() {
      if (!this.showDefinition) {
        this.showDefinition = true
      }
    },

    memorized(success) {
      if (!success) this.unmemorized.push(this.currentCard)
      this.nextCard()
    },

    nextCard() {
      this.currentIndex++
      this.showDefinition = false

      if (this.currentIndex >= this.flashcards.length) {
        if (this.unmemorized.length > 0) {
          this.flashcards = [...this.unmemorized]
          this.unmemorized = []
          this.currentIndex = 0
          this.round++
          this.showRoundBanner()
        } else {
          this.stopTimer()
          this.completionStats = {
            total: this.allCards.length,
            rounds: this.round,
            time: this.elapsedTime
          }
          this.completionVisible = true

          // Save the set
          const existing = this.savedSets.findIndex(s => s.title === this.setTitle)
          if (existing >= 0) {
            this.savedSets[existing].cards = [...this.allCards]
          } else {
            this.savedSets.push({ title: this.setTitle, cards: [...this.allCards] })
          }
          this.persistSaved()
          this.sessionStarted = false
        }
      }
    },

    showRoundBanner() {
      this.roundBanner = true
      setTimeout(() => { this.roundBanner = false }, 2200)
    },

    dismissCompletion() {
      this.completionVisible = false
      this.setTitle = ''
      this.rawInput = ''
    },

    quitSession() {
      this.stopTimer()
      this.sessionStarted = false
      this.setTitle = ''
      this.rawInput = ''
    },

    deleteSet(index) {
      this.savedSets.splice(index, 1)
      this.persistSaved()
    },

    toggleMini(si, ci) {
      const key = si + '-' + ci
      this.flippedMinis = { ...this.flippedMinis, [key]: !this.flippedMinis[key] }
    },

    persistSaved() {
      try { localStorage.setItem('medpredict_flashcards', JSON.stringify(this.savedSets)) } catch (e) { /* silent */ }
    },

    loadSaved() {
      try {
        const data = localStorage.getItem('medpredict_flashcards')
        if (data) this.savedSets = JSON.parse(data)
      } catch (e) { /* silent */ }
    }
  }
}
</script>

<style scoped>
/* ============================================================
   PAGE
   ============================================================ */
.flashcard-page {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-8);
}

/* ============================================================
   INPUT SECTION
   ============================================================ */
.input-card {
  max-width: 640px;
  margin: 0 auto;
  text-align: center;
}

.card-icon {
  width: 56px;
  height: 56px;
  margin: 0 auto var(--space-4);
}
.card-icon svg { width: 100%; height: 100%; }

.page-title {
  font-size: var(--text-3xl);
  margin-bottom: var(--space-2);
}

.page-subtitle {
  color: var(--text-tertiary);
  font-size: var(--text-base);
  margin-bottom: var(--space-8);
}

.form-group {
  text-align: left;
  margin-bottom: var(--space-5);
}

.field-label {
  display: flex;
  align-items: baseline;
  gap: var(--space-2);
  font-family: var(--font-heading);
  font-size: var(--text-sm);
  font-weight: 600;
  color: var(--text-secondary);
  margin-bottom: var(--space-2);
}

.field-hint {
  font-weight: 400;
  font-size: var(--text-xs);
  color: var(--text-tertiary);
}

.input-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-4);
  margin-top: var(--space-6);
}

.card-count-preview {
  font-size: var(--text-sm);
  font-weight: 600;
  color: var(--primary);
  background: var(--primary-bg);
  padding: var(--space-1) var(--space-3);
  border-radius: var(--radius-full);
}

.btn:disabled {
  opacity: 0.45;
  cursor: not-allowed;
  transform: none !important;
}

/* ============================================================
   STUDY SECTION
   ============================================================ */
.study-section {
  width: 100%;
  max-width: 580px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-5);
}

.study-top-bar {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-3);
}

.study-counter {
  font-family: var(--font-heading);
  font-size: var(--text-lg);
  font-weight: 700;
  color: var(--text-primary);
}

.study-timer {
  display: inline-flex;
  align-items: center;
  gap: var(--space-1);
  font-family: var(--font-heading);
  font-size: var(--text-sm);
  font-weight: 600;
  color: var(--text-tertiary);
  background: var(--glass-white);
  border: 1px solid var(--glass-border);
  padding: var(--space-1) var(--space-3);
  border-radius: var(--radius-full);
}

/* Progress */
.study-progress-track {
  width: 100%;
  height: 6px;
  background: rgba(61, 153, 112, 0.08);
  border-radius: var(--radius-full);
  overflow: hidden;
}

.study-progress-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--primary), var(--primary-light));
  border-radius: var(--radius-full);
  transition: width 0.4s var(--ease-out);
}

/* Study Card (3D flip on click) */
.study-card {
  width: 100%;
  min-height: 280px;
  padding: 0;
  cursor: pointer;
  perspective: 1200px;
  background: transparent;
  border: none;
  box-shadow: none;
  backdrop-filter: none;
  -webkit-backdrop-filter: none;
}
.study-card:hover {
  transform: none;
}

.study-card-content {
  position: relative;
  width: 100%;
  min-height: 280px;
  transition: transform 0.55s cubic-bezier(0.4, 0, 0.2, 1);
  transform-style: preserve-3d;
}

.study-card-content.flipped {
  transform: rotateY(180deg);
}

.study-face {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--space-3);
  padding: var(--space-8) var(--space-6);
  border-radius: var(--radius-2xl);
  backface-visibility: hidden;
  -webkit-backface-visibility: hidden;
  background: var(--glass-white-md);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid var(--glass-border);
  box-shadow: var(--glass-shadow);
}

.study-front {
  z-index: 2;
}

.study-back {
  transform: rotateY(180deg);
  background: rgba(61, 153, 112, 0.06);
  border-color: rgba(61, 153, 112, 0.2);
}

.face-label {
  font-family: var(--font-heading);
  font-size: var(--text-xs);
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: var(--text-tertiary);
  background: var(--glass-white);
  padding: var(--space-1) var(--space-3);
  border-radius: var(--radius-full);
}

.face-label--def {
  color: var(--primary);
  background: var(--primary-bg);
}

.face-text {
  font-family: var(--font-heading);
  font-size: var(--text-2xl);
  font-weight: 700;
  color: var(--text-primary);
  text-align: center;
  word-break: break-word;
  margin: 0;
}

.face-text--def {
  font-size: var(--text-lg);
  font-weight: 500;
  font-family: var(--font-body);
  line-height: 1.6;
}

.tap-hint {
  font-size: var(--text-xs);
  color: var(--text-tertiary);
  margin-top: var(--space-2);
}

/* Action buttons */
.action-row {
  display: flex;
  gap: var(--space-4);
  width: 100%;
}

.action-btn {
  flex: 1;
}

.quit-btn {
  margin-top: var(--space-2);
}

.btn-text {
  background: none;
  border: none;
  font-family: var(--font-heading);
  font-size: var(--text-sm);
  font-weight: 500;
  color: var(--text-tertiary);
  cursor: pointer;
  padding: var(--space-2) var(--space-4);
  border-radius: var(--radius-lg);
  transition: color var(--duration-fast) var(--ease-out), background var(--duration-fast) var(--ease-out);
}

.btn-text:hover {
  color: var(--danger);
  background: var(--danger-bg);
}

/* ============================================================
   ROUND BANNER
   ============================================================ */
.round-banner {
  position: fixed;
  top: 90px;
  left: 50%;
  transform: translateX(-50%);
  z-index: var(--z-overlay);
  padding: var(--space-3) var(--space-6);
  font-family: var(--font-heading);
  font-size: var(--text-sm);
  font-weight: 600;
  color: var(--primary-dark);
  border-radius: var(--radius-full);
  box-shadow: var(--glass-shadow-hover);
  white-space: nowrap;
}

.round-banner-icon {
  margin-right: var(--space-2);
}

.slide-down-enter-active { transition: all 0.35s var(--ease-spring); }
.slide-down-leave-active  { transition: all 0.25s ease-in; }
.slide-down-enter-from    { opacity: 0; transform: translateX(-50%) translateY(-20px); }
.slide-down-leave-to      { opacity: 0; transform: translateX(-50%) translateY(-12px); }

/* ============================================================
   COMPLETION OVERLAY
   ============================================================ */
.completion-overlay {
  position: fixed;
  inset: 0;
  z-index: var(--z-modal);
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(44, 62, 45, 0.25);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  padding: var(--space-6);
}

.completion-card {
  text-align: center;
  padding: var(--space-10) var(--space-8);
  max-width: 400px;
  width: 100%;
  animation: popIn 0.4s var(--ease-spring);
}

@keyframes popIn {
  0% { opacity: 0; transform: scale(0.9) translateY(10px); }
  100% { opacity: 1; transform: scale(1) translateY(0); }
}

.completion-icon {
  width: 64px;
  height: 64px;
  margin: 0 auto var(--space-5);
}
.completion-icon svg { width: 100%; height: 100%; }

.completion-title {
  font-size: var(--text-2xl);
  color: var(--primary-dark);
  margin-bottom: var(--space-4);
}

.completion-stat {
  font-size: var(--text-base);
  color: var(--text-secondary);
  margin-bottom: var(--space-2);
}

.stat-number {
  font-family: var(--font-heading);
  font-weight: 800;
  color: var(--primary);
}

.completion-time {
  display: inline-flex;
  align-items: center;
  gap: var(--space-1);
  font-size: var(--text-sm);
  color: var(--text-tertiary);
  margin-bottom: var(--space-6);
}

/* ============================================================
   SAVED SETS SECTION
   ============================================================ */
.saved-section {
  width: 100%;
  max-width: 800px;
  margin: 0 auto;
}

.section-heading {
  font-size: var(--text-2xl);
  text-align: center;
  margin-bottom: var(--space-6);
}

.sets-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-5);
}

.set-block {
  text-align: left;
}

.set-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-4);
  margin-bottom: var(--space-5);
}

.set-title {
  font-size: var(--text-lg);
  font-weight: 700;
  color: var(--text-primary);
  margin: 0;
  text-transform: capitalize;
}

.set-meta {
  font-size: var(--text-xs);
  color: var(--text-tertiary);
}

.set-actions {
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

.btn-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 34px;
  height: 34px;
  border-radius: var(--radius-lg);
  border: none;
  background: transparent;
  color: var(--text-tertiary);
  cursor: pointer;
  transition: all var(--duration-fast) var(--ease-out);
}

.btn-icon:hover {
  color: var(--danger);
  background: var(--danger-bg);
}

/* Mini cards */
.mini-cards {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: var(--space-3);
}

.mini-card {
  height: 100px;
  perspective: 800px;
  cursor: pointer;
}

.mini-inner {
  position: relative;
  width: 100%;
  height: 100%;
  transition: transform 0.5s cubic-bezier(0.4, 0, 0.2, 1);
  transform-style: preserve-3d;
}

.mini-flipped .mini-inner {
  transform: rotateY(180deg);
}

.mini-front,
.mini-back {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--space-1);
  padding: var(--space-3);
  border-radius: var(--radius-lg);
  backface-visibility: hidden;
  -webkit-backface-visibility: hidden;
  text-align: center;
  overflow: hidden;
}

.mini-front {
  background: var(--glass-white-md);
  border: 1px solid var(--glass-border);
  box-shadow: 0 2px 8px rgba(60, 80, 50, 0.06);
}

.mini-back {
  transform: rotateY(180deg);
  background: rgba(61, 153, 112, 0.06);
  border: 1px solid rgba(61, 153, 112, 0.18);
}

.mini-label {
  font-size: 0.6rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--text-tertiary);
}

.mini-back .mini-label {
  color: var(--primary);
}

.mini-text {
  font-size: var(--text-xs);
  font-weight: 600;
  color: var(--text-primary);
  line-height: 1.3;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.mini-more {
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--glass-white);
  border: 1px dashed var(--glass-border);
  border-radius: var(--radius-lg);
  font-size: var(--text-sm);
  font-weight: 600;
  color: var(--text-tertiary);
  perspective: none;
  cursor: default;
}

/* ============================================================
   SHARED
   ============================================================ */
.icon-sm {
  width: 16px;
  height: 16px;
  flex-shrink: 0;
}

/* Transitions */
.fade-enter-active { transition: all 0.3s var(--ease-out); }
.fade-leave-active { transition: all 0.2s ease-in; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

/* ============================================================
   RESPONSIVE
   ============================================================ */
@media (max-width: 640px) {
  .input-card { padding: var(--space-6); }

  .page-title { font-size: var(--text-2xl); }

  .input-footer {
    flex-direction: column;
    align-items: stretch;
  }

  .study-card-content { min-height: 240px; }

  .face-text { font-size: var(--text-xl); }

  .action-row {
    flex-direction: column;
  }

  .mini-cards {
    grid-template-columns: repeat(2, 1fr);
  }

  .set-header {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
