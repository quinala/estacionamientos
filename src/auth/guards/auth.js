import { authService } from '../services/auth.js'
import { errorHandler } from '../../middleware/errorHandler.js'

export const authGuard = {
  // Verificar si el usuario está autenticado
  checkAuth() {
    return errorHandler.executeWithHandling(
      () => {
        const user = authService.checkAuth()
        if (!user) {
          throw new Error('No autenticado')
        }
        return user
      },
      'Verificación de autenticación'
    )
  },

  // Verificar roles requeridos
  checkRole(requiredRole) {
    return errorHandler.executeWithHandling(
      () => {
        const user = authService.checkAuth()
        if (!user) {
          throw new Error('No autenticado')
        }

        if (requiredRole && user.role !== requiredRole && user.role !== 'admin') {
          throw new Error('No tienes permisos para esta acción')
        }

        return user
      },
      'Verificación de rol'
    )
  },

  // Middleware para Vue Router
  requireAuth(to, from, next) {
    const result = authGuard.checkAuth()
    if (result.userMessage) {
      next('/login')
    } else {
      next()
    }
  },

  // Redirigir si ya está autenticado
  redirectIfAuth(to, from, next) {
    const user = authService.checkAuth()
    if (user) {
      next('/')
    } else {
      next()
    }
  }
}