document.addEventListener('DOMContentLoaded', function() {
    // Add operators to the scroll content
    addOperators();
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