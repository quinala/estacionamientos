import { storageService } from '../../services/storage.js'

const STORAGE_KEYS = {
  USERS: 'parking_users',
  CURRENT_USER: 'parking_current_user',
  SESSIONS: 'parking_sessions'
}

export const authService = {
  // Inicializar datos de usuarios por defecto
  initializeAuth() {
    const defaultUsers = [
      {
        id: 1,
        email: 'admin@estacionamiento.com',
        password: this.hashPassword('admin123'),
        name: 'Administrador',
        role: 'admin',
        createdAt: new Date().toISOString(),
        isActive: true
      },
      {
        id: 2,
        email: 'operador@estacionamiento.com',
        password: this.hashPassword('operador123'),
        name: 'Operador',
        role: 'operator',
        createdAt: new Date().toISOString(),
        isActive: true
      }
    ]

    if (!storageService.getData(STORAGE_KEYS.USERS)) {
      storageService.setData(STORAGE_KEYS.USERS, defaultUsers)
    }
    if (!storageService.getData(STORAGE_KEYS.SESSIONS)) {
      storageService.setData(STORAGE_KEYS.SESSIONS, [])
    }
  },

  // Hash simple de contraseña
  hashPassword(password) {
    let hash = 0
    for (let i = 0; i < password.length; i++) {
      const char = password.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash
    }
    return hash.toString()
  },

  // Validar contraseña
  validatePassword(password, hashedPassword) {
    return this.hashPassword(password) === hashedPassword
  },

  // Registrar nuevo usuario
  async register(userData) {
    try {
      const users = storageService.getData(STORAGE_KEYS.USERS) || []
      
      // Validar que el email no exista
      const existingUser = users.find(user => user.email === userData.email)
      if (existingUser) {
        throw new Error('El email ya está registrado')
      }

      const newUser = {
        id: Date.now(),
        ...userData,
        password: this.hashPassword(userData.password),
        role: 'operator',
        createdAt: new Date().toISOString(),
        isActive: true
      }

      users.push(newUser)
      storageService.setData(STORAGE_KEYS.USERS, users)

      return {
        success: true,
        user: {
          id: newUser.id,
          email: newUser.email,
          name: newUser.name,
          role: newUser.role
        }
      }
    } catch (error) {
      throw new Error(`Error en registro: ${error.message}`)
    }
  },

  // Iniciar sesión
  async login(email, password) {
    try {
      const users = storageService.getData(STORAGE_KEYS.USERS) || []
      const sessions = storageService.getData(STORAGE_KEYS.SESSIONS) || []
      
      const user = users.find(u => u.email === email && u.isActive)
      if (!user) {
        throw new Error('Usuario no encontrado')
      }

      if (!this.validatePassword(password, user.password)) {
        throw new Error('Contraseña incorrecta')
      }

      const session = {
        id: Date.now().toString(),
        userId: user.id,
        token: this.generateToken(),
        createdAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
      }

      sessions.push(session)
      storageService.setData(STORAGE_KEYS.SESSIONS, sessions)

      const currentUser = {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        token: session.token
      }
      storageService.setData(STORAGE_KEYS.CURRENT_USER, currentUser)

      return {
        success: true,
        user: currentUser,
        token: session.token
      }
    } catch (error) {
      throw new Error(`Error en login: ${error.message}`)
    }
  },

  // Cerrar sesión
  logout() {
    try {
      const sessions = storageService.getData(STORAGE_KEYS.SESSIONS) || []
      const currentUser = storageService.getData(STORAGE_KEYS.CURRENT_USER)
      
      if (currentUser) {
        const updatedSessions = sessions.filter(s => s.token !== currentUser.token)
        storageService.setData(STORAGE_KEYS.SESSIONS, updatedSessions)
      }

      storageService.setData(STORAGE_KEYS.CURRENT_USER, null)
      
      return { success: true }
    } catch (error) {
      throw new Error(`Error en logout: ${error.message}`)
    }
  },

  // Verificar sesión activa
  checkAuth() {
    try {
      const currentUser = storageService.getData(STORAGE_KEYS.CURRENT_USER)
      const sessions = storageService.getData(STORAGE_KEYS.SESSIONS) || []

      if (!currentUser || !currentUser.token) {
        return null
      }

      const session = sessions.find(s => 
        s.token === currentUser.token && 
        new Date(s.expiresAt) > new Date()
      )

      if (!session) {
        this.logout()
        return null
      }

      return currentUser
    } catch (error) {
      console.error('Error verificando autenticación:', error)
      return null
    }
  },

  // Generar token
  generateToken() {
    return 'token_' + Math.random().toString(36).substr(2) + Date.now().toString(36)
  },

  // Obtener usuario actual
  getCurrentUser() {
    return storageService.getData(STORAGE_KEYS.CURRENT_USER)
  }
}

authService.initializeAuth()