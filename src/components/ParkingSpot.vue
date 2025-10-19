<template>
  <div 
    class="parking-spot" 
    :class="{
      'occupied': spot.occupied,
      'premium': spot.type === 'premium',
      'regular': spot.type === 'regular'
    }"
  >
    <div class="spot-header">
      <span class="spot-number">#{{ spot.number }}</span>
      <span class="spot-type">{{ spot.type === 'premium' ? '💎' : '🅿️' }}</span>
    </div>
    
    <div class="spot-status">
      <span v-if="spot.occupied" class="status occupied">OCUPADO</span>
      <span v-else class="status available">DISPONIBLE</span>
    </div>

    <div v-if="spot.occupied && vehicle" class="vehicle-info">
      <div class="license-plate">{{ vehicle.licensePlate }}</div>
      <div class="entry-time">{{ formatTime(vehicle.entryTime) }}</div>
    </div>

    <div class="spot-rate">
      ${{ spot.hourlyRate }}/hora
    </div>
  </div>
</template>

<script>
import { computed } from 'vue'
import { useParkingStore } from '../store'

export default {
  name: 'ParkingSpot',
  props: {
    spot: {
      type: Object,
      required: true
    }
  },
  setup(props) {
    const store = useParkingStore()
    
    const vehicle = computed(() => {
      return store.vehicles.find(v => v.id === props.spot.vehicleId)
    })

    const formatTime = (dateString) => {
      return new Date(dateString).toLocaleTimeString('es-ES', {
        hour: '2-digit',
        minute: '2-digit'
      })
    }

    return {
      vehicle,
      formatTime
    }
  }
}
</script>

<style scoped>
.parking-spot {
  border: 2px solid #e2e8f0;
  border-radius: 10px;
  padding: 1rem;
  text-align: center;
  transition: all 0.3s;
  background: white;
}

.parking-spot:hover {
  transform: translateY(-5px);
  box-shadow: 0 5px 15px rgba(0,0,0,0.1);
}

.parking-spot.occupied {
  border-color: #f56565;
  background: #fed7d7;
}

.parking-spot.available {
  border-color: #48bb78;
  background: #f0fff4;
}

.parking-spot.premium {
  border-color: #9f7aea;
}

.spot-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.spot-number {
  font-size: 1.25rem;
  font-weight: bold;
  color: #2d3748;
}

.spot-type {
  font-size: 1.25rem;
}

.spot-status {
  margin-bottom: 0.5rem;
}

.status {
  padding: 0.25rem 0.5rem;
  border-radius: 15px;
  font-size: 0.75rem;
  font-weight: bold;
  text-transform: uppercase;
}

.status.occupied {
  background: #f56565;
  color: white;
}

.status.available {
  background: #48bb78;
  color: white;
}

.vehicle-info {
  margin: 0.5rem 0;
  padding: 0.5rem;
  background: rgba(255, 255, 255, 0.7);
  border-radius: 5px;
}

.license-plate {
  font-family: 'Courier New', monospace;
  font-weight: bold;
  font-size: 1.1rem;
  color: #2d3748;
  margin-bottom: 0.25rem;
}

.entry-time {
  font-size: 0.875rem;
  color: #718096;
}

.spot-rate {
  font-size: 0.875rem;
  color: #667eea;
  font-weight: 600;
}
</style>