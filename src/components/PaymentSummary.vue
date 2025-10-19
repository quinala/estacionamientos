<template>
  <div class="payment-summary card">
    <h3>Resumen de Pago</h3>
    
    <div v-if="transaction" class="payment-details">
      <div class="detail-row">
        <span class="label">Placa:</span>
        <span class="value">{{ transaction.licensePlate }}</span>
      </div>
      
      <div class="detail-row">
        <span class="label">Espacio:</span>
        <span class="value">#{{ getSpotNumber(transaction.spotId) }}</span>
      </div>
      
      <div class="detail-row">
        <span class="label">Entrada:</span>
        <span class="value">{{ formatDateTime(transaction.entryTime) }}</span>
      </div>
      
      <div class="detail-row">
        <span class="label">Salida:</span>
        <span class="value">{{ formatDateTime(transaction.exitTime) }}</span>
      </div>
      
      <div class="detail-row">
        <span class="label">Tiempo:</span>
        <span class="value">{{ transaction.hours }} hora(s)</span>
      </div>
      
      <div class="detail-row total">
        <span class="label">Total a Pagar:</span>
        <span class="value">${{ transaction.amount.toFixed(2) }}</span>
      </div>

      <button 
        v-if="!transaction.paid"
        @click="processPayment"
        class="btn btn-success payment-btn"
        :disabled="processingPayment"
      >
        <span v-if="processingPayment">⌛ Procesando...</span>
        <span v-else>💳 Procesar Pago y Generar Ticket</span>
      </button>

      <div v-else class="paid-badge">
        ✅ PAGADO
        <button @click="showTicket" class="btn btn-outline btn-sm">
          🎫 Ver Ticket
        </button>
      </div>
    </div>

    <div v-else class="no-transaction">
      <p>No hay transacciones pendientes</p>
    </div>

    <!-- Modal de ticket -->
    <div v-if="showTicketModal" class="modal-overlay">
      <div class="modal-content">
        <div class="modal-header">
          <h3>Ticket de Salida</h3>
          <button @click="closeTicketModal" class="close-btn">&times;</button>
        </div>
        <Ticket 
          :ticket-data="generatedTicket"
          @close="closeTicketModal"
        />
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed } from 'vue'
import { useParkingStore } from '../store'
import Ticket from './Ticket.vue'

export default {
  name: 'PaymentSummary',
  components: {
    Ticket
  },
  props: {
    spotId: {
      type: Number,
      default: null
    }
  },
  setup(props) {
    const store = useParkingStore()
    const processingPayment = ref(false)
    const showTicketModal = ref(false)
    const generatedTicket = ref(null)

    const transaction = computed(() => {
      if (props.spotId) {
        return store.transactions
          .filter(t => !t.paid)
          .find(t => t.spotId === props.spotId)
      }
      return store.transactions
        .filter(t => !t.paid)
        .slice(-1)[0] // Última transacción no pagada
    })

    const formatDateTime = (dateString) => {
      return new Date(dateString).toLocaleString('es-ES')
    }

    const getSpotNumber = (spotId) => {
      const spot = store.spots.find(s => s.id === spotId)
      return spot ? spot.number : spotId
    }

    const processPayment = async () => {
      if (!transaction.value) return
      
      processingPayment.value = true

      try {
        const result = store.markAsPaid(transaction.value.id)
        
        if (result.success && result.ticket) {
          generatedTicket.value = result.ticket
          showTicketModal.value = true
        } else {
          alert('Error al procesar el pago')
        }
      } catch (error) {
        console.error('Error procesando pago:', error)
        alert('Error al procesar el pago')
      } finally {
        processingPayment.value = false
      }
    }

    const showTicket = () => {
      // Buscar el ticket de salida para esta transacción
      const ticket = store.tickets.find(t => 
        t.transactionId === transaction.value.id && t.type === 'exit'
      )
      
      if (ticket) {
        generatedTicket.value = ticket
        showTicketModal.value = true
      } else {
        alert('No se encontró el ticket de salida')
      }
    }

    const closeTicketModal = () => {
      showTicketModal.value = false
      generatedTicket.value = null
    }

    return {
      transaction,
      processingPayment,
      showTicketModal,
      generatedTicket,
      formatDateTime,
      getSpotNumber,
      processPayment,
      showTicket,
      closeTicketModal
    }
  }
}
</script>

<style scoped>
.payment-summary {
  max-width: 400px;
  margin: 0 auto;
}

.payment-details {
  space-y: 0.75rem;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 0;
  border-bottom: 1px solid #e2e8f0;
}

.detail-row:last-child {
  border-bottom: none;
}

.detail-row.total {
  font-size: 1.25rem;
  font-weight: bold;
  color: #2d3748;
  padding-top: 1rem;
  margin-top: 1rem;
  border-top: 2px solid #667eea;
}

.label {
  color: #718096;
  font-weight: 600;
}

.value {
  color: #2d3748;
  font-weight: 600;
}

.payment-btn {
  width: 100%;
  margin-top: 1rem;
  font-size: 1.1rem;
  padding: 1rem;
}

.payment-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.paid-badge {
  background: #c6f6d5;
  color: #276749;
  padding: 1rem;
  border-radius: 5px;
  text-align: center;
  font-weight: bold;
  margin-top: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  align-items: center;
}

.btn-sm {
  padding: 0.5rem 1rem;
  font-size: 0.9rem;
}

.no-transaction {
  text-align: center;
  color: #718096;
  padding: 2rem;
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

@media (max-width: 480px) {
  .payment-summary {
    margin: 10px;
  }
  
  .modal-content {
    max-width: 95%;
  }
}
</style>