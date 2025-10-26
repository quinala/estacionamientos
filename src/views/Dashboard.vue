<template>
  <div class="dashboard">
    <h2>Dashboard de Estacionamiento</h2>
    
    <!-- Estadísticas -->
    <div class="grid grid-4">
      <StatsCard
        icon="🅿️"
        :value="stats.totalSpots"
        label="Espacios Totales"
        type="primary"
      />
      <StatsCard
        icon="🚗"
        :value="stats.occupiedSpots"
        label="Ocupados"
        type="danger"
      />
      <StatsCard
        icon="✅"
        :value="stats.availableSpots"
        label="Disponibles"
        type="success"
      />
      <StatsCard
        icon="💰"
        :value="`$${stats.totalRevenue.toFixed(2)}`"
        label="Ingresos Totales"
        type="warning"
      />
    </div>

    <!-- Resumen Rápido -->
    <div class="grid grid-2">
      <div class="card">
        <h3>Espacios Ocupados Recientemente</h3>
        <div v-if="recentVehicles.length > 0" class="recent-list">
          <div 
            v-for="vehicle in recentVehicles" 
            :key="vehicle.id" 
            class="recent-item"
          >
            <span class="license-plate">{{ vehicle.licensePlate }}</span>
            <span class="spot-number">Espacio #{{ getSpotNumber(vehicle.spotId) }}</span>
            <span class="entry-time">{{ formatTime(vehicle.entryTime) }}</span>
          </div>
        </div>
        <div v-else class="empty-state">
          No hay vehículos estacionados
        </div>
      </div>

      <div class="card">
        <h3>Transacciones de Hoy</h3>
        <div v-if="todayTransactions.length > 0" class="transactions-list">
          <div 
            v-for="transaction in todayTransactions.slice(0, 5)" 
            :key="transaction.id" 
            class="transaction-item"
            :class="{ paid: transaction.paid }"
          >
            <div class="transaction-header">
              <span class="license-plate">{{ transaction.licensePlate }}</span>
              <span class="amount">${{ transaction.amount.toFixed(2) }}</span>
            </div>
            <div class="transaction-details">
              <span class="hours">{{ transaction.hours }} hora(s)</span>
              <span class="status" :class="transaction.paid ? 'paid' : 'pending'">
                {{ transaction.paid ? 'Pagado' : 'Pendiente' }}
              </span>
            </div>
          </div>
        </div>
        <div v-else class="empty-state">
          No hay transacciones hoy
        </div>
      </div>
    </div>

    <!-- Acciones Rápidas -->
    <div class="card">
      <h3>Acciones Rápidas</h3>
      <div class="quick-actions">
        <router-link to="/entry" class="btn btn-primary">
          🚗 Registrar Entrada
        </router-link>
        <router-link to="/spots" class="btn btn-success">
          📊 Ver Todos los Espacios
        </router-link>
        <router-link to="/reports" class="btn btn-warning">
          📈 Ver Reportes
        </router-link>
        <router-link to="/users" class="btn btn-warning">
          📈 Ver Usuarios
        </router-link>
      </div>
    </div>
  </div>
</template>

<script>
import { computed } from 'vue'
import { useParkingStore } from '../store'
import StatsCard from '../components/StatsCard.vue'

export default {
  name: 'Dashboard',
  components: {
    StatsCard
  },
  setup() {
    const store = useParkingStore()

    const stats = computed(() => store.stats)
    const todayTransactions = computed(() => store.todayTransactions)
    
    const recentVehicles = computed(() => {
      return store.vehicles
        .sort((a, b) => new Date(b.entryTime) - new Date(a.entryTime))
        .slice(0, 5)
    })

    const getSpotNumber = (spotId) => {
      const spot = store.spots.find(s => s.id === spotId)
      return spot ? spot.number : 'N/A'
    }

    const formatTime = (dateString) => {
      return new Date(dateString).toLocaleTimeString('es-ES', {
        hour: '2-digit',
        minute: '2-digit'
      })
    }

    return {
      stats,
      todayTransactions,
      recentVehicles,
      getSpotNumber,
      formatTime
    }
  }
}
</script>

<style scoped>
.dashboard h2 {
  margin-bottom: 2rem;
  color: #2d3748;
}

.grid-4 {
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  margin-bottom: 2rem;
}

.recent-list,
.transactions-list {
  space-y: 0.75rem;
}

.recent-item,
.transaction-item {
  padding: 0.75rem;
  border: 1px solid #e2e8f0;
  border-radius: 5px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.recent-item {
  background: #f7fafc;
}

.transaction-item {
  background: white;
}

.transaction-item.paid {
  background: #f0fff4;
  border-color: #48bb78;
}

.transaction-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  margin-bottom: 0.25rem;
}

.transaction-details {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  font-size: 0.875rem;
}

.license-plate {
  font-family: 'Courier New', monospace;
  font-weight: bold;
  color: #2d3748;
}

.spot-number {
  color: #667eea;
  font-weight: 600;
}

.entry-time {
  color: #718096;
  font-size: 0.875rem;
}

.amount {
  font-weight: bold;
  color: #48bb78;
}

.hours {
  color: #718096;
}

.status {
  padding: 0.25rem 0.5rem;
  border-radius: 15px;
  font-size: 0.75rem;
  font-weight: bold;
  text-transform: uppercase;
}

.status.pending {
  background: #fed7d7;
  color: #c53030;
}

.status.paid {
  background: #c6f6d5;
  color: #276749;
}

.empty-state {
  text-align: center;
  color: #718096;
  padding: 2rem;
  font-style: italic;
}

.quick-actions {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.quick-actions .btn {
  flex: 1;
  min-width: 200px;
  padding: 1rem 1.5rem;
  font-size: 1.1rem;
}

.btn-warning {
  background: #ed8936;
  color: white;
}

.btn-warning:hover {
  background: #dd7724;
  transform: translateY(-2px);
}
</style>