<!-- src/components/AppFooter.vue -->
<template>
  <footer class="site-footer">
    <div class="footer-inner">
      <div class="footer-glass">
        <div class="footer-top">
          <div class="footer-brand">
            <span class="footer-logo">
              <span class="f-med">Med</span><span class="f-predict">Predict</span>
            </span>
            <p class="footer-tagline">AI-Powered Medical Study Companion</p>
          </div>

          <div class="footer-nav">
            <router-link to="/classifier">AI Quiz</router-link>
            <router-link to="/symptoms">Symptoms</router-link>
            <router-link to="/flashcards">Flashcards</router-link>
            <router-link to="/simulate">Simulator</router-link>
            <router-link to="/textbook">Textbook</router-link>
          </div>
        </div>

        <div class="footer-divider"></div>

        <div class="footer-bottom">
          <p class="footer-copy">&copy; 2025 MedPredict &middot; Filali Salma</p>
          <p class="footer-credit">Built at Sichuan University &middot; College of Software Engineering</p>
        </div>
      </div>
    </div>
  </footer>
</template>

<script>
export default { name: 'AppFooter' }
</script>

<style scoped>
.site-footer {
  margin-top: var(--space-20);
  padding: 0 var(--space-6) var(--space-8);
}

.footer-inner {
  max-width: 1200px;
  margin: 0 auto;
}

.footer-glass {
  background: var(--glass-white);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-2xl);
  padding: var(--space-8);
  box-shadow: var(--glass-shadow);
}

.footer-top {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  flex-wrap: wrap;
  gap: var(--space-6);
}

.footer-logo {
  font-family: var(--font-heading);
  font-size: var(--text-xl);
  font-weight: 800;
  letter-spacing: -0.03em;
}

.f-med { color: var(--text-primary); }
.f-predict { color: var(--primary); }
.f-med { color: var(--text-primary); }

.footer-tagline {
  color: var(--text-tertiary);
  font-size: var(--text-sm);
  margin-top: var(--space-1);
}

.footer-nav {
  display: flex;
  align-items: center;
  gap: var(--space-5);
  flex-wrap: wrap;
}

.footer-nav a {
  color: var(--text-secondary);
  font-family: var(--font-heading);
  font-size: var(--text-sm);
  font-weight: 500;
  text-decoration: none;
  transition: color var(--duration-fast) var(--ease-out);
}

.footer-nav a:hover { color: var(--primary); }

.footer-divider {
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(61, 153, 112, 0.15), transparent);
  margin: var(--space-6) 0;
}

.footer-bottom {
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: var(--space-2);
}

.footer-copy,
.footer-credit {
  color: var(--text-tertiary);
  font-size: var(--text-xs);
}

@media (max-width: 640px) {
  .footer-top { flex-direction: column; }
  .footer-nav { gap: var(--space-3); }
  .footer-bottom { flex-direction: column; text-align: center; }
}
</style>
