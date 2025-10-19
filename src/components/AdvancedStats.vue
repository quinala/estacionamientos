<template>
  <div class="advanced-stats">
    <h3>Estadísticas Avanzadas</h3>
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-icon">🚗</div>
        <h4>Ocupación Actual</h4>
        <p class="stat-value">{{ occupancyRate }}%</p>
        <div class="progress-bar">
          <div class="progress-fill" :style="{ width: occupancyRate + '%' }"></div>
        </div>
        <p class="stat-detail">{{ occupiedSpots }}/{{ totalSpots }} espacios ocupados</p>
      </div>

      <div class="stat-card">
        <div class="stat-icon">⏱️</div>
        <h4>Tiempo Promedio</h4>
        <p class="stat-value">{{ averageTime }}</p>
        <p class="stat-detail">Por vehículo</p>
      </div>

      <div class="stat-card">
        <div class="stat-icon">💰</div>
        <h4>Ingresos Hoy</h4>
        <p class="stat-value">${{ dailyRevenue }}</p>
        <p class="stat-detail">{{ transactionsToday }} transacciones</p>
      </div>

      <div class="stat-card">
        <div class="stat-icon">📈</div>
        <h4>Eficiencia</h4>
        <p class="stat-value">{{ efficiency }}%</p>
        <div class="progress-bar">
          <div class="progress-fill" :style="{ width: efficiency + '%', backgroundColor: '#e74c3c' }"></div>
        </div>
        <p class="stat-detail">Uso del espacio</p>
      </div>
    </div>

    <div class="time-stats">
      <h4>Distribución por Horas</h4>
      <div class="time-chart">
        <div v-for="(hour, index) in hourlyData" :key="index" class="time-bar">
          <div class="bar-label">{{ hour.time }}</div>
          <div class="bar-container">
            <div 
              class="bar" 
              :style="{ height: hour.occupancy + '%' }"
              :title="hour.occupancy + '%'"
            ></div>
          </div>
          <div class="bar-value">{{ hour.occupancy }}%</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'AdvancedStats',
  data() {
    return {
      totalSpots: 50,
      occupiedSpots: 38,
      transactionsToday: 124,
      dailyRevenue: 1250.75,
      averageTime: '2h 15m',
      efficiency: 82
    }
  },
  computed: {
    occupancyRate() {
      return Math.round((this.occupiedSpots / this.totalSpots) * 100)
    },
    hourlyData() {
      return [
        { time: '6:00', occupancy: 15 },
        { time: '8:00', occupancy: 45 },
        { time: '10:00', occupancy: 78 },
        { time: '12:00', occupancy: 92 },
        { time: '14:00', occupancy: 85 },
        { time: '16:00', occupancy: 76 },
        { time: '18:00', occupancy: 60 },
        { time: '20:00', occupancy: 35 }
      ]
    }
  }
}
</script>

<style scoped>
.advanced-stats {
  margin-top: 2rem;
  padding: 1.5rem;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.stat-card {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 1.5rem;
  border-radius: 12px;
  text-align: center;
  position: relative;
  overflow: hidden;
}

.stat-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: rgba(255,255,255,0.3);
}

.stat-icon {
  font-size: 2rem;
  margin-bottom: 0.5rem;
}

.stat-card h4 {
  margin: 0.5rem 0;
  font-size: 0.9rem;
  opacity: 0.9;
  font-weight: 500;
}

.stat-value {
  margin: 0.5rem 0;
  font-size: 2rem;
  font-weight: bold;
}

.stat-detail {
  margin: 0.5rem 0 0 0;
  font-size: 0.8rem;
  opacity: 0.8;
}

.progress-bar {
  width: 100%;
  height: 6px;
  background: rgba(255,255,255,0.3);
  border-radius: 3px;
  margin: 0.5rem 0;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: #4cd964;
  border-radius: 3px;
  transition: width 0.3s ease;
}

.time-stats {
  margin-top: 2rem;
}

.time-stats h4 {
  margin-bottom: 1rem;
  color: #2c3e50;
}

.time-chart {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 0.5rem;
  height: 200px;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 8px;
}

.time-bar {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 1;
}

.bar-container {
  height: 150px;
  width: 30px;
  background: #e9ecef;
  border-radius: 4px;
  position: relative;
  overflow: hidden;
}

.bar {
  width: 100%;
  background: linear-gradient(to top, #667eea, #764ba2);
  position: absolute;
  bottom: 0;
  border-radius: 4px;
  transition: height 0.3s ease;
}

.bar-label {
  font-size: 0.8rem;
  margin-bottom: 0.5rem;
  color: #666;
}

.bar-value {
  font-size: 0.7rem;
  margin-top: 0.5rem;
  color: #666;
}
</style>