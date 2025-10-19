<template>
  <div class="vehicle-entry">
    <h2>Registro de Entrada y Salida</h2>
    
    <div class="grid grid-2">
      <!-- Formulario de Entrada -->
      <VehicleForm 
        mode="entry" 
        @vehicle-processed="refreshData"
      />

      <!-- Formulario de Salida -->
      <VehicleForm 
        mode="exit" 
        @vehicle-processed="refreshData"
      />
    </div>

    <!-- Resumen de Pago -->
    <PaymentSummary />

    <!-- Espacios Disponibles y Ocupados -->
    <div class="grid grid-2">
      <div class="card">
        <h3>🚗 Vehículos Estacionados</h3>
        <div v-if="occupiedSpots.length > 0" class="vehicles-list">
          <div 
            v-for="spot in occupiedSpots" 
            :key="spot.id" 
            class="vehicle-item"
          >
            <div class="vehicle-info">
              <span class="license-plate">{{ getVehiclePlate(spot.vehicleId) }}</span>
              <span class="spot-type" :class="spot.type">
                {{ spot.type === 'premium' ? '💎 Premium' : '🅿️ Regular' }}
              </span>
            </div>
            <div class="spot-info">
              <span class="spot-number">Espacio #{{ spot.number }}</span>
              <span class="entry-time">{{ getEntryTime(spot.vehicleId) }}</span>
            </div>
          </div>
        </div>
        <div v-else class="empty-state">
          No hay vehículos estacionados
        </div>
      </div>

      <div class="card">
        <h3>✅ Espacios Disponibles</h3>
        <div class="available-summary">
          <div class="availability-item">
            <span class="type">Regulares</span>
            <span class="count">{{ regularAvailable }}/{{ regularTotal }} disponibles</span>
            <div class="progress-bar">
              <div 
                class="progress-fill" 
                :style="{ width: `${(regularAvailable / regularTotal) * 100}%` }"
              ></div>
            </div>
          </div>
          <div class="availability-item">
            <span class="type">Premium</span>
            <span class="count">{{ premiumAvailable }}/{{ premiumTotal }} disponibles</span>
            <div class="progress-bar">
              <div 
                class="progress-fill premium" 
                :style="{ width: `${(premiumAvailable / premiumTotal) * 100}%` }"
              ></div>
            </div>
          </div>
        </div>
        
        <div class="quick-spots">
          <h4>Espacios Libres:</h4>
          <div class="spot-numbers">
            <span 
              v-for="spot in availableSpots.slice(0, 10)" 
              :key="spot.id"
              class="spot-number-tag"
              :class="spot.type"
            >
              #{{ spot.number }}
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useParkingStore } from '../store'
import VehicleForm from '../components/VehicleForm.vue'
import PaymentSummary from '../components/PaymentSummary.vue'

export default {
  name: 'VehicleEntry',
  components: {
    VehicleForm,
    PaymentSummary
  },
  setup() {
    const store = useParkingStore()

    const occupiedSpots = computed(() => store.occupiedSpots)
    const availableSpots = computed(() => store.availableSpots)

    const regularSpots = computed(() => 
      store.spots.filter(spot => spot.type === 'regular')
    )
    const premiumSpots = computed(() => 
      store.spots.filter(spot => spot.type === 'premium')
    )

    const regularAvailable = computed(() => 
      regularSpots.value.filter(spot => !spot.occupied).length
    )
    const regularTotal = computed(() => regularSpots.value.length)

    const premiumAvailable = computed(() => 
      premiumSpots.value.filter(spot => !spot.occupied).length
    )
    const premiumTotal = computed(() => premiumSpots.value.length)

    const getVehiclePlate = (vehicleId) => {
      const vehicle = store.vehicles.find(v => v.id === vehicleId)
      return vehicle ? vehicle.licensePlate : 'N/A'
    }

    const getEntryTime = (vehicleId) => {
      const vehicle = store.vehicles.find(v => v.id === vehicleId)
      if (vehicle) {
        return new Date(vehicle.entryTime).toLocaleTimeString('es-ES', {
          hour: '2-digit',
          minute: '2-digit'
        })
      }
      return 'N/A'
    }

    const refreshData = () => {
      // Los datos se actualizan automáticamente a través del store
    }

    onMounted(() => {
      store.loadData()
    })

    return {
      occupiedSpots,
      availableSpots,
      regularAvailable,
      regularTotal,
      premiumAvailable,
      premiumTotal,
      getVehiclePlate,
      getEntryTime,
      refreshData
    }
  }
}
</script>

<style scoped>
.vehicle-entry {
  space-y: 2rem;
}

.vehicle-entry h2 {
  color: #2d3748;
  margin-bottom: 1rem;
}

.vehicles-list {
  space-y: 0.75rem;
}

.vehicle-item {
  padding: 1rem;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  background: #f7fafc;
}

.vehicle-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.spot-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.875rem;
}

.license-plate {
  font-family: 'Courier New', monospace;
  font-weight: bold;
  font-size: 1.1rem;
  color: #2d3748;
}

.spot-type {
  padding: 0.25rem 0.5rem;
  border-radius: 15px;
  font-size: 0.75rem;
  font-weight: bold;
}

.spot-type.regular {
  background: #bee3f8;
  color: #2c5282;
}

.spot-type.premium {
  background: #e9d8fd;
  color: #6b46c1;
}

.spot-number {
  color: #667eea;
  font-weight: 600;
}

.entry-time {
  color: #718096;
}

.available-summary {
  space-y: 1rem;
  margin-bottom: 1.5rem;
}

.availability-item {
  space-y: 0.5rem;
}

.availability-item .type {
  font-weight: 600;
  color: #4a5568;
}

.availability-item .count {
  color: #718096;
  font-size: 0.875rem;
}

.progress-bar {
  height: 8px;
  background: #e2e8f0;
  border-radius: 4px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: #48bb78;
  transition: width 0.3s;
}

.progress-fill.premium {
  background: #9f7aea;
}

.quick-spots h4 {
  margin-bottom: 0.75rem;
  color: #4a5568;
}

.spot-numbers {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.spot-number-tag {
  padding: 0.375rem 0.75rem;
  border-radius: 20px;
  font-size: 0.875rem;
  font-weight: 600;
  border: 2px solid;
}

.spot-number-tag.regular {
  background: #f0fff4;
  border-color: #48bb78;
  color: #2f855a;
}

.spot-number-tag.premium {
  background: #faf5ff;
  border-color: #9f7aea;
  color: #6b46c1;
}

.empty-state {
  text-align: center;
  color: #718096;
  padding: 2rem;
  font-style: italic;
}
</style>