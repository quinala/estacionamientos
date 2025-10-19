// src/services/tickets.js

class TicketService {
  constructor() {
    this.tickets = JSON.parse(localStorage.getItem('parkingTickets')) || [];
  }

  generateTicketId() {
    const timestamp = new Date().getTime();
    const random = Math.floor(Math.random() * 1000);
    return `TKT-${timestamp}-${random}`;
  }

  createTicket(vehicleData) {
    const ticket = {
      id: this.generateTicketId(),
      plate: vehicleData.plate,
      vehicleType: vehicleData.vehicleType,
      entryTime: new Date().toISOString(),
      exitTime: null,
      duration: '',
      amount: 0,
      spot: vehicleData.spot,
      status: 'active'
    };

    this.tickets.unshift(ticket);
    this.saveToStorage();
    return ticket;
  }

  completeTicket(ticketId, exitTime, duration, amount) {
    const ticket = this.tickets.find(t => t.id === ticketId);
    if (ticket) {
      ticket.exitTime = exitTime;
      ticket.duration = duration;
      ticket.amount = amount;
      ticket.status = 'completed';
      this.saveToStorage();
    }
    return ticket;
  }

  getTicket(ticketId) {
    return this.tickets.find(t => t.id === ticketId);
  }

  getActiveTickets() {
    return this.tickets.filter(t => t.status === 'active');
  }

  getCompletedTickets() {
    return this.tickets.filter(t => t.status === 'completed');
  }

  saveToStorage() {
    localStorage.setItem('parkingTickets', JSON.stringify(this.tickets));
  }

  // Calcular costo basado en el tiempo
  calculateCost(entryTime, exitTime, ratePerHour = 10) {
    const entry = new Date(entryTime);
    const exit = new Date(exitTime);
    const diffMs = exit - entry;
    const diffHours = diffMs / (1000 * 60 * 60);
    
    // Mínimo 1 hora, luego por fracciones de hora
    const hours = Math.max(1, Math.ceil(diffHours * 4) / 4); // Redondear a cuartos de hora
    return (hours * ratePerHour).toFixed(2);
  }

  // Formatear duración
  formatDuration(entryTime, exitTime) {
    const entry = new Date(entryTime);
    const exit = new Date(exitTime);
    const diffMs = exit - entry;
    
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    
    return `${hours}h ${minutes}m`;
  }
}

export default new TicketService();