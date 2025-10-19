export class AppError extends Error {
  constructor(message, code = 'APP_ERROR', details = null) {
    super(message)
    this.name = 'AppError'
    this.code = code
    this.details = details
    this.timestamp = new Date().toISOString()
  }
}

export class AuthError extends AppError {
  constructor(message = 'Error de autenticación', details = null) {
    super(message, 'AUTH_ERROR', details)
    this.name = 'AuthError'
  }
}

export class ValidationError extends AppError {
  constructor(message = 'Error de validación', details = null) {
    super(message, 'VALIDATION_ERROR', details)
    this.name = 'ValidationError'
  }
}

export const errorHandler = {
  handle(error, context = '') {
    console.error(`[Error Handler] ${context}:`, error)

    let userMessage = 'Ha ocurrido un error inesperado'
    let type = 'error'

    if (error instanceof AuthError) {
      userMessage = error.message || 'Error de autenticación'
      type = 'warning'
    } else if (error instanceof ValidationError) {
      userMessage = error.message || 'Error de validación'
      type = 'warning'
    } else if (error.message) {
      userMessage = error.message
    }

    return {
      userMessage,
      type,
      originalError: error
    }
  },

  async executeWithHandling(operation, context = '') {
    try {
      return await operation()
    } catch (error) {
      return this.handle(error, context)
    }
  }
}