<template>
  <div class="vehicle-form card">
    <h3>{{ mode === 'entry' ? 'Entrada de Vehículo' : 'Salida de Vehículo' }}</h3>
    
    <form @submit.prevent="handleSubmit">
      <div class="form-group">
        <label for="licensePlate">Placa del Vehículo</label>
        <input
          type="text"
          id="licensePlate"
          v-model="form.licensePlate"
          placeholder="Ej: ABC123"
          required
          :disabled="mode === 'exit'"
        >
      </div>

      <div v-if="mode === 'entry'" class="form-group">
        <label for="vehicleType">Tipo de Vehículo</label>
        <select id="vehicleType" v-model="form.type" required>
          <option value="car">🚗 Automóvil</option>
          <option value="motorcycle">🏍️ Motocicleta</option>
          <option value="truck">🚚 Camión</option>
        </select>
      </div>

      <div v-if="mode === 'entry'" class="form-group">
        <label for="spotType">Tipo de Espacio</label>
        <select id="spotType" v-model="form.spotType" required @change="onSpotTypeChange">
          <option value="regular">Regular ($5/hora)</option>
          <option value="premium">Premium ($8/hora)</option>
        </select>
      </div>

      <!-- NUEVO: Selector de horas para entrada -->
      <div v-if="mode === 'entry'" class="form-group">
        <label for="hours">Horas de Estacionamiento</label>
        <div class="hours-selector">
          <input
            type="range"
            id="hours"
            class="hours-input"
            min="1"
            max="24"
            v-model="form.hours"
          >
          <div class="hours-display">{{ form.hours }} {{ form.hours === 1 ? 'hora' : 'horas' }}</div>
        </div>
        <p class="example">Seleccione la cantidad de horas que desea estacionar</p>
      </div>

      <!-- NUEVO: Selección de espacio específico para entrada -->
      <div v-if="mode === 'entry'" class="form-group">
        <label>Seleccionar Espacio Específico</label>
        <div class="spaces-grid">
          <div
            class="space-option"
            v-for="space in availableSpots"
            :key="space.id"
            :class="{ 'occupied': space.occupied }"
          >
            <input
              type="radio"
              :id="'space-' + space.id"
              :value="space.id"
              v-model="form.selectedSpotId"
              :disabled="space.occupied"
            >
            <label :for="'space-' + space.id">
              {{ space.number }}
              <div v-if="space.occupied" class="space-status">OCUPADO</div>
              <div v-else class="space-status">DISPONIBLE</div>
            </label>
          </div>
        </div>
        <p class="example" v-if="availableSpots.length === 0">No hay espacios disponibles de este tipo</p>
      </div>

      <!-- Resumen de costo para entrada -->
      <div v-if="mode === 'entry' && form.selectedSpotId" class="cost-summary">
        <h4>Resumen de Reserva</h4>
        <div class="summary-details">
          <div class="detail-row">
            <span class="label">Horas seleccionadas:</span>
            <span class="value">{{ form.hours }}</span>
          </div>
          <div class="detail-row">
            <span class="label">Tarifa por hora:</span>
            <span class="value">${{ getHourlyRate() }}</span>
          </div>
          <div class="detail-row total">
            <span class="label">Total a pagar:</span>
            <span class="value">${{ calculateEntryAmount() }}</span>
          </div>
        </div>
      </div>

      <div v-if="mode === 'exit'" class="form-group">
        <label for="spotId">Espacio a Liberar</label>
        <select id="spotId" v-model="form.spotId" required>
          <option value="">Seleccione un espacio</option>
          <option 
            v-for="spot in occupiedSpots" 
            :key="spot.id" 
            :value="spot.id"
          >
            Espacio #{{ spot.number }} - {{ getVehiclePlate(spot.vehicleId) }}
          </option>
        </select>
      </div>

      <!-- Opciones de pago para salida -->
      <div v-if="mode === 'exit' && form.spotId" class="payment-options">
        <h4>Opciones de Pago</h4>
        <div class="option-group">
          <label class="option-label">
            <input 
              type="radio" 
              v-model="form.paymentOption" 
              value="payNow" 
              class="option-input"
            >
            <span class="option-text">
              💳 Pagar Ahora - ${{ calculateAmount() }}
            </span>
          </label>
          
          <label class="option-label">
            <input 
              type="radio" 
              v-model="form.paymentOption" 
              value="payLater" 
              class="option-input"
            >
            <span class="option-text">
              ⏰ Pagar Después - Generar factura pendiente
            </span>
          </label>
        </div>
      </div>

      <!-- Resumen para salida -->
      <div v-if="mode === 'exit' && form.spotId" class="exit-summary">
        <h4>Resumen</h4>
        <div class="summary-details">
          <div class="detail-row">
            <span class="label">Tiempo estimado:</span>
            <span class="value">{{ calculateDuration() }}</span>
          </div>
          <div class="detail-row">
            <span class="label">Tarifa por hora:</span>
            <span class="value">${{ getHourlyRate() }}</span>
          </div>
          <div class="detail-row total">
            <span class="label">Total a pagar:</span>
            <span class="value">${{ calculateAmount() }}</span>
          </div>
        </div>
      </div>

      <button 
        type="submit" 
        class="btn"
        :class="getButtonClass()"
        :disabled="processing || !canSubmit"
      >
        <span v-if="processing">⌛ Procesando...</span>
        <span v-else>
          {{ getButtonText() }}
        </span>
      </button>
    </form>

    <div v-if="message" class="message" :class="messageType">
      {{ message }}
    </div>

    <!-- Modal para mostrar el ticket -->
    <div v-if="showTicketModal" class="modal-overlay">
      <div class="modal-content">
        <div class="modal-header">
          <h3>{{ getModalTitle() }}</h3>
          <button @click="closeTicketModal" class="close-btn">&times;</button>
        </div>
        <Ticket 
          :ticket-data="generatedTicket"
          @close="closeTicketModal"
        />
      </div>
    </div>

    <!-- Sección de pagos pendientes -->
    <div v-if="pendingPayments.length > 0" class="pending-payments-section">
      <h4>📋 Pagos Pendientes</h4>
      <div class="pending-payments-list">
        <div 
          v-for="payment in pendingPayments" 
          :key="payment.id"
          class="pending-payment-item"
        >
          <div class="payment-info">
            <div class="payment-header">
              <span class="plate">{{ payment.licensePlate }}</span>
              <span class="amount">${{ payment.amount.toFixed(2) }}</span>
            </div>
            <div class="payment-details">
              <span class="spot">Espacio #{{ getSpotNumber(payment.spotId) }}</span>
              <span class="time">{{ formatDateTime(payment.entryTime) }} - {{ formatDateTime(payment.exitTime) }}</span>
              <span class="hours">{{ payment.hours }} hora(s)</span>
            </div>
          </div>
          <button 
            @click="processPendingPayment(payment.id)"
            class="btn btn-success btn-sm"
          >
            💳 Pagar Ahora
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, watch } from 'vue'
import { useParkingStore } from '../store'
import Ticket from './Ticket.vue'

export default {
  name: 'VehicleForm',
  components: {
    Ticket
  },
  props: {
    mode: {
      type: String,
      required: true,
      validator: (value) => ['entry', 'exit'].includes(value)
    }
  },
  setup(props, { emit }) {
    const store = useParkingStore()
    const form = ref({
      licensePlate: '',
      type: 'car',
      spotType: 'regular',
      hours: 1, // NUEVO: Horas de estacionamiento
      selectedSpotId: '', // NUEVO: Espacio específico seleccionado
      spotId: '',
      paymentOption: 'payNow'
    })
    const message = ref('')
    const messageType = ref('')
    const processing = ref(false)
    const showTicketModal = ref(false)
    const generatedTicket = ref(null)

    const availableSpots = computed(() => {
      return store.availableSpots.filter(spot => 
        props.mode === 'entry' ? spot.type === form.value.spotType : true
      )
    })

    const occupiedSpots = computed(() => store.occupiedSpots)

    const pendingPayments = computed(() => {
      return store.transactions.filter(transaction => 
        !transaction.paid && transaction.exitTime
      )
    })

    // NUEVO: Validación para habilitar el botón de submit
    const canSubmit = computed(() => {
      if (props.mode === 'entry') {
        return form.value.licensePlate.trim() !== '' && 
               form.value.selectedSpotId !== '' &&
               form.value.hours > 0
      } else {
        return form.value.spotId !== '' && 
               form.value.paymentOption !== ''
      }
    })

    const getHourlyRate = () => {
      if (props.mode === 'entry') {
        return form.value.spotType === 'premium' ? 8 : 5
      } else {
        if (!form.value.spotId) return 0
        const spot = store.spots.find(s => s.id == form.value.spotId)
        return spot ? spot.hourlyRate : 0
      }
    }

    // NUEVO: Calcular monto para entrada
    const calculateEntryAmount = () => {
      return (getHourlyRate() * form.value.hours).toFixed(2)
    }

    const getVehiclePlate = (vehicleId) => {
      const vehicle = store.vehicles.find(v => v.id === vehicleId)
      return vehicle ? vehicle.licensePlate : 'N/A'
    }

    const getSpotNumber = (spotId) => {
      const spot = store.spots.find(s => s.id === spotId)
      return spot ? spot.number : spotId
    }

    const getVehicleInfo = (spotId) => {
      const spot = store.spots.find(s => s.id === spotId)
      if (!spot || !spot.vehicleId) return null
      
      return store.vehicles.find(v => v.id === spot.vehicleId)
    }

    const calculateDuration = () => {
      if (props.mode !== 'exit' || !form.value.spotId) return '0h 0m'
      
      const vehicle = getVehicleInfo(form.value.spotId)
      if (!vehicle) return '0h 0m'

      const entry = new Date(vehicle.entryTime)
      const now = new Date()
      const diffMs = now - entry
      
      const hours = Math.floor(diffMs / (1000 * 60 * 60))
      const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60))
      
      return `${hours}h ${minutes}m`
    }

    const calculateAmount = () => {
      if (props.mode !== 'exit' || !form.value.spotId) return '0.00'
      
      const vehicle = getVehicleInfo(form.value.spotId)
      if (!vehicle) return '0.00'

      const spot = store.spots.find(s => s.id == form.value.spotId)
      if (!spot) return '0.00'

      const entry = new Date(vehicle.entryTime)
      const now = new Date()
      const hours = Math.ceil((now - entry) / (1000 * 60 * 60))
      
      return (hours * spot.hourlyRate).toFixed(2)
    }

    // NUEVO: Manejar cambio de tipo de espacio
    const onSpotTypeChange = () => {
      form.value.selectedSpotId = ''
    }

    const showMessage = (text, type = 'success') => {
      message.value = text
      messageType.value = type
      setTimeout(() => {
        message.value = ''
      }, 3000)
    }

    const formatDateTime = (dateString) => {
      if (!dateString) return 'N/A'
      return new Date(dateString).toLocaleString('es-ES')
    }

    const generateTicketId = () => {
      const timestamp = Date.now()
      const random = Math.random().toString(36).substr(2, 5).toUpperCase()
      return `TKT-${timestamp}-${random}`
    }

    const generateBarcode = (ticketId) => {
      return ticketId.split('').map(char => {
        if (char === '-') return ' '
        return '█'
      }).join('')
    }

    const createEntryTicket = (spot, vehicleData, hours, amount) => {
      const ticketId = generateTicketId()
      
      const ticket = {
        id: ticketId,
        type: 'entry',
        licensePlate: vehicleData.licensePlate.toUpperCase(),
        vehicleType: vehicleData.type,
        spotId: spot.id,
        spotNumber: spot.number,
        entryTime: new Date().toISOString(),
        reservedHours: hours,
        amount: amount,
        status: 'active',
        barcode: generateBarcode(ticketId)
      }

      // Guardar en el store
      if (!store.tickets) {
        store.tickets = []
      }
      store.tickets.unshift(ticket)
      store.saveData()
      
      return ticket
    }

    const createExitTicket = (transaction, spot, paid = false) => {
      const ticketId = generateTicketId()
      
      const ticket = {
        id: ticketId,
        type: 'exit',
        licensePlate: transaction.licensePlate,
        vehicleType: store.getVehicleType ? store.getVehicleType(transaction.vehicleId) : 'car',
        spotId: transaction.spotId,
        spotNumber: spot?.number || 'N/A',
        entryTime: transaction.entryTime,
        exitTime: transaction.exitTime,
        hours: transaction.hours,
        amount: transaction.amount,
        status: paid ? 'completed' : 'pending_payment',
        barcode: generateBarcode(ticketId),
        transactionId: transaction.id,
        paid: paid
      }

      // Guardar en el store
      if (!store.tickets) {
        store.tickets = []
      }
      store.tickets.unshift(ticket)
      store.saveData()
      
      return ticket
    }

    const handleSubmit = async () => {
      processing.value = true

      try {
        if (props.mode === 'entry') {
          // Validar formato de placa
          const plateRegex = /^[A-Z]{3}\d{3}$/
          const formattedPlate = form.value.licensePlate.toUpperCase().replace(/\s/g, '')
          
          if (!plateRegex.test(formattedPlate)) {
            showMessage('Formato de placa inválido. Use: ABC123', 'error')
            processing.value = false
            return
          }

          // Verificar si el espacio seleccionado está disponible
          const selectedSpot = availableSpots.value.find(spot => spot.id == form.value.selectedSpotId)
          if (!selectedSpot || selectedSpot.occupied) {
            showMessage('El espacio seleccionado no está disponible', 'error')
            processing.value = false
            return
          }

          const success = store.occupySpot(parseInt(form.value.selectedSpotId), {
            licensePlate: formattedPlate,
            type: form.value.type,
            reservedHours: form.value.hours // NUEVO: Guardar horas reservadas
          })

          if (success) {
            // Calcular monto
            const amount = parseFloat(calculateEntryAmount())
            
            // Crear ticket de entrada
            const ticket = createEntryTicket(selectedSpot, {
              licensePlate: formattedPlate,
              type: form.value.type
            }, form.value.hours, amount)
            
            generatedTicket.value = ticket
            showTicketModal.value = true
            
            showMessage(`Vehículo registrado en espacio #${selectedSpot.number} por ${form.value.hours} horas`)
            
            // Resetear formulario
            form.value.licensePlate = ''
            form.value.selectedSpotId = ''
            form.value.hours = 1
            
            emit('vehicle-processed')
          } else {
            showMessage('Error al registrar el vehículo', 'error')
          }
        } else {
          // Modo salida (código existente)
          if (!form.value.spotId) {
            showMessage('Seleccione un espacio', 'error')
            processing.value = false
            return
          }

          const success = store.freeSpot(parseInt(form.value.spotId))
          if (success) {
            // Buscar la transacción recién creada
            setTimeout(() => {
              const transaction = store.transactions
                .filter(t => !t.paid)
                .find(t => t.spotId == form.value.spotId)
              
              if (transaction) {
                // Buscar el spot para el ticket
                const spot = store.spots.find(s => s.id == form.value.spotId)
                
                if (form.value.paymentOption === 'payNow') {
                  // Pagar inmediatamente
                  const paymentSuccess = store.markAsPaid(transaction.id)
                  
                  if (paymentSuccess) {
                    // Crear ticket de salida pagado
                    const ticket = createExitTicket(transaction, spot, true)
                    generatedTicket.value = ticket
                    showTicketModal.value = true
                    
                    showMessage('Vehículo retirado y pago procesado exitosamente')
                  }
                } else {
                  // Dejar pago pendiente
                  const ticket = createExitTicket(transaction, spot, false)
                  generatedTicket.value = ticket
                  showTicketModal.value = true
                  
                  showMessage('Vehículo retirado. Pago pendiente por $' + transaction.amount.toFixed(2))
                }
                
                form.value.spotId = ''
                form.value.paymentOption = 'payNow'
                emit('vehicle-processed')
              }
            }, 100)
          } else {
            showMessage('Error al retirar el vehículo', 'error')
          }
        }
      } catch (error) {
        showMessage('Error en el proceso', 'error')
        console.error(error)
      } finally {
        processing.value = false
      }
    }

    const processPendingPayment = async (transactionId) => {
      processing.value = true

      try {
        const success = store.markAsPaid(transactionId)
        
        if (success) {
          // Actualizar el ticket correspondiente
          const transaction = store.transactions.find(t => t.id === transactionId)
          if (transaction) {
            const ticket = store.tickets.find(t => t.transactionId === transactionId)
            if (ticket) {
              ticket.paid = true
              ticket.status = 'completed'
              store.saveData()
            }
          }
          
          showMessage('Pago procesado exitosamente')
          emit('vehicle-processed')
        } else {
          showMessage('Error al procesar el pago', 'error')
        }
      } catch (error) {
        showMessage('Error al procesar el pago', 'error')
        console.error(error)
      } finally {
        processing.value = false
      }
    }

    const closeTicketModal = () => {
      showTicketModal.value = false
      generatedTicket.value = null
    }

    const getButtonClass = () => {
      if (props.mode === 'entry') return 'btn-primary'
      return form.value.paymentOption === 'payNow' ? 'btn-success' : 'btn-warning'
    }

    const getButtonText = () => {
      if (props.mode === 'entry') {
        return `🎫 Reservar por ${form.value.hours} ${form.value.hours === 1 ? 'hora' : 'horas'} y Generar Ticket`
      }
      
      if (form.value.paymentOption === 'payNow') {
        return '💳 Registrar Salida y Pagar Ahora'
      } else {
        return '⏰ Registrar Salida y Dejar Pago Pendiente'
      }
    }

    const getModalTitle = () => {
      if (props.mode === 'entry') return 'Ticket de Entrada'
      
      if (form.value.paymentOption === 'payNow') {
        return 'Ticket de Salida - PAGADO'
      } else {
        return 'Ticket de Salida - PAGO PENDIENTE'
      }
    }

    // Resetear formulario cuando cambia el modo
    watch(() => props.mode, () => {
      form.value = {
        licensePlate: '',
        type: 'car',
        spotType: 'regular',
        hours: 1,
        selectedSpotId: '',
        spotId: '',
        paymentOption: 'payNow'
      }
      message.value = ''
      showTicketModal.value = false
      generatedTicket.value = null
    })

    return {
      form,
      message,
      messageType,
      processing,
      showTicketModal,
      generatedTicket,
      pendingPayments,
      availableSpots,
      occupiedSpots,
      canSubmit,
      getVehiclePlate,
      getSpotNumber,
      calculateDuration,
      getHourlyRate,
      calculateAmount,
      calculateEntryAmount,
      formatDateTime,
      onSpotTypeChange,
      handleSubmit,
      processPendingPayment,
      closeTicketModal,
      getButtonClass,
      getButtonText,
      getModalTitle
    }
  }
}
</script>

<style scoped>
.form-group {
  margin-bottom: 1rem;
}

label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 600;
  color: #4a5568;
}

input, select {
  width: 100%;
  padding: 0.75rem;
  border: 2px solid #e2e8f0;
  border-radius: 5px;
  font-size: 1rem;
  transition: border-color 0.3s;
}

input:focus, select:focus {
  outline: none;
  border-color: #667eea;
}

input:disabled {
  background-color: #f7fafc;
  cursor: not-allowed;
}

/* NUEVOS ESTILOS PARA SELECTOR DE HORAS */
.hours-selector {
  display: flex;
  align-items: center;
  gap: 15px;
  margin-top: 0.5rem;
}

.hours-input {
  flex: 1;
}

.hours-display {
  font-weight: bold;
  color: #2c3e50;
  min-width: 60px;
  text-align: center;
}

.example {
  font-size: 0.85rem;
  color: #7f8c8d;
  margin-top: 5px;
}

/* NUEVOS ESTILOS PARA SELECCIÓN DE ESPACIOS */
.spaces-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  gap: 10px;
  margin-top: 10px;
}

.space-option {
  position: relative;
}

.space-option input {
  display: none;
}

.space-option label {
  display: block;
  padding: 15px 10px;
  background-color: #ecf0f1;
  border: 2px solid transparent;
  border-radius: 8px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s;
}

.space-option input:checked + label {
  background-color: #2ecc71;
  color: white;
  border-color: #2ecc71;
}

.space-option.occupied label {
  background-color: #e74c3c;
  color: white;
  cursor: not-allowed;
  opacity: 0.6;
}

.space-option.occupied input {
  display: none;
}

.space-status {
  font-size: 0.7em;
  margin-top: 5px;
  font-weight: bold;
}

/* NUEVOS ESTILOS PARA RESUMEN DE COSTO */
.cost-summary {
  margin: 1.5rem 0;
  padding: 1rem;
  background: #f0f9ff;
  border-radius: 8px;
  border: 1px solid #90cdf4;
}

.cost-summary h4 {
  margin-bottom: 1rem;
  color: #2b6cb0;
}

/* ESTILOS EXISTENTES */
.payment-options {
  margin: 1.5rem 0;
  padding: 1rem;
  background: #f8fafc;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
}

.payment-options h4 {
  margin-bottom: 1rem;
  color: #4a5568;
}

.option-group {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.option-label {
  display: flex;
  align-items: center;
  padding: 0.75rem;
  border: 2px solid #e2e8f0;
  border-radius: 5px;
  cursor: pointer;
  transition: all 0.3s;
}

.option-label:hover {
  border-color: #667eea;
  background: #f7fafc;
}

.option-input {
  margin-right: 0.75rem;
}

.option-text {
  font-weight: 500;
}

.exit-summary {
  margin: 1.5rem 0;
  padding: 1rem;
  background: #f0fff4;
  border-radius: 8px;
  border: 1px solid #9ae6b4;
}

.exit-summary h4 {
  margin-bottom: 1rem;
  color: #2f855a;
}

.summary-details {
  space-y: 0.5rem;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.25rem 0;
}

.detail-row.total {
  font-size: 1.1rem;
  font-weight: bold;
  color: #2d3748;
  padding-top: 0.5rem;
  margin-top: 0.5rem;
  border-top: 2px solid #48bb78;
}

.label {
  color: #718096;
  font-weight: 600;
}

.value {
  color: #2d3748;
  font-weight: 600;
}

.message {
  margin-top: 1rem;
  padding: 0.75rem;
  border-radius: 5px;
  text-align: center;
  font-weight: 600;
}

.message.success {
  background: #c6f6d5;
  color: #2d3748;
  border: 1px solid #48bb78;
}

.message.error {
  background: #fed7d7;
  color: #2d3748;
  border: 1px solid #f56565;
}

.pending-payments-section {
  margin-top: 2rem;
  padding: 1.5rem;
  background: #fffaf0;
  border-radius: 8px;
  border: 1px solid #fbd38d;
}

.pending-payments-section h4 {
  margin-bottom: 1rem;
  color: #dd6b20;
}

.pending-payments-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.pending-payment-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background: white;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
}

.payment-info {
  flex: 1;
}

.payment-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.plate {
  font-weight: bold;
  font-size: 1.1rem;
  color: #2d3748;
}

.amount {
  font-weight: bold;
  color: #e53e3e;
  font-size: 1.1rem;
}

.payment-details {
  display: flex;
  gap: 1rem;
  font-size: 0.9rem;
  color: #718096;
}

.btn-sm {
  padding: 0.5rem 1rem;
  font-size: 0.9rem;
}

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
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.5rem;
  border-bottom: 1px solid #e2e8f0;
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

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

@media (max-width: 768px) {
  .payment-details {
    flex-direction: column;
    gap: 0.25rem;
  }
  
  .pending-payment-item {
    flex-direction: column;
    align-items: stretch;
    gap: 1rem;
  }

  .spaces-grid {
    grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
  }

  .hours-selector {
    flex-direction: column;
    gap: 10px;
  }

  .hours-display {
    min-width: auto;
  }
}
</style>