// Servicio para manejar el almacenamiento local
const STORAGE_KEYS = {
  PARKING_SPOTS: 'parking_spots',
  VEHICLES: 'parking_vehicles',
  TRANSACTIONS: 'parking_transactions'
}

export const storageService = {
  // Obtener datos del localStorage
  getData(key) {
    try {
      const data = localStorage.getItem(key)
      return data ? JSON.parse(data) : null
    } catch (error) {
      console.error('Error al obtener datos:', error)
      return null
    }
  },

  // Guardar datos en localStorage
  setData(key, data) {
    try {
      localStorage.setItem(key, JSON.stringify(data))
      return true
    } catch (error) {
      console.error('Error al guardar datos:', error)
      return false
    }
  },

  // Inicializar datos por defecto
  initializeData() {
    const defaultSpots = Array.from({ length: 20 }, (_, i) => ({
      id: i + 1,
      number: i + 1,
      occupied: false,
      vehicleId: null,
      type: i < 15 ? 'regular' : 'premium',
      hourlyRate: i < 15 ? 5 : 8
    }))

    if (!this.getData(STORAGE_KEYS.PARKING_SPOTS)) {
      this.setData(STORAGE_KEYS.PARKING_SPOTS, defaultSpots)
    }
    if (!this.getData(STORAGE_KEYS.VEHICLES)) {
      this.setData(STORAGE_KEYS.VEHICLES, [])
    }
    if (!this.getData(STORAGE_KEYS.TRANSACTIONS)) {
      this.setData(STORAGE_KEYS.TRANSACTIONS, [])
    }
  }
}

// Inicializar datos al cargar el módulo
storageService.initializeData()

export { STORAGE_KEYS }