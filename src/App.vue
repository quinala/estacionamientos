<template>
  <div id="app">
    <!-- Navbar solo si está autenticado -->
    <nav v-if="isAuthenticated" class="navbar">
      <div class="nav-brand">
        <h1>🚗 Sistema de Estacionamiento</h1>
        <span class="user-info" v-if="currentUser">
          Hola, {{ currentUser.name }} ({{ currentUser.role }})
        </span>
      </div>
      <div class="nav-links">
        <router-link to="/">Dashboard</router-link>
        <router-link to="/spots">Espacios</router-link>
        <router-link to="/entry">Entrada/Salida</router-link>
        <router-link to="/reports">Reportes</router-link>
        <router-link to="/users" class="nav-link">
      👥 Usuarios
    </router-link>

    
        <router-link v-if="isAdmin" to="/reports">Reportes</router-link>
        <button @click="handleLogout" class="btn-logout">
          Cerrar Sesión
        </button>
      </div>
    </nav>
    
    <main class="main-content" :class="{ 'auth-page': !isAuthenticated }">
      <router-view />
    </main>
  </div>
</template>

<script>
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useParkingStore } from './store'
import { authService } from './auth/services/auth.js'
import { errorHandler } from './middleware/errorHandler.js'

export default {
  name: 'App',
  setup() {
    const store = useParkingStore()
    const router = useRouter()

    const isAuthenticated = computed(() => !!store.currentUser)
    const currentUser = computed(() => store.currentUser)
    const isAdmin = computed(() => store.currentUser?.role === 'admin')

    const handleLogout = async () => {
      try {
        await authService.logout()
        store.setCurrentUser(null)
        router.push('/login')
      } catch (error) {
        const handledError = errorHandler.handle(error, 'Logout')
        alert(handledError.userMessage)
      }
    }

    onMounted(() => {
      // Verificar autenticación al cargar la app
      const user = authService.checkAuth()
      store.setCurrentUser(user)
      store.loadData()

      if (!user && router.currentRoute.value.path !== '/login' && router.currentRoute.value.path !== '/register') {
        router.push('/login')
      }
    })

    return {
      isAuthenticated,
      currentUser,
      isAdmin,
      handleLogout
    }
  }
}
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  background-color: #f5f5f5;
  color: #333;
}

#app {
  min-height: 100vh;
}

.navbar {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 1rem 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}

.nav-brand {
  display: flex;
  flex-direction: column;
}

.nav-brand h1 {
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 0.25rem;
}

.user-info {
  font-size: 0.875rem;
  opacity: 0.9;
}

.nav-links {
  display: flex;
  gap: 1.5rem;
  align-items: center;
}

.nav-links a {
  color: white;
  text-decoration: none;
  padding: 0.5rem 1rem;
  border-radius: 5px;
  transition: background-color 0.3s;
}

.nav-links a:hover,
.nav-links a.router-link-active {
  background-color: rgba(255, 255, 255, 0.2);
}

.btn-logout {
  background: rgba(255, 255, 255, 0.2);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.3);
  padding: 0.5rem 1rem;
  border-radius: 5px;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-logout:hover {
  background: rgba(255, 255, 255, 0.3);
}

.main-content {
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

.main-content.auth-page {
  padding: 0;
  max-width: none;
}

/* Estilos generales para componentes */
.card {
  background: white;
  border-radius: 10px;
  padding: 1.5rem;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  margin-bottom: 1.5rem;
}

.btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s;
  text-decoration: none;
  display: inline-block;
  text-align: center;
}

.btn-primary {
  background: #667eea;
  color: white;
}

.btn-primary:hover {
  background: #5a6fd8;
  transform: translateY(-2px);
}

.btn-success {
  background: #48bb78;
  color: white;
}

.btn-success:hover {
  background: #38a169;
  transform: translateY(-2px);
}

.btn-danger {
  background: #f56565;
  color: white;
}

.btn-danger:hover {
  background: #e53e3e;
  transform: translateY(-2px);
}

.grid {
  display: grid;
  gap: 1.5rem;
}

.grid-2 {
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
}

.grid-3 {
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
}

@media (max-width: 768px) {
  .navbar {
    flex-direction: column;
    gap: 1rem;
    padding: 1rem;
  }

  .nav-links {
    flex-wrap: wrap;
    justify-content: center;
  }

  .main-content {
    padding: 1rem;
  }
}
</style>