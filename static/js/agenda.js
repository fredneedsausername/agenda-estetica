// JavaScript to create the scroll elements
document.addEventListener('DOMContentLoaded', function() {

    const nomiClienti = ["Margaryta", "Daria", "Maria", "Baria", "Miroslava", "Federico", "Luciana", "Cristiana"]

    const scrollContent = document.getElementById('scrollContent');
    
    // Create 8 elements for testing
    for (let i = 0; i < 8; i++) {
        // Create the scroll element
        const scrollElement = document.createElement('div');
        scrollElement.className = 'scroll-element';
        
        // Create the content area with text
        const elementContent = document.createElement('div');
        elementContent.className = 'element-content';
        
        // Add centered text to the content area
        const contentText = document.createElement('span');
        contentText.textContent = nomiClienti[i];
        elementContent.appendChild(contentText);
        
        // Create the empty div below
        const emptyDiv = document.createElement('div');
        emptyDiv.className = 'element-empty-div';
        
        // Append the elements
        scrollElement.appendChild(elementContent);
        scrollElement.appendChild(emptyDiv);
        scrollContent.appendChild(scrollElement);
    }
});