<template>
  <div class="login-form">
    <div class="auth-card">
      <div class="auth-header">
        <h2>Iniciar Sesión</h2>
        <p>Bienvenido al Sistema de Estacionamiento</p>
      </div>

      <form @submit.prevent="handleLogin" class="auth-form">
        <div class="form-group">
          <label for="email">Email</label>
          <input
            type="email"
            id="email"
            v-model="form.email"
            :class="{ 'error': errors.email }"
            placeholder="tu@email.com"
            @blur="validateField('email')"
          >
          <span v-if="errors.email" class="error-message">{{ errors.email }}</span>
        </div>

        <div class="form-group">
          <label for="password">Contraseña</label>
          <input
            type="password"
            id="password"
            v-model="form.password"
            :class="{ 'error': errors.password }"
            placeholder="••••••••"
            @blur="validateField('password')"
          >
          <span v-if="errors.password" class="error-message">{{ errors.password }}</span>
        </div>

        <button 
          type="submit" 
          class="btn btn-primary auth-btn"
          :disabled="loading"
        >
          <span v-if="loading">Iniciando sesión...</span>
          <span v-else>Iniciar Sesión</span>
        </button>

        <div class="auth-links">
          <p>¿No tienes cuenta? <router-link to="/register">Regístrate aquí</router-link></p>
        </div>
      </form>

      <!-- Demo Credentials -->
      <div class="demo-credentials">
        <h4>Credenciales de Demo:</h4>
        <div class="credential-item">
          <strong>Admin:</strong> admin@estacionamiento.com / admin123
        </div>
        <div class="credential-item">
          <strong>Operador:</strong> operador@estacionamiento.com / operador123
        </div>
      </div>
    </div>

    <!-- Notificación -->
    <div v-if="notification.message" class="notification" :class="notification.type">
      {{ notification.message }}
    </div>
  </div>
</template>

<script>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { authService } from '../services/auth.js'
import { validators } from '../../utils/validators.js'
import { errorHandler } from '../../middleware/errorHandler.js'

export default {
  name: 'LoginForm',
  setup() {
    const router = useRouter()
    
    const form = reactive({
      email: '',
      password: ''
    })
    
    const errors = reactive({})
    const loading = ref(false)
    const notification = reactive({
      message: '',
      type: ''
    })

    const validateField = (fieldName) => {
      const validator = validators[fieldName]
      if (validator) {
        errors[fieldName] = validator(form[fieldName])
      }
    }

    const showNotification = (message, type = 'error') => {
      notification.message = message
      notification.type = type
      setTimeout(() => {
        notification.message = ''
      }, 5000)
    }

    const handleLogin = async () => {
      try {
        loading.value = true

        // Validar campos
        const emailError = validators.email(form.email)
        const passwordError = validators.password(form.password)

        if (emailError || passwordError) {
          errors.email = emailError
          errors.password = passwordError
          throw new Error('Por favor corrige los errores del formulario')
        }

        // Intentar login
        const result = await authService.login(form.email, form.password)
        
        if (result.success) {
          showNotification(`Bienvenido ${result.user.name}`, 'success')
          setTimeout(() => {
            router.push('/')
          }, 1000)
        }
      } catch (error) {
        const handledError = errorHandler.handle(error, 'Login')
        showNotification(handledError.userMessage, handledError.type)
      } finally {
        loading.value = false
      }
    }

    return {
      form,
      errors,
      loading,
      notification,
      validateField,
      handleLogin
    }
  }
}
</script>

<style scoped>
.login-form {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 2rem;
}

.auth-card {
  background: white;
  border-radius: 15px;
  padding: 2.5rem;
  box-shadow: 0 20px 40px rgba(0,0,0,0.1);
  width: 100%;
  max-width: 400px;
}

.auth-header {
  text-align: center;
  margin-bottom: 2rem;
}

.auth-header h2 {
  color: #2d3748;
  margin-bottom: 0.5rem;
}

.auth-header p {
  color: #718096;
}

.auth-form {
  space-y: 1.5rem;
}

.form-group {
  space-y: 0.5rem;
}

.form-group label {
  display: block;
  font-weight: 600;
  color: #4a5568;
  margin-bottom: 0.5rem;
}

.form-group input {
  width: 100%;
  padding: 0.75rem 1rem;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  font-size: 1rem;
  transition: all 0.3s;
}

.form-group input:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.form-group input.error {
  border-color: #f56565;
}

.error-message {
  color: #f56565;
  font-size: 0.875rem;
  display: block;
}

.auth-btn {
  width: 100%;
  padding: 0.875rem;
  font-size: 1.1rem;
  margin-top: 1rem;
}

.auth-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.auth-links {
  text-align: center;
  margin-top: 1.5rem;
  padding-top: 1.5rem;
  border-top: 1px solid #e2e8f0;
}

.auth-links a {
  color: #667eea;
  text-decoration: none;
  font-weight: 600;
}

.auth-links a:hover {
  text-decoration: underline;
}

.demo-credentials {
  margin-top: 2rem;
  padding: 1.5rem;
  background: #f7fafc;
  border-radius: 8px;
  border-left: 4px solid #667eea;
}

.demo-credentials h4 {
  color: #2d3748;
  margin-bottom: 0.75rem;
  font-size: 0.9rem;
}

.credential-item {
  font-size: 0.8rem;
  color: #4a5568;
  margin-bottom: 0.5rem;
}

.credential-item strong {
  color: #2d3748;
}

.notification {
  position: fixed;
  top: 20px;
  right: 20px;
  padding: 1rem 1.5rem;
  border-radius: 8px;
  color: white;
  font-weight: 600;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  z-index: 1000;
  max-width: 300px;
}

.notification.error {
  background: #f56565;
}

.notification.success {
  background: #48bb78;
}

.notification.warning {
  background: #ed8936;
}

@media (max-width: 480px) {
  .auth-card {
    padding: 2rem 1.5rem;
  }
  
  .login-form {
    padding: 1rem;
  }
}
</style>