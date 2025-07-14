<template>
    <div class="card">
      <div class="img"></div>
      <span>Filali Salma</span>
      <p class="info">I’m Salma, Enthusiastic AI researcher at the SCU IDS Lab, with hands-on experience in big data analytics, full-stack development, and
mobile application design. </p>
      <div class="share">
        <a href="https://github.com/Saf9933" target="_blank" rel="noopener">
          <i class="bi bi-github"></i>
        </a>
        <a href="www.linkedin.com/in/salma-filali-5b5b572b6" target="_blank" rel="noopener">
          <i class="bi bi-linkedin"></i>
        </a>
        <a href="salmaf999o@email.com">
          <i class="bi bi-envelope"></i>
        </a>
      </div>
      <button @click="downloadResume">Resume</button>
    </div>
  </template>
  
  <script>
  export default {
    name: "AboutMe",
    methods: {
      downloadResume() {
        window.open('/path-to-your-resume.pdf', '_blank');
      }
    }
  }
  </script>
  
  <style scoped>
  /* From Uiverse.io by Praashoo7 */ 
.card {
  width: 17em;
  height: 22.5em;
  background: #171717;
  transition: 1s ease-in-out;
  clip-path: polygon(30px 0%, 100% 0, 100% calc(100% - 30px), calc(100% - 30px) 100%, 0 100%, 0% 30px);
  border-top-right-radius: 20px;
  border-bottom-left-radius: 20px;
  display: flex;
  flex-direction: column;
}

.card span {
  font-weight: bold;
  color: white;
  text-align: center;
  display: block;
  font-size: 1em;
}

.card .info {
  font-weight: 400;
  color: white;
  display: block;
  text-align: center;
  font-size: 0.72em;
  margin: 1em;
}

.card .img {
  width: 4.8em;
  height: 4.8em;
  background: white;
  border-radius: 15px;
  margin: auto;
}

.card .share {
  margin-top: 1em;
  display: flex;
  justify-content: center;
  gap: 1em;
}

.card a {
  color: white;
  transition: .4s ease-in-out;
}

.card a:hover {
  color: red;
}

.card button {
  padding: 0.8em 1.7em;
  display: block;
  margin: auto;
  border-radius: 25px;
  border: none;
  font-weight: bold;
  background: #ffffff;
  color: rgb(0, 0, 0);
  transition: .4s ease-in-out;
}

.card button:hover {
  background: red;
  color: white;
  cursor: pointer;
}
  </style>
  