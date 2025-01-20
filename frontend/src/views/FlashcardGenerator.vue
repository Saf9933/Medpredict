<template>
  <div class="flashcard-wrapper">
    <div class="input-section" v-if="!sessionStarted">
      <h2 class="title">📋 Flashcard Maker</h2>
      <p class="subtitle">Enter flashcards as: <strong>term; definition</strong></p>

      <input
        v-model="setTitle"
        placeholder="Enter a title for your flashcard set"
        class="set-title-input"
      />

      <textarea
        v-model="rawInput"
        placeholder="Example: Heart; Pumps blood through the body"
        class="flashcard-input"
      ></textarea>

      <button class="start-btn" @click="startSession">Start Session</button>
    </div>

    <div v-else class="session-section">
      <h2 class="title">🧠 {{ currentCard.term }}</h2>

      <div v-if="showDefinition" class="definition-box">💡 {{ currentCard.definition }}</div>

      <div class="btn-group">
        <button v-if="!showDefinition" @click="showDefinition = true" class="reveal-btn">
          Reveal Answer
        </button>
        <button v-if="showDefinition" @click="memorized(true)" class="yes-btn">✅ Memorized</button>
        <button v-if="showDefinition" @click="memorized(false)" class="no-btn">❌ Review Again</button>
      </div>

      <p class="timer">⏱️ Time elapsed: {{ elapsedTime }} seconds</p>
    </div>

    <div v-if="savedSets.length" class="saved-section">
      <h3>🗂️ Your Flashcard Sets</h3>
      <div class="saved-set" v-for="(set, index) in savedSets" :key="index">
        <h4>{{ set.title }}</h4>
        <div class="card-grid">
          <div class="flip-card" v-for="(card, i) in set.cards" :key="i">
            <div class="flip-card-inner">
              <div class="flip-card-front">
                {{ card.term }}
              </div>
              <div class="flip-card-back">
                {{ card.definition }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "FlashcardTrainer",
  data() {
    return {
      setTitle: "",
      rawInput: "",
      flashcards: [],
      unmemorized: [],
      currentIndex: 0,
      showDefinition: false,
      sessionStarted: false,
      round: 1,
      startTime: null,
      elapsedTime: 0,
      timerInterval: null,
      savedSets: []
    };
  },
  computed: {
    currentCard() {
      return this.flashcards[this.currentIndex];
    }
  },
  methods: {
    async startSession() {
      if (!this.rawInput.trim() || !this.setTitle.trim()) {
        return alert("Please enter a title and some flashcards");
      }

      const res = await fetch("http://localhost:5032/api/flashcards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ input: this.rawInput })
      });

      const data = await res.json();
      this.flashcards = data.flashcards;
      this.unmemorized = [];
      this.currentIndex = 0;
      this.showDefinition = false;
      this.sessionStarted = true;
      this.round = 1;
      this.startTime = performance.now();
      this.elapsedTime = 0;
      this.startTimer();
    },
    startTimer() {
      this.timerInterval = setInterval(() => {
        this.elapsedTime = ((performance.now() - this.startTime) / 1000).toFixed(1);
      }, 100);
    },
    stopTimer() {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    },
    memorized(success) {
      if (!success) this.unmemorized.push(this.currentCard);
      this.nextCard();
    },
    nextCard() {
      this.currentIndex++;
      this.showDefinition = false;

      if (this.currentIndex >= this.flashcards.length) {
        if (this.unmemorized.length > 0) {
          this.flashcards = this.unmemorized;
          this.unmemorized = [];
          this.currentIndex = 0;
          this.round++;
          alert(`🔁 Round ${this.round} starts now!`);
        } else {
          this.stopTimer();
          alert(`🎉 All flashcards memorized!\n⏱️ Total session time: ${this.elapsedTime} seconds`);
          this.savedSets.push({
            title: this.setTitle,
            cards: [...this.flashcards]
          });
          this.resetSession();
        }
      }
    },
    resetSession() {
      this.setTitle = "";
      this.rawInput = "";
      this.sessionStarted = false;
    }
  }
};
</script>

<style scoped>
.flashcard-wrapper {
  padding: 3rem 1rem;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.input-section, .session-section {
  max-width: 700px;
  width: 100%;
  text-align: center;
  background: #f8f8fb;
  padding: 2rem;
  border-radius: 1.5rem;
  box-shadow: 0 4px 12px rgba(0,0,0,0.05);
  margin-bottom: 2rem;
}

.set-title-input {
  width: 100%;
  padding: 0.8rem;
  font-size: 1rem;
  border-radius: 12px;
  border: none;
  box-shadow: 0 0 0 1px #ccc;
  margin-bottom: 1rem;
}

.title {
  font-size: 2rem;
  font-weight: bold;
  margin-bottom: 0.5rem;
  font-family: "Georgia", serif;
}

.subtitle {
  color: #555;
  font-size: 1rem;
  margin-bottom: 1rem;
}

.flashcard-input {
  width: 100%;
  height: 200px;
  padding: 1rem;
  font-size: 1rem;
  border-radius: 12px;
  border: none;
  box-shadow: 0 0 0 1px #ccc;
  margin-bottom: 1.5rem;
  resize: vertical;
}

.start-btn, .reveal-btn, .yes-btn, .no-btn {
  padding: 0.8rem 2rem;
  font-size: 1rem;
  font-weight: bold;
  border: none;
  border-radius: 1.5rem;
  cursor: pointer;
  margin: 0.5rem;
}
.set-section {
  margin-top: 4rem;
  padding: 2rem 1rem;
  text-align: center;
}

.set-title {
  font-size: 1.6rem;
  font-weight: bold;
  margin-bottom: 2rem;
  font-family: "Georgia", serif;
}

.flashcard-grid {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 2rem;
}

.flashcard {
  width: 140px;
  height: 190px;
  background: white;
  border-radius: 1.2rem;
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.05);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 1.1rem;
  cursor: pointer;
  transition: transform 0.3s ease;
}

.flashcard:hover {
  transform: scale(1.05);
}


.start-btn { background-color: #001eff; color: white; }
.reveal-btn { background-color: #0077ff; color: white; }
.yes-btn { background-color: #28a745; color: white; }
.no-btn { background-color: #dc3545; color: white; }

.definition-box {
  margin: 1rem auto;
  padding: 1rem;
  background-color: #fff;
  border-radius: 1rem;
  box-shadow: 0 0 8px rgba(0,0,0,0.05);
  font-size: 1.1rem;
}

.btn-group {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 1rem;
  margin-top: 1rem;
}

.timer {
  margin-top: 1rem;
  font-size: 1rem;
  color: #666;
}

.saved-section {
  max-width: 1000px;
  width: 100%;
  margin-top: 2rem;
  text-align: center;
}

.saved-set h4 {
  font-size: 1.5rem;
  margin: 2rem 0 1.5rem;
  font-weight: bold;
  text-transform: capitalize;
  font-family: "Georgia", serif;
}


.card-grid {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  justify-content: center;
}

.flip-card {
  background-color: transparent;
  width: 160px;
  height: 200px;
  perspective: 1000px;
}

.flip-card-inner {
  position: relative;
  width: 100%;
  height: 100%;
  text-align: center;
  transition: transform 0.6s;
  transform-style: preserve-3d;
}

.flip-card:hover .flip-card-inner {
  transform: rotateY(180deg);
}

.flip-card-front, .flip-card-back {
  position: absolute;
  width: 100%;
  height: 100%;
  backface-visibility: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1rem;
  border-radius: 1rem;
  padding: 1rem;
  background: white;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
}

.flip-card-back {
  transform: rotateY(180deg);
  background: #eaeaea;
}
</style>
