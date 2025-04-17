<template>
  <div class="home">
    <!-- ========== HERO ========== -->
    <section class="hero fade-in-up">
      <div class="hero-badge badge badge-primary fade-in-up fade-in-up-delay-1">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
        Powered by Fine-Tuned PubMedBERT
      </div>

      <h1 class="hero-title fade-in-up fade-in-up-delay-2">
        Your AI-Powered<br/>
        <span class="hero-gradient">Medical Study</span> Companion
      </h1>

      <p class="hero-subtitle fade-in-up fade-in-up-delay-3">
        Master medical concepts with AI-driven quizzes, symptom analysis,
        clinical simulations, and smart flashcards — all in one platform.
      </p>

      <div class="hero-cta fade-in-up fade-in-up-delay-4">
        <router-link to="/classifier" class="btn btn-primary btn-lg">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
          Start Quiz
        </router-link>
        <router-link to="/symptoms" class="btn btn-ghost btn-lg">
          Explore Tools
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
        </router-link>
      </div>
    </section>

    <!-- ========== FEATURES GRID ========== -->
    <section class="features-section">
      <h2 class="section-title fade-in-up">Everything You Need to Study Medicine</h2>

      <div class="features-grid">
        <router-link
          v-for="(feature, i) in features"
          :key="feature.path"
          :to="feature.path"
          class="feature-card glass-shimmer fade-in-up"
          :class="'fade-in-up-delay-' + (i + 1)"
        >
          <div class="feature-icon-wrap" :style="{ background: feature.iconBg }">
            <span class="feature-icon" v-html="feature.icon"></span>
          </div>
          <h3 class="feature-name">{{ feature.name }}</h3>
          <p class="feature-desc">{{ feature.desc }}</p>
          <span class="feature-arrow">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
          </span>
        </router-link>
      </div>
    </section>

    <!-- ========== STATS BAR ========== -->
    <section class="stats-bar fade-in-up">
      <div class="stats-glass">
        <div class="stat" v-for="stat in stats" :key="stat.label">
          <span class="stat-value">{{ stat.value }}</span>
          <span class="stat-label">{{ stat.label }}</span>
        </div>
      </div>
    </section>

    <!-- ========== ABOUT ========== -->
    <section class="about-section fade-in-up">
      <div class="about-glass">
        <div class="about-avatar">
          <div class="avatar-circle">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
          </div>
        </div>
        <div class="about-content">
          <h3 class="about-name">Filali Salma</h3>
          <p class="about-role">AI Researcher &middot; Sichuan University IDS Lab</p>
          <p class="about-bio">
            Enthusiastic AI researcher with hands-on experience in big data analytics,
            full-stack development, and mobile application design.
          </p>
          <div class="about-links">
            <a href="https://github.com/Saf9933" target="_blank" rel="noopener" class="about-social">
              <svg width="18" height="18" viewBox="0 0 16 16" fill="currentColor"><path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/></svg>
            </a>
            <a href="https://www.linkedin.com/in/salma-filali-5b5b572b6" target="_blank" rel="noopener" class="about-social">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
            </a>
            <a href="mailto:salmaf999o@email.com" class="about-social">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="M22 7l-10 7L2 7"/></svg>
            </a>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script>
export default {
  name: 'HomePage',
  data() {
    return {
      features: [
        {
          path: '/classifier',
          name: 'MCQ Classifier',
          desc: 'Test your knowledge with AI-powered predictions and confidence analysis',
          icon: '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>',
          iconBg: 'linear-gradient(135deg, rgba(61,153,112,0.12), rgba(90,184,138,0.12))'
        },
        {
          path: '/symptoms',
          name: 'Symptom Checker',
          desc: 'Reason through symptoms to identify conditions like a clinician',
          icon: '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>',
          iconBg: 'linear-gradient(135deg, rgba(192,80,58,0.12), rgba(212,165,116,0.12))'
        },
        {
          path: '/flashcards',
          name: 'Smart Flashcards',
          desc: 'Create and drill custom study decks with timed sessions',
          icon: '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>',
          iconBg: 'linear-gradient(135deg, rgba(200,169,110,0.14), rgba(212,187,136,0.14))'
        },
        {
          path: '/simulate',
          name: 'Case Simulator',
          desc: 'Walk through real clinical scenarios with AI-generated feedback',
          icon: '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M16 4h2a2 2 0 012 2v14a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2h2"/><rect x="8" y="2" width="8" height="4" rx="1"/><path d="M9 14l2 2 4-4"/></svg>',
          iconBg: 'linear-gradient(135deg, rgba(107,143,91,0.14), rgba(126,168,126,0.14))'
        },
        {
          path: '/textbook',
          name: 'Textbook Search',
          desc: 'Upload PDFs and search or generate quizzes from your own materials',
          icon: '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M4 19.5A2.5 2.5 0 016.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"/><line x1="9" y1="7" x2="16" y2="7"/><line x1="9" y1="11" x2="14" y2="11"/></svg>',
          iconBg: 'linear-gradient(135deg, rgba(90,143,168,0.12), rgba(126,168,126,0.12))'
        }
      ],
      stats: [
        { value: '194K+', label: 'Training Questions' },
        { value: '21',    label: 'Medical Subjects' },
        { value: '8',     label: 'Clinical Cases' },
        { value: '5',     label: 'Study Modules' }
      ]
    }
  }
}
</script>

<style scoped>
/* ========== HERO ========== */

.hero {
  text-align: center;
  padding: var(--space-16) 0 var(--space-12);
}

.hero-badge {
  display: inline-flex;
  gap: 6px;
  margin-bottom: var(--space-6);
  font-size: var(--text-xs);
}

.hero-title {
  font-family: var(--font-heading);
  font-size: clamp(2.2rem, 5.5vw, var(--text-6xl));
  font-weight: 800;
  letter-spacing: -0.03em;
  line-height: 1.1;
  color: var(--text-primary);
  margin-bottom: var(--space-6);
}

.hero-gradient {
  background: linear-gradient(135deg, var(--primary), var(--sage), var(--secondary));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.hero-subtitle {
  font-size: var(--text-lg);
  color: var(--text-secondary);
  max-width: 600px;
  margin: 0 auto var(--space-8);
  line-height: 1.7;
}

.hero-cta {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-4);
  flex-wrap: wrap;
}

/* ========== FEATURES ========== */

.features-section {
  padding: var(--space-12) 0;
}

.section-title {
  font-family: var(--font-heading);
  font-size: var(--text-2xl);
  font-weight: 700;
  text-align: center;
  margin-bottom: var(--space-10);
  color: var(--text-primary);
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: var(--space-6);
}

.feature-card {
  position: relative;
  background: var(--glass-white-medium);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-2xl);
  padding: var(--space-8) var(--space-6);
  text-decoration: none;
  color: var(--text-primary);
  box-shadow: var(--glass-shadow);
  transition:
    transform var(--duration-normal) var(--ease-out),
    box-shadow var(--duration-normal) var(--ease-out),
    border-color var(--duration-normal) var(--ease-out);
  overflow: hidden;
}

.feature-card:hover {
  transform: translateY(-6px);
  box-shadow: var(--glass-shadow-hover);
  border-color: rgba(61, 153, 112, 0.25);
}

.feature-card:hover .feature-arrow {
  opacity: 1;
  transform: translateX(0);
}

.feature-icon-wrap {
  width: 56px;
  height: 56px;
  border-radius: var(--radius-xl);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: var(--space-5);
}

.feature-icon {
  display: flex;
  color: var(--primary);
}

.feature-name {
  font-family: var(--font-heading);
  font-size: var(--text-lg);
  font-weight: 700;
  margin-bottom: var(--space-2);
}

.feature-desc {
  font-size: var(--text-sm);
  color: var(--text-secondary);
  line-height: 1.6;
}

.feature-arrow {
  position: absolute;
  top: var(--space-6);
  right: var(--space-6);
  color: var(--primary);
  opacity: 0;
  transform: translateX(-8px);
  transition: all var(--duration-normal) var(--ease-out);
}

/* ========== STATS ========== */

.stats-bar {
  padding: var(--space-8) 0;
}

.stats-glass {
  background: var(--glass-white-medium);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-2xl);
  padding: var(--space-8) var(--space-6);
  box-shadow: var(--glass-shadow);
  display: flex;
  justify-content: space-around;
  flex-wrap: wrap;
  gap: var(--space-6);
}

.stat {
  text-align: center;
  min-width: 120px;
}

.stat-value {
  display: block;
  font-family: var(--font-heading);
  font-size: var(--text-3xl);
  font-weight: 800;
  background: linear-gradient(135deg, var(--primary), var(--secondary));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  letter-spacing: -0.02em;
}

.stat-label {
  display: block;
  font-size: var(--text-sm);
  color: var(--text-tertiary);
  font-weight: 500;
  margin-top: var(--space-1);
}

/* ========== ABOUT ========== */

.about-section {
  padding: var(--space-8) 0;
}

.about-glass {
  background: var(--glass-white-medium);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-2xl);
  padding: var(--space-8);
  box-shadow: var(--glass-shadow);
  display: flex;
  align-items: center;
  gap: var(--space-8);
}

.avatar-circle {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--primary-bg), var(--sage-bg));
  border: 2px solid rgba(61, 153, 112, 0.15);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--primary);
  flex-shrink: 0;
}

.about-name {
  font-family: var(--font-heading);
  font-size: var(--text-xl);
  font-weight: 700;
  margin-bottom: var(--space-1);
}

.about-role {
  font-size: var(--text-sm);
  color: var(--primary);
  font-weight: 500;
  margin-bottom: var(--space-3);
}

.about-bio {
  font-size: var(--text-sm);
  color: var(--text-secondary);
  line-height: 1.7;
  margin-bottom: var(--space-4);
}

.about-links {
  display: flex;
  gap: var(--space-3);
}

.about-social {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: var(--radius-lg);
  background: var(--glass-white);
  border: 1px solid var(--glass-border);
  color: var(--text-secondary);
  transition: all var(--duration-fast) var(--ease-out);
}

.about-social:hover {
  color: var(--primary);
  border-color: rgba(61, 153, 112, 0.25);
  background: var(--primary-bg);
  transform: translateY(-2px);
}

/* ========== RESPONSIVE ========== */

@media (max-width: 768px) {
  .hero { padding: var(--space-8) 0 var(--space-8); }
  .hero-title { font-size: var(--text-4xl); }

  .features-grid {
    grid-template-columns: 1fr;
  }

  .stats-glass {
    flex-direction: column;
    align-items: center;
  }

  .about-glass {
    flex-direction: column;
    text-align: center;
  }

  .about-links { justify-content: center; }
}

@media (max-width: 480px) {
  .hero-title { font-size: var(--text-3xl); }
  .hero-cta { flex-direction: column; }
  .hero-cta .btn { width: 100%; }
}
</style>
