<template>
  <div class="symptom-wrapper">
    <div class="card-section">
      <h1 class="title">CAN YOU GUESS THE DISEASE?</h1>
      <p class="subtitle">A Symptom-to-Disease Study Companion for Medical Students</p>

      <input
        v-model="symptoms"
        placeholder="Enter symptoms separated by commas..."
        class="input-box"
      />

      <div class="btn-group">
        <button class="check-btn" @click.prevent="checkSymptoms">Check diagnosis</button>
      </div>

      <transition name="fade">
        <div v-if="resultsVisible" class="result-cards">
          <div class="card">
            <h3>Most likely conditions</h3>
            <hr />
            <ul>
              <li v-for="(item, index) in conditions" :key="index">
                 {{ item.disease }} – {{ item.confidence.toFixed(1) }}%
              </li>
            </ul>
          </div>

          <div class="card">
            <h3>Precautions</h3>
            <hr />
            <ul>
              <li v-for="(item, index) in precautions" :key="index">🩺 {{ item }}</li>
            </ul>
          </div>
        </div>
      </transition>

      <transition name="fade">
        <button v-if="resultsVisible" class="clear-btn" @click="clearResults">Clear</button>
      </transition>
    </div>
  </div>
</template>

<script>
export default {
  name: "SymptomChecker",
  data() {
    return {
      symptoms: "",
      conditions: [],
      precautions: [],
      resultsVisible: false
    };
  },
  methods: {
    async checkSymptoms() {
      console.log(" Button clicked");

      if (!this.symptoms.trim()) return;

      try {
        const response = await fetch("http://localhost:5032/api/symptoms-python", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            symptoms: this.symptoms.split(",").map((s) => s.trim())
          })
        });

        const raw = await response.text();
        console.log(" Raw response:", raw);

        const data = JSON.parse(raw);
        console.log(" Parsed:", data);

        this.conditions = data.predictions || [];
        this.precautions = data.precautions || [];

        if (this.conditions.length > 0) {
          this.resultsVisible = true;
          this.scrollToResults();
        }
      } catch (error) {
        console.error(" Fetch error:", error);
        alert("Something went wrong. Please try again later.");
      }
    },

    clearResults() {
      this.symptoms = "";
      this.conditions = [];
      this.precautions = [];
      this.resultsVisible = false;
    },

    scrollToResults() {
      this.$nextTick(() => {
        const el = document.querySelector(".result-cards");
        if (el) el.scrollIntoView({ behavior: "smooth" });
      });
    }
  }
};
</script>

<style scoped>
.symptom-wrapper {
  padding: 6rem 1rem;
  display: flex;
  justify-content: center;
  min-height: 100vh;
}

.card-section {
  background-color: #f8f6f8;
  border-radius: 2rem;
  padding: 3rem 2rem;
  max-width: 1000px;
  width: 100%;
  text-align: center;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.05);
}

.title {
  font-family: "Georgia", serif;
  font-size: 2.5rem;
  font-weight: bold;
  margin-bottom: 0.5rem;
}

.subtitle {
  color: #a94442;
  font-size: 1.1rem;
  margin-bottom: 2rem;
}

.input-box {
  width: 100%;
  max-width: 800px;
  padding: 1rem;
  border-radius: 12px;
  border: none;
  box-shadow: 0 0 0 1px #ccc;
  font-size: 1rem;
  margin-bottom: 1.5rem;
}

.btn-group {
  display: flex;
  justify-content: center;
  gap: 1rem;
}

.check-btn {
  background-color: #001eff;
  color: white;
  padding: 0.8rem 2rem;
  font-weight: bold;
  font-size: 1rem;
  border: none;
  border-radius: 1.5rem;
  cursor: pointer;
}

.clear-btn {
  background-color: #841c1c;
  color: white;
  margin-top: 2rem;
  padding: 0.6rem 2rem;
  border: none;
  font-size: 1rem;
  border-radius: 1.5rem;
  cursor: pointer;
}

.result-cards {
  margin-top: 3rem;
  display: flex;
  gap: 2rem;
  justify-content: center;
  flex-wrap: wrap;
}

.card {
  background: white;
  border-radius: 2rem;
  padding: 2rem;
  width: 45%;
  min-width: 280px;
  text-align: left;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.card h3 {
  font-size: 1.2rem;
  font-weight: bold;
  text-align: center;
  margin-bottom: 1rem;
}

.card ul {
  list-style: none;
  padding-left: 0;
  font-size: 0.95rem;
  line-height: 1.6;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.4s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
