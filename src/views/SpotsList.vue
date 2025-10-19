<template>
  <div class="spots-list">
    <div class="page-header">
      <h2>Gestión de Espacios de Estacionamiento</h2>
      <div class="header-actions">
        <router-link to="/entry" class="btn btn-primary">
          🚗 Nueva Entrada
        </router-link>
      </div>
    </div>

    <!-- Filtros -->
    <div class="card filters">
      <div class="filter-group">
        <label>Filtrar por:</label>
        <select v-model="filterType" class="filter-select">
          <option value="all">Todos los espacios</option>
          <option value="occupied">Ocupados</option>
          <option value="available">Disponibles</option>
          <option value="regular">Regulares</option>
          <option value="premium">Premium</option>
        </select>
      </div>
      
      <div class="stats-summary">
        <span class="stat">
          <strong>{{ filteredSpots.length }}</strong> espacios mostrados
        </span>
        <span class="stat">
          <strong>{{ availableCount }}</strong> disponibles
        </span>
        <span class="stat">
          <strong>{{ occupiedCount }}</strong> ocupados
        </span>
      </div>
    </div>

    <!-- Lista de espacios -->
    <div class="spots-grid">
      <ParkingSpot
        v-for="spot in filteredSpots"
        :key="spot.id"
        :spot="spot"
      />
    </div>

    <!-- Resumen de pagos si hay espacios ocupados seleccionados -->
    <PaymentSummary v-if="selectedSpotId" :spot-id="selectedSpotId" />
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useParkingStore } from '../store'
import ParkingSpot from '../components/ParkingSpot.vue'
import PaymentSummary from '../components/PaymentSummary.vue'

export default {
  name: 'SpotsList',
  components: {
    ParkingSpot,
    PaymentSummary
  },
  setup() {
    const store = useParkingStore()
    const filterType = ref('all')
    const selectedSpotId = ref(null)

    const filteredSpots = computed(() => {
      let spots = store.spots
      
      switch (filterType.value) {
        case 'occupied':
          spots = spots.filter(spot => spot.occupied)
          break
        case 'available':
          spots = spots.filter(spot => !spot.occupied)
          break
        case 'regular':
          spots = spots.filter(spot => spot.type === 'regular')
          break
        case 'premium':
          spots = spots.filter(spot => spot.type === 'premium')
          break
      }
      
      return spots.sort((a, b) => a.number - b.number)
    })

    const availableCount = computed(() => 
      filteredSpots.value.filter(spot => !spot.occupied).length
    )

    const occupiedCount = computed(() => 
      filteredSpots.value.filter(spot => spot.occupied).length
    )

    onMounted(() => {
      store.loadData()
    })

    return {
      filterType,
      selectedSpotId,
      filteredSpots,
      availableCount,
      occupiedCount
    }
  }
}
</script>

<style scoped>
.spots-list {
  space-y: 1.5rem;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.page-header h2 {
  color: #2d3748;
  margin: 0;
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

.filter-select {
  padding: 0.5rem;
  border: 2px solid #e2e8f0;
  border-radius: 5px;
  background: white;
}

.stats-summary {
  display: flex;
  gap: 1.5rem;
}

.stat {
  color: #718096;
  font-size: 0.875rem;
}

.stat strong {
  color: #2d3748;
}

.spots-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.5rem;
}

@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    gap: 1rem;
    align-items: stretch;
  }

  .filters {
    flex-direction: column;
    align-items: stretch;
  }

  .stats-summary {
    justify-content: space-between;
  }

  .spots-grid {
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  }
}
</style>