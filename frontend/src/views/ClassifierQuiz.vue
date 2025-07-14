<template>
  <div class="classifier-wrapper">
    <div class="card-box">
      <!-- 👇 Keep everything else inside here -->
      <h1 class="title">CAN YOU GUESS THE ANSWER?</h1>
      <p class="subtitle">An AI-powered Assistant for Medical Multiple Choice Questions</p>
    <div class="input-box">
      <label>Enter a Question:</label>
      <textarea v-model="question" rows="3" placeholder="Type your clinical MCQ here..."></textarea>

      <label>Enter Choices:</label>
      <input v-model="choices.A" placeholder="Choice A" />
      <input v-model="choices.B" placeholder="Choice B" />
      <input v-model="choices.C" placeholder="Choice C" />
      <input v-model="choices.D" placeholder="Choice D" />

      <div class="button-group">
        <button @click="submit" :disabled="loading || !isComplete">{{ loading ? 'Predicting...' : 'Get Prediction' }}</button>
        <button @click="clearAll" class="clear-btn">Clear</button>
      </div>
    </div>
  </div>
    <div v-if="result" class="result-box">
      <h2>Model Prediction: <span>{{ result.predicted }}</span></h2>
      <p>Predicted Answer: <strong>{{ result.pred_text }}</strong></p>
      <p>Confidence: <strong>{{ (result.confidence * 100).toFixed(2) }}%</strong></p>
      <p>Difficulty:
        <span :class="['badge', getDiffClass(result.confidence)]">
          {{ classifyDifficulty(result.confidence) }}
        </span>
      </p>
      <p v-if="userAnswer">
        Your Answer: <strong>{{ userAnswer }}</strong>
        <span :class="userAnswer === result.predicted ? 'correct' : 'incorrect'">
          ({{ userAnswer === result.predicted ? 'Correct' : 'Incorrect' }})
        </span>
      </p>
      <p>Time Taken: <strong>{{ timeTaken.toFixed(1) }}s</strong></p>

      <div class="bar-chart">
        <div class="bar-container" v-for="(value, key) in result.breakdown" :key="key">
          <span class="bar-label">{{ key }}</span>
          <div class="bar-wrapper">
            <div class="bar-fill" :style="{ height: (value * 100) + '%'}">
              <span>{{ (value * 100).toFixed(1) }}%</span>
            </div>
          </div>
        </div>
      </div>

      <div class="export-buttons">
        <button @click="exportJSON">Export JSON</button>
        <button @click="exportCSV">Export CSV</button>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios'

export default {
  name: 'ClassifierQuiz',
  data() {
    return {
      question: '',
      choices: { A: '', B: '', C: '', D: '' },
      userAnswer: '',
      result: null,
      loading: false,
      timeTaken: 0
    }
  },
  computed: {
    isComplete() {
      return this.question && this.choices.A && this.choices.B && this.choices.C && this.choices.D
    }
  },
  methods: {
    async submit() {
      this.loading = true
      const start = performance.now()

      try {
        const response = await axios.post('/api/mcq', {
          question: this.question,
          choices: [this.choices.A, this.choices.B, this.choices.C, this.choices.D]
        })

        this.result = response.data
        this.timeTaken = (performance.now() - start) / 1000
        this.userAnswer = prompt('🧑‍⚕️ What is your answer? (A/B/C/D)').toUpperCase()
      } catch (err) {
        alert("Prediction failed. Try again.")
      } finally {
        this.loading = false
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
    }
  }
}
</script>

<style scoped>
.classifier-wrapper {
  max-width: 800px;
  margin: auto;
  padding: 3rem 1rem;
  font-family: 'Georgia', serif;
  text-align: center;
}

.title {
  font-size: 2.2rem;
  font-weight: bold;
}

.subtitle {
  font-size: 1.1rem;
  color: #c00;
  margin-bottom: 2rem;
}

.input-box textarea,
.input-box input {
  width: 100%;
  margin: 0.5rem 0;
  padding: 0.8rem;
  border: 1px solid #ccc;
  border-radius: 10px;
}

.button-group {
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin-top: 1rem;
}

.button-group button {
  padding: 0.6rem 1.5rem;
  border-radius: 25px;
  font-weight: bold;
  cursor: pointer;
  border: none;
  background: #003cff;
  color: white;
}

.clear-btn {
  background: #aaa;
}

.result-box {
  margin-top: 3rem;
  text-align: center;
}

.badge {
  padding: 0.3rem 1rem;
  border-radius: 20px;
  font-weight: bold;
}

.easy {
  background-color: #c7f5d9;
  color: green;
}

.medium {
  background-color: #fff3cd;
  color: orange;
}

.hard {
  background-color: #f8d7da;
  color: red;
}

.correct {
  color: green;
  font-weight: bold;
}

.incorrect {
  color: red;
  font-weight: bold;
}

.bar-chart {
  display: flex;
  justify-content: center;
  align-items: flex-end;
  height: 200px;
  gap: 1rem;
  margin-top: 2rem;
  padding: 1rem 0;
}

.bar-container {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.bar-label {
  font-weight: bold;
  margin-bottom: 0.5rem;
}

.bar-wrapper {
  width: 50px;
  background-color: #eee;
  height: 100%;
  display: flex;
  align-items: flex-end;
  border-radius: 8px;
  overflow: hidden;
}

.bar-fill {
  width: 100%;
  background: #81cfff;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  color: black;
  font-weight: bold;
  animation: grow 0.7s ease-out forwards;
}

@keyframes grow {
  from {
    height: 0%;
  }
  to {
    /* height is dynamic via inline style */
  }
}

.export-buttons {
  margin-top: 2rem;
  display: flex;
  justify-content: center;
  gap: 2rem;
}

.export-buttons button {
  background: black;
  color: white;
  border: none;
  padding: 0.7rem 1.4rem;
  border-radius: 12px;
  font-weight: bold;
  cursor: pointer;
}
.card-box {
  background-color: #fdfcfd;
  padding: 2rem;
  margin-top: 2rem;
  border-radius: 20px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

</style>
