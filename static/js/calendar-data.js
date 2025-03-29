// Data storage keys
const STORAGE_KEYS = {
    WORKERS: 'agenda_workers',
    CLIENTS: 'agenda_clients',
    SERVICES: 'agenda_services',
    APPOINTMENTS: 'agenda_appointments',
    POSITIONS: 'agenda_positions'
};

// Sample data for initial testing
const SAMPLE_DATA = {
    workers: [
        { id: '1', name: 'Margaryta' },
        { id: '2', name: 'Daria' },
        { id: '3', name: 'Maria' },
        { id: '4', name: 'Baria' },
        { id: '5', name: 'Miroslava' },
        { id: '6', name: 'Federico' },
        { id: '7', name: 'Luciana' },
        { id: '8', name: 'Cristiana' }
    ],
    clients: [
        { id: '1', name: 'Sofia Bianchi' },
        { id: '2', name: 'Giulia Rossi' },
        { id: '3', name: 'Anna Verdi' },
        { id: '4', name: 'Laura Neri' }
    ],
    services: [
        { id: '1', name: 'Manicure', duration: 60 },
        { id: '2', name: 'Pedicure', duration: 60 },
        { id: '3', name: 'Ceretta', duration: 30 },
        { id: '4', name: 'Massaggio', duration: 90 }
    ],
    positions: [
        { id: '1', name: 'Postazione 1' },
        { id: '2', name: 'Postazione 2' },
        { id: '3', name: 'Postazione 3' },
        { id: '4', name: 'Postazione 4' },
        { id: '5', name: 'Postazione 5' }
    ],
    appointments: [
        {
            id: '1',
            clientId: '1',
            workerId: '1',
            serviceId: '1',
            positionId: '1',
            start: '2025-03-29T10:00:00',
            end: '2025-03-29T11:00:00',
            price: 30,
            notes: ''
        },
        {
            id: '2',
            clientId: '2',
            workerId: '1',
            serviceId: '2',
            positionId: '1',
            start: '2025-03-29T14:00:00',
            end: '2025-03-29T15:00:00',
            price: 35,
            notes: ''
        },
        {
            id: '3',
            clientId: '3',
            workerId: '2',
            serviceId: '3',
            positionId: '2',
            start: '2025-03-29T11:00:00',
            end: '2025-03-29T11:30:00',
            price: 25,
            notes: ''
        }
    ]
};

/**
 * CalendarDataService
 * Service for managing calendar data
 */
const CalendarDataService = {
    /**
     * Initialize the data service
     * Loads data from localStorage or initializes with sample data
     */
    init() {
        // Check if data exists in localStorage
        if (!localStorage.getItem(STORAGE_KEYS.WORKERS)) {
            // Initialize with sample data
            this.initializeSampleData();
        }
    },

    /**
     * Initialize sample data for testing
     */
    initializeSampleData() {
        localStorage.setItem(STORAGE_KEYS.WORKERS, JSON.stringify(SAMPLE_DATA.workers));
        localStorage.setItem(STORAGE_KEYS.CLIENTS, JSON.stringify(SAMPLE_DATA.clients));
        localStorage.setItem(STORAGE_KEYS.SERVICES, JSON.stringify(SAMPLE_DATA.services));
        localStorage.setItem(STORAGE_KEYS.POSITIONS, JSON.stringify(SAMPLE_DATA.positions));
        localStorage.setItem(STORAGE_KEYS.APPOINTMENTS, JSON.stringify(SAMPLE_DATA.appointments));
    },

    /**
     * Get all workers
     * @returns {Array} List of workers
     */
    getWorkers() {
        return JSON.parse(localStorage.getItem(STORAGE_KEYS.WORKERS) || '[]');
    },

    /**
     * Get all clients
     * @returns {Array} List of clients
     */
    getClients() {
        return JSON.parse(localStorage.getItem(STORAGE_KEYS.CLIENTS) || '[]');
    },

    /**
     * Get all services
     * @returns {Array} List of services
     */
    getServices() {
        return JSON.parse(localStorage.getItem(STORAGE_KEYS.SERVICES) || '[]');
    },

    /**
     * Get all positions
     * @returns {Array} List of positions
     */
    getPositions() {
        return JSON.parse(localStorage.getItem(STORAGE_KEYS.POSITIONS) || '[]');
    },

    /**
     * Get all appointments
     * @returns {Array} List of appointments
     */
    getAppointments() {
        return JSON.parse(localStorage.getItem(STORAGE_KEYS.APPOINTMENTS) || '[]');
    },

    /**
     * Get appointments for a specific worker
     * @param {string} workerId - The ID of the worker
     * @returns {Array} List of appointments for the worker
     */
    getWorkerAppointments(workerId) {
        const appointments = this.getAppointments();
        return appointments.filter(app => app.workerId === workerId);
    },

    /**
     * Format appointments as FullCalendar events
     * @param {string} workerId - The ID of the worker
     * @returns {Array} List of events for FullCalendar
     */
    getWorkerEvents(workerId) {
        const appointments = this.getWorkerAppointments(workerId);
        const clients = this.getClients();
        const services = this.getServices();
        
        return appointments.map(appointment => {
            const client = clients.find(c => c.id === appointment.clientId);
            const service = services.find(s => s.id === appointment.serviceId);
            
            return {
                id: appointment.id,
                title: `${client ? client.name : 'Cliente'} - ${service ? service.name : 'Servizio'}`,
                start: appointment.start,
                end: appointment.end,
                extendedProps: {
                    clientId: appointment.clientId,
                    serviceId: appointment.serviceId,
                    workerId: appointment.workerId,
                    positionId: appointment.positionId,
                    price: appointment.price,
                    notes: appointment.notes
                }
            };
        });
    },

    /**
     * Save a new appointment or update an existing one
     * @param {Object} appointmentData - The appointment data
     * @returns {Object} The saved appointment
     */
    saveAppointment(appointmentData) {
        const appointments = this.getAppointments();
        let appointment;
        
        if (appointmentData.id) {
            // Update existing appointment
            const index = appointments.findIndex(a => a.id === appointmentData.id);
            if (index !== -1) {
                appointments[index] = appointmentData;
                appointment = appointmentData;
            }
        } else {
            // Create new appointment
            appointment = {
                ...appointmentData,
                id: this.generateId()
            };
            appointments.push(appointment);
        }
        
        localStorage.setItem(STORAGE_KEYS.APPOINTMENTS, JSON.stringify(appointments));
        return appointment;
    },

    /**
     * Delete an appointment
     * @param {string} appointmentId - The ID of the appointment to delete
     * @returns {boolean} Success status
     */
    deleteAppointment(appointmentId) {
        const appointments = this.getAppointments();
        const filteredAppointments = appointments.filter(a => a.id !== appointmentId);
        
        if (filteredAppointments.length < appointments.length) {
            localStorage.setItem(STORAGE_KEYS.APPOINTMENTS, JSON.stringify(filteredAppointments));
            return true;
        }
        
        return false;
    },

    /**
     * Generate a unique ID for new records
     * @returns {string} A unique ID
     */
    generateId() {
        return Date.now().toString() + Math.floor(Math.random() * 1000).toString();
    }
};

// Initialize the data service
document.addEventListener('DOMContentLoaded', function() {
    CalendarDataService.init();
});