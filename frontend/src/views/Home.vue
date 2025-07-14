<template>
  <div class="home-wrapper">
    <div class="card-section">
      <h1 class="title">START STUDYING NOW !</h1>
      <p class="subtitle">medical student assistance</p>

      <!-- Main Feature Buttons -->
      <div class="features">
        <router-link to="/symptoms" class="feature-box">
          <img src="@/assets/book-icon.png" alt="Book" />
          <div class="text">
            <h3>SYMPTOM STUDY SIMULATION</h3>
            <p>SEARCH THROUGH YOUR TEXTBOOKS</p>
          </div>
        </router-link>

        <router-link to="/textbook" class="feature-box">
          <img src="@/assets/book-icon.png" alt="Book" />
          <div class="text">
            <h3>TEXTBOOK UPLOAD</h3>
            <p>SEARCH THROUGH YOUR TEXTBOOKS</p>
          </div>
        </router-link>

        <router-link to="/simulate" class="feature-box">
          <img src="@/assets/book-icon.png" alt="Book" />
          <div class="text">
            <h3>CLINICAL CASE SIMULATOR</h3>
            <p>WORK THROUGH REAL-LIFE CASES</p>
          </div>
        </router-link>

        <router-link to="/flashcards" class="feature-box">
          <img src="@/assets/book-icon.png" alt="Book" />
          <div class="text">
            <h3>FLASHCARD MAKER</h3>
            <p>LEARN ABOUT THE HEART AND TAKE QUIZZES ON IT</p>
          </div>
        </router-link>
      </div>
    </div>

    <!-- Study Smarter Circle Section -->
    <StudySmarter />

    <!-- Mini White Card Section -->
    <div class="mini-card-section">
      <router-link to="/symptoms" class="mini-card">
        <h4>Explore Symptoms</h4>
        <hr />
        <img src="@/assets/symptom-icon.png" alt="Explore Symptoms" />
      </router-link>

      <router-link to="/news" class="mini-card">
        <h4>Get Latest News</h4>
        <hr />
        <img src="@/assets/news-icon.png" alt="Get Latest News" />
      </router-link>

      <router-link to="/quiz" class="mini-card">
        <h4>Quiz Yourself</h4>
        <hr />
        <img src="@/assets/quiz-icon.png" alt="Quiz Yourself" />
      </router-link>
    </div>

    <!-- 📰 News Section Goes Here -->
    <NewsSection />
    <!-- About Me Section -->
    <AboutMe />

  </div>
</template>

<script>
import StudySmarter from '@/views/StudySmarter.vue';
import NewsSection from '@/components/NewsSection.vue'; 
import AboutMe from '@/components/AboutMe.vue';

export default {
  name: 'HomePage',
  components: {
    StudySmarter,
    NewsSection,
    AboutMe

  }
}

</script>

<style scoped>
.home-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 6rem 1rem;
  min-height: 100vh;
  text-align: center;
}

.card-section {
  background-color: #f6f6f6;
  border-radius: 2rem;
  padding: 3rem 2rem;
  max-width: 1100px;
  width: 100%;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.05);
  margin: 0 auto; /* ✅ Add this line to center horizontally */
}


.title {
  font-family: 'Georgia', serif;
  font-size: 3rem;
  font-weight: bold;
  margin-bottom: 0.5rem;
}

.subtitle {
  font-size: 1.2rem;
  font-weight: 500;
  color: #a94442;
  margin-bottom: 4rem;
}

.features {
  display: grid;
  grid-template-columns: repeat(2, max-content); 
  gap: 4rem;
  justify-content: center; 
  margin-top: 2rem;
}


.feature-box {
  background-color: #ffffff;
  border-radius: 2rem;
  padding: 1.8rem;
  display: flex;
  align-items: center;
  gap: 1.5rem;
  text-align: left;
  text-decoration: none;
  color: black;
  width: 450px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  transition: transform 0.2s ease;
}

.feature-box:hover {
  transform: translateY(-5px);
}

.feature-box img {
  width: 60px;
  height: auto;
}

.feature-box .text h3 {
  font-size: 1.3rem;
  font-weight: bold;
  margin-bottom: 0.4rem;
}

.feature-box .text p {
  font-size: 0.9rem;
  font-weight: 500;
  color: #444;
}

/* Mini Cards */
.mini-card-section {
  margin-top: 5rem;
  display: flex;
  justify-content: center;
  gap: 2rem;
  flex-wrap: wrap;
}

.mini-card {
  width: 320px;
  height: 280px;
  padding: 2rem;
  background: #ffffff;
  border-radius: 2rem;
  text-align: center;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.08);
  transition: transform 0.2s ease;
  text-decoration: none;
  color: #000;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.mini-card:hover {
  transform: translateY(-5px);
}

.mini-card h4 {
  font-size: 1.1rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: #111;
}

.mini-card hr {
  width: 80%;
  margin: 0 auto 1.5rem auto;
  border: none;
  border-top: 1px solid #999;
}

.mini-card img {
  width: 150px;
  height: auto;
}
</style>
