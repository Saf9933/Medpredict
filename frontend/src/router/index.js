import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'
import SymptomChecker from '../views/SymptomChecker.vue'
import TextbookSearch from '../views/TextbookSearch.vue'
import FlashcardGenerator from '../views/FlashcardGenerator.vue'
import SimulationView from '../views/SimulationView.vue' 
import ClassifierQuiz from '../views/ClassifierQuiz.vue'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home,
  },
  {
    path: '/symptoms',
    name: 'SymptomChecker',
    component: SymptomChecker,
  },
  {
    path: '/classifier',
    name: 'ClassifierQuiz',
    component: ClassifierQuiz,
  },
  {
    path: '/textbook',
    name: 'TextbookSearch',
    component: TextbookSearch,
  },
  {
    path: '/flashcards',
    name: 'FlashcardGenerator',
    component: FlashcardGenerator,
  },
  
  {
    path: '/simulate',
    name: 'SimulationView',
    component: SimulationView,
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/',
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
