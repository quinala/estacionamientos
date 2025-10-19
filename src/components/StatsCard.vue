<template>
  <div class="stats-card" :class="type">
    <div class="stats-icon">
      {{ icon }}
    </div>
    <div class="stats-content">
      <div class="stats-value">{{ value }}</div>
      <div class="stats-label">{{ label }}</div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'StatsCard',
  props: {
    type: {
      type: String,
      default: 'primary',
      validator: (value) => ['primary', 'success', 'warning', 'danger'].includes(value)
    },
    icon: {
      type: String,
      required: true
    },
    value: {
      type: [String, Number],
      required: true
    },
    label: {
      type: String,
      required: true
    }
  }
}
</script>

<style scoped>
.stats-card {
  background: white;
  border-radius: 10px;
  padding: 1.5rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  transition: transform 0.3s;
}

.stats-card:hover {
  transform: translateY(-5px);
}

.stats-card.primary {
  border-left: 4px solid #667eea;
}

.stats-card.success {
  border-left: 4px solid #48bb78;
}

.stats-card.warning {
  border-left: 4px solid #ed8936;
}

.stats-card.danger {
  border-left: 4px solid #f56565;
}

.stats-icon {
  font-size: 2.5rem;
  width: 60px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
}

.stats-card.primary .stats-icon {
  background: #667eea;
  color: white;
}

.stats-card.success .stats-icon {
  background: #48bb78;
  color: white;
}

.stats-card.warning .stats-icon {
  background: #ed8936;
  color: white;
}

.stats-card.danger .stats-icon {
  background: #f56565;
  color: white;
}

.stats-content {
  flex: 1;
}

.stats-value {
  font-size: 2rem;
  font-weight: bold;
  color: #2d3748;
  line-height: 1;
  margin-bottom: 0.25rem;
}

.stats-label {
  color: #718096;
  font-weight: 600;
  font-size: 0.875rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}
</style>