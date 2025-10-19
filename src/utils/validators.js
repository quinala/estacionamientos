export const validators = {
  email: (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!email) return 'El email es requerido'
    if (!emailRegex.test(email)) return 'El formato del email es inválido'
    return null
  },

  password: (password) => {
    if (!password) return 'La contraseña es requerida'
    if (password.length < 6) return 'La contraseña debe tener al menos 6 caracteres'
    return null
  },

  name: (name) => {
    if (!name) return 'El nombre es requerido'
    if (name.length < 2) return 'El nombre debe tener al menos 2 caracteres'
    return null
  },

  licensePlate: (plate) => {
    if (!plate) return 'La placa es requerida'
    if (plate.length < 4) return 'La placa debe tener al menos 4 caracteres'
    return null
  }
}

export const validateForm = (fields, values) => {
  const errors = {}
  
  for (const field of fields) {
    const validator = validators[field.validator]
    if (validator) {
      const error = validator(values[field.name])
      if (error) {
        errors[field.name] = error
      }
    }
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  }
}