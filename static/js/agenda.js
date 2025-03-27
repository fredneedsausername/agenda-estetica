document.addEventListener('DOMContentLoaded', function() {
    // Add operators to the scroll content
    addOperators();
    
    // Initialize the date picker functionality
    setupDatePicker();
});

function addOperators() {
    const nomiOperatori = ["Margaryta", "Daria", "Maria", "Baria", "Miroslava", "Federico", "Luciana", "Cristiana"];
    const scrollContent = document.getElementById('scrollContent');
    
    for (let i = 0; i < nomiOperatori.length; i++) {
        const scrollElement = document.createElement('div');
        scrollElement.className = 'scroll-element';

        const elementContent = document.createElement('div');
        elementContent.className = 'element-content';

        const contentText = document.createElement('span');
        contentText.textContent = nomiOperatori[i];
        elementContent.appendChild(contentText);

        const emptyDiv = document.createElement('div');
        emptyDiv.className = 'element-empty-div';

        scrollElement.appendChild(elementContent);
        scrollElement.appendChild(emptyDiv);
        scrollContent.appendChild(scrollElement);
    }
}

function setupDatePicker() {
    // Get the date display element
    const giornoDisplay = document.getElementById('giorno-display');
    
    // Set initial date display
    const today = new Date();
    giornoDisplay.textContent = today.toLocaleDateString();
    
    // Create a wrapper div for the date picker
    const wrapperEl = document.createElement('div');
    wrapperEl.id = 'datepicker-wrapper';
    wrapperEl.style.position = 'fixed';
    wrapperEl.style.zIndex = '2000';
    wrapperEl.style.left = '50%';
    wrapperEl.style.top = '50%';
    wrapperEl.style.transform = 'translate(-50%, -50%)';
    wrapperEl.style.backgroundColor = 'white';
    wrapperEl.style.padding = '20px';
    wrapperEl.style.boxShadow = '0 5px 15px rgba(0,0,0,0.3)';
    wrapperEl.style.borderRadius = '8px';
    wrapperEl.style.display = 'none';
    document.body.appendChild(wrapperEl);
    
    // Create the input element required for DatePicker
    const inputEl = document.createElement('input');
    inputEl.type = 'text';
    inputEl.id = 'datepicker-input';
    wrapperEl.appendChild(inputEl);
    
    // Initialize the DatePicker with the input
    const datePicker = new tui.DatePicker(wrapperEl, {
        date: today,
        input: {
            element: inputEl,
            format: 'yyyy-MM-dd'
        },
        type: 'date',
        language: 'ru',
        usageStatistics: false
    });

    const giornoContainer = document.getElementById('giorno-container');
    
    giornoContainer.addEventListener('click', function(e) {
        e.stopPropagation();
        console.log('Giorno container clicked, making wrapper visible...');
        wrapperEl.style.display = 'block'; // Make the container div visible
        try {
             datePicker.open();
             console.log('Called datePicker.open()');
        } catch (openError) {
             console.error('Error calling datePicker.open():', openError);
        }
    });

    // Update the display when a date is selected
    datePicker.on('change', function() {
        const selectedDate = datePicker.getDate();
        console.log('Date changed:', selectedDate);
        giornoDisplay.textContent = selectedDate.toLocaleDateString('it-IT'); // Use locale if using 'it'
        // giornoDisplay.textContent = selectedDate.toLocaleDateString(); // Use default if using 'en'
        wrapperEl.style.display = 'none'; // Hide container after selection
        // datePicker.close(); // You might also need to call close explicitly
    });
    
    // Add a close button
    
    // Close the date picker when clicking outside
    document.addEventListener('click', function(e) {
        if (wrapperEl.style.display === 'block' && 
            !wrapperEl.contains(e.target) && 
            e.target.id !== 'giorno-display' &&
            !document.getElementById('giorno-container').contains(e.target)) {
            wrapperEl.style.display = 'none';
        }
    });
    
    // Debug information to console
    console.log('DatePicker initialized:', datePicker);
}