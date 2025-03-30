/**
 * Calendar Scroll Synchronization
 * This file adds synchronized vertical scrolling to the calendar system
 */
document.addEventListener('DOMContentLoaded', function() {
    // Initialize after a short delay to ensure the DOM is fully loaded
    setTimeout(initSingleScrollCalendar, 100);
});

/**
 * Initialize the single scroll calendar system
 */
function initSingleScrollCalendar() {
    if (typeof CalendarManager === 'undefined') {
        console.error('CalendarManager not found');
        return;
    }

    // Store original methods we need to override
    const originalCreateWorkerCalendars = CalendarManager.createWorkerCalendars;
    const originalChangeView = CalendarManager.changeView;
    const originalNavigateTo = CalendarManager.navigateTo;
    const originalRefreshCalendars = CalendarManager.refreshCalendars;

    /**
     * Modify the DOM to use a single scroll container
     */
    function setupSingleScrollContainer() {
        const scrollContent = document.getElementById('scrollContent');
        if (!scrollContent) return;
        
        // Get all the calendar containers
        const calendarContainers = document.querySelectorAll('.calendar-container');
        if (calendarContainers.length <= 1) return;
        
        // Remove scroll capability from individual calendar containers
        calendarContainers.forEach(container => {
            container.style.overflow = 'visible';
            container.style.height = 'auto';
        });
        
        // Make the scroll-content container scrollable
        scrollContent.style.overflowY = 'auto';
        scrollContent.style.overflowX = 'auto';
        
        // Ensure the scroll-container takes the full available height
        const scrollContainer = document.querySelector('.scroll-container');
        if (scrollContainer) {
            scrollContainer.style.display = 'flex';
            scrollContainer.style.flexDirection = 'column';
        }
        
        // Fix the calendar heights
        const calendarElements = document.querySelectorAll('.fc');
        calendarElements.forEach(calendar => {
            calendar.style.height = 'auto';
        });
        
        // Ensure the calendar time grids render properly
        const timeGrids = document.querySelectorAll('.fc-timegrid-body');
        timeGrids.forEach(grid => {
            grid.style.overflow = 'visible';
        });
        
        // Fix position of calendar headers
        const calendarHeaders = document.querySelectorAll('.fc-col-header');
        calendarHeaders.forEach(header => {
            header.style.position = 'sticky';
            header.style.top = '0';
            header.style.zIndex = '2';
            header.style.backgroundColor = 'white';
        });
    }
    
    /**
     * Apply CSS Grid layout to align all calendars
     * This ensures events line up perfectly across calendars
     */
    function applyGridLayout() {
        // Get all scroll elements (worker columns)
        const scrollElements = document.querySelectorAll('.scroll-element');
        const headerContainers = [];
        const calendarBodies = [];
        
        // Separate headers and calendar bodies
        scrollElements.forEach(element => {
            const header = element.querySelector('.element-content');
            const calendarContainer = element.querySelector('.calendar-container');
            
            if (header) headerContainers.push(header);
            if (calendarContainer) calendarBodies.push(calendarContainer);
            
            // Remove height constraint on the calendar container
            if (calendarContainer) {
                calendarContainer.style.flex = '0 0 auto';
            }
        });
        
        // Ensure all worker headers have the same height
        const maxHeaderHeight = Math.max(...Array.from(headerContainers).map(h => h.offsetHeight));
        headerContainers.forEach(header => {
            header.style.height = `${maxHeaderHeight}px`;
        });
        
        // Find all time slots in all calendars
        const calendars = document.querySelectorAll('.fc');
        calendars.forEach(calendar => {
            // Make sure all time slots have the same height
            const timeSlots = calendar.querySelectorAll('.fc-timegrid-slot');
            timeSlots.forEach(slot => {
                slot.style.height = '3em'; // Consistent height for all time slots
            });
        });
    }
    
    // Override the createWorkerCalendars method
    CalendarManager.createWorkerCalendars = function() {
        // Call the original function to create calendars
        originalCreateWorkerCalendars.call(this);
        
        // Setup single scroll container
        setTimeout(() => {
            setupSingleScrollContainer();
            applyGridLayout();
        }, 50);
    };
    
    // Override the changeView method
    CalendarManager.changeView = function(viewName) {
        // Call the original function
        originalChangeView.call(this, viewName);
        
        // Re-apply single scroll container
        setTimeout(() => {
            setupSingleScrollContainer();
            applyGridLayout();
        }, 50);
    };
    
    // Override the navigateTo method
    CalendarManager.navigateTo = function(direction) {
        // Call the original function
        originalNavigateTo.call(this, direction);
        
        // Re-apply single scroll container
        setTimeout(() => {
            setupSingleScrollContainer();
            applyGridLayout();
        }, 50);
    };
    
    // Override the refreshCalendars method
    CalendarManager.refreshCalendars = function() {
        // Call the original function
        originalRefreshCalendars.call(this);
        
        // Re-apply single scroll container
        setTimeout(() => {
            setupSingleScrollContainer();
            applyGridLayout();
        }, 50);
    };
    
    // Apply the single scroll container now if calendars already exist
    if (CalendarManager.calendarInstances.length > 0) {
        setupSingleScrollContainer();
        applyGridLayout();
    }
    
    // Add window resize handler
    let resizeTimeout;
    window.addEventListener('resize', function() {
        if (resizeTimeout) clearTimeout(resizeTimeout);
        
        resizeTimeout = setTimeout(() => {
            if (CalendarManager.calendarInstances.length > 0) {
                setupSingleScrollContainer();
                applyGridLayout();
            }
        }, 150);
    });
}