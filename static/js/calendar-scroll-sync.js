/**
 * Calendar Scroll Synchronization
 * This file adds synchronized vertical scrolling to the calendar system
 */
document.addEventListener('DOMContentLoaded', function() {
    // Wait for CalendarManager to finish initialization
    setTimeout(initSynchronizedScrolling, 500);
});

/**
 * Initialize the scroll synchronization
 */
function initSynchronizedScrolling() {
    if (typeof CalendarManager === 'undefined') {
        console.error('CalendarManager not found');
        return;
    }

    // Store original methods we need to extend
    const originalCreateWorkerCalendars = CalendarManager.createWorkerCalendars;
    const originalChangeView = CalendarManager.changeView;
    const originalNavigateTo = CalendarManager.navigateTo;
    const originalRefreshCalendars = CalendarManager.refreshCalendars;

    // Add setupSynchronizedScrolling method to CalendarManager
    CalendarManager.setupSynchronizedScrolling = function() {
        // Get all calendar containers
        const calendarContainers = document.querySelectorAll('.calendar-container');
        
        if (calendarContainers.length <= 1) {
            return; // No need to synchronize if there's only one or no calendars
        }
        
        // Flag to prevent recursive scroll events
        let isScrolling = false;
        
        // Remove any existing scroll events first to avoid duplicates
        calendarContainers.forEach(container => {
            const newContainer = container.cloneNode(true);
            container.parentNode.replaceChild(newContainer, container);
        });
        
        // Get fresh references after DOM replacements
        const freshContainers = document.querySelectorAll('.calendar-container');
        
        // Add scroll event listener to each container
        freshContainers.forEach(container => {
            container.addEventListener('scroll', function() {
                // If we're already handling a scroll event, exit
                if (isScrolling) return;
                
                // Set the flag
                isScrolling = true;
                
                // Get current scroll position
                const scrollTop = this.scrollTop;
                
                // Apply this scroll position to all other containers
                freshContainers.forEach(otherContainer => {
                    if (otherContainer !== this) {
                        otherContainer.scrollTop = scrollTop;
                    }
                });
                
                // Reset the flag after a short timeout
                setTimeout(() => {
                    isScrolling = false;
                }, 50);
            });
        });
    };

    // Override createWorkerCalendars to set up scrolling
    CalendarManager.createWorkerCalendars = function() {
        // Call the original function
        originalCreateWorkerCalendars.call(this);
        
        // Set up synchronized scrolling after calendars are created
        setTimeout(() => {
            this.setupSynchronizedScrolling();
        }, 100);
    };

    // Override changeView to maintain scroll synchronization
    CalendarManager.changeView = function(viewName) {
        // Call the original changeView function
        originalChangeView.call(this, viewName);
        
        // Reset scroll synchronization after view change
        setTimeout(() => {
            this.setupSynchronizedScrolling();
        }, 100);
    };

    // Override navigateTo to maintain scroll synchronization
    CalendarManager.navigateTo = function(direction) {
        // Call the original navigateTo function
        originalNavigateTo.call(this, direction);
        
        // Reset scroll synchronization after navigation
        setTimeout(() => {
            this.setupSynchronizedScrolling();
        }, 100);
    };

    // Override refreshCalendars to maintain scroll synchronization
    CalendarManager.refreshCalendars = function() {
        // Call the original refreshCalendars function
        originalRefreshCalendars.call(this);
        
        // Reset scroll synchronization after refresh
        setTimeout(() => {
            this.setupSynchronizedScrolling();
        }, 100);
    };

    // Add window resize handler for scroll synchronization
    window.addEventListener('resize', function() {
        // If resizing might affect calendar layout, re-setup scroll sync
        if (CalendarManager.calendarInstances.length > 0) {
            CalendarManager.setupSynchronizedScrolling();
        }
    });

    // Initialize scroll synchronization if calendars already exist
    if (CalendarManager.calendarInstances.length > 0) {
        CalendarManager.setupSynchronizedScrolling();
    }
}