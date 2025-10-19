import { defineStore } from 'pinia'
import { storageService, STORAGE_KEYS } from '../services/storage.js'
import { authService } from '../auth/services/auth.js'
import { errorHandler } from '../middleware/errorHandler.js'

export const useParkingStore = defineStore('parking', {
  state: () => ({
    spots: [],
    vehicles: [],
    transactions: [],
    tickets: [], // NUEVO: Array para almacenar tickets
    currentUser: null
  }),

  actions: {
    // Cargar datos del almacenamiento local
    loadData() {
      try {
        this.spots = storageService.getData(STORAGE_KEYS.PARKING_SPOTS) || []
        this.vehicles = storageService.getData(STORAGE_KEYS.VEHICLES) || []
        this.transactions = storageService.getData(STORAGE_KEYS.TRANSACTIONS) || []
        this.tickets = storageService.getData(STORAGE_KEYS.TICKETS) || [] // NUEVO
        this.currentUser = authService.getCurrentUser()
      } catch (error) {
        errorHandler.handle(error, 'Cargando datos')
      }
    },

    // Guardar datos en el almacenamiento local
    saveData() {
      try {
        storageService.setData(STORAGE_KEYS.PARKING_SPOTS, this.spots)
        storageService.setData(STORAGE_KEYS.VEHICLES, this.vehicles)
        storageService.setData(STORAGE_KEYS.TRANSACTIONS, this.transactions)
        storageService.setData(STORAGE_KEYS.TICKETS, this.tickets) // NUEVO
      } catch (error) {
        errorHandler.handle(error, 'Guardando datos')
      }
    },

    // Ocupar un espacio de estacionamiento
    occupySpot(spotId, vehicleData) {
      try {
        const spot = this.spots.find(s => s.id === spotId)
        if (spot && !spot.occupied) {
          const vehicle = {
            id: Date.now().toString(),
            licensePlate: vehicleData.licensePlate,
            type: vehicleData.type,
            entryTime: new Date().toISOString(),
            spotId: spotId,
            registeredBy: this.currentUser?.id || 'system'
          }

          spot.occupied = true
          spot.vehicleId = vehicle.id
          this.vehicles.push(vehicle)
          
          // NUEVO: Generar ticket de entrada automáticamente
          this.generateEntryTicket(spotId, vehicleData)
          
          this.saveData()
          return true
        }
        return false
      } catch (error) {
        errorHandler.handle(error, 'Ocupando espacio')
        return false
      }
    },

    // Liberar un espacio de estacionamiento
    freeSpot(spotId) {
      try {
        const spot = this.spots.find(s => s.id === spotId)
        if (spot && spot.occupied) {
          const vehicle = this.vehicles.find(v => v.id === spot.vehicleId)
          if (vehicle) {
            const exitTime = new Date().toISOString()
            const entryTime = new Date(vehicle.entryTime)
            const hours = Math.ceil((new Date(exitTime) - entryTime) / (1000 * 60 * 60))
            const amount = hours * spot.hourlyRate

            const transaction = {
              id: Date.now().toString(),
              vehicleId: vehicle.id,
              licensePlate: vehicle.licensePlate,
              spotId: spotId,
              entryTime: vehicle.entryTime,
              exitTime: exitTime,
              hours: hours,
              amount: amount,
              paid: false,
              processedBy: this.currentUser?.id || 'system'
            }

            this.transactions.push(transaction)
            this.vehicles = this.vehicles.filter(v => v.id !== vehicle.id)
          }

          spot.occupied = false
          spot.vehicleId = null
          this.saveData()
          return true
        }
        return false
      } catch (error) {
        errorHandler.handle(error, 'Liberando espacio')
        return false
      }
    },

    // Marcar transacción como pagada
    markAsPaid(transactionId) {
      try {
        const transaction = this.transactions.find(t => t.id === transactionId)
        if (transaction) {
          transaction.paid = true
          transaction.paidAt = new Date().toISOString()
          transaction.paidBy = this.currentUser?.id || 'system'
          
          // NUEVO: Generar ticket de salida automáticamente
          this.generateExitTicket(transactionId)
          
          this.saveData()
          return true
        }
        return false
      } catch (error) {
        errorHandler.handle(error, 'Marcando pago')
        return false
      }
    },

    // NUEVO: Generar ticket de entrada
    generateEntryTicket(spotId, vehicleData) {
      try {
        const spot = this.spots.find(s => s.id === spotId)
        if (!spot) {
          throw new Error('Espacio no encontrado')
        }

        const ticketId = `TKT-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`.toUpperCase()
        
        const ticket = {
          id: ticketId,
          type: 'entry',
          licensePlate: vehicleData.licensePlate,
          vehicleType: vehicleData.type,
          spotId: spotId,
          spotNumber: spot.number,
          entryTime: new Date().toISOString(),
          amount: 0,
          status: 'active',
          generatedBy: this.currentUser?.id || 'system',
          barcode: this.generateBarcode(ticketId)
        }

        this.tickets.unshift(ticket)
        return ticket
      } catch (error) {
        errorHandler.handle(error, 'Generando ticket de entrada')
        return null
      }
    },

    // NUEVO: Generar ticket de salida/pago
    generateExitTicket(transactionId) {
      try {
        const transaction = this.transactions.find(t => t.id === transactionId)
        if (!transaction) {
          throw new Error('Transacción no encontrada')
        }

        const spot = this.spots.find(s => s.id === transaction.spotId)
        const entryTicket = this.tickets.find(t => 
          t.licensePlate === transaction.licensePlate && 
          t.type === 'entry' && 
          t.status === 'active'
        )

        const ticketId = `TKT-EXIT-${Date.now()}`.toUpperCase()
        
        const ticket = {
          id: ticketId,
          type: 'exit',
          licensePlate: transaction.licensePlate,
          vehicleType: this.getVehicleType(transaction.vehicleId),
          spotId: transaction.spotId,
          spotNumber: spot?.number || 'N/A',
          entryTime: transaction.entryTime,
          exitTime: transaction.exitTime,
          hours: transaction.hours,
          amount: transaction.amount,
          status: 'completed',
          generatedBy: this.currentUser?.id || 'system',
          barcode: this.generateBarcode(ticketId),
          transactionId: transactionId
        }

        // Marcar ticket de entrada como completado
        if (entryTicket) {
          entryTicket.status = 'completed'
          entryTicket.exitTime = transaction.exitTime
        }

        this.tickets.unshift(ticket)
        return ticket
      } catch (error) {
        errorHandler.handle(error, 'Generando ticket de salida')
        return null
      }
    },

    // NUEVO: Obtener tipo de vehículo
    getVehicleType(vehicleId) {
      const vehicle = this.vehicles.find(v => v.id === vehicleId)
      return vehicle?.type || 'car'
    },

    // NUEVO: Generar código de barras simple
    generateBarcode(ticketId) {
      return ticketId.split('').map(char => {
        if (char === '-') return ' '
        return '█'
      }).join('')
    },

    // NUEVO: Obtener ticket por ID
    getTicketById(ticketId) {
      return this.tickets.find(ticket => ticket.id === ticketId)
    },

    // NUEVO: Obtener tickets activos
    getActiveTickets() {
      return this.tickets.filter(ticket => ticket.status === 'active')
    },

    // NUEVO: Obtener tickets completados
    getCompletedTickets() {
      return this.tickets.filter(ticket => ticket.status === 'completed')
    },

    // Actualizar usuario actual
    setCurrentUser(user) {
      this.currentUser = user
    }
  },

  getters: {
    // Getters básicos existentes
    occupiedSpots: (state) => state.spots.filter(spot => spot.occupied),
    availableSpots: (state) => state.spots.filter(spot => !spot.occupied),
    
    stats: (state) => {
      const totalSpots = state.spots.length
      const occupiedSpots = state.spots.filter(spot => spot.occupied).length
      const availableSpots = totalSpots - occupiedSpots
      const totalRevenue = state.transactions
        .filter(t => t.paid)
        .reduce((sum, t) => sum + t.amount, 0)
      
      return {
        totalSpots,
        occupiedSpots,
        availableSpots,
        totalRevenue
      }
    },
    
    todayTransactions: (state) => {
      const today = new Date().toDateString()
      return state.transactions.filter(t => 
        new Date(t.entryTime).toDateString() === today
      )
    },
    
    isAdmin: (state) => state.currentUser?.role === 'admin',
    isOperator: (state) => state.currentUser?.role === 'operator',

    // ========== NUEVOS GETTERS PARA TICKETS ==========
    
    // Tickets activos (entrada sin salida)
    activeTickets: (state) => {
      return state.tickets.filter(ticket => 
        ticket.type === 'entry' && ticket.status === 'active'
      )
    },

    // Tickets completados
    completedTickets: (state) => {
      return state.tickets.filter(ticket => ticket.status === 'completed')
    },

    // Tickets de entrada
    entryTickets: (state) => {
      return state.tickets.filter(ticket => ticket.type === 'entry')
    },

    // Tickets de salida
    exitTickets: (state) => {
      return state.tickets.filter(ticket => ticket.type === 'exit')
    },

    // Tickets recientes (últimos 10)
    recentTickets: (state) => {
      return state.tickets
        .sort((a, b) => new Date(b.entryTime) - new Date(a.entryTime))
        .slice(0, 10)
    },

    // ========== ESTADÍSTICAS AVANZADAS ==========
    
    // Métricas principales avanzadas
    advancedMetrics: (state) => {
      const transactions = state.transactions
      const paidTransactions = transactions.filter(t => t.paid)
      
      // Ingresos totales
      const totalRevenue = paidTransactions.reduce((sum, t) => sum + t.amount, 0)
      
      // Tiempo promedio de estadía
      const totalHours = transactions.reduce((sum, t) => sum + t.hours, 0)
      const avgStayTime = transactions.length > 0 ? (totalHours / transactions.length).toFixed(1) : 0
      
      // Tasa de ocupación promedio (simulada para 30 días)
      const totalSpotDays = state.spots.length * 30
      const occupiedSpotDays = transactions.reduce((sum, t) => sum + t.hours / 24, 0)
      const occupancyRate = totalSpotDays > 0 ? ((occupiedSpotDays / totalSpotDays) * 100).toFixed(1) : 0
      
      // Ingresos promedio por vehículo
      const avgRevenuePerVehicle = paidTransactions.length > 0 ? 
        (totalRevenue / paidTransactions.length).toFixed(2) : 0

      return {
        totalRevenue,
        totalVehicles: transactions.length,
        avgStayTime: parseFloat(avgStayTime),
        occupancyRate: parseFloat(occupancyRate),
        avgRevenuePerVehicle: parseFloat(avgRevenuePerVehicle),
        paidTransactions: paidTransactions.length,
        pendingPayments: transactions.filter(t => !t.paid).length
      }
    },

    // Ingresos por día (últimos 7 días)
    revenueByDay: (state) => {
      const days = {}
      const transactions = state.transactions.filter(t => t.paid)
      
      // Últimos 7 días
      for (let i = 6; i >= 0; i--) {
        const date = new Date()
        date.setDate(date.getDate() - i)
        const dateKey = date.toISOString().split('T')[0]
        days[dateKey] = 0
      }
      
      transactions.forEach(transaction => {
        const date = new Date(transaction.entryTime).toISOString().split('T')[0]
        if (days[date] !== undefined) {
          days[date] += transaction.amount
        }
      })
      
      return Object.entries(days).map(([date, amount]) => ({
        date,
        label: new Date(date).toLocaleDateString('es-ES', {
          weekday: 'short',
          month: 'short',
          day: 'numeric'
        }),
        amount: Math.round(amount)
      }))
    },

    // Distribución por horas del día
    hourlyDistribution: (state) => {
      const hoursCount = Array(24).fill(0).map((_, i) => ({ 
        hour: i, 
        count: 0,
        revenue: 0 
      }))
      
      state.transactions.forEach(transaction => {
        const hour = new Date(transaction.entryTime).getHours()
        hoursCount[hour].count++
        if (transaction.paid) {
          hoursCount[hour].revenue += transaction.amount
        }
      })
      
      return hoursCount
    },

    // Horas pico (top 8)
    peakHours: (state) => {
      const distribution = state.hourlyDistribution
      return distribution
        .filter(h => h.count > 0)
        .sort((a, b) => b.count - a.count)
        .slice(0, 8)
        .map(hour => ({
          hour: hour.hour,
          count: hour.count,
          revenue: Math.round(hour.revenue)
        }))
    },

    // Distribución por tipo de vehículo
    vehicleTypeDistribution: (state) => {
      const distribution = {
        car: { count: 0, revenue: 0 },
        motorcycle: { count: 0, revenue: 0 },
        truck: { count: 0, revenue: 0 }
      }
      
      state.transactions.forEach(transaction => {
        const vehicle = state.vehicles.find(v => v.id === transaction.vehicleId)
        if (vehicle && distribution[vehicle.type]) {
          distribution[vehicle.type].count++
          if (transaction.paid) {
            distribution[vehicle.type].revenue += transaction.amount
          }
        }
      })
      
      const total = Object.values(distribution).reduce((sum, data) => sum + data.count, 0)
      const colors = ['#667eea', '#ed8936', '#48bb78']
      
      return Object.entries(distribution)
        .map(([type, data], index) => {
          const percentage = total > 0 ? ((data.count / total) * 100).toFixed(1) : 0
          return {
            type: type === 'car' ? 'Automóvil' : type === 'motorcycle' ? 'Motocicleta' : 'Camión',
            count: data.count,
            revenue: Math.round(data.revenue),
            percentage: parseFloat(percentage),
            color: colors[index]
          }
        })
        .filter(item => item.count > 0)
    },

    // Eficiencia por espacios (top 10)
    spotEfficiency: (state) => {
      return state.spots.map(spot => {
        const spotTransactions = state.transactions.filter(t => 
          t.spotId === spot.id && t.paid
        )
        const revenue = spotTransactions.reduce((sum, t) => sum + t.amount, 0)
        const usageCount = spotTransactions.length
        
        // Eficiencia basada en uso e ingresos
        const maxPossibleRevenue = 24 * 30 * spot.hourlyRate // Máximo teórico en 30 días
        const efficiency = maxPossibleRevenue > 0 ? 
          ((revenue / maxPossibleRevenue) * 100).toFixed(1) : 0
        
        return {
          id: spot.id,
          number: spot.number,
          type: spot.type,
          efficiency: parseFloat(efficiency),
          usageCount,
          revenue: Math.round(revenue),
          hourlyRate: spot.hourlyRate
        }
      })
      .filter(spot => spot.usageCount > 0)
      .sort((a, b) => b.efficiency - a.efficiency)
      .slice(0, 10)
    },

    // Espacios más rentables (top 5)
    topSpots: (state) => {
      return state.spotEfficiency.slice(0, 5)
    },

    // Ingresos por tipo de espacio
    revenueBySpotType: (state) => {
      const regularRevenue = state.transactions
        .filter(t => t.paid)
        .filter(t => {
          const spot = state.spots.find(s => s.id === t.spotId)
          return spot && spot.type === 'regular'
        })
        .reduce((sum, t) => sum + t.amount, 0)
      
      const premiumRevenue = state.transactions
        .filter(t => t.paid)
        .filter(t => {
          const spot = state.spots.find(s => s.id === t.spotId)
          return spot && spot.type === 'premium'
        })
        .reduce((sum, t) => sum + t.amount, 0)
      
      const totalRevenue = regularRevenue + premiumRevenue
      
      return {
        regular: {
          revenue: Math.round(regularRevenue),
          percentage: totalRevenue > 0 ? ((regularRevenue / totalRevenue) * 100).toFixed(1) : 0
        },
        premium: {
          revenue: Math.round(premiumRevenue),
          percentage: totalRevenue > 0 ? ((premiumRevenue / totalRevenue) * 100).toFixed(1) : 0
        },
        total: Math.round(totalRevenue)
      }
    },

    // Estadísticas de rendimiento del día actual
    dailyPerformance: (state) => {
      const today = new Date().toDateString()
      const todayTransactions = state.transactions.filter(t => 
        new Date(t.entryTime).toDateString() === today
      )
      
      const yesterday = new Date()
      yesterday.setDate(yesterday.getDate() - 1)
      const yesterdayTransactions = state.transactions.filter(t => 
        new Date(t.entryTime).toDateString() === yesterday.toDateString()
      )
      
      const todayRevenue = todayTransactions
        .filter(t => t.paid)
        .reduce((sum, t) => sum + t.amount, 0)
      
      const yesterdayRevenue = yesterdayTransactions
        .filter(t => t.paid)
        .reduce((sum, t) => sum + t.amount, 0)
      
      // Comparativas
      const revenueComparison = yesterdayRevenue > 0 ? 
        ((todayRevenue - yesterdayRevenue) / yesterdayRevenue * 100).toFixed(1) : 
        (todayRevenue > 0 ? 100 : 0)
      
      const vehiclesComparison = yesterdayTransactions.length > 0 ? 
        ((todayTransactions.length - yesterdayTransactions.length) / yesterdayTransactions.length * 100).toFixed(1) : 
        (todayTransactions.length > 0 ? 100 : 0)
      
      // Ocupación actual
      const currentOccupancy = (state.occupiedSpots.length / state.spots.length * 100).toFixed(1)
      const avgOccupancy = state.advancedMetrics.occupancyRate
      const occupancyComparison = avgOccupancy > 0 ? 
        ((currentOccupancy - avgOccupancy) / avgOccupancy * 100).toFixed(1) : 100
      
      return {
        todayRevenue: Math.round(todayRevenue),
        todayVehicles: todayTransactions.length,
        currentOccupancy: parseFloat(currentOccupancy),
        revenueComparison: parseFloat(revenueComparison),
        vehiclesComparison: parseFloat(vehiclesComparison),
        occupancyComparison: parseFloat(occupancyComparison),
        goalProgress: Math.min((todayRevenue / 500) * 100, 100) // Meta diaria de $500
      }
    },

    // Transacciones recientes (últimas 10)
    recentTransactions: (state) => {
      return state.transactions
        .sort((a, b) => new Date(b.entryTime) - new Date(a.entryTime))
        .slice(0, 10)
        .map(transaction => {
          const spot = state.spots.find(s => s.id === transaction.spotId)
          return {
            ...transaction,
            spotNumber: spot ? spot.number : 'N/A',
            spotType: spot ? spot.type : 'N/A'
          }
        })
    },

    // Métricas para dashboard rápido
    dashboardMetrics: (state) => {
      const today = new Date().toDateString()
      const todayTransactions = state.transactions.filter(t => 
        new Date(t.entryTime).toDateString() === today
      )
      
      const todayRevenue = todayTransactions
        .filter(t => t.paid)
        .reduce((sum, t) => sum + t.amount, 0)
      
      const weeklyRevenue = state.transactions
        .filter(t => t.paid)
        .filter(t => {
          const transactionDate = new Date(t.entryTime)
          const weekAgo = new Date()
          weekAgo.setDate(weekAgo.getDate() - 7)
          return transactionDate >= weekAgo
        })
        .reduce((sum, t) => sum + t.amount, 0)
      
      return {
        todayRevenue: Math.round(todayRevenue),
        weeklyRevenue: Math.round(weeklyRevenue),
        todayVehicles: todayTransactions.length,
        availableSpots: state.availableSpots.length,
        occupiedSpots: state.occupiedSpots.length,
        totalSpots: state.spots.length
      }
    },

    // Datos para filtros avanzados
    filteredStats: (state) => (filters = {}) => {
      let transactions = state.transactions
      
      // Aplicar filtros
      if (filters.startDate && filters.endDate) {
        transactions = transactions.filter(transaction => {
          const entryDate = new Date(transaction.entryTime).toISOString().split('T')[0]
          return entryDate >= filters.startDate && entryDate <= filters.endDate
        })
      }
      
      if (filters.spotType && filters.spotType !== 'all') {
        transactions = transactions.filter(transaction => {
          const spot = state.spots.find(s => s.id === transaction.spotId)
          return spot && spot.type === filters.spotType
        })
      }
      
      if (filters.paymentStatus && filters.paymentStatus !== 'all') {
        transactions = transactions.filter(transaction => 
          filters.paymentStatus === 'paid' ? transaction.paid : !transaction.paid
        )
      }
      
      if (filters.vehicleType && filters.vehicleType !== 'all') {
        transactions = transactions.filter(transaction => {
          const vehicle = state.vehicles.find(v => v.id === transaction.vehicleId)
          return vehicle && vehicle.type === filters.vehicleType
        })
      }
      
      // Calcular métricas filtradas
      const paidTransactions = transactions.filter(t => t.paid)
      const totalRevenue = paidTransactions.reduce((sum, t) => sum + t.amount, 0)
      const vehicleCount = transactions.length
      
      return {
        transactions,
        paidTransactions,
        totalRevenue: Math.round(totalRevenue),
        vehicleCount,
        avgTransactionValue: vehicleCount > 0 ? (totalRevenue / vehicleCount).toFixed(2) : 0,
        paymentRate: vehicleCount > 0 ? ((paidTransactions.length / vehicleCount) * 100).toFixed(1) : 0
      }
    }
  }
})