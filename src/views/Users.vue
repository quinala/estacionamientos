<template>
  <div class="users-page">
    <div class="header">
      <h1>👥 Gestor de Usuarios</h1>
      <p>Usuarios registrados en el sistema</p>
    </div>

    <!-- Estadísticas -->
    <div class="stats">
      <div class="stat-card">
        <div class="stat-number">{{ users.length }}</div>
        <div class="stat-label">Total Registrados</div>
      </div>
      <div class="stat-card active">
        <div class="stat-number">{{ activeUsers }}</div>
        <div class="stat-label">Activos</div>
      </div>
      <div class="stat-card inactive">
        <div class="stat-number">{{ inactiveUsers }}</div>
        <div class="stat-label">Inactivos</div>
      </div>
    </div>

    <!-- Navegación -->
    <div class="navigation">
      <router-link to="/reports" class="nav-btn">
        📊 Ver Reportes
      </router-link>
      <button @click="showRegisterForm = true" class="nav-btn register">
        ➕ Registrar Nuevo Usuario
      </button>
    </div>

    <!-- Formulario de Registro -->
    <div v-if="showRegisterForm" class="modal-overlay">
      <div class="modal-content">
        <div class="modal-header">
          <h3>📝 Registrar Nuevo Usuario</h3>
          <button @click="showRegisterForm = false" class="close-btn">×</button>
        </div>
        <div class="modal-body">
          <form @submit.prevent="registerUser" class="register-form">
            <div class="form-group">
              <label>Nombre completo:</label>
              <input 
                type="text" 
                v-model="newUser.name"
                placeholder="Ej: Juan Pérez"
                required
              >
            </div>
            <div class="form-group">
              <label>Email:</label>
              <input 
                type="email" 
                v-model="newUser.email"
                placeholder="Ej: usuario@estacionamiento.com"
                required
              >
            </div>
            <div class="form-group">
              <label>Rol:</label>
              <select v-model="newUser.role" required>
                <option value="Operador">Operador</option>
                <option value="Administrador">Administrador</option>
                <option value="Supervisor">Supervisor</option>
                <option value="Ayudante">Ayudante</option>
              </select>
            </div>
            <div class="form-group">
              <label>Estado inicial:</label>
              <select v-model="newUser.active">
                <option :value="true">Activo</option>
                <option :value="false">Inactivo</option>
              </select>
            </div>
          </form>
        </div>
        <div class="modal-footer">
          <button @click="showRegisterForm = false" class="btn btn-cancel">
            Cancelar
          </button>
          <button @click="registerUser" class="btn btn-primary">
            Registrar Usuario
          </button>
        </div>
      </div>
    </div>

    <!-- Lista de Usuarios Registrados -->
    <div class="users-container">
      <h2>Usuarios Registrados en el Sistema</h2>
      
      <div class="users-list">
        <div 
          v-for="user in users" 
          :key="user.id"
          class="user-card"
          :class="{ 'active': user.active, 'inactive': !user.active }"
        >
          <div class="user-avatar">
            {{ user.name.charAt(0) }}
          </div>
          
          <div class="user-info">
            <h3>{{ user.name }}</h3>
            <p class="user-email">{{ user.email }}</p>
            <div class="user-details">
              <span class="user-role">{{ user.role }}</span>
              <span class="user-date">Registrado: {{ formatDate(user.registeredAt) }}</span>
            </div>
          </div>

          <div class="user-status">
            <span class="status-badge" :class="user.active ? 'active' : 'inactive'">
              {{ user.active ? '🟢 ACTIVO' : '🔴 INACTIVO' }}
            </span>
          </div>

          <div class="user-actions">
            <button 
              @click="toggleUser(user)"
              class="btn-toggle"
              :class="user.active ? 'deactivate' : 'activate'"
            >
              {{ user.active ? '⏸️ Desactivar' : '▶️ Activar' }}
            </button>
            <button 
              @click="deleteUser(user)"
              class="btn-delete"
              title="Eliminar usuario"
            >
              🗑️
            </button>
          </div>
        </div>
      </div>

      <!-- Mensaje si no hay usuarios -->
      <div v-if="users.length === 0" class="empty-state">
        <div class="empty-icon">👥</div>
        <h3>No hay usuarios registrados</h3>
        <p>Registra el primer usuario usando el botón arriba</p>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Users',
  data() {
    return {
      showRegisterForm: false,
      newUser: {
        name: '',
        email: '',
        role: 'Operador',
        active: true
      },
      // Cargar usuarios desde localStorage o usar datos por defecto
      users: JSON.parse(localStorage.getItem('parkingUsers')) || [
        {
          id: 1,
          name: 'Administrador Principal',
          email: 'admin@estacionamiento.com',
          role: 'Administrador',
          active: true,
          registeredAt: new Date('2024-01-01')
        }
      ]
    }
  },
  computed: {
    activeUsers() {
      return this.users.filter(user => user.active).length
    },
    inactiveUsers() {
      return this.users.filter(user => !user.active).length
    }
  },
  methods: {
    registerUser() {
      if (!this.newUser.name || !this.newUser.email) {
        alert('Por favor completa todos los campos')
        return
      }

      // Verificar si el email ya existe
      if (this.users.some(user => user.email === this.newUser.email)) {
        alert('Este email ya está registrado')
        return
      }

      // Crear nuevo usuario
      const user = {
        id: Date.now(), // ID único basado en timestamp
        name: this.newUser.name,
        email: this.newUser.email,
        role: this.newUser.role,
        active: this.newUser.active,
        registeredAt: new Date()
      }

      // Agregar a la lista
      this.users.push(user)
      
      // Guardar en localStorage
      this.saveUsers()
      
      // Limpiar formulario y cerrar modal
      this.newUser = { name: '', email: '', role: 'Operador', active: true }
      this.showRegisterForm = false
      
      alert(`Usuario ${user.name} registrado exitosamente!`)

      
    },

    toggleUser(user) {
      user.active = !user.active
      this.saveUsers()
      
      const action = user.active ? 'activado' : 'desactivado'
      console.log(`Usuario ${user.name} ${action}`)
    },

    deleteUser(user) {
      if (confirm(`¿Estás seguro de eliminar a ${user.name}?`)) {
        this.users = this.users.filter(u => u.id !== user.id)
        this.saveUsers()
        alert('Usuario eliminado correctamente')
      }
    },

    saveUsers() {
      localStorage.setItem('parkingUsers', JSON.stringify(this.users))
    },

    formatDate(date) {
      return new Date(date).toLocaleDateString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      })
    }
  },
  mounted() {
    console.log('Gestor de usuarios cargado. Total:', this.users.length)
  }
}
</script>

<style scoped>
.users-page {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
  min-height: 100vh;
  background: #f8f9fa;
}

.header {
  text-align: center;
  margin-bottom: 30px;
  padding: 30px;
  background: white;
  border-radius: 15px;
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
}

.header h1 {
  color: #2d3748;
  margin-bottom: 10px;
  font-size: 2.5rem;
}

.header p {
  color: #718096;
  font-size: 1.2rem;
  margin: 0;
}

/* Estadísticas */
.stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
  margin-bottom: 30px;
}

.stat-card {
  background: white;
  padding: 30px;
  border-radius: 15px;
  text-align: center;
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
  border: 3px solid #e2e8f0;
  transition: transform 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-5px);
}

.stat-card.active {
  border-color: #48bb78;
  background: linear-gradient(135deg, #f0fff4, #ffffff);
}

.stat-card.inactive {
  border-color: #f56565;
  background: linear-gradient(135deg, #fff5f5, #ffffff);
}

.stat-number {
  font-size: 3rem;
  font-weight: bold;
  color: #2d3748;
  margin-bottom: 10px;
}

.stat-label {
  color: #718096;
  font-weight: 600;
  font-size: 1.1rem;
}

/* Navegación */
.navigation {
  display: flex;
  gap: 15px;
  margin-bottom: 30px;
  flex-wrap: wrap;
  justify-content: center;
}

.nav-btn {
  padding: 15px 25px;
  background: #667eea;
  color: white;
  text-decoration: none;
  border: none;
  border-radius: 10px;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 6px rgba(102, 126, 234, 0.3);
}

.nav-btn.register {
  background: #48bb78;
}

.nav-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 12px rgba(0,0,0,0.2);
}

/* Modal de registro */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}

.modal-content {
  background: white;
  border-radius: 15px;
  max-width: 500px;
  width: 100%;
  box-shadow: 0 10px 25px rgba(0,0,0,0.2);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 25px;
  border-bottom: 2px solid #f1f5f9;
}

.modal-header h3 {
  margin: 0;
  color: #2d3748;
}

.close-btn {
  background: none;
  border: none;
  font-size: 2rem;
  cursor: pointer;
  color: #718096;
  padding: 0;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-btn:hover {
  color: #2d3748;
}

.modal-body {
  padding: 25px;
}

.modal-footer {
  padding: 20px 25px;
  border-top: 2px solid #f1f5f9;
  display: flex;
  gap: 15px;
  justify-content: flex-end;
}

/* Formulario */
.register-form {
  space-y: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-group label {
  font-weight: 600;
  color: #4a5568;
}

.form-group input,
.form-group select {
  padding: 12px;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  font-size: 1rem;
}

.form-group input:focus,
.form-group select:focus {
  outline: none;
  border-color: #667eea;
}

/* Botones */
.btn {
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-cancel {
  background: #a0aec0;
  color: white;
}

.btn-cancel:hover {
  background: #718096;
}

.btn-primary {
  background: #667eea;
  color: white;
}

.btn-primary:hover {
  background: #5a6fd8;
}

/* Lista de usuarios */
.users-container {
  background: white;
  border-radius: 15px;
  padding: 30px;
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
}

.users-container h2 {
  color: #2d3748;
  margin-bottom: 25px;
  text-align: center;
  font-size: 1.8rem;
}

.users-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.user-card {
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 25px;
  border-radius: 12px;
  border: 3px solid #f1f5f9;
  transition: all 0.3s ease;
  background: white;
}

.user-card.active {
  border-color: #48bb78;
  background: linear-gradient(135deg, #f0fff4, #ffffff);
}

.user-card.inactive {
  border-color: #fed7d7;
  background: linear-gradient(135deg, #fff5f5, #ffffff);
  opacity: 0.8;
}

.user-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 20px rgba(0,0,0,0.15);
}

.user-avatar {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 1.5rem;
  flex-shrink: 0;
  box-shadow: 0 4px 8px rgba(0,0,0,0.2);
}

.user-info {
  flex: 1;
}

.user-info h3 {
  margin: 0 0 8px 0;
  color: #2d3748;
  font-size: 1.3rem;
}

.user-email {
  margin: 0 0 12px 0;
  color: #718096;
  font-size: 1rem;
}

.user-details {
  display: flex;
  gap: 15px;
  flex-wrap: wrap;
}

.user-role {
  background: #e2e8f0;
  color: #4a5568;
  padding: 6px 12px;
  border-radius: 15px;
  font-size: 0.85rem;
  font-weight: 600;
  text-transform: uppercase;
}

.user-date {
  color: #a0aec0;
  font-size: 0.85rem;
}

.user-status {
  margin-right: 20px;
}

.status-badge {
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 0.9rem;
  font-weight: bold;
  text-transform: uppercase;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.status-badge.active {
  background: #c6f6d5;
  color: #276749;
  border: 2px solid #48bb78;
}

.status-badge.inactive {
  background: #fed7d7;
  color: #c53030;
  border: 2px solid #f56565;
}

.user-actions {
  display: flex;
  gap: 10px;
  flex-shrink: 0;
}

.btn-toggle {
  padding: 12px 20px;
  border: none;
  border-radius: 10px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 1rem;
  min-width: 140px;
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
}

.btn-toggle.activate {
  background: linear-gradient(135deg, #48bb78, #38a169);
  color: white;
}

.btn-toggle.activate:hover {
  background: linear-gradient(135deg, #38a169, #2f855a);
  transform: translateY(-2px);
  box-shadow: 0 6px 12px rgba(72, 187, 120, 0.3);
}

.btn-toggle.deactivate {
  background: linear-gradient(135deg, #f56565, #e53e3e);
  color: white;
}

.btn-toggle.deactivate:hover {
  background: linear-gradient(135deg, #e53e3e, #c53030);
  transform: translateY(-2px);
  box-shadow: 0 6px 12px rgba(245, 101, 101, 0.3);
}

.btn-delete {
  padding: 12px;
  background: #fed7d7;
  color: #c53030;
  border: 2px solid #fed7d7;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 1.2rem;
}

.btn-delete:hover {
  background: #feb2b2;
  border-color: #feb2b2;
  transform: scale(1.1);
}

/* Estado vacío */
.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: #718096;
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: 20px;
}

.empty-state h3 {
  margin: 0 0 10px 0;
  color: #4a5568;
}

.empty-state p {
  margin: 0;
}

/* Responsive */
@media (max-width: 768px) {
  .users-page {
    padding: 15px;
  }
  
  .header h1 {
    font-size: 2rem;
  }
  
  .stats {
    grid-template-columns: 1fr;
    gap: 15px;
  }
  
  .navigation {
    flex-direction: column;
  }
  
  .nav-btn {
    text-align: center;
  }
  
  .user-card {
    flex-direction: column;
    text-align: center;
    gap: 15px;
    padding: 20px;
  }
  
  .user-status {
    margin-right: 0;
  }
  
  .user-actions {
    width: 100%;
    justify-content: center;
  }
  
  .btn-toggle {
    width: 100%;
  }
  
  .modal-content {
    margin: 10px;
  }
}

@media (max-width: 480px) {
  .header h1 {
    font-size: 1.8rem;
  }
  
  .stat-number {
    font-size: 2.5rem;
  }
  
  .users-container {
    padding: 20px 15px;
  }
}
</style>