<template>
  <div class="reports">
    <h2>Reportes y Estadísticas</h2>

    <!-- Filtro de Fecha Único -->
    <div class="card filters">
      <div class="filter-group">
        <label>Seleccionar Fecha:</label>
        <input 
          type="date" 
          v-model="selectedDate"
          class="date-input"
        >
        <button @click="resetDate" class="btn btn-secondary">
          Hoy
        </button>
      </div>
      <div class="date-info">
        <span class="info-text">
          Mostrando datos del {{ formatDisplayDate(selectedDate) }}
        </span>
      </div>
    </div>

    <!-- Estadísticas Principales -->
    <div class="grid grid-3">
      <StatsCard
        icon="💰"
        :value="`$${filteredRevenue.toFixed(2)}`"
        label="Ingresos del Día"
        type="warning"
      />
      <StatsCard
        icon="🚗"
        :value="filteredTransactions.length"
        label="Vehículos del Día"
        type="primary"
      />
      <StatsCard
        icon="⏱️"
        :value="averageHours.toFixed(1)"
        label="Horas Promedio"
        type="success"
      />
    </div>

    <!-- Gráficos Circulares -->
    <div class="grid grid-2">
      <!-- Distribución de Ingresos -->
      <div class="card">
        <h3>Distribución de Ingresos</h3>
        <div class="pie-chart-container">
          <div class="pie-chart">
            <svg viewBox="0 0 42 42" class="pie-svg">
              <!-- Segmento Regular -->
              <circle 
                class="pie-segment regular"
                r="15.9" 
                cx="21" 
                cy="21" 
                :stroke-dasharray="`${revenueDistribution.regular.percentage} 100`"
              />
              <!-- Segmento Premium -->
              <circle 
                class="pie-segment premium"
                r="15.9" 
                cx="21" 
                cy="21" 
                :stroke-dasharray="`${revenueDistribution.premium.percentage} 100`"
                :stroke-dashoffset="`${-revenueDistribution.regular.percentage}`"
              />
              <!-- Texto central -->
              <text x="21" y="21" text-anchor="middle" class="pie-center-text">
                <tspan x="21" y="19" class="pie-total">Total</tspan>
                <tspan x="21" y="25" class="pie-amount">${{ filteredRevenue.toFixed(2) }}</tspan>
              </text>
            </svg>
          </div>
          <div class="pie-legend">
            <div class="legend-item">
              <span class="legend-color regular"></span>
              <div class="legend-details">
                <span class="legend-label">Regular</span>
                <span class="legend-value">${{ revenueDistribution.regular.amount.toFixed(2) }} ({{ revenueDistribution.regular.percentage.toFixed(1) }}%)</span>
              </div>
            </div>
            <div class="legend-item">
              <span class="legend-color premium"></span>
              <div class="legend-details">
                <span class="legend-label">Premium</span>
                <span class="legend-value">${{ revenueDistribution.premium.amount.toFixed(2) }} ({{ revenueDistribution.premium.percentage.toFixed(1) }}%)</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Distribución de Vehículos -->
      <div class="card">
        <h3>Distribución de Vehículos</h3>
        <div class="pie-chart-container">
          <div class="pie-chart">
            <svg viewBox="0 0 42 42" class="pie-svg">
              <!-- Segmento Regular -->
              <circle 
                class="pie-segment regular"
                r="15.9" 
                cx="21" 
                cy="21" 
                :stroke-dasharray="`${vehiclesDistribution.regular.percentage} 100`"
              />
              <!-- Segmento Premium -->
              <circle 
                class="pie-segment premium"
                r="15.9" 
                cx="21" 
                cy="21" 
                :stroke-dasharray="`${vehiclesDistribution.premium.percentage} 100`"
                :stroke-dashoffset="`${-vehiclesDistribution.regular.percentage}`"
              />
              <!-- Texto central -->
              <text x="21" y="21" text-anchor="middle" class="pie-center-text">
                <tspan x="21" y="19" class="pie-total">Total</tspan>
                <tspan x="21" y="25" class="pie-amount">{{ filteredTransactions.length }}</tspan>
              </text>
            </svg>
          </div>
          <div class="pie-legend">
            <div class="legend-item">
              <span class="legend-color regular"></span>
              <div class="legend-details">
                <span class="legend-label">Regular</span>
                <span class="legend-value">{{ vehiclesDistribution.regular.count }} vehículos ({{ vehiclesDistribution.regular.percentage.toFixed(1) }}%)</span>
              </div>
            </div>
            <div class="legend-item">
              <span class="legend-color premium"></span>
              <div class="legend-details">
                <span class="legend-label">Premium</span>
                <span class="legend-value">{{ vehiclesDistribution.premium.count }} vehículos ({{ vehiclesDistribution.premium.percentage.toFixed(1) }}%)</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Horas Pico -->
    <div class="card">
      <h3>Horas Más Ocupadas</h3>
      <div class="peak-hours-chart">
        <div 
          v-for="hour in peakHours" 
          :key="hour.hour"
          class="peak-hour-item"
        >
          <div class="hour-info">
            <span class="hour-time">{{ hour.hour }}:00</span>
            <span class="hour-count">{{ hour.count }} vehículos</span>
          </div>
          <div class="hour-bar">
            <div 
              class="bar-fill" 
              :style="{ width: `${(hour.count / maxHourCount) * 100}%` }"
            ></div>
          </div>
          <span class="hour-percentage">{{ ((hour.count / totalVehiclesCount) * 100).toFixed(1) }}%</span>
        </div>
      </div>
    </div>

    <!-- Lista Detallada de Transacciones -->
    <div class="card">
      <div class="table-header-section">
        <h3>Transacciones del Día</h3>
        <button 
          @click="showAllTickets" 
          class="btn btn-info"
          :disabled="filteredTransactions.length === 0"
        >
          🎫 Ver Todos los Tickets
        </button>
      </div>
      <div class="transactions-table">
        <div class="table-header">
          <span>Placa</span>
          <span>Espacio</span>
          <span>Entrada</span>
          <span>Salida</span>
          <span>Horas</span>
          <span>Monto</span>
          <span>Estado</span>
          <span>Acciones</span>
        </div>
        <div 
          v-for="transaction in paginatedTransactions" 
          :key="transaction.id"
          class="table-row"
        >
          <span class="license-plate">{{ transaction.licensePlate }}</span>
          <span class="spot-number">#{{ getSpotNumber(transaction.spotId) }}</span>
          <span class="datetime">{{ formatDateTime(transaction.entryTime) }}</span>
          <span class="datetime">{{ formatDateTime(transaction.exitTime) }}</span>
          <span class="hours">{{ transaction.hours }}</span>
          <span class="amount">${{ transaction.amount.toFixed(2) }}</span>
          <span class="status" :class="transaction.paid ? 'paid' : 'pending'">
            {{ transaction.paid ? 'Pagado' : 'Pendiente' }}
          </span>
          <span class="actions">
            <button 
              @click="showVehicleTickets(transaction)"
              class="btn-ticket"
              title="Ver tickets del vehículo"
            >
              🎫
            </button>
          </span>
        </div>
      </div>

      <!-- Paginación -->
      <div v-if="totalPages > 1" class="pagination">
        <button 
          @click="prevPage" 
          :disabled="currentPage === 1"
          class="btn btn-secondary"
        >
          Anterior
        </button>
        <span class="page-info">
          Página {{ currentPage }} de {{ totalPages }}
        </span>
        <button 
          @click="nextPage" 
          :disabled="currentPage === totalPages"
          class="btn btn-secondary"
        >
          Siguiente
        </button>
      </div>

      <div v-if="filteredTransactions.length === 0" class="empty-state">
        No hay transacciones para la fecha seleccionada
      </div>
    </div>

    <!-- Botones de Acción -->
    <div class="action-buttons">
      <router-link to="/users" class="btn btn-primary">
      👥 Ver Usuarios
      </router-link>
      
      <button @click="printReport" class="btn btn-success">
        🖨️ Imprimir Reporte
      </button>
    </div>

    <!-- Modal para mostrar tickets del vehículo -->
    <div v-if="showTicketsModal" class="modal-overlay">
      <div class="modal-content">
        <div class="modal-header">
          <h3>🎫 Tickets del Vehículo {{ selectedVehiclePlate }}</h3>
          <button @click="closeTicketsModal" class="close-btn">&times;</button>
        </div>
        <div class="tickets-list">
          <div 
            v-for="ticket in vehicleTickets" 
            :key="ticket.id"
            class="ticket-card"
          >
            <div class="ticket-header">
              <span class="ticket-id">Ticket: {{ ticket.id }}</span>
              <span class="ticket-type" :class="ticket.type">
                {{ ticket.type === 'entry' ? 'ENTRADA' : 'SALIDA' }}
              </span>
            </div>
            <div class="ticket-details">
              <div class="detail-row">
                <span class="label">Espacio:</span>
                <span class="value">#{{ ticket.spotNumber }}</span>
              </div>
              <div class="detail-row">
                <span class="label">{{ ticket.type === 'entry' ? 'Entrada' : 'Salida' }}:</span>
                <span class="value">{{ formatDateTime(ticket.entryTime || ticket.exitTime) }}</span>
              </div>
              <div v-if="ticket.type === 'entry'" class="detail-row">
                <span class="label">Horas Reservadas:</span>
                <span class="value">{{ ticket.reservedHours }}</span>
              </div>
              <div v-if="ticket.type === 'exit'" class="detail-row">
                <span class="label">Horas Estacionado:</span>
                <span class="value">{{ ticket.hours }}</span>
              </div>
              <div class="detail-row">
                <span class="label">Monto:</span>
                <span class="value">${{ ticket.amount?.toFixed(2) || '0.00' }}</span>
              </div>
              <div class="detail-row">
                <span class="label">Estado:</span>
                <span class="value status" :class="ticket.status">
                  {{ getStatusText(ticket.status) }}
                </span>
              </div>
            </div>
            <div class="ticket-barcode">
              <div class="barcode">{{ ticket.barcode }}</div>
              <small>Código: {{ ticket.id }}</small>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button @click="closeTicketsModal" class="btn btn-secondary">
            Cerrar
          </button>
        </div>
      </div>
    </div>

    <!-- Modal para todos los tickets -->
    <div v-if="showAllTicketsModal" class="modal-overlay">
      <div class="modal-content large-modal">
        <div class="modal-header">
          <h3>🎫 Todos los Tickets - {{ formatDisplayDate(selectedDate) }}</h3>
          <button @click="closeAllTicketsModal" class="close-btn">&times;</button>
        </div>
        <div class="all-tickets-section">
          <div class="tickets-stats">
            <div class="stat">
              <span class="stat-label">Total Tickets:</span>
              <span class="stat-value">{{ allTickets.length }}</span>
            </div>
            <div class="stat">
              <span class="stat-label">Entradas:</span>
              <span class="stat-value">{{ entryTicketsCount }}</span>
            </div>
            <div class="stat">
              <span class="stat-label">Salidas:</span>
              <span class="stat-value">{{ exitTicketsCount }}</span>
            </div>
          </div>
          <div class="all-tickets-list">
            <div 
              v-for="ticket in allTickets" 
              :key="ticket.id"
              class="ticket-card compact"
            >
              <div class="ticket-header">
                <span class="ticket-plate">{{ ticket.licensePlate }}</span>
                <span class="ticket-type" :class="ticket.type">
                  {{ ticket.type === 'entry' ? 'ENTRADA' : 'SALIDA' }}
                </span>
              </div>
              <div class="ticket-details compact">
                <span class="detail">Espacio #{{ ticket.spotNumber }}</span>
                <span class="detail">{{ formatDateTime(ticket.entryTime || ticket.exitTime) }}</span>
                <span class="detail">${{ ticket.amount?.toFixed(2) || '0.00' }}</span>
              </div>
              <div class="ticket-id">
                <small>{{ ticket.id }}</small>
              </div>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button @click="closeAllTicketsModal" class="btn btn-secondary">
            Cerrar
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useParkingStore } from '../store'
import StatsCard from '../components/StatsCard.vue'

export default {
  name: 'Reports',
  components: {
    StatsCard
  },
  setup() {
    const store = useParkingStore()
    const selectedDate = ref('')
    const currentPage = ref(1)
    const itemsPerPage = 10
    const showTicketsModal = ref(false)
    const showAllTicketsModal = ref(false)
    const selectedVehiclePlate = ref('')
    const vehicleTickets = ref([])

    // Inicializar fecha (hoy)
    const initDate = () => {
      const today = new Date()
      const year = today.getFullYear()
      const month = String(today.getMonth() + 1).padStart(2, '0')
      const day = String(today.getDate()).padStart(2, '0')
      selectedDate.value = `${year}-${month}-${day}`
    }

    const resetDate = () => {
      const today = new Date()
      const year = today.getFullYear()
      const month = String(today.getMonth() + 1).padStart(2, '0')
      const day = String(today.getDate()).padStart(2, '0')
      selectedDate.value = `${year}-${month}-${day}`
      currentPage.value = 1
    }

    const filteredTransactions = computed(() => {
      let transactions = store.transactions
      
      if (selectedDate.value) {
        transactions = transactions.filter(transaction => {
          const entryDateObj = new Date(transaction.entryTime)
          const entryYear = entryDateObj.getFullYear()
          const entryMonth = String(entryDateObj.getMonth() + 1).padStart(2, '0')
          const entryDay = String(entryDateObj.getDate()).padStart(2, '0')
          const entryDate = `${entryYear}-${entryMonth}-${entryDay}`
          
          return entryDate === selectedDate.value
        })
      }
      
      return transactions.sort((a, b) => new Date(b.entryTime) - new Date(a.entryTime))
    })

    // Obtener todos los tickets del día
    const allTickets = computed(() => {
      if (!store.tickets) return []
      
      return store.tickets.filter(ticket => {
        const ticketTime = ticket.entryTime || ticket.exitTime
        if (!ticketTime) return false
        const ticketDateObj = new Date(ticketTime)
        const ticketYear = ticketDateObj.getFullYear()
        const ticketMonth = String(ticketDateObj.getMonth() + 1).padStart(2, '0')
        const ticketDay = String(ticketDateObj.getDate()).padStart(2, '0')
        const ticketDate = `${ticketYear}-${ticketMonth}-${ticketDay}`
        return ticketDate === selectedDate.value
      }).sort((a, b) => new Date(b.entryTime || b.exitTime) - new Date(a.entryTime || a.exitTime))
    })

    const entryTicketsCount = computed(() => 
      allTickets.value.filter(t => t.type === 'entry').length
    )

    const exitTicketsCount = computed(() => 
      allTickets.value.filter(t => t.type === 'exit').length
    )

    const filteredRevenue = computed(() => {
      return filteredTransactions.value
        .filter(t => t.paid)
        .reduce((sum, t) => sum + t.amount, 0)
    })

    const averageHours = computed(() => {
      if (filteredTransactions.value.length === 0) return 0
      const totalHours = filteredTransactions.value.reduce((sum, t) => sum + t.hours, 0)
      return totalHours / filteredTransactions.value.length
    })

    // Distribución de ingresos para gráfico circular
    const revenueDistribution = computed(() => {
      const regular = filteredTransactions.value
        .filter(t => t.paid)
        .filter(t => {
          const spot = store.spots.find(s => s.id === t.spotId)
          return spot && spot.type === 'regular'
        })
        .reduce((sum, t) => sum + t.amount, 0)

      const premium = filteredTransactions.value
        .filter(t => t.paid)
        .filter(t => {
          const spot = store.spots.find(s => s.id === t.spotId)
          return spot && spot.type === 'premium'
        })
        .reduce((sum, t) => sum + t.amount, 0)

      const total = regular + premium
      const regularPercentage = total > 0 ? (regular / total) * 100 : 0
      const premiumPercentage = total > 0 ? (premium / total) * 100 : 0

      return {
        regular: { amount: regular, percentage: regularPercentage },
        premium: { amount: premium, percentage: premiumPercentage }
      }
    })

    // Distribución de vehículos para gráfico circular
    const vehiclesDistribution = computed(() => {
      const regular = filteredTransactions.value.filter(t => {
        const spot = store.spots.find(s => s.id === t.spotId)
        return spot && spot.type === 'regular'
      }).length

      const premium = filteredTransactions.value.filter(t => {
        const spot = store.spots.find(s => s.id === t.spotId)
        return spot && spot.type === 'premium'
      }).length

      const total = regular + premium
      const regularPercentage = total > 0 ? (regular / total) * 100 : 0
      const premiumPercentage = total > 0 ? (premium / total) * 100 : 0

      return {
        regular: { count: regular, percentage: regularPercentage },
        premium: { count: premium, percentage: premiumPercentage }
      }
    })

    // Horas pico
    const peakHours = computed(() => {
      const hoursCount = Array(24).fill(0).map((_, i) => ({ hour: i, count: 0 }))
      
      filteredTransactions.value.forEach(transaction => {
        const hour = new Date(transaction.entryTime).getHours()
        hoursCount[hour].count++
      })
      
      return hoursCount
        .filter(h => h.count > 0)
        .sort((a, b) => b.count - a.count)
        .slice(0, 6)
    })

    const maxHourCount = computed(() => {
      const counts = peakHours.value.map(h => h.count)
      return counts.length > 0 ? Math.max(...counts) : 0
    })

    const totalVehiclesCount = computed(() => {
      return peakHours.value.reduce((sum, hour) => sum + hour.count, 0)
    })

    const totalPages = computed(() => 
      Math.ceil(filteredTransactions.value.length / itemsPerPage)
    )

    const paginatedTransactions = computed(() => {
      const start = (currentPage.value - 1) * itemsPerPage
      const end = start + itemsPerPage
      return filteredTransactions.value.slice(start, end)
    })

    const getSpotNumber = (spotId) => {
      const spot = store.spots.find(s => s.id === spotId)
      return spot ? spot.number : spotId
    }

    const formatDateTime = (dateString) => {
      if (!dateString) return 'N/A'
      return new Date(dateString).toLocaleString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    }

    const formatDisplayDate = (dateString) => {
      const [year, month, day] = dateString.split('-').map(Number)
      const date = new Date(year, month - 1, day)
      
      return date.toLocaleDateString('es-ES', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    }

    const getStatusText = (status) => {
      const statusMap = {
        'active': 'Activo',
        'completed': 'Completado',
        'pending_payment': 'Pago Pendiente'
      }
      return statusMap[status] || status
    }

    const showVehicleTickets = (transaction) => {
      if (!store.tickets) return
      
      selectedVehiclePlate.value = transaction.licensePlate
      vehicleTickets.value = store.tickets.filter(ticket => 
        ticket.licensePlate === transaction.licensePlate
      ).sort((a, b) => new Date(b.entryTime || b.exitTime) - new Date(a.entryTime || a.exitTime))
      
      showTicketsModal.value = true
    }

    const showAllTickets = () => {
      showAllTicketsModal.value = true
    }

    const closeTicketsModal = () => {
      showTicketsModal.value = false
      selectedVehiclePlate.value = ''
      vehicleTickets.value = []
    }

    const closeAllTicketsModal = () => {
      showAllTicketsModal.value = false
    }

    const prevPage = () => {
      if (currentPage.value > 1) currentPage.value--
    }

    const nextPage = () => {
      if (currentPage.value < totalPages.value) currentPage.value++
    }

    const printReport = () => {
      window.print()
    }

    onMounted(() => {
      store.loadData()
      initDate()
    })

    return {
      selectedDate,
      currentPage,
      filteredTransactions,
      filteredRevenue,
      averageHours,
      revenueDistribution,
      vehiclesDistribution,
      peakHours,
      maxHourCount,
      totalVehiclesCount,
      totalPages,
      paginatedTransactions,
      showTicketsModal,
      showAllTicketsModal,
      selectedVehiclePlate,
      vehicleTickets,
      allTickets,
      entryTicketsCount,
      exitTicketsCount,
      formatDateTime,
      formatDisplayDate,
      getSpotNumber,
      getStatusText,
      showVehicleTickets,
      showAllTickets,
      closeTicketsModal,
      closeAllTicketsModal,
      prevPage,
      nextPage,
      resetDate,
      printReport
    }
  }
}
</script>

<style scoped>
.reports {
  space-y: 2rem;
}

.filters {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
}

.filter-group {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.filter-group label {
  font-weight: 600;
  color: #4a5568;
  white-space: nowrap;
}

.date-input {
  padding: 0.5rem;
  border: 2px solid #e2e8f0;
  border-radius: 5px;
  font-size: 1rem;
}

.date-info {
  display: flex;
  align-items: center;
}

.info-text {
  color: #667eea;
  font-weight: 600;
  font-size: 0.9rem;
}

.btn-secondary {
  background: #a0aec0;
  color: white;
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.btn-info {
  background: #4299e1;
  color: white;
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.btn-info:hover:not(:disabled) {
  background: #3182ce;
}

.btn-info:disabled {
  background: #cbd5e0;
  cursor: not-allowed;
}

.btn-secondary:hover:not(:disabled) {
  background: #718096;
}

.btn-secondary:disabled {
  background: #cbd5e0;
  cursor: not-allowed;
}

.table-header-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.table-header-section h3 {
  margin: 0;
}

/* Estilos para gráficos circulares */
.pie-chart-container {
  display: flex;
  align-items: center;
  gap: 2rem;
  padding: 1rem;
}

.pie-chart {
  flex-shrink: 0;
}

.pie-svg {
  width: 160px;
  height: 160px;
  transform: rotate(-90deg);
}

.pie-segment {
  fill: none;
  stroke-width: 3.2;
  stroke-linecap: round;
  animation: progress 1s ease-in-out forwards;
  opacity: 0;
}

.pie-segment.regular {
  stroke: #48bb78;
  animation-delay: 0.3s;
}

.pie-segment.premium {
  stroke: #9f7aea;
  animation-delay: 0.6s;
}

@keyframes progress {
  0% {
    opacity: 0;
    stroke-dasharray: 0 100;
  }
  100% {
    opacity: 1;
  }
}

.pie-center-text {
  transform: rotate(90deg);
  transform-origin: center;
}

.pie-total {
  font-size: 3px;
  fill: #718096;
  font-weight: 500;
}

.pie-amount {
  font-size: 4px;
  fill: #2d3748;
  font-weight: bold;
}

.pie-legend {
  flex: 1;
  space-y: 1rem;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.75rem;
  background: #f8fafc;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
}

.legend-color {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  border: 3px solid white;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  flex-shrink: 0;
}

.legend-color.regular {
  background: #48bb78;
}

.legend-color.premium {
  background: #9f7aea;
}

.legend-details {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.legend-label {
  font-weight: 600;
  color: #2d3748;
  font-size: 0.9rem;
}

.legend-value {
  font-size: 0.8rem;
  color: #718096;
}

/* Estilos para horas pico */
.peak-hours-chart {
  space-y: 1rem;
  padding: 1rem 0;
}

.peak-hour-item {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.hour-info {
  display: flex;
  justify-content: space-between;
  width: 120px;
}

.hour-time {
  font-weight: 600;
  color: #4a5568;
}

.hour-count {
  color: #718096;
  font-size: 0.875rem;
}

.hour-bar {
  flex: 1;
  height: 20px;
  background: #e2e8f0;
  border-radius: 10px;
  overflow: hidden;
}

.bar-fill {
  height: 100%;
  background: linear-gradient(90deg, #667eea, #764ba2);
  transition: width 0.3s ease;
  border-radius: 10px;
}

.hour-percentage {
  width: 60px;
  text-align: right;
  font-size: 0.875rem;
  color: #718096;
  font-weight: 600;
}

.transactions-table {
  space-y: 0.5rem;
}

.table-header,
.table-row {
  display: grid;
  grid-template-columns: 1fr 0.5fr 1fr 1fr 0.5fr 0.5fr 0.8fr 0.5fr;
  gap: 1rem;
  padding: 0.75rem;
  align-items: center;
}

.table-header {
  background: #f7fafc;
  border-radius: 5px;
  font-weight: 600;
  color: #4a5568;
  font-size: 0.875rem;
}

.table-row {
  border: 1px solid #e2e8f0;
  border-radius: 5px;
  background: white;
}

.table-row:hover {
  background: #f7fafc;
}

.license-plate {
  font-family: 'Courier New', monospace;
  font-weight: bold;
}

.spot-number {
  color: #667eea;
  font-weight: 600;
}

.datetime {
  font-size: 0.875rem;
  color: #718096;
}

.hours {
  text-align: center;
  font-weight: 600;
}

.amount {
  text-align: right;
  font-weight: bold;
  color: #48bb78;
}

.status {
  padding: 0.25rem 0.5rem;
  border-radius: 15px;
  font-size: 0.75rem;
  font-weight: bold;
  text-transform: uppercase;
  text-align: center;
}

.status.paid {
  background: #c6f6d5;
  color: #276749;
}

.status.pending {
  background: #fed7d7;
  color: #c53030;
}

.actions {
  display: flex;
  justify-content: center;
}

.btn-ticket {
  background: #4299e1;
  color: white;
  border: none;
  border-radius: 5px;
  padding: 0.5rem;
  cursor: pointer;
  transition: background-color 0.3s;
  font-size: 1rem;
}

.btn-ticket:hover {
  background: #3182ce;
  transform: scale(1.1);
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  margin-top: 1.5rem;
  padding-top: 1rem;
  border-top: 1px solid #e2e8f0;
}

.page-info {
  color: #718096;
  font-weight: 600;
}

.action-buttons {
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin-top: 2rem;
}

.empty-state {
  text-align: center;
  color: #718096;
  padding: 3rem;
  font-style: italic;
}

/* Estilos para los modales de tickets */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}

.modal-content {
  background: white;
  border-radius: 8px;
  max-width: 90%;
  max-height: 90vh;
  overflow: auto;
  position: relative;
  width: 600px;
}

.large-modal {
  width: 90%;
  max-width: 1200px;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid #e2e8f0;
  background: #f7fafc;
}

.modal-header h3 {
  margin: 0;
  color: #2d3748;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #718096;
  padding: 0;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-btn:hover {
  color: #2d3748;
}

.tickets-list {
  padding: 1.5rem;
  space-y: 1rem;
  max-height: 60vh;
  overflow-y: auto;
}

.ticket-card {
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  padding: 1rem;
  background: white;
}

.ticket-card.compact {
  padding: 0.75rem;
}

.ticket-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid #e2e8f0;
}

.ticket-id {
  font-family: 'Courier New', monospace;
  font-weight: bold;
  color: #4a5568;
}

.ticket-plate {
  font-family: 'Courier New', monospace;
  font-weight: bold;
  color: #2d3748;
  font-size: 1.1rem;
}

.ticket-type {
  padding: 0.25rem 0.5rem;
  border-radius: 15px;
  font-size: 0.75rem;
  font-weight: bold;
  text-transform: uppercase;
}

.ticket-type.entry {
  background: #c6f6d5;
  color: #276749;
}

.ticket-type.exit {
  background: #fed7d7;
  color: #c53030;
}

.ticket-details {
  space-y: 0.5rem;
  margin-bottom: 1rem;
}

.ticket-details.compact {
  display: flex;
  gap: 1rem;
  margin-bottom: 0.5rem;
}

.ticket-details.compact .detail {
  font-size: 0.875rem;
  color: #718096;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.detail-row .label {
  color: #718096;
  font-weight: 600;
}

.detail-row .value {
  color: #2d3748;
  font-weight: 600;
}

.ticket-barcode {
  text-align: center;
  padding: 1rem;
  background: #f7fafc;
  border-radius: 5px;
  border: 1px solid #e2e8f0;
}

.barcode {
  font-family: 'Courier New', monospace;
  letter-spacing: 2px;
  font-weight: bold;
  color: #2d3748;
  margin-bottom: 0.5rem;
}

.modal-footer {
  padding: 1.5rem;
  border-top: 1px solid #e2e8f0;
  text-align: right;
  background: #f7fafc;
}

/* Sección de todos los tickets */
.all-tickets-section {
  padding: 1.5rem;
}

.tickets-stats {
  display: flex;
  justify-content: space-around;
  margin-bottom: 1.5rem;
  padding: 1rem;
  background: #f7fafc;
  border-radius: 8px;
}

.stat {
  text-align: center;
}

.stat-label {
  display: block;
  color: #718096;
  font-size: 0.875rem;
  margin-bottom: 0.25rem;
}

.stat-value {
  display: block;
  font-size: 1.5rem;
  font-weight: bold;
  color: #667eea;
}

.all-tickets-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1rem;
  max-height: 60vh;
  overflow-y: auto;
}

@media (max-width: 768px) {
  .table-header,
  .table-row {
    grid-template-columns: 1fr 1fr 0.5fr;
    gap: 0.5rem;
  }

  .table-header span:nth-child(n+4),
  .table-row span:nth-child(n+4) {
    display: none;
  }

  .filters {
    flex-direction: column;
    align-items: stretch;
  }

  .filter-group {
    flex-wrap: wrap;
    justify-content: center;
  }

  .date-info {
    justify-content: center;
    text-align: center;
  }

  .action-buttons {
    flex-direction: column;
  }

  .table-header-section {
    flex-direction: column;
    gap: 1rem;
    align-items: stretch;
  }

  .all-tickets-list {
    grid-template-columns: 1fr;
  }

  .tickets-stats {
    flex-direction: column;
    gap: 1rem;
  }

  .modal-content {
    width: 95%;
  }

  .ticket-details.compact {
    flex-direction: column;
    gap: 0.25rem;
  }

  .pie-chart-container {
    flex-direction: column;
    gap: 1.5rem;
    text-align: center;
  }

  .pie-svg {
    width: 140px;
    height: 140px;
  }

  .legend-item {
    justify-content: center;
  }

  .peak-hour-item {
    flex-direction: column;
    gap: 0.5rem;
    align-items: stretch;
  }

  .hour-info {
    width: auto;
    justify-content: space-between;
  }

  .hour-percentage {
    text-align: center;
    width: auto;
  }
}

@media print {
  .navbar,
  .filters,
  .action-buttons {
    display: none;
  }

  .card {
    box-shadow: none;
    border: 1px solid #ccc;
  }
}
</style>