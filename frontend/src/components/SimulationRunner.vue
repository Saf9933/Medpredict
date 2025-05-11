<template>
  <div class="sim">
    <!-- Progress Bar -->
    <div class="sim__progress glass-md">
      <div class="sim__progress-inner">
        <span class="sim__progress-label">
          Step {{ Math.max(currentStep + 1, 1) }} of {{ caseData.steps.length }}
        </span>
        <div class="sim__progress-track">
          <div
            class="sim__progress-fill"
            :style="{ width: progressPercent + '%' }"
          ></div>
        </div>
      </div>
    </div>

    <!-- Intro Step -->
    <div v-if="currentStep === -1" class="sim__card glass-card">
      <h1 class="sim__title">{{ caseData.title }}</h1>
      <p class="sim__subtitle">{{ caseData.intro }}</p>
      <button class="btn btn-primary btn-lg" @click="nextStep">
        Begin Simulation
      </button>
    </div>

    <!-- Simulation Steps -->
    <div v-else-if="currentStep < caseData.steps.length" class="sim__card glass-card">
      <p v-if="current.prompt" class="sim__prompt">
        "{{ current.prompt }}"
      </p>
      <p v-else-if="current.text" class="sim__prompt">
        "{{ current.text }}"
      </p>

      <h2 v-if="current.question" class="sim__question">
        {{ current.question }}
      </h2>

      <!-- Options -->
      <div v-if="current.options" class="sim__options">
        <button
          v-for="(option, index) in current.options"
          :key="index"
          class="sim__option-btn"
          @click="chooseOption(option)"
        >
          {{ option.label || option }}
        </button>
      </div>

      <!-- Free Text -->
      <div v-if="current.freeText" class="sim__freetext">
        <textarea
          v-model="freeText"
          class="textarea-glass"
          placeholder="Type your clinical decision..."
        ></textarea>
      </div>

      <!-- Final Diagnosis Input -->
      <div v-if="current.type === 'input'" class="sim__freetext">
        <label class="sim__input-label">Enter your final diagnosis:</label>
        <input
          type="text"
          class="input-glass"
          v-model="freeText"
          placeholder="e.g., Inferior STEMI"
        />
      </div>

      <!-- Navigation -->
      <div class="sim__nav">
        <button
          v-if="currentStep > 0"
          class="btn btn-ghost"
          @click="previousStep"
        >
          Previous
        </button>
        <span v-else></span>
        <button class="btn btn-primary" @click="submitStep">
          Next
        </button>
      </div>
    </div>

    <!-- Summary -->
    <div v-else class="sim__card glass-card sim__summary">
      <h2 class="sim__title">Simulation Complete</h2>
      <p class="sim__subtitle">Here is a summary of your decisions:</p>

      <!-- Timeline -->
      <div class="sim__timeline glass">
        <ol class="sim__timeline-list">
          <li
            v-for="(log, i) in timeline"
            :key="i"
            class="sim__timeline-item"
          >
            <div class="sim__timeline-dot"></div>
            <div class="sim__timeline-content">
              <span class="sim__timeline-step">Step {{ i + 1 }}</span>
              <span class="sim__timeline-text">
                {{ log.choice?.label || log.input || log.choice }}
              </span>
            </div>
          </li>
        </ol>
      </div>

      <!-- GPT Feedback -->
      <div class="sim__feedback glass">
        <h3 class="sim__feedback-heading">AI Feedback</h3>
        <div v-if="loadingFeedback" class="sim__loading">
          Generating feedback<span class="sim__dot">.</span><span class="sim__dot">.</span><span class="sim__dot">.</span>
        </div>
        <div v-else-if="feedbackError" class="sim__feedback-error">
          <p>{{ feedbackError }}</p>
          <button class="btn btn-ghost" @click="submitFeedback">Retry</button>
        </div>
        <div v-else-if="feedback" v-html="formattedFeedback" class="sim__feedback-body" />
        <p v-else class="sim__feedback-empty">No feedback received.</p>
      </div>

      <button class="btn btn-primary btn-lg" @click="$emit('back')">
        Back to Cases
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed} from 'vue'

const props = defineProps({
  caseData: Object
})

const currentStep = ref(-1)
const freeText = ref('')
const timeline = ref([])
const feedback = ref('')
const loadingFeedback = ref(false)
const feedbackError = ref('')

const current = computed(() => props.caseData.steps[currentStep.value] || {})

const progressPercent = computed(() => {
  const total = props.caseData.steps.length
  if (currentStep.value < 0) return 0
  if (currentStep.value >= total) return 100
  return Math.round(((currentStep.value + 1) / total) * 100)
})

function nextStep() {
  currentStep.value++
}

function previousStep() {
  currentStep.value--
  timeline.value.pop()
}

function chooseOption(option) {
  timeline.value.push({ choice: option.label || option })
  nextStep()
  if (currentStep.value >= props.caseData.steps.length) submitFeedback()
}

function submitStep() {
  if (current.value.freeText || current.value.type === 'input') {
    if (!freeText.value.trim()) return
    timeline.value.push({ input: freeText.value })
    freeText.value = ''
  }
  nextStep()
  if (currentStep.value >= props.caseData.steps.length) submitFeedback()
}

async function submitFeedback() {
  loadingFeedback.value = true
  feedbackError.value = ''
  try {
    const res = await fetch('/api/feedback', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        timeline: timeline.value,
        prompt: props.caseData.gpt_feedback_prompt
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
    feedbackError.value = err.message || 'Failed to get AI feedback. Please try again.'
  } finally {
    loadingFeedback.value = false
  }
}

const formattedFeedback = computed(() => {
  return feedback.value
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\n/g, '<br>')
})
</script>

<style scoped>
/* ---- Layout ---- */
.sim {
  max-width: 860px;
  margin: 0 auto;
  padding: 0 0 var(--space-16);
  font-family: var(--font-body);
}

/* ---- Progress Bar ---- */
.sim__progress {
  padding: var(--space-3) var(--space-6);
  margin-bottom: var(--space-6);
}

.sim__progress-inner {
  display: flex;
  align-items: center;
  gap: var(--space-4);
}

.sim__progress-label {
  font-family: var(--font-heading);
  font-size: var(--text-sm);
  font-weight: 600;
  color: var(--text-secondary);
  white-space: nowrap;
}

.sim__progress-track {
  flex: 1;
  height: 8px;
  background: var(--glass-white);
  border-radius: var(--radius-full);
  border: 1px solid var(--glass-border);
  overflow: hidden;
}

.sim__progress-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--primary), var(--primary-light));
  border-radius: var(--radius-full);
  transition: width var(--duration-slow) var(--ease-out);
}

/* ---- Card ---- */
.sim__card {
  text-align: center;
}

.sim__title {
  font-family: var(--font-heading);
  font-size: var(--text-3xl);
  font-weight: 800;
  color: var(--text-primary);
  margin-bottom: var(--space-3);
  letter-spacing: -0.02em;
}

.sim__subtitle {
  font-size: var(--text-lg);
  color: var(--text-secondary);
  margin-bottom: var(--space-8);
  line-height: 1.6;
}

/* ---- Prompt & Question ---- */
.sim__prompt {
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

.sim__question {
  font-family: var(--font-heading);
  font-weight: 700;
  font-size: var(--text-xl);
  color: var(--text-primary);
  margin-bottom: var(--space-6);
}

/* ---- Options ---- */
.sim__options {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  margin-bottom: var(--space-6);
}

.sim__option-btn {
  width: 100%;
  padding: var(--space-3) var(--space-6);
  font-family: var(--font-heading);
  font-size: var(--text-sm);
  font-weight: 600;
  color: var(--primary);
  background: var(--glass-white);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 2px solid var(--primary);
  border-radius: var(--radius-full);
  cursor: pointer;
  text-align: left;
  transition:
    background var(--duration-normal) var(--ease-out),
    color var(--duration-normal) var(--ease-out),
    transform var(--duration-fast) var(--ease-out),
    box-shadow var(--duration-normal) var(--ease-out);
}

.sim__option-btn:hover {
  background: var(--primary-bg);
  color: var(--primary-dark);
  transform: translateY(-2px);
  box-shadow: 0 4px 16px var(--primary-glow);
}

.sim__option-btn:active {
  transform: scale(0.98);
}

/* ---- Free Text ---- */
.sim__freetext {
  margin-bottom: var(--space-6);
  text-align: left;
}

.sim__input-label {
  display: block;
  font-family: var(--font-heading);
  font-weight: 600;
  font-size: var(--text-sm);
  color: var(--text-primary);
  margin-bottom: var(--space-2);
}

/* ---- Navigation ---- */
.sim__nav {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: var(--space-6);
}

/* ---- Summary ---- */
.sim__summary {
  text-align: center;
}

/* ---- Timeline ---- */
.sim__timeline {
  text-align: left;
  padding: var(--space-6);
  margin-top: var(--space-6);
  margin-bottom: var(--space-6);
}

.sim__timeline-list {
  list-style: none;
  padding: 0;
  margin: 0;
  position: relative;
}

.sim__timeline-list::before {
  content: '';
  position: absolute;
  left: 7px;
  top: 4px;
  bottom: 4px;
  width: 3px;
  background: linear-gradient(to bottom, var(--primary), var(--primary-light));
  border-radius: var(--radius-full);
}

.sim__timeline-item {
  display: flex;
  align-items: flex-start;
  gap: var(--space-4);
  padding-bottom: var(--space-5);
  position: relative;
}

.sim__timeline-item:last-child {
  padding-bottom: 0;
}

.sim__timeline-dot {
  width: 17px;
  height: 17px;
  min-width: 17px;
  border-radius: 50%;
  background: var(--primary);
  border: 3px solid var(--glass-white-heavy);
  box-shadow: 0 0 0 2px var(--primary-glow);
  margin-top: 2px;
  position: relative;
  z-index: 1;
}

.sim__timeline-content {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}

.sim__timeline-step {
  font-family: var(--font-heading);
  font-size: var(--text-xs);
  font-weight: 700;
  color: var(--primary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.sim__timeline-text {
  font-size: var(--text-base);
  color: var(--text-primary);
  line-height: 1.5;
}

/* ---- GPT Feedback ---- */
.sim__feedback {
  text-align: left;
  padding: var(--space-6);
  margin-bottom: var(--space-8);
  border-left: 5px solid var(--primary);
}

.sim__feedback-heading {
  font-family: var(--font-heading);
  font-size: var(--text-lg);
  font-weight: 700;
  color: var(--primary);
  margin-bottom: var(--space-3);
}

.sim__feedback-body {
  font-size: var(--text-base);
  color: var(--text-primary);
  line-height: 1.7;
}

.sim__feedback-error {
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

.sim__feedback-error p {
  margin: 0;
}

.sim__feedback-empty {
  font-size: var(--text-sm);
  color: var(--text-tertiary);
}

/* ---- Loading Dots ---- */
.sim__loading {
  font-family: var(--font-heading);
  font-weight: 600;
  font-style: italic;
  color: var(--text-secondary);
}

.sim__dot {
  animation: blink 1.2s infinite;
}

.sim__dot:nth-child(2) {
  animation-delay: 0.2s;
}

.sim__dot:nth-child(3) {
  animation-delay: 0.4s;
}

@keyframes blink {
  0%, 20% { opacity: 0.2; }
  50% { opacity: 1; }
  100% { opacity: 0.2; }
}

/* ---- Responsive ---- */
@media (max-width: 640px) {
  .sim__title {
    font-size: var(--text-2xl);
  }

  .sim__progress-inner {
    flex-direction: column;
    gap: var(--space-2);
  }

  .sim__progress-label {
    align-self: flex-start;
  }
}
</style>
