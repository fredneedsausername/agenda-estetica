/**
 * Calendar Core Functionality
 * Handles the initialization and management of the calendar system
 */

document.addEventListener('DOMContentLoaded', function() {
    // Initialize the calendar system
    CalendarManager.init();
});

/**
 * Calendar Manager
 * Core logic for managing the calendar system
 */
const CalendarManager = {
    // Calendar instances
    calendarInstances: [],
    
    // Current view
    currentView: 'timeGridDay',
    
    // Current date
    currentDate: new Date(),
    
    // Modal elements
    appointmentModal: null,
    appointmentForm: null,
    currentAppointment: null,
    
    /**
     * Initialize the calendar system
     */
    init() {
        // Locales are loaded via the separate script tag
        // No need to register them manually
        
        // Initialize DOM elements
        this.initDomElements();
        
        // Create worker calendars
        this.createWorkerCalendars();
        
        // Setup event handlers
        this.setupEventHandlers();
        
        // Initialize date pickers
        this.initDatePickers();
        
        // Update the current date display
        this.updateDateDisplay();
    },
    
    /**
     * Initialize DOM elements
     */
    initDomElements() {
        this.appointmentModal = document.getElementById('appointment-modal-overlay');
        this.appointmentForm = document.getElementById('appointment-form');
        
        // Populate form dropdowns
        this.populateClientDropdown();
        this.populateServiceDropdown();
        this.populateWorkerDropdown();
        this.populatePositionDropdown();
    },
    
    /**
     * Create calendar for each worker
     */
    createWorkerCalendars() {
        const workers = CalendarDataService.getWorkers();
        const scrollContent = document.getElementById('scrollContent');
        
        // Clear existing content
        scrollContent.innerHTML = '';
        this.calendarInstances = [];
        
        // Create calendar for each worker
        workers.forEach(worker => {
            // Create worker container
            const workerElement = document.createElement('div');
            workerElement.className = 'scroll-element';
            workerElement.dataset.workerId = worker.id;
            
            // Create worker header
            const workerHeader = document.createElement('div');
            workerHeader.className = 'element-content';
            workerHeader.textContent = worker.name;
            
            // Create calendar container
            const calendarContainer = document.createElement('div');
            calendarContainer.className = 'calendar-container';
            
            // Append elements
            workerElement.appendChild(workerHeader);
            workerElement.appendChild(calendarContainer);
            scrollContent.appendChild(workerElement);
            
            // Initialize FullCalendar
            const calendar = new FullCalendar.Calendar(calendarContainer, {
                initialView: this.currentView,
                initialDate: this.currentDate,
                locale: 'it',
                headerToolbar: false, // We use custom controls
                allDaySlot: false,
                slotMinTime: '08:00:00',
                slotMaxTime: '20:00:00',
                height: 'auto',
                stickyHeaderDates: true,
                nowIndicator: true,
                events: CalendarDataService.getWorkerEvents(worker.id),
                eventClick: this.handleEventClick.bind(this),
                dateClick: this.handleDateClick.bind(this),
                eventTimeFormat: {
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: false
                }
            });
            
            calendar.render();
            
            // Store calendar instance with worker ID
            this.calendarInstances.push({
                calendar,
                workerId: worker.id
            });
        });
    },
    
    /**
     * Set up event handlers
     */
    setupEventHandlers() {
        // Previous button
        document.getElementById('prev-button').addEventListener('click', () => {
            this.navigateTo('prev');
        });
        
        // Next button
        document.getElementById('next-button').addEventListener('click', () => {
            this.navigateTo('next');
        });
        
        // View buttons
        document.getElementById('day-view').addEventListener('click', () => {
            this.changeView('timeGridDay');
        });
        
        document.getElementById('week-view').addEventListener('click', () => {
            this.changeView('timeGridWeek');
        });
        
        document.getElementById('month-view').addEventListener('click', () => {
            this.changeView('dayGridMonth');
        });
        
        document.getElementById('list-view').addEventListener('click', () => {
            this.changeView('listWeek');
        });
        
        // New appointment button
        document.getElementById('new-appointment-btn').addEventListener('click', () => {
            this.openAppointmentModal();
        });
        
        // Modal close button
        document.getElementById('modal-close').addEventListener('click', () => {
            this.closeAppointmentModal();
        });
        
        // Cancel button
        document.getElementById('cancel-appointment').addEventListener('click', () => {
            this.closeAppointmentModal();
        });
        
        // Save button
        document.getElementById('save-appointment').addEventListener('click', () => {
            this.saveAppointment();
        });
        
        // Delete button
        document.getElementById('delete-appointment').addEventListener('click', () => {
            this.deleteAppointment();
        });
        
        // Service dropdown change
        document.getElementById('appointment-service').addEventListener('change', (e) => {
            this.handleServiceChange(e.target.value);
        });
    },
    
    /**
     * Initialize date pickers
     */
    initDatePickers() {
        // Start date/time picker
        flatpickr('#appointment-start', {
            enableTime: true,
            dateFormat: "Y-m-d H:i",
            locale: "it",
            time_24hr: true,
            minuteIncrement: 15,
            onChange: (selectedDates) => {
                // Update end time based on start time and service duration
                if (selectedDates.length > 0) {
                    this.updateEndTime(selectedDates[0]);
                }
            }
        });
        
        // End date/time picker
        flatpickr('#appointment-end', {
            enableTime: true,
            dateFormat: "Y-m-d H:i",
            locale: "it",
            time_24hr: true,
            minuteIncrement: 15
        });
    },
    
    /**
     * Update end time based on start time and selected service
     * @param {Date} startDate - The selected start date
     */
    updateEndTime(startDate) {
        const serviceId = document.getElementById('appointment-service').value;
        if (!serviceId) return;
        
        const services = CalendarDataService.getServices();
        const service = services.find(s => s.id === serviceId);
        if (!service) return;
        
        const endDate = new Date(startDate);
        endDate.setMinutes(endDate.getMinutes() + service.duration);
        
        const endPicker = document.getElementById('appointment-end')._flatpickr;
        endPicker.setDate(endDate);
    },
    
    /**
     * Handle service selection change
     * @param {string} serviceId - The ID of the selected service
     */
    handleServiceChange(serviceId) {
        if (!serviceId) return;
        
        const startInput = document.getElementById('appointment-start');
        const startDate = startInput._flatpickr.selectedDates[0];
        
        if (startDate) {
            this.updateEndTime(startDate);
        }
    },
    
    /**
     * Navigate calendars to previous/next
     * @param {string} direction - Direction to navigate ('prev' or 'next')
     */
    navigateTo(direction) {
        this.calendarInstances.forEach(({ calendar }) => {
            calendar[direction]();
        });
        
        // Update current date from first calendar
        if (this.calendarInstances.length > 0) {
            this.currentDate = this.calendarInstances[0].calendar.getDate();
            this.updateDateDisplay();
        }
    },
    
    /**
     * Change calendar view
     * @param {string} viewName - Name of the view to change to
     */
    changeView(viewName) {
        // Update view buttons
        const viewButtons = document.querySelectorAll('.view-btn');
        viewButtons.forEach(button => {
            button.classList.remove('active');
        });
        
        const activeButton = document.getElementById(`${viewName.replace('timeGrid', '').replace('dayGrid', '').toLowerCase()}-view`);
        if (activeButton) {
            activeButton.classList.add('active');
        }
        
        // Change view for all calendars
        this.currentView = viewName;
        this.calendarInstances.forEach(({ calendar }) => {
            calendar.changeView(viewName);
        });
    },
    
    /**
     * Update the date display
     */
    updateDateDisplay() {
        const dateDisplay = document.getElementById('current-date');
        const options = { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        };
        
        dateDisplay.textContent = this.currentDate.toLocaleDateString('it-IT', options);
    },
    
    /**
     * Handle click on a calendar event
     * @param {Object} info - Event information from FullCalendar
     */
    handleEventClick(info) {
        const eventId = info.event.id;
        const appointments = CalendarDataService.getAppointments();
        const appointment = appointments.find(a => a.id === eventId);
        
        if (appointment) {
            this.openAppointmentModal(appointment);
        }
    },
    
    /**
     * Handle click on a calendar date
     * @param {Object} info - Date information from FullCalendar
     */
    handleDateClick(info) {
        // Create a new appointment at the clicked time for the appropriate worker
        const workerId = info.view.calendar.el.closest('.scroll-element').dataset.workerId;
        
        const newAppointment = {
            workerId: workerId,
            start: info.dateStr,
            end: this.calculateEndTime(info.date, 60) // Default to 1 hour
        };
        
        this.openAppointmentModal(newAppointment);
    },
    
    /**
     * Calculate end time based on start time and duration
     * @param {Date} startDate - The start date
     * @param {number} durationMinutes - Duration in minutes
     * @returns {string} ISO string for end time
     */
    calculateEndTime(startDate, durationMinutes) {
        const endDate = new Date(startDate);
        endDate.setMinutes(endDate.getMinutes() + durationMinutes);
        return endDate.toISOString();
    },
    
    /**
     * Open the appointment modal
     * @param {Object} appointment - Appointment data (optional)
     */
    openAppointmentModal(appointment = null) {
        this.currentAppointment = appointment;
        
        // Get modal elements
        const modalTitle = document.getElementById('modal-title');
        const deleteButton = document.getElementById('delete-appointment');
        
        // Set modal title and delete button visibility
        if (appointment && appointment.id) {
            modalTitle.textContent = 'Modifica Appuntamento';
            deleteButton.style.display = 'block';
        } else {
            modalTitle.textContent = 'Nuovo Appuntamento';
            deleteButton.style.display = 'none';
        }
        
        // Reset form
        this.appointmentForm.reset();
        
        // Fill form with appointment data if provided
        if (appointment) {
            if (appointment.clientId) {
                document.getElementById('appointment-client').value = appointment.clientId;
            }
            
            if (appointment.serviceId) {
                document.getElementById('appointment-service').value = appointment.serviceId;
            }
            
            if (appointment.workerId) {
                document.getElementById('appointment-worker').value = appointment.workerId;
            }
            
            if (appointment.positionId) {
                document.getElementById('appointment-position').value = appointment.positionId;
            }
            
            if (appointment.start) {
                document.getElementById('appointment-start')._flatpickr.setDate(appointment.start);
            }
            
            if (appointment.end) {
                document.getElementById('appointment-end')._flatpickr.setDate(appointment.end);
            }
            
            if (appointment.price) {
                document.getElementById('appointment-price').value = appointment.price;
            }
            
            if (appointment.notes) {
                document.getElementById('appointment-notes').value = appointment.notes;
            }
        }
        
        // Show the modal
        this.appointmentModal.style.display = 'flex';
    },
    
    /**
     * Close the appointment modal
     */
    closeAppointmentModal() {
        this.appointmentModal.style.display = 'none';
        this.currentAppointment = null;
    },
    
    /**
     * Save the current appointment
     */
    saveAppointment() {
        // Validate form
        if (!this.validateAppointmentForm()) {
            return;
        }
        
        // Get form data
        const appointmentData = {
            clientId: document.getElementById('appointment-client').value,
            serviceId: document.getElementById('appointment-service').value,
            workerId: document.getElementById('appointment-worker').value,
            positionId: document.getElementById('appointment-position').value,
            start: document.getElementById('appointment-start')._flatpickr.selectedDates[0].toISOString(),
            end: document.getElementById('appointment-end')._flatpickr.selectedDates[0].toISOString(),
            price: parseFloat(document.getElementById('appointment-price').value),
            notes: document.getElementById('appointment-notes').value
        };
        
        // If editing, include the appointment ID
        if (this.currentAppointment && this.currentAppointment.id) {
            appointmentData.id = this.currentAppointment.id;
        }
        
        // Save the appointment
        CalendarDataService.saveAppointment(appointmentData);
        
        // Close the modal
        this.closeAppointmentModal();
        
        // Refresh the calendars
        this.refreshCalendars();
    },
    
    /**
     * Delete the current appointment
     */
    deleteAppointment() {
        if (this.currentAppointment && this.currentAppointment.id) {
            if (confirm('Sei sicuro di voler eliminare questo appuntamento?')) {
                CalendarDataService.deleteAppointment(this.currentAppointment.id);
                this.closeAppointmentModal();
                this.refreshCalendars();
            }
        }
    },
    
    /**
     * Validate the appointment form
     * @returns {boolean} Whether the form is valid
     */
    validateAppointmentForm() {
        const client = document.getElementById('appointment-client').value;
        const service = document.getElementById('appointment-service').value;
        const worker = document.getElementById('appointment-worker').value;
        const position = document.getElementById('appointment-position').value;
        const start = document.getElementById('appointment-start')._flatpickr.selectedDates[0];
        const end = document.getElementById('appointment-end')._flatpickr.selectedDates[0];
        const price = document.getElementById('appointment-price').value;
        
        if (!client) {
            alert('Seleziona un cliente');
            return false;
        }
        
        if (!service) {
            alert('Seleziona un servizio');
            return false;
        }
        
        if (!worker) {
            alert('Seleziona un operatore');
            return false;
        }
        
        if (!position) {
            alert('Seleziona una postazione');
            return false;
        }
        
        if (!start) {
            alert('Seleziona un orario di inizio');
            return false;
        }
        
        if (!end) {
            alert('Seleziona un orario di fine');
            return false;
        }
        
        if (end <= start) {
            alert('L\'orario di fine deve essere successivo all\'orario di inizio');
            return false;
        }
        
        if (!price || isNaN(price) || parseFloat(price) <= 0) {
            alert('Inserisci un prezzo valido');
            return false;
        }
        
        return true;
    },
    
    /**
     * Refresh all calendars
     */
    refreshCalendars() {
        this.calendarInstances.forEach(({ calendar, workerId }) => {
            // Remove all events
            calendar.removeAllEvents();
            
            // Add events from data service
            const events = CalendarDataService.getWorkerEvents(workerId);
            calendar.addEventSource(events);
        });
    },
    
    /**
     * Populate client dropdown
     */
    populateClientDropdown() {
        const clientSelect = document.getElementById('appointment-client');
        const clients = CalendarDataService.getClients();
        
        clientSelect.innerHTML = '<option value="">Seleziona cliente</option>';
        
        clients.forEach(client => {
            const option = document.createElement('option');
            option.value = client.id;
            option.textContent = client.name;
            clientSelect.appendChild(option);
        });
    },
    
    /**
     * Populate service dropdown
     */
    populateServiceDropdown() {
        const serviceSelect = document.getElementById('appointment-service');
        const services = CalendarDataService.getServices();
        
        serviceSelect.innerHTML = '<option value="">Seleziona servizio</option>';
        
        services.forEach(service => {
            const option = document.createElement('option');
            option.value = service.id;
            option.textContent = `${service.name} (${service.duration} min)`;
            serviceSelect.appendChild(option);
        });
    },
    
    /**
     * Populate worker dropdown
     */
    populateWorkerDropdown() {
        const workerSelect = document.getElementById('appointment-worker');
        const workers = CalendarDataService.getWorkers();
        
        workerSelect.innerHTML = '<option value="">Seleziona operatore</option>';
        
        workers.forEach(worker => {
            const option = document.createElement('option');
            option.value = worker.id;
            option.textContent = worker.name;
            workerSelect.appendChild(option);
        });
    },
    
    /**
     * Populate position dropdown
     */
    populatePositionDropdown() {
        const positionSelect = document.getElementById('appointment-position');
        const positions = CalendarDataService.getPositions();
        
        positionSelect.innerHTML = '<option value="">Seleziona postazione</option>';
        
        positions.forEach(position => {
            const option = document.createElement('option');
            option.value = position.id;
            option.textContent = position.name;
            positionSelect.appendChild(option);
        });
    }
};