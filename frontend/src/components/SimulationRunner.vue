<template>
  <div class="simulation-wrapper">
    <!--  Progress -->
    <div class="progress-bar">
      Step {{ currentStep + 1 }} / {{ caseData.steps.length }}
    </div>

    <!--  Intro Step -->
    <div v-if="currentStep === -1" class="card">
      <h1 class="title">{{ caseData.title }}</h1>
      <p class="subtitle">{{ caseData.intro }}</p>
      <button class="main-button" @click="nextStep">Begin Simulation</button>
    </div>

    <!--  Simulation Steps -->
    <div v-else-if="currentStep < caseData.steps.length" class="card">
      <p v-if="current.prompt" class="prompt">“{{ current.prompt }}”</p>
      <p v-else-if="current.text" class="prompt">“{{ current.text }}”</p>

      <h2 v-if="current.question" class="question">{{ current.question }}</h2>

      <!--  Options -->
      <div v-if="current.options" class="options">
        <button
          v-for="(option, index) in current.options"
          :key="index"
          @click="chooseOption(option)"
          class="option-button"
        >
          {{ option.label || option }}
        </button>
      </div>

      <!-- Free Text -->
      <div v-if="current.freeText" class="free-text">
        <textarea
          v-model="freeText"
          placeholder="Type your clinical decision..."
        ></textarea>
      </div>

      <!-- Final Diagnosis Input -->
      <div v-if="current.type === 'input'" class="free-text">
        <label class="block mb-2 font-semibold">Enter your final diagnosis:</label>
        <input
          type="text"
          class="diagnosis-input"
          v-model="freeText"
          placeholder="e.g., Inferior STEMI"
        />
      </div>

      <!-- 🔀 Navigation -->
      <div class="nav-buttons">
        <button v-if="currentStep > 0" class="nav-button back" @click="previousStep">⬅ Previous</button>
        <button class="nav-button next" @click="submitStep">Next ➡</button>
      </div>
    </div>

    <!-- ✅ Summary -->
    <div v-else class="card summary">
      <h2 class="title"> Simulation Complete</h2>
      <p class="subtitle">Here’s a summary of your decisions:</p>
      <ul class="timeline">
        <li v-for="(log, i) in timeline" :key="i">
          <strong>Step {{ i + 1 }}:</strong> {{ log.choice?.label || log.input || log.choice }}
        </li>
      </ul>

      <!-- 🧠 GPT Feedback -->
      <div class="gpt-feedback">
        <h3> AI Feedback</h3>
        <div v-if="loadingFeedback" class="loading-dots">Generating feedback<span class="dot">.</span><span class="dot">.</span><span class="dot">.</span></div>
        <p v-else-if="feedback" v-html="formattedFeedback" class="mt-2" />
        <p v-else class="text-gray-500">⚠️ No feedback received.</p>
      </div>

      <button class="main-button mt-6" @click="$emit('back')">⬅ Back to Case Selection</button>
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

const current = computed(() => props.caseData.steps[currentStep.value] || {})

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
  try {
    const res = await fetch('/api/feedback', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        timeline: timeline.value,
        prompt: props.caseData.gpt_feedback_prompt
      })
    })
    const data = await res.json()
    feedback.value = data.feedback || ''
  } catch (err) {
    feedback.value = ''
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
.simulation-wrapper {
  max-width: 840px;
  margin: 40px auto;
  padding: 0 24px;
  font-family: 'Segoe UI', sans-serif;
}

.progress-bar {
  text-align: center;
  font-size: 15px;
  color: #6b7280;
  margin-bottom: 12px;
}

.card {
  background: #fff;
  padding: 32px;
  border-radius: 24px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.05);
  text-align: center;
}

.title {
  font-size: 26px;
  font-weight: bold;
  margin-bottom: 12px;
}

.subtitle {
  font-size: 16px;
  color: #555;
  margin-bottom: 28px;
}

.prompt {
  font-style: italic;
  font-size: 16px;
  color: #333;
  text-align: left;
  margin-bottom: 20px;
}

.question {
  font-weight: bold;
  font-size: 18px;
  margin-bottom: 20px;
}

.options {
  display: flex;
  flex-direction: column;
  gap: 14px;
  margin-bottom: 28px;
}

.option-button {
  border: 2px solid #8b1c13;
  border-radius: 50px;
  padding: 12px 24px;
  font-size: 15px;
  background: #fff;
  color: #8b1c13;
  font-weight: 600;
  cursor: pointer;
  transition: 0.2s ease;
}

.option-button:hover {
  background-color: #f9e6e6;
}

.free-text textarea,
.diagnosis-input {
  width: 100%;
  padding: 14px;
  font-size: 14px;
  border: 1px solid #ccc;
  border-radius: 14px;
}

.nav-buttons {
  display: flex;
  justify-content: space-between;
  margin-top: 24px;
}

.nav-button {
  padding: 10px 20px;
  border-radius: 9999px;
  font-size: 14px;
  font-weight: bold;
  border: none;
  cursor: pointer;
}

.nav-button.back {
  background-color: #e5e7eb;
  color: #111;
}

.nav-button.next {
  background-color: #8b1c13;
  color: white;
}

.main-button {
  background-color: #8b1c13;
  color: white;
  font-weight: bold;
  padding: 10px 24px;
  border-radius: 9999px;
  border: none;
  cursor: pointer;
  margin-top: 24px;
}

.timeline {
  text-align: left;
  background: #f8f8f8;
  padding: 20px;
  border-radius: 14px;
  margin-top: 20px;
}

.gpt-feedback {
  background: #efefef;
  border-left: 5px solid #610606;
  padding: 16px 20px;
  margin-top: 24px;
  border-radius: 12px;
  text-align: left;
}

.loading-dots {
  font-weight: bold;
  font-style: italic;
  color: #444;
}

.loading-dots .dot {
  animation: blink 1.2s infinite;
}

.loading-dots .dot:nth-child(2) {
  animation-delay: 0.2s;
}
.loading-dots .dot:nth-child(3) {
  animation-delay: 0.4s;
}

@keyframes blink {
  0%, 20% { opacity: 0.2 }
  50% { opacity: 1 }
  100% { opacity: 0.2 }
}
</style>
