document.addEventListener('DOMContentLoaded', function() {
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

    // ✅ FIXED: Use actual DOM element
    const datePickerContainer = document.getElementById('date-picker-container');

    const fakeInput = document.createElement('input'); // Required dummy input
    datePickerContainer.appendChild(fakeInput);

    const datePicker = new tui.DatePicker(datePickerContainer, {
        date: new Date(),
        input: {
            element: fakeInput,
            format: 'yyyy-MM-dd'
        },
        autoClose: true
    });

    document.getElementById('giorno-container').addEventListener('click', () => {
        datePickerContainer.style.display = 'block';
        datePickerContainer.style.position = 'fixed';
        datePickerContainer.style.left = '50%';
        datePickerContainer.style.top = '50%';
        datePickerContainer.style.transform = 'translate(-50%, -50%)';
        datePickerContainer.style.zIndex = 1000;
    });

    datePicker.on('change', () => {
        const selectedDate = datePicker.getDate();
        document.getElementById('giorno-display').textContent = selectedDate.toLocaleDateString();
        datePickerContainer.style.display = 'none';
    });
});
