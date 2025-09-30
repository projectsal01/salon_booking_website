import { CONFIG } from './config.js';

export class BookingService {
  constructor() {
    this.currentUser = null;
  }

  // Set user authentication
  setUser(user) {
    this.currentUser = user;
  }

  // View available slots
  async viewAvailableSlots(salonId, date, services = []) {
    try {
      const response = await fetch(CONFIG.VIEW_AVAILABLE_SLOTS_URL || CONFIG.BOOK_MULTI_SLOTS_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.currentUser?.token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          mode: "view",
          salon_id: salonId,
          date: date,
          services: services,
          debug: false
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching available slots:', error);
      throw error;
    }
  }

  // Reserve a slot temporarily
  async reserveSlot(salonId, date, slotStartMin, services = []) {
    try {
      const response = await fetch(CONFIG.BOOK_MULTI_SLOTS_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.currentUser?.token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          mode: "reserve",
          salon_id: salonId,
          date: date,
          slot_start_min: slotStartMin,
          services: services,
          debug: false
        })
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.message || 'Reservation failed');
      }

      return result;
    } catch (error) {
      console.error('Error reserving slot:', error);
      throw error;
    }
  }

  // Confirm booking
  async confirmBooking(salonId, date, slotStartMin, services = [], reservationId = null) {
    try {
      const response = await fetch(CONFIG.BOOK_MULTI_SLOTS_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.currentUser?.token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          mode: "book",
          salon_id: salonId,
          date: date,
          slot_start_min: slotStartMin,
          services: services,
          reservation_id: reservationId,
          debug: false
        })
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.message || 'Booking failed');
      }

      return result;
    } catch (error) {
      console.error('Error confirming booking:', error);
      throw error;
    }
  }

  // Convert time string to minutes
  timeToMinutes(timeStr) {
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours * 60 + minutes;
  }

  // Format minutes to time string
  minutesToTime(minutes) {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
  }
}
