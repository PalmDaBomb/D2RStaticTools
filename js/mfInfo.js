import { createMFCalculator } from './selectionBoxFactory.js';

document.addEventListener('DOMContentLoaded', () => {
    const container = document.querySelector('.mf-container');
    const mfCalculator = createMFCalculator("Enter your Magic Find");

    container.appendChild(mfCalculator);
});