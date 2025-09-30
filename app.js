import { BookingService } from './booking-service.js';

class SalonBookingApp {
  constructor() {
    this.bookingService = new BookingService();
    this.currentSalonId = null;
    this.selectedServices = [];
    this.currentReservation = null;
    
    this.initializeApp();
  }

  initializeApp() {
    // Initialize UI components
    this.attachEventListeners();
    this.loadServices();
    
    // For demo - in real app, you'd get this from Supabase auth
    this.setupDemoUser();
  }

  setupDemoUser() {
    // Demo user - replace with actual Supabase auth
    const demoUser = {
      id: 'demo-user-id',
      token: 'demo-token', // Replace with actual JWT from Supabase auth
      name: 'Demo User'
    };
    this.bookingService.setUser(demoUser);
  }

  attachEventListeners() {
    // Service selection
    document.querySelectorAll('.service-checkbox').forEach(checkbox => {
      checkbox.addEventListener('change', (e) => {
        this.handleServiceSelection(e.target);
      });
    });

    // Date selection
    document.getElementById('booking-date').addEventListener('change', (e) => {
      this.handleDateSelection(e.target.value);
    });

    // Book now button
    document.getElementById('book-now-btn').addEventListener('click', () => {
      this.handleBooking();
    });
  }

  async handleServiceSelection(checkbox) {
    const service = {
      id: checkbox.value,
      name: checkbox.dataset.name,
      duration: parseInt(checkbox.dataset.duration),
      price: parseFloat(checkbox.dataset.price)
    };

    if (checkbox.checked) {
      this.selectedServices.push(service);
    } else {
      this.selectedServices = this.selectedServices.filter(s => s.id !== service.id);
    }

    await this.updateAvailableSlots();
  }

  async handleDateSelection(date) {
    if (!date) return;
    await this.updateAvailableSlots();
  }

  async updateAvailableSlots() {
    const date = document.getElementById('booking-date').value;
    if (!date || !this.currentSalonId) return;

    try {
      const result = await this.bookingService.viewAvailableSlots(
        this.currentSalonId,
        date,
        this.selectedServices
      );

      if (result.success) {
        this.displayAvailableSlots(result.slots);
      } else {
        this.showError(result.message);
      }
    } catch (error) {
      this.showError(error.message);
    }
  }

  displayAvailableSlots(slots) {
    const slotsContainer = document.getElementById('available-slots');
    slotsContainer.innerHTML = '';

    if (!slots || slots.length === 0) {
      slotsContainer.innerHTML = '<p class="no-slots">No available slots for selected criteria</p>';
      return;
    }

    slots.forEach(slot => {
      const slotElement = document.createElement('div');
      slotElement.className = `slot ${slot.can_book ? 'available' : 'unavailable'}`;
      slotElement.innerHTML = `
        <div class="slot-time">${slot.start} - ${slot.end}</div>
        <div class="slot-status">${slot.status}</div>
        ${slot.can_book ? 
          `<button class="book-slot-btn" data-start="${slot.slot_start_min}">
            ${slot.reserved_by_you ? 'Confirm Booking' : 'Book Now'}
          </button>` : 
          ''
        }
      `;
      
      if (slot.can_book) {
        slotElement.querySelector('.book-slot-btn').addEventListener('click', (e) => {
          this.handleSlotSelection(slot.slot_start_min, slot.reserved_by_you);
        });
      }

      slotsContainer.appendChild(slotElement);
    });
  }

  async handleSlotSelection(slotStartMin, alreadyReserved = false) {
    try {
      let reservationId = null;

      if (!alreadyReserved) {
        // Reserve slot first
        const reserveResult = await this.bookingService.reserveSlot(
          this.currentSalonId,
          document.getElementById('booking-date').value,
          slotStartMin,
          this.selectedServices
        );

        if (reserveResult.success) {
          reservationId = reserveResult.reservation_id;
          this.currentReservation = reserveResult;
          this.showSuccess('Slot reserved! You have 5 minutes to confirm.');
        }
      } else {
        reservationId = this.currentReservation?.reservation_id;
      }

      // Confirm booking
      const bookResult = await this.bookingService.confirmBooking(
        this.currentSalonId,
        document.getElementById('booking-date').value,
        slotStartMin,
        this.selectedServices,
        reservationId
      );

      if (bookResult.success) {
        this.showSuccess('Booking confirmed successfully!');
        this.resetBookingForm();
      }

    } catch (error) {
      this.showError(error.message);
    }
  }

  resetBookingForm() {
    this.selectedServices = [];
    this.currentReservation = null;
    document.querySelectorAll('.service-checkbox').forEach(cb => cb.checked = false);
    document.getElementById('available-slots').innerHTML = '';
  }

  showError(message) {
    // Implement error display
    console.error('Error:', message);
    alert(`Error: ${message}`); // Replace with better UI
  }

  showSuccess(message) {
    // Implement success display
    console.log('Success:', message);
    alert(`Success: ${message}`); // Replace with better UI
  }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new SalonBookingApp();
});
