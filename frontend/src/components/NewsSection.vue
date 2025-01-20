<template>
    <div class="news-wrapper">
      <h2 class="news-title">Medical headlines</h2>
      <div class="news-grid">
        <!-- Top Left (Large Wide Card) -->
        <div class="news-card wide">
          <h3 class="news-headline">Antidepressant Therapy Linked to a 2% Weight Gain</h3>
          <p class="news-content">
            The use of antidepressants has been linked to a 2% weight gain in patients who used this treatment at any point during a 6-year follow-up, according to a Spanish study. The authors suggest that these findings should encourage weight control and metabolic monitoring in patients with depression who are being treated with medications.
          </p>
        </div>
  
        <!-- Top Right (Tall Card) -->
        <div class="news-card tall">
          <h3 class="news-headline">Antidepressant Therapy Linked to a 2% Weight Gain</h3>
          <p class="news-source">Medscape Medical News<br>March 27, 2025</p>
          <p class="news-content small">
            The use of antidepressants has been linked to a 2% weight gain in patients who used this treatment at any point during a 6-year follow-up, according to a Spanish study. The authors suggest that these findings should encourage weight control and metabolic monitoring in patients with depression who are being treated with medications.
          </p>
        </div>
  
        <!-- Bottom Cards -->
        <div class="news-card">
          <h3 class="news-headline">Physician’s handbook</h3>
          <p class="news-source">Medscape Medical News<br>March 27, 2025</p>
        </div>
  
        <div class="news-card">
          <h3 class="news-headline">Physician’s handbook</h3>
          <p class="news-source">Medscape Medical News<br>March 27, 2025</p>
        </div>
  
      </div>
    </div>
  </template>
  
  
  
  <style scoped>
  .news-wrapper {
  max-width: 1200px;
  margin: 6rem auto;
  padding: 0 1rem;
  text-align: center;
}

.news-title {
  font-size: 1.8rem;
  font-weight: bold;
  font-family: Georgia, serif;
  border-bottom: 1px solid #aaa;
  padding-bottom: 0.5rem;
  margin-bottom: 3rem;
  display: inline-block;
}

.news-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  grid-template-rows: auto auto;
  gap: 2rem;
}

/* Default card */
.news-card {
  background: #f8f7f7;
  border-radius: 2rem;
  padding: 2rem;
  text-align: left;
  font-family: 'Georgia', serif;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.05);
}

/* Wide card (top-left, spans 2 columns) */
.news-card.wide {
  grid-column: span 2;
}

/* Tall card (top-right) */
.news-card.tall {
  grid-row: span 2;
}

/* Headlines */
.news-headline {
  font-size: 1.5rem;
  font-style: italic;
  font-weight: 700;
  margin-bottom: 1rem;
}

/* Long content */
.news-content {
  font-size: 0.95rem;
  color: #333;
  line-height: 1.6;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  font-weight: 500;
}

.news-content.small {
  font-size: 0.8rem;
}

/* News source */
.news-source {
  font-size: 0.9rem;
  color: #333;
  margin-top: 1rem;
  letter-spacing: 0.03em;
}

  </style>
  