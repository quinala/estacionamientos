import { createRouter, createWebHistory } from 'vue-router'
import { authGuard } from '../auth/guards/auth.js'

// Vistas de autenticación
import Login from '../auth/components/LoginForm.vue'
import Register from '../auth/components/RegisterForm.vue'

// Vistas principales
import Dashboard from '../views/Dashboard.vue'
import SpotsList from '../views/SpotsList.vue'
import VehicleEntry from '../views/VehicleEntry.vue'
import Reports from '../views/Reports.vue'
import Users from '../views/Users.vue'

const routes = [
  { 
    path: '/login', 
    name: 'Login', 
    component: Login,
   
    beforeEnter: authGuard.redirectIfAuth
  },
  { 
    path: '/register', 
    name: 'Register', 
    component: Register,
    beforeEnter: authGuard.redirectIfAuth
  },
  { 
    path: '/', 
    name: 'Dashboard', 
    component: Dashboard,
    beforeEnter: authGuard.requireAuth
  },
  { 
    path: '/spots', 
    name: 'SpotsList', 
    component: SpotsList,
    beforeEnter: authGuard.requireAuth
  },
  { 
    path: '/entry', 
    name: 'VehicleEntry', 
    component: VehicleEntry,
    beforeEnter: authGuard.requireAuth
  },
  { 
    path: '/reports', 
    name: 'Reports', 
    component: Reports,
    beforeEnter: authGuard.requireAuth
  },
  {
    path: '/users',
    name: 'Users',
    component: Users
  },
  // Ruta de redirección por defecto
  { 
    path: '/:pathMatch(.*)*', 
    redirect: '/' 
  }
  
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
