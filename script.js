// Mobile menu functionality
function toggleMenu() {
    const navLinks = document.querySelector('.nav-links');
    navLinks.classList.toggle('active');
}

// Smooth scrolling
function scrollToBooking() {
    document.getElementById('booking').scrollIntoView({
        behavior: 'smooth'
    });
}

// Booking functionality
function bookAppointment() {
    const service = document.getElementById('service').value;
    const date = document.getElementById('date').value;
    const time = document.getElementById('time').value;
    const name = document.getElementById('name').value;
    const phone = document.getElementById('phone').value;
    
    if (!name || !phone || !date) {
        alert('Please fill in all required fields');
        return;
    }
    
    // In a real app, this would connect to Supabase
    const appointment = {
        service,
        date,
        time,
        name,
        phone,
        timestamp: new Date().toISOString()
    };
    
    // Save to localStorage for demo
    localStorage.setItem('lastAppointment', JSON.stringify(appointment));
    
    alert(`✅ Appointment booked!\n\n${name}, your ${service} is confirmed for ${date} at ${time}. We'll call you at ${phone} to confirm.`);
    
    // Clear form
    document.getElementById('name').value = '';
    document.getElementById('phone').value = '';
}

// Set minimum date to today
const today = new Date().toISOString().split('T')[0];
document.getElementById('date').min = today;

// PWA Installation prompt
let deferredPrompt;
window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
});

// Service Worker Registration for PWA
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js')
        .then(() => console.log('Service Worker Registered'))
        .catch(err => console.log('Service Worker Error:', err));
}
