<template>
  <div class="ticket-container">
    <!-- Vista previa del ticket -->
    <div class="ticket-preview" ref="ticketContent">
      <div class="ticket">
        <div class="ticket-header">
          <h2>{{ companyName }}</h2>
          <p class="address">{{ companyAddress }}</p>
          <p class="phone">{{ companyPhone }}</p>
        </div>
        
        <div class="divider"></div>
        
        <div class="ticket-body">
          <div class="ticket-row">
            <span class="label">TICKET #:</span>
            <span class="value">{{ ticketData.id }}</span>
          </div>
          
          <div class="ticket-row" v-if="ticketData.type === 'exit'">
            <span class="label">TIPO:</span>
            <span class="value">SALIDA</span>
          </div>
          <div class="ticket-row" v-else>
            <span class="label">TIPO:</span>
            <span class="value">ENTRADA</span>
          </div>
          
          <div class="ticket-row">
            <span class="label">PLACA:</span>
            <span class="value">{{ ticketData.licensePlate }}</span>
          </div>
          
          <div class="ticket-row">
            <span class="label">VEHÍCULO:</span>
            <span class="value">{{ formatVehicleType(ticketData.vehicleType) }}</span>
          </div>
          
          <div class="ticket-row">
            <span class="label">ESPACIO:</span>
            <span class="value">#{{ ticketData.spotNumber }}</span>
          </div>
          
          <div class="ticket-row">
            <span class="label">ENTRADA:</span>
            <span class="value">{{ formatDateTime(ticketData.entryTime) }}</span>
          </div>
          
          <div class="ticket-row" v-if="ticketData.exitTime">
            <span class="label">SALIDA:</span>
            <span class="value">{{ formatDateTime(ticketData.exitTime) }}</span>
          </div>
          
          <div class="ticket-row" v-if="ticketData.hours">
            <span class="label">TIEMPO:</span>
            <span class="value">{{ ticketData.hours }} hora(s)</span>
          </div>
          
          <div class="ticket-row total" v-if="ticketData.amount > 0">
            <span class="label">TOTAL:</span>
            <span class="value">${{ ticketData.amount.toFixed(2) }}</span>
          </div>
        </div>
        
        <div class="divider"></div>
        
        <div class="ticket-footer">
          <p class="thank-you">¡Gracias por su preferencia!</p>
          <p class="barcode">{{ ticketData.barcode }}</p>
          <p class="footer-note">Conserve este ticket</p>
        </div>
      </div>
    </div>

    <!-- Controles -->
    <div class="ticket-controls">
      <button @click="printTicket" class="btn btn-primary">
        🖨️ Imprimir Ticket
      </button>
      <button @click="downloadAsImage" class="btn btn-success">
        🖼️ Descargar Imagen
      </button>
      
      <button @click="$emit('close')" class="btn btn-outline">
        Cerrar
      </button>
    </div>

    <!-- Estado de carga -->
    <div v-if="loading" class="loading-overlay">
      <div class="loading-spinner"></div>
      <p>Generando descarga...</p>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue'
import { useParkingStore } from '../store'

export default {
  name: 'Ticket',
  props: {
    ticketData: {
      type: Object,
      required: true,
      default: () => ({
        id: '',
        type: 'entry',
        licensePlate: '',
        vehicleType: 'car',
        spotId: null,
        spotNumber: '',
        entryTime: null,
        exitTime: null,
        hours: 0,
        amount: 0,
        barcode: ''
      })
    },
    companyName: {
      type: String,
      default: 'ESTACIONAMIENTO CENTRAL'
    },
    companyAddress: {
      type: String,
      default: 'Av. Principal #123'
    },
    companyPhone: {
      type: String,
      default: 'Tel: (555) 123-4567'
    }
  },
  setup() {
    const store = useParkingStore()
    const loading = ref(false)
    return { store, loading }
  },
  methods: {
    formatVehicleType(type) {
      const types = {
        car: 'AUTOMÓVIL',
        motorcycle: 'MOTOCICLETA',
        truck: 'CAMION',
        van: 'VAN'
      }
      return types[type] || 'AUTOMÓVIL'
    },
    
    formatDateTime(dateString) {
      if (!dateString) return 'N/A'
      const date = new Date(dateString)
      return date.toLocaleString('es-ES', {
        hour: '2-digit',
        minute: '2-digit',
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      })
    },
    
    printTicket() {
      const ticketContent = this.$refs.ticketContent.innerHTML
      
      const printWindow = window.open('', '_blank', 'width=300,height=600')
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Ticket de Estacionamiento - ${this.ticketData.id}</title>
            <style>
              * { 
                margin: 0; 
                padding: 0; 
                box-sizing: border-box; 
              }
              body { 
                font-family: 'Courier New', monospace;
                font-size: 12px;
                line-height: 1.2;
                padding: 10px;
                background: white;
              }
              .ticket { 
                width: 70mm;
                margin: 0 auto;
                text-align: center;
                border: 2px solid #000;
                padding: 15px;
                border-radius: 8px;
              }
              .ticket-header { 
                margin-bottom: 10px;
              }
              .ticket-header h2 { 
                font-size: 16px;
                font-weight: bold;
                margin-bottom: 3px;
                text-transform: uppercase;
              }
              .address, .phone {
                font-size: 10px;
                margin-bottom: 2px;
              }
              .divider {
                border-top: 2px dashed #000;
                margin: 10px 0;
              }
              .ticket-row { 
                display: flex;
                justify-content: space-between;
                margin: 5px 0;
                text-align: left;
              }
              .label {
                font-weight: bold;
                flex: 1;
              }
              .value {
                flex: 1;
                text-align: right;
              }
              .total {
                border-top: 2px solid #000;
                padding-top: 8px;
                margin-top: 10px;
                font-weight: bold;
                font-size: 14px;
              }
              .barcode { 
                font-family: monospace;
                letter-spacing: 3px;
                margin: 12px 0;
                padding: 8px;
                background: #f5f5f5;
                border-radius: 4px;
                font-weight: bold;
                font-size: 14px;
              }
              .ticket-footer { 
                margin-top: 12px;
              }
              .thank-you {
                font-weight: bold;
                margin-bottom: 5px;
                font-size: 13px;
              }
              .footer-note {
                font-size: 10px;
                color: #666;
              }
              @media print {
                body { 
                  margin: 0; 
                  padding: 0; 
                }
                .ticket { 
                  width: 70mm; 
                  border: none;
                  padding: 10px;
                }
                @page {
                  margin: 0;
                  size: 70mm auto;
                }
              }
            </style>
          </head>
          <body onload="setTimeout(() => { window.print(); setTimeout(() => window.close(), 1000); }, 500);">
            <div class="ticket">
              ${ticketContent}
            </div>
          </body>
        </html>
      `)
      
      printWindow.document.close()
    },
    
    async downloadAsImage() {
  this.loading = true
  try {
    // Importar directamente desde node_modules
    const html2canvas = (await import('html2canvas')).default
    
    const element = this.$refs.ticketContent
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      backgroundColor: '#ffffff'
    })

    const image = canvas.toDataURL('image/png')
    const link = document.createElement('a')
    link.href = image
    link.download = `ticket-${this.ticketData.id}.png`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    
  } catch (error) {
    console.error('Error:', error)
    
  } finally {
    this.loading = false
  }
},
    
    loadHtml2Canvas() {
      return new Promise((resolve, reject) => {
        // Verificar si ya está cargado
        if (typeof html2canvas !== 'undefined') {
          resolve()
          return
        }

        // Crear script para cargar html2canvas
        const script = document.createElement('script')
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js'
        script.integrity = 'sha512-BNaRQnYJYiPSqHHDb58B0yaPfCu+Wgds8Gp/gU33kqBtgNS4tSPHuGibyooqWH/xgJsgwknjq2k7L+4UZ6uIYQ=='
        script.crossOrigin = 'anonymous'
        script.onload = resolve
        script.onerror = reject
        document.head.appendChild(script)
      })
    },
    
  }
}
</script>

<style scoped>
.ticket-container {
  max-width: 400px;
  margin: 0 auto;
  padding: 20px;
  position: relative;
}

.ticket-preview {
  background: white;
  border: 2px dashed #ccc;
  border-radius: 8px;
  padding: 25px;
  margin-bottom: 25px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
}

.ticket {
  font-family: 'Courier New', monospace;
  font-size: 14px;
  line-height: 1.4;
}

.ticket-header {
  text-align: center;
  margin-bottom: 20px;
}

.ticket-header h2 {
  margin: 8px 0;
  font-size: 18px;
  font-weight: bold;
  text-transform: uppercase;
  color: #2d3748;
  letter-spacing: 1px;
}

.address, .phone {
  font-size: 12px;
  color: #666;
  margin: 3px 0;
}

.divider {
  border-top: 2px dashed #000;
  margin: 15px 0;
  opacity: 0.7;
}

.ticket-row {
  display: flex;
  justify-content: space-between;
  margin: 8px 0;
  padding: 2px 0;
}

.label {
  font-weight: bold;
  flex: 1;
  color: #4a5568;
}

.value {
  flex: 1;
  text-align: right;
  color: #2d3748;
  font-weight: 600;
}

.total {
  border-top: 2px solid #000;
  padding-top: 10px;
  margin-top: 15px;
  font-size: 16px;
  font-weight: bold;
}

.barcode {
  font-family: monospace;
  letter-spacing: 4px;
  margin: 15px 0;
  padding: 12px;
  background: #f8fafc;
  border-radius: 6px;
  font-weight: bold;
  font-size: 15px;
  border: 1px solid #e2e8f0;
  text-align: center;
}

.ticket-footer {
  text-align: center;
  margin-top: 20px;
}

.thank-you {
  font-weight: bold;
  margin-bottom: 8px;
  font-size: 14px;
  color: #2d3748;
}

.footer-note {
  font-size: 11px;
  color: #666;
  font-style: italic;
}

.ticket-controls {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 12px;
  justify-content: center;
}

.btn {
  padding: 12px 16px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  min-height: 50px;
}

.btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0,0,0,0.2);
}

.btn-primary {
  background: linear-gradient(135deg, #007bff 0%, #0056b3 100%);
  color: white;
}

.btn-success {
  background: linear-gradient(135deg, #28a745 0%, #1e7e34 100%);
  color: white;
}

.btn-info {
  background: linear-gradient(135deg, #17a2b8 0%, #138496 100%);
  color: white;
}

.btn-outline {
  background: transparent;
  border: 2px solid #6c757d;
  color: #6c757d;
}

.btn-outline:hover {
  background: #6c757d;
  color: white;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none !important;
}

.loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.9);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  z-index: 10;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #007bff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 15px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.loading-overlay p {
  color: #4a5568;
  font-weight: 600;
  margin: 0;
}

@media (max-width: 480px) {
  .ticket-container {
    padding: 15px;
  }
  
  .ticket-preview {
    padding: 20px;
  }
  
  .ticket-controls {
    grid-template-columns: 1fr;
    gap: 10px;
  }
  
  .btn {
    min-height: 45px;
    font-size: 13px;
  }
  
  .ticket-header h2 {
    font-size: 16px;
  }
  
  .ticket {
    font-size: 13px;
  }
}

@media print {
  .ticket-controls {
    display: none;
  }
  
  .ticket-preview {
    border: none;
    box-shadow: none;
    padding: 0;
  }
}
</style>