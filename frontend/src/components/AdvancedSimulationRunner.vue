<template>
  <div class="adv-sim">
    <!-- Header Bar: Progress + Timer + Score -->
    <div class="adv-sim__header glass-md">
      <div class="adv-sim__header-row">
        <span class="adv-sim__step-label">
          Step {{ displayStepNumber }} of {{ totalSteps }}
        </span>
        <div class="adv-sim__badges">
          <span
            class="adv-sim__score-badge"
            :class="scoreFlashClass"
          >
            Score: {{ totalScore }} / {{ maxScore }}
          </span>
          <span
            class="adv-sim__timer-badge"
            :class="{ 'adv-sim__timer-badge--danger': timerDanger }"
          >
            {{ formattedTime }}
          </span>
        </div>
      </div>
      <div class="adv-sim__progress-track">
        <div
          class="adv-sim__progress-fill"
          :style="{ width: progressPercent + '%' }"
        ></div>
      </div>
    </div>

    <!-- Vitals Monitor Panel -->
    <transition name="fade">
      <div v-if="currentStep >= 0 && !showSummary" class="adv-sim__vitals glass">
        <div class="adv-sim__vitals-header">
          <span class="adv-sim__vitals-icon">&#9829;</span>
          <span class="adv-sim__vitals-title">Vitals Monitor</span>
        </div>
        <p class="adv-sim__vitals-text">{{ currentVitalsText }}</p>
        <transition name="slide-down">
          <div v-if="vitalsNotification" class="adv-sim__vitals-alert">
            {{ vitalsNotification }}
          </div>
        </transition>
      </div>
    </transition>

    <!-- Intro Step -->
    <div v-if="currentStep === -1" class="adv-sim__card glass-card">
      <h1 class="adv-sim__title">{{ caseData.title }}</h1>
      <p class="adv-sim__subtitle">{{ caseData.intro || caseData.chief_complaint }}</p>
      <div class="adv-sim__meta">
        <span v-if="caseData.estimated_duration" class="badge badge-ghost">
          {{ caseData.estimated_duration }}
        </span>
        <span v-if="caseData.context?.time_limit" class="badge badge-ghost">
          Time Limit: {{ caseData.context.time_limit }} min
        </span>
      </div>
      <button class="btn btn-primary btn-lg" @click="beginSimulation">
        Begin Simulation
      </button>
    </div>

    <!-- Active Steps -->
    <div v-else-if="!showSummary" class="adv-sim__card glass-card">
      <!-- Info step -->
      <div v-if="current.type === 'info'">
        <p class="adv-sim__prompt">{{ current.text }}</p>
        <div class="adv-sim__nav">
          <span></span>
          <button class="btn btn-primary" @click="advanceStep">Continue</button>
        </div>
      </div>

      <!-- Question step -->
      <div v-else-if="current.type === 'question'">
        <p v-if="current.prompt" class="adv-sim__prompt">"{{ current.prompt }}"</p>
        <h2 v-if="current.question" class="adv-sim__question">{{ current.question }}</h2>

        <!-- Response callout -->
        <transition name="fade">
          <div v-if="showResponse" class="adv-sim__callout">
            <div class="adv-sim__callout-label">Patient Response</div>
            <p class="adv-sim__callout-text">{{ lastResponseText }}</p>
            <button class="btn btn-primary" @click="continueAfterResponse">Continue</button>
          </div>
        </transition>

        <!-- Options -->
        <div v-if="!showResponse" class="adv-sim__options">
          <button
            v-for="(option, index) in current.options"
            :key="index"
            class="adv-sim__option-btn"
            @click="chooseOption(option)"
          >
            <span class="adv-sim__option-label">{{ option.label || option }}</span>
            <span v-if="option.score != null" class="adv-sim__option-score" :class="option.score > 0 ? 'positive' : option.score < 0 ? 'negative' : ''">
              {{ option.score > 0 ? '+' : '' }}{{ option.score }}
            </span>
          </button>
        </div>
      </div>

      <!-- Diagnostics step -->
      <div v-else-if="current.type === 'diagnostics'">
        <p v-if="current.prompt" class="adv-sim__prompt">"{{ current.prompt }}"</p>

        <div class="adv-sim__tests">
          <label
            v-for="(test, index) in current.tests"
            :key="index"
            class="adv-sim__test-card glass"
            :class="{
              'adv-sim__test-card--selected': selectedTests.includes(index),
              'adv-sim__test-card--revealed': revealedTests.includes(index)
            }"
          >
            <input
              type="checkbox"
              :value="index"
              v-model="selectedTests"
              :disabled="testsOrdered"
              class="adv-sim__test-checkbox"
            />
            <div class="adv-sim__test-info">
              <span class="adv-sim__test-name">{{ test.name }}</span>
              <span class="adv-sim__test-time">~{{ test.time_to_result }} min for results</span>
            </div>
            <transition name="fade">
              <div v-if="revealedTests.includes(index)" class="adv-sim__test-result">
                <p class="adv-sim__test-result-text">{{ test.result }}</p>
                <span
                  class="adv-sim__test-score-badge"
                  :class="test.score > 0 ? 'positive' : test.score < 0 ? 'negative' : 'neutral'"
                >
                  {{ test.score > 0 ? '+' : '' }}{{ test.score }} pts
                </span>
              </div>
            </transition>
          </label>
        </div>

        <div class="adv-sim__nav">
          <span></span>
          <button
            v-if="!testsOrdered"
            class="btn btn-primary"
            :disabled="selectedTests.length === 0"
            @click="orderTests"
          >
            Order Selected Tests
          </button>
          <button
            v-else-if="allTestsRevealed"
            class="btn btn-primary"
            @click="finishDiagnostics"
          >
            Continue
          </button>
          <span v-else class="adv-sim__revealing">Revealing results...</span>
        </div>
      </div>

      <!-- Input step (final diagnosis) -->
      <div v-else-if="current.type === 'input'">
        <p v-if="current.prompt" class="adv-sim__prompt">"{{ current.prompt }}"</p>
        <div class="adv-sim__freetext">
          <label class="adv-sim__input-label">Enter your final diagnosis:</label>
          <input
            type="text"
            class="input-glass"
            v-model="userDiagnosis"
            placeholder="e.g., Inferior STEMI"
            @keyup.enter="submitDiagnosis"
          />
        </div>
        <div class="adv-sim__nav">
          <span></span>
          <button class="btn btn-primary" @click="submitDiagnosis" :disabled="!userDiagnosis.trim()">
            Submit Diagnosis
          </button>
        </div>
      </div>

      <!-- Summary step in data — skip, handled by showSummary -->
    </div>

    <!-- Rich Summary Dashboard -->
    <div v-if="showSummary" class="adv-sim__card glass-card adv-sim__summary">
      <h2 class="adv-sim__title">Simulation Complete</h2>

      <!-- Score Gauge -->
      <div class="adv-sim__gauge-wrapper">
        <div class="adv-sim__gauge">
          <svg viewBox="0 0 120 120" class="adv-sim__gauge-svg">
            <circle cx="60" cy="60" r="52" class="adv-sim__gauge-bg" />
            <circle
              cx="60" cy="60" r="52"
              class="adv-sim__gauge-fill"
              :style="gaugeStyle"
            />
          </svg>
          <div class="adv-sim__gauge-center">
            <span class="adv-sim__gauge-score">{{ totalScore }}</span>
            <span class="adv-sim__gauge-max">/ {{ maxScore }}</span>
          </div>
        </div>
        <span class="adv-sim__grade" :class="'adv-sim__grade--' + gradeClass">
          {{ gradeLabel }}
        </span>
      </div>

      <!-- Time Display -->
      <div class="adv-sim__time-summary glass">
        <span>Elapsed: <strong>{{ formatSeconds(elapsedSeconds) }}</strong></span>
        <span v-if="timeLimit">Time Limit: <strong>{{ timeLimit }} min</strong></span>
        <span v-if="timerExpired" class="adv-sim__time-penalty">Time expired!</span>
      </div>

      <!-- Diagnosis Match -->
      <div v-if="userDiagnosis" class="adv-sim__diagnosis-result glass">
        <h3>Final Diagnosis</h3>
        <div class="adv-sim__diagnosis-row">
          <span class="adv-sim__diagnosis-label">Your answer:</span>
          <span class="adv-sim__diagnosis-value">{{ userDiagnosis }}</span>
        </div>
        <div class="adv-sim__diagnosis-row">
          <span class="adv-sim__diagnosis-label">Expected:</span>
          <span class="adv-sim__diagnosis-value">{{ expectedAnswer }}</span>
        </div>
        <span
          class="adv-sim__diagnosis-match"
          :class="diagnosisMatch ? 'match' : 'mismatch'"
        >
          {{ diagnosisMatch ? 'Match' : 'Mismatch' }}
        </span>
      </div>

      <!-- Correct Path Comparison -->
      <div v-if="correctPath.length" class="adv-sim__path-compare glass">
        <h3>Decision Path Comparison</h3>
        <div class="adv-sim__path-columns">
          <div class="adv-sim__path-col">
            <h4>Your Decisions</h4>
            <ol class="adv-sim__path-list">
              <li
                v-for="(entry, i) in timeline"
                :key="'student-' + i"
                class="adv-sim__path-item"
              >
                <span class="adv-sim__path-text">{{ entry.label }}</span>
                <span
                  v-if="entry.score != null"
                  class="adv-sim__path-score"
                  :class="entry.score > 0 ? 'positive' : entry.score < 0 ? 'negative' : 'neutral'"
                >
                  {{ entry.score > 0 ? '+' : '' }}{{ entry.score }}
                </span>
              </li>
            </ol>
          </div>
          <div class="adv-sim__path-col">
            <h4>Ideal Path</h4>
            <ol class="adv-sim__path-list">
              <li
                v-for="(step, i) in correctPath"
                :key="'correct-' + i"
                class="adv-sim__path-item"
              >
                <span class="adv-sim__path-text">{{ step }}</span>
              </li>
            </ol>
          </div>
        </div>
      </div>

      <!-- Step Timeline -->
      <div class="adv-sim__timeline glass">
        <h3>Your Timeline</h3>
        <ol class="adv-sim__timeline-list">
          <li
            v-for="(log, i) in timeline"
            :key="i"
            class="adv-sim__timeline-item"
          >
            <div
              class="adv-sim__timeline-dot"
              :class="log.score > 0 ? 'positive' : log.score < 0 ? 'negative' : 'neutral'"
            ></div>
            <div class="adv-sim__timeline-content">
              <span class="adv-sim__timeline-step">Step {{ i + 1 }}</span>
              <span class="adv-sim__timeline-text">{{ log.label }}</span>
              <span
                v-if="log.score != null"
                class="adv-sim__timeline-score"
                :class="log.score > 0 ? 'positive' : log.score < 0 ? 'negative' : 'neutral'"
              >
                {{ log.score > 0 ? '+' : '' }}{{ log.score }} pts
              </span>
            </div>
          </li>
        </ol>
      </div>

      <!-- AI Feedback -->
      <div class="adv-sim__feedback glass">
        <h3 class="adv-sim__feedback-heading">AI Feedback</h3>
        <div v-if="loadingFeedback" class="adv-sim__loading">
          Generating feedback<span class="dot">.</span><span class="dot">.</span><span class="dot">.</span>
        </div>
        <div v-else-if="feedbackError" class="adv-sim__feedback-error">
          <p>{{ feedbackError }}</p>
          <button class="btn btn-ghost" @click="fetchFeedback">Retry</button>
        </div>
        <div v-else-if="feedback" v-html="formattedFeedback" class="adv-sim__feedback-body" />
        <p v-else class="adv-sim__feedback-empty">No feedback received.</p>
      </div>

      <button class="btn btn-primary btn-lg" @click="$emit('back')">
        Back to Cases
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onUnmounted } from 'vue'

const props = defineProps({
  caseData: Object
})

defineEmits(['back'])

// ── Core state ──
const currentStep = ref(-1)
const totalScore = ref(0)
const elapsedSeconds = ref(0)
const timerExpired = ref(false)
let timerInterval = null

const timeline = ref([])
const vitalsHistory = ref([])
const currentVitalsText = ref('Stable — no vitals recorded yet')
const vitalsNotification = ref('')
let vitalsNotifTimeout = null

// Question step
const showResponse = ref(false)
const lastResponseText = ref('')

// Diagnostics
const selectedTests = ref([])
const revealedTests = ref([])
const testsOrdered = ref(false)
const allTestsRevealed = ref(false)

// Final input
const userDiagnosis = ref('')

// Summary
const showSummary = ref(false)
const feedback = ref('')
const loadingFeedback = ref(false)
const feedbackError = ref('')

// Score flash
const scoreFlashClass = ref('')
let scoreFlashTimeout = null

// ── Derived data from caseData ──
const timeLimit = computed(() => props.caseData.context?.time_limit || 0)
const vitalsDrift = computed(() => props.caseData.context?.vitals_drift || [])

const actionableSteps = computed(() =>
  props.caseData.steps.filter(s => s.type !== 'summary')
)

const totalSteps = computed(() => actionableSteps.value.length)

const current = computed(() => actionableSteps.value[currentStep.value] || {})

const displayStepNumber = computed(() =>
  Math.max(currentStep.value + 1, 1)
)

const progressPercent = computed(() => {
  if (currentStep.value < 0) return 0
  if (showSummary.value) return 100
  return Math.round(((currentStep.value + 1) / totalSteps.value) * 100)
})

const timerDanger = computed(() => {
  if (!timeLimit.value) return false
  const remaining = timeLimit.value * 60 - elapsedSeconds.value
  return remaining <= 120 && remaining > 0
})

const formattedTime = computed(() => {
  if (!timeLimit.value) return formatSeconds(elapsedSeconds.value)
  const remaining = Math.max(0, timeLimit.value * 60 - elapsedSeconds.value)
  return formatSeconds(remaining)
})

// Summary computations
const summaryStep = computed(() =>
  props.caseData.steps.find(s => s.type === 'summary') || {}
)

const maxScore = computed(() => summaryStep.value.scoring?.max_score || 15)

const correctPath = computed(() => summaryStep.value.correct_path || [])

const expectedAnswer = computed(() => {
  const inputStep = props.caseData.steps.find(s => s.type === 'input')
  return inputStep?.expected_answer || ''
})

const diagnosisMatch = computed(() => {
  if (!userDiagnosis.value || !expectedAnswer.value) return false
  return expectedAnswer.value.toLowerCase().includes(userDiagnosis.value.toLowerCase()) ||
    userDiagnosis.value.toLowerCase().includes(expectedAnswer.value.toLowerCase())
})

const gradeLabel = computed(() => {
  const thresholds = summaryStep.value.scoring?.thresholds || {}
  if (totalScore.value >= (thresholds.excellent || 13)) return 'Excellent'
  if (totalScore.value >= (thresholds.good || 10)) return 'Good'
  if (totalScore.value >= (thresholds.needs_improvement || 7)) return 'Needs Improvement'
  return 'Needs Improvement'
})

const gradeClass = computed(() => {
  if (gradeLabel.value === 'Excellent') return 'excellent'
  if (gradeLabel.value === 'Good') return 'good'
  return 'needs-improvement'
})

const gaugeStyle = computed(() => {
  const circumference = 2 * Math.PI * 52
  const pct = Math.min(totalScore.value / maxScore.value, 1)
  const offset = circumference * (1 - pct)
  return {
    strokeDasharray: circumference + 'px',
    strokeDashoffset: offset + 'px'
  }
})

const formattedFeedback = computed(() =>
  feedback.value
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\n/g, '<br>')
)

// ── Timer ──
function startTimer() {
  elapsedSeconds.value = 0
  timerInterval = setInterval(() => {
    elapsedSeconds.value++
    checkVitalsDrift()
    checkTimerExpiry()
  }, 1000)
}

function stopTimer() {
  if (timerInterval) {
    clearInterval(timerInterval)
    timerInterval = null
  }
}

function checkTimerExpiry() {
  if (!timeLimit.value) return
  if (elapsedSeconds.value >= timeLimit.value * 60 && !timerExpired.value) {
    timerExpired.value = true
    stopTimer()
    goToSummary()
  }
}

// ── Vitals Drift ──
const triggeredDriftMinutes = ref(new Set())

function checkVitalsDrift() {
  const elapsedMin = Math.floor(elapsedSeconds.value / 60)
  for (const drift of vitalsDrift.value) {
    if (elapsedMin >= drift.minutes && !triggeredDriftMinutes.value.has(drift.minutes)) {
      triggeredDriftMinutes.value.add(drift.minutes)
      currentVitalsText.value = drift.effect
      vitalsHistory.value.push({ minutes: drift.minutes, effect: drift.effect })
      showVitalsNotification('Patient deteriorating... ' + drift.effect)
    }
  }
}

function showVitalsNotification(msg) {
  vitalsNotification.value = msg
  if (vitalsNotifTimeout) clearTimeout(vitalsNotifTimeout)
  vitalsNotifTimeout = setTimeout(() => {
    vitalsNotification.value = ''
  }, 5000)
}

// ── Navigation ──
function beginSimulation() {
  currentStep.value = 0
  startTimer()
}

function advanceStep() {
  const nextIndex = currentStep.value + 1
  if (nextIndex >= actionableSteps.value.length) {
    goToSummary()
  } else if (actionableSteps.value[nextIndex].type === 'summary') {
    goToSummary()
  } else {
    currentStep.value = nextIndex
  }
  resetStepState()
}

function resetStepState() {
  showResponse.value = false
  lastResponseText.value = ''
  selectedTests.value = []
  revealedTests.value = []
  testsOrdered.value = false
  allTestsRevealed.value = false
}

// ── Question Options ──
function chooseOption(option) {
  const score = option.score ?? 0
  addScore(score)
  timeline.value.push({
    stepId: current.value.id,
    label: option.label || option,
    score,
    type: 'choice'
  })

  if (option.response) {
    lastResponseText.value = option.response
    showResponse.value = true
  } else {
    advanceStep()
  }
}

function continueAfterResponse() {
  showResponse.value = false
  advanceStep()
}

// ── Diagnostics ──
function orderTests() {
  testsOrdered.value = true
  const tests = current.value.tests
  let delay = 0

  // Add time cost for each selected test
  let totalTimeCost = 0
  for (const idx of selectedTests.value) {
    totalTimeCost += tests[idx].time_to_result || 0
  }
  // Add time cost to elapsed (simulated minutes → seconds at 10x speed)
  elapsedSeconds.value += totalTimeCost * 6

  for (const idx of selectedTests.value) {
    const test = tests[idx]
    delay += 800
    setTimeout(() => {
      revealedTests.value.push(idx)
      addScore(test.score ?? 0)
      timeline.value.push({
        stepId: current.value.id,
        label: test.name + ': ' + test.result,
        score: test.score ?? 0,
        type: 'test'
      })
      if (revealedTests.value.length === selectedTests.value.length) {
        allTestsRevealed.value = true
      }
    }, delay)
  }
}

function finishDiagnostics() {
  advanceStep()
}

// ── Final Diagnosis ──
function submitDiagnosis() {
  if (!userDiagnosis.value.trim()) return
  timeline.value.push({
    stepId: current.value.id,
    label: 'Diagnosis: ' + userDiagnosis.value,
    score: null,
    type: 'diagnosis'
  })
  goToSummary()
}

// ── Score ──
function addScore(points) {
  totalScore.value += points
  triggerScoreFlash(points)
}

function triggerScoreFlash(points) {
  if (scoreFlashTimeout) clearTimeout(scoreFlashTimeout)
  scoreFlashClass.value = points > 0 ? 'flash-green' : points < 0 ? 'flash-red' : ''
  scoreFlashTimeout = setTimeout(() => {
    scoreFlashClass.value = ''
  }, 600)
}

// ── Summary ──
function goToSummary() {
  stopTimer()
  showSummary.value = true
  fetchFeedback()
  persistRun()
}

async function fetchFeedback() {
  loadingFeedback.value = true
  feedbackError.value = ''
  try {
    const timelineText = timeline.value
      .map((t, i) => `Step ${i + 1}: ${t.label} (${t.score != null ? t.score + ' pts' : 'N/A'})`)
      .join('\n')

    const prompt = props.caseData.gpt_feedback_prompt || 'Provide feedback on the student simulation.'
    const enhancedPrompt = `${prompt}\n\nScore: ${totalScore.value}/${maxScore.value} (${gradeLabel.value})\nElapsed: ${formatSeconds(elapsedSeconds.value)}\n${timerExpired.value ? 'NOTE: Timer expired before completion.\n' : ''}\nTimeline:\n${timelineText}`

    const res = await fetch('/api/feedback', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        timeline: timeline.value,
        prompt: enhancedPrompt
      })
    })
    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      throw new Error(err.error || `Server error (${res.status})`)
    }
    const data = await res.json()
    feedback.value = data.feedback || ''
  } catch (err) {
    feedback.value = ''
    feedbackError.value = err.message || 'Failed to get AI feedback.'
  } finally {
    loadingFeedback.value = false
  }
}

async function persistRun() {
  try {
    await fetch('/api/simulation-runs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        caseTitle: props.caseData.title,
        timeline: timeline.value,
        score: totalScore.value,
        maxScore: maxScore.value,
        grade: gradeLabel.value,
        elapsedSeconds: elapsedSeconds.value,
        timerExpired: timerExpired.value,
        diagnosis: userDiagnosis.value,
        diagnosisMatch: diagnosisMatch.value
      })
    })
  } catch (err) {
    console.error('Failed to persist simulation run:', err)
  }
}

// ── Helpers ──
function formatSeconds(s) {
  const m = Math.floor(s / 60)
  const sec = s % 60
  return `${m}:${String(sec).padStart(2, '0')}`
}

onUnmounted(() => {
  stopTimer()
  if (vitalsNotifTimeout) clearTimeout(vitalsNotifTimeout)
  if (scoreFlashTimeout) clearTimeout(scoreFlashTimeout)
})
</script>

<style scoped>
/* ── Layout ── */
.adv-sim {
  max-width: 900px;
  margin: 0 auto;
  padding: 0 0 var(--space-16);
  font-family: var(--font-body);
}

/* ── Header ── */
.adv-sim__header {
  padding: var(--space-3) var(--space-6);
  margin-bottom: var(--space-4);
}

.adv-sim__header-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-4);
  margin-bottom: var(--space-2);
}

.adv-sim__step-label {
  font-family: var(--font-heading);
  font-size: var(--text-sm);
  font-weight: 600;
  color: var(--text-secondary);
}

.adv-sim__badges {
  display: flex;
  gap: var(--space-3);
  align-items: center;
}

.adv-sim__score-badge {
  font-family: var(--font-heading);
  font-size: var(--text-sm);
  font-weight: 700;
  padding: var(--space-1) var(--space-3);
  border-radius: var(--radius-full);
  background: var(--primary-bg);
  color: var(--primary);
  border: 1px solid var(--primary);
  transition: background 0.3s, color 0.3s, transform 0.15s;
}

.adv-sim__score-badge.flash-green {
  background: #22c55e;
  color: #fff;
  transform: scale(1.12);
}

.adv-sim__score-badge.flash-red {
  background: #ef4444;
  color: #fff;
  transform: scale(1.12);
}

.adv-sim__timer-badge {
  font-family: var(--font-heading);
  font-size: var(--text-sm);
  font-weight: 700;
  padding: var(--space-1) var(--space-3);
  border-radius: var(--radius-full);
  background: var(--glass-white);
  color: var(--text-primary);
  border: 1px solid var(--glass-border);
  min-width: 60px;
  text-align: center;
}

.adv-sim__timer-badge--danger {
  background: rgba(239, 68, 68, 0.12);
  color: #ef4444;
  border-color: #ef4444;
  animation: pulse-danger 1s infinite;
}

@keyframes pulse-danger {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.6; }
}

.adv-sim__progress-track {
  height: 6px;
  background: var(--glass-white);
  border-radius: var(--radius-full);
  border: 1px solid var(--glass-border);
  overflow: hidden;
}

.adv-sim__progress-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--primary), var(--primary-light));
  border-radius: var(--radius-full);
  transition: width 0.4s ease-out;
}

/* ── Vitals Monitor ── */
.adv-sim__vitals {
  padding: var(--space-4) var(--space-6);
  margin-bottom: var(--space-4);
  border-left: 4px solid #ef4444;
}

.adv-sim__vitals-header {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  margin-bottom: var(--space-2);
}

.adv-sim__vitals-icon {
  color: #ef4444;
  font-size: var(--text-lg);
}

.adv-sim__vitals-title {
  font-family: var(--font-heading);
  font-weight: 700;
  font-size: var(--text-sm);
  color: #ef4444;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.adv-sim__vitals-text {
  font-size: var(--text-base);
  color: var(--text-primary);
  margin: 0;
}

.adv-sim__vitals-alert {
  margin-top: var(--space-3);
  padding: var(--space-2) var(--space-4);
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.3);
  border-radius: var(--radius-lg);
  color: #dc2626;
  font-weight: 600;
  font-size: var(--text-sm);
  animation: alert-in 0.4s ease-out;
}

@keyframes alert-in {
  from { opacity: 0; transform: translateY(-8px); }
  to { opacity: 1; transform: translateY(0); }
}

/* ── Card ── */
.adv-sim__card {
  text-align: center;
}

.adv-sim__title {
  font-family: var(--font-heading);
  font-size: var(--text-3xl);
  font-weight: 800;
  color: var(--text-primary);
  margin-bottom: var(--space-3);
  letter-spacing: -0.02em;
}

.adv-sim__subtitle {
  font-size: var(--text-lg);
  color: var(--text-secondary);
  margin-bottom: var(--space-6);
  line-height: 1.6;
}

.adv-sim__meta {
  display: flex;
  gap: var(--space-3);
  justify-content: center;
  margin-bottom: var(--space-8);
}

/* ── Prompt & Question ── */
.adv-sim__prompt {
  font-style: italic;
  font-size: var(--text-base);
  color: var(--text-primary);
  text-align: left;
  margin-bottom: var(--space-5);
  padding: var(--space-4);
  background: var(--primary-bg);
  border-radius: var(--radius-lg);
  border-left: 4px solid var(--primary);
  line-height: 1.7;
}

.adv-sim__question {
  font-family: var(--font-heading);
  font-weight: 700;
  font-size: var(--text-xl);
  color: var(--text-primary);
  margin-bottom: var(--space-6);
}

/* ── Response Callout ── */
.adv-sim__callout {
  text-align: left;
  padding: var(--space-5);
  margin-bottom: var(--space-6);
  background: rgba(34, 197, 94, 0.06);
  border: 1px solid rgba(34, 197, 94, 0.25);
  border-left: 4px solid #22c55e;
  border-radius: var(--radius-lg);
}

.adv-sim__callout-label {
  font-family: var(--font-heading);
  font-size: var(--text-xs);
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: #16a34a;
  margin-bottom: var(--space-2);
}

.adv-sim__callout-text {
  font-size: var(--text-base);
  color: var(--text-primary);
  margin: 0 0 var(--space-4);
  line-height: 1.7;
}

/* ── Options ── */
.adv-sim__options {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  margin-bottom: var(--space-6);
}

.adv-sim__option-btn {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: var(--space-3) var(--space-6);
  font-family: var(--font-heading);
  font-size: var(--text-sm);
  font-weight: 600;
  color: var(--primary);
  background: var(--glass-white);
  backdrop-filter: blur(12px);
  border: 2px solid var(--primary);
  border-radius: var(--radius-full);
  cursor: pointer;
  text-align: left;
  transition:
    background 0.2s ease,
    color 0.2s ease,
    transform 0.15s ease,
    box-shadow 0.2s ease;
}

.adv-sim__option-btn:hover {
  background: var(--primary-bg);
  color: var(--primary-dark);
  transform: translateY(-2px);
  box-shadow: 0 4px 16px var(--primary-glow);
}

.adv-sim__option-btn:active {
  transform: scale(0.98);
}

.adv-sim__option-label {
  flex: 1;
}

.adv-sim__option-score {
  font-size: var(--text-xs);
  padding: 2px 8px;
  border-radius: var(--radius-full);
  font-weight: 700;
  display: none; /* Hidden during play, scores revealed in summary */
}

/* ── Diagnostics ── */
.adv-sim__tests {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  margin-bottom: var(--space-6);
  text-align: left;
}

.adv-sim__test-card {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-start;
  gap: var(--space-3);
  padding: var(--space-4);
  cursor: pointer;
  border: 2px solid transparent;
  transition: border-color 0.2s, background 0.2s;
}

.adv-sim__test-card--selected {
  border-color: var(--primary);
  background: var(--primary-bg);
}

.adv-sim__test-card--revealed {
  cursor: default;
}

.adv-sim__test-checkbox {
  margin-top: 3px;
  accent-color: var(--primary);
}

.adv-sim__test-info {
  display: flex;
  flex-direction: column;
  flex: 1;
}

.adv-sim__test-name {
  font-family: var(--font-heading);
  font-weight: 700;
  font-size: var(--text-base);
  color: var(--text-primary);
}

.adv-sim__test-time {
  font-size: var(--text-xs);
  color: var(--text-tertiary);
}

.adv-sim__test-result {
  width: 100%;
  padding: var(--space-3) var(--space-4);
  margin-top: var(--space-2);
  background: rgba(34, 197, 94, 0.06);
  border: 1px solid rgba(34, 197, 94, 0.2);
  border-radius: var(--radius-lg);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-3);
}

.adv-sim__test-result-text {
  margin: 0;
  font-size: var(--text-sm);
  color: var(--text-primary);
}

.adv-sim__test-score-badge {
  font-size: var(--text-xs);
  font-weight: 700;
  padding: 2px 10px;
  border-radius: var(--radius-full);
  white-space: nowrap;
}

.adv-sim__test-score-badge.positive {
  background: rgba(34, 197, 94, 0.15);
  color: #16a34a;
}

.adv-sim__test-score-badge.negative {
  background: rgba(239, 68, 68, 0.12);
  color: #dc2626;
}

.adv-sim__test-score-badge.neutral {
  background: var(--glass-white);
  color: var(--text-tertiary);
}

.adv-sim__revealing {
  font-style: italic;
  color: var(--text-secondary);
  font-size: var(--text-sm);
}

/* ── Free Text / Input ── */
.adv-sim__freetext {
  margin-bottom: var(--space-6);
  text-align: left;
}

.adv-sim__input-label {
  display: block;
  font-family: var(--font-heading);
  font-weight: 600;
  font-size: var(--text-sm);
  color: var(--text-primary);
  margin-bottom: var(--space-2);
}

/* ── Navigation ── */
.adv-sim__nav {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: var(--space-6);
}

/* ── Summary ── */
.adv-sim__summary {
  text-align: center;
}

/* Score Gauge */
.adv-sim__gauge-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: var(--space-6) 0 var(--space-8);
}

.adv-sim__gauge {
  position: relative;
  width: 140px;
  height: 140px;
}

.adv-sim__gauge-svg {
  width: 100%;
  height: 100%;
  transform: rotate(-90deg);
}

.adv-sim__gauge-bg {
  fill: none;
  stroke: var(--glass-border);
  stroke-width: 8;
}

.adv-sim__gauge-fill {
  fill: none;
  stroke: var(--primary);
  stroke-width: 8;
  stroke-linecap: round;
  transition: stroke-dashoffset 1s ease-out;
}

.adv-sim__gauge-center {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
}

.adv-sim__gauge-score {
  display: block;
  font-family: var(--font-heading);
  font-size: var(--text-3xl);
  font-weight: 800;
  color: var(--text-primary);
  line-height: 1;
}

.adv-sim__gauge-max {
  font-size: var(--text-sm);
  color: var(--text-tertiary);
}

.adv-sim__grade {
  margin-top: var(--space-3);
  font-family: var(--font-heading);
  font-size: var(--text-lg);
  font-weight: 700;
  padding: var(--space-1) var(--space-4);
  border-radius: var(--radius-full);
}

.adv-sim__grade--excellent {
  background: rgba(34, 197, 94, 0.15);
  color: #16a34a;
}

.adv-sim__grade--good {
  background: rgba(59, 130, 246, 0.12);
  color: #2563eb;
}

.adv-sim__grade--needs-improvement {
  background: rgba(245, 158, 11, 0.12);
  color: #d97706;
}

/* Time Summary */
.adv-sim__time-summary {
  display: flex;
  gap: var(--space-6);
  justify-content: center;
  align-items: center;
  padding: var(--space-3) var(--space-6);
  margin-bottom: var(--space-6);
  font-size: var(--text-sm);
  color: var(--text-secondary);
}

.adv-sim__time-penalty {
  color: #ef4444;
  font-weight: 700;
}

/* Diagnosis Result */
.adv-sim__diagnosis-result {
  text-align: left;
  padding: var(--space-5);
  margin-bottom: var(--space-6);
}

.adv-sim__diagnosis-result h3 {
  font-family: var(--font-heading);
  font-weight: 700;
  font-size: var(--text-lg);
  color: var(--text-primary);
  margin: 0 0 var(--space-3);
}

.adv-sim__diagnosis-row {
  display: flex;
  gap: var(--space-3);
  margin-bottom: var(--space-2);
  font-size: var(--text-base);
}

.adv-sim__diagnosis-label {
  color: var(--text-secondary);
  min-width: 110px;
}

.adv-sim__diagnosis-value {
  color: var(--text-primary);
  font-weight: 600;
}

.adv-sim__diagnosis-match {
  display: inline-block;
  margin-top: var(--space-3);
  padding: var(--space-1) var(--space-4);
  border-radius: var(--radius-full);
  font-family: var(--font-heading);
  font-weight: 700;
  font-size: var(--text-sm);
}

.adv-sim__diagnosis-match.match {
  background: rgba(34, 197, 94, 0.15);
  color: #16a34a;
}

.adv-sim__diagnosis-match.mismatch {
  background: rgba(239, 68, 68, 0.12);
  color: #dc2626;
}

/* Path Comparison */
.adv-sim__path-compare {
  text-align: left;
  padding: var(--space-5);
  margin-bottom: var(--space-6);
}

.adv-sim__path-compare h3 {
  font-family: var(--font-heading);
  font-weight: 700;
  font-size: var(--text-lg);
  color: var(--text-primary);
  margin: 0 0 var(--space-4);
}

.adv-sim__path-columns {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-6);
}

.adv-sim__path-col h4 {
  font-family: var(--font-heading);
  font-size: var(--text-sm);
  font-weight: 700;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.04em;
  margin: 0 0 var(--space-3);
}

.adv-sim__path-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.adv-sim__path-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-2);
  padding: var(--space-2) 0;
  border-bottom: 1px solid var(--glass-border);
  font-size: var(--text-sm);
}

.adv-sim__path-item:last-child {
  border-bottom: none;
}

.adv-sim__path-text {
  color: var(--text-primary);
}

.adv-sim__path-score {
  font-size: var(--text-xs);
  font-weight: 700;
  padding: 1px 8px;
  border-radius: var(--radius-full);
}

.adv-sim__path-score.positive { background: rgba(34, 197, 94, 0.15); color: #16a34a; }
.adv-sim__path-score.negative { background: rgba(239, 68, 68, 0.12); color: #dc2626; }
.adv-sim__path-score.neutral  { background: var(--glass-white); color: var(--text-tertiary); }

/* Timeline */
.adv-sim__timeline {
  text-align: left;
  padding: var(--space-6);
  margin-bottom: var(--space-6);
}

.adv-sim__timeline h3 {
  font-family: var(--font-heading);
  font-weight: 700;
  font-size: var(--text-lg);
  color: var(--text-primary);
  margin: 0 0 var(--space-4);
}

.adv-sim__timeline-list {
  list-style: none;
  padding: 0;
  margin: 0;
  position: relative;
}

.adv-sim__timeline-list::before {
  content: '';
  position: absolute;
  left: 7px;
  top: 4px;
  bottom: 4px;
  width: 3px;
  background: linear-gradient(to bottom, var(--primary), var(--primary-light));
  border-radius: var(--radius-full);
}

.adv-sim__timeline-item {
  display: flex;
  align-items: flex-start;
  gap: var(--space-4);
  padding-bottom: var(--space-5);
  position: relative;
}

.adv-sim__timeline-item:last-child { padding-bottom: 0; }

.adv-sim__timeline-dot {
  width: 17px;
  height: 17px;
  min-width: 17px;
  border-radius: 50%;
  border: 3px solid var(--glass-white-heavy);
  margin-top: 2px;
  position: relative;
  z-index: 1;
}

.adv-sim__timeline-dot.positive { background: #22c55e; box-shadow: 0 0 0 2px rgba(34,197,94,0.3); }
.adv-sim__timeline-dot.negative { background: #ef4444; box-shadow: 0 0 0 2px rgba(239,68,68,0.3); }
.adv-sim__timeline-dot.neutral  { background: var(--primary); box-shadow: 0 0 0 2px var(--primary-glow); }

.adv-sim__timeline-content {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}

.adv-sim__timeline-step {
  font-family: var(--font-heading);
  font-size: var(--text-xs);
  font-weight: 700;
  color: var(--primary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.adv-sim__timeline-text {
  font-size: var(--text-base);
  color: var(--text-primary);
  line-height: 1.5;
}

.adv-sim__timeline-score {
  font-size: var(--text-xs);
  font-weight: 700;
}

.adv-sim__timeline-score.positive { color: #16a34a; }
.adv-sim__timeline-score.negative { color: #dc2626; }
.adv-sim__timeline-score.neutral  { color: var(--text-tertiary); }

/* Feedback */
.adv-sim__feedback {
  text-align: left;
  padding: var(--space-6);
  margin-bottom: var(--space-8);
  border-left: 5px solid var(--primary);
}

.adv-sim__feedback-heading {
  font-family: var(--font-heading);
  font-size: var(--text-lg);
  font-weight: 700;
  color: var(--primary);
  margin-bottom: var(--space-3);
}

.adv-sim__feedback-body {
  font-size: var(--text-base);
  color: var(--text-primary);
  line-height: 1.7;
}

.adv-sim__feedback-error {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-4);
  padding: var(--space-3) var(--space-4);
  background: rgba(192, 80, 58, 0.08);
  border: 1px solid rgba(192, 80, 58, 0.2);
  border-radius: var(--radius-lg);
  color: var(--danger, #c0503a);
  font-size: var(--text-sm);
}

.adv-sim__feedback-error p { margin: 0; }

.adv-sim__feedback-empty {
  font-size: var(--text-sm);
  color: var(--text-tertiary);
}

/* Loading dots */
.adv-sim__loading {
  font-family: var(--font-heading);
  font-weight: 600;
  font-style: italic;
  color: var(--text-secondary);
}

.dot { animation: blink 1.2s infinite; }
.dot:nth-child(2) { animation-delay: 0.2s; }
.dot:nth-child(3) { animation-delay: 0.4s; }

@keyframes blink {
  0%, 20% { opacity: 0.2; }
  50% { opacity: 1; }
  100% { opacity: 0.2; }
}

/* ── Transitions ── */
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}

.slide-down-enter-active {
  transition: all 0.4s ease-out;
}
.slide-down-enter-from {
  opacity: 0;
  transform: translateY(-8px);
}
.slide-down-leave-active {
  transition: all 0.3s ease-in;
}
.slide-down-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}

/* ── Responsive ── */
@media (max-width: 640px) {
  .adv-sim__title {
    font-size: var(--text-2xl);
  }

  .adv-sim__header-row {
    flex-direction: column;
    gap: var(--space-2);
    align-items: flex-start;
  }

  .adv-sim__path-columns {
    grid-template-columns: 1fr;
    gap: var(--space-4);
  }

  .adv-sim__time-summary {
    flex-direction: column;
    gap: var(--space-2);
  }
}
</style>
