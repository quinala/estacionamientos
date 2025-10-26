<template>
  <div class="login-page">
    <div class="login-container">
      <div class="login-header">
        <h1>🚗 Sistema de Estacionamiento</h1>
        <p>Inicia sesión para acceder al sistema</p>
      </div>

      <form @submit.prevent="login" class="login-form">
        <div class="form-group">
          <label>Email:</label>
          <input 
            type="email" 
            v-model="credentials.email"
            placeholder="usuario@estacionamiento.com"
            required
          >
        </div>

        <div class="form-group">
          <label>Contraseña:</label>
          <input 
            type="password" 
            v-model="credentials.password"
            placeholder="Ingresa tu contraseña"
            required
          >
        </div>

        <button type="submit" class="login-btn">
          🔑 Iniciar Sesión
        </button>

        <!-- Usuarios de prueba -->
        <div class="test-users">
          <h3>Usuarios de prueba:</h3>
          <div class="user-list">
            <div 
              v-for="user in testUsers" 
              :key="user.email"
              class="test-user"
              @click="fillCredentials(user)"
            >
              <strong>{{ user.role }}</strong>
              <span>{{ user.email }}</span>
              <span>Contraseña: {{ user.password }}</span>
            </div>
          </div>
        </div>
      </form>

      <div class="login-footer">
        <p>Sistema de Gestión de Estacionamiento v1.0</p>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Login',
  data() {
    return {
      credentials: {
        email: '',
        password: ''
      },
      testUsers: [
        {
          email: 'admin@estacionamiento.com',
          password: 'admin123',
          role: 'Administrador'
        },
        {
          email: 'operador@estacionamiento.com',
          password: 'operador123',
          role: 'Operador'
        },
        {
          email: 'supervisor@estacionamiento.com',
          password: 'supervisor123',
          role: 'Supervisor'
        }
      ]
    }
  },
  methods: {
    login() {
      // Verificar credenciales
      const user = this.testUsers.find(u => 
        u.email === this.credentials.email && 
        u.password === this.credentials.password
      )

      if (user) {
        // Guardar sesión
        localStorage.setItem('currentUser', JSON.stringify(user))
        localStorage.setItem('isLoggedIn', 'true')
        
        // Registrar el acceso en el historial
        this.registerAccess(user)
        
        // Redirigir al gestor de usuarios
        this.$router.push('/users')
      } else {
        alert('Credenciales incorrectas. Usa uno de los usuarios de prueba.')
      }
    },

    fillCredentials(user) {
      this.credentials.email = user.email
      this.credentials.password = user.password
    },

    registerAccess(user) {
      // Obtener usuarios existentes o inicializar array
      let users = JSON.parse(localStorage.getItem('parkingUsers')) || []
      
      // Buscar si el usuario ya existe
      let existingUser = users.find(u => u.email === user.email)
      
      if (existingUser) {
        // Actualizar último acceso
        existingUser.lastAccess = new Date()
        existingUser.accessCount = (existingUser.accessCount || 0) + 1
        existingUser.active = true
      } else {
        // Crear nuevo usuario
        const newUser = {
          id: Date.now(),
          name: user.role,
          email: user.email,
          role: user.role,
          active: true,
          registeredAt: new Date(),
          lastAccess: new Date(),
          accessCount: 1
        }
        users.push(newUser)
      }
      
      // Guardar en localStorage
      localStorage.setItem('parkingUsers', JSON.stringify(users))
    }
  },
  mounted() {
    // Si ya está logueado, redirigir al gestor de usuarios
    if (localStorage.getItem('isLoggedIn') === 'true') {
      this.$router.push('/users')
    }
  }
}
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.login-container {
  background: white;
  border-radius: 20px;
  padding: 40px;
  box-shadow: 0 20px 40px rgba(0,0,0,0.1);
  max-width: 450px;
  width: 100%;
}

.login-header {
  text-align: center;
  margin-bottom: 30px;
}

.login-header h1 {
  color: #2d3748;
  margin-bottom: 10px;
  font-size: 2rem;
}

.login-header p {
  color: #718096;
  margin: 0;
}

.login-form {
  space-y: 25px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-group label {
  font-weight: 600;
  color: #4a5568;
  font-size: 0.9rem;
}

.form-group input {
  padding: 15px;
  border: 2px solid #e2e8f0;
  border-radius: 10px;
  font-size: 1rem;
  transition: all 0.3s ease;
}

.form-group input:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.login-btn {
  width: 100%;
  padding: 15px;
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  border: none;
  border-radius: 10px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-top: 10px;
}

.login-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(102, 126, 234, 0.3);
}

/* Usuarios de prueba */
.test-users {
  margin-top: 30px;
  padding-top: 20px;
  border-top: 2px solid #f1f5f9;
}

.test-users h3 {
  color: #4a5568;
  margin-bottom: 15px;
  font-size: 1rem;
  text-align: center;
}

.user-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.test-user {
  background: #f7fafc;
  padding: 12px;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  cursor: pointer;
  transition: all 0.3s ease;
}

.test-user:hover {
  background: #edf2f7;
  transform: translateX(5px);
}

.test-user strong {
  display: block;
  color: #2d3748;
  margin-bottom: 5px;
}

.test-user span {
  display: block;
  color: #718096;
  font-size: 0.85rem;
}

.login-footer {
  text-align: center;
  margin-top: 30px;
  padding-top: 20px;
  border-top: 1px solid #e2e8f0;
}

.login-footer p {
  color: #a0aec0;
  margin: 0;
  font-size: 0.9rem;
}

/* Responsive */
@media (max-width: 480px) {
  .login-container {
    padding: 30px 20px;
  }
  
  .login-header h1 {
    font-size: 1.7rem;
  }
}
</style>