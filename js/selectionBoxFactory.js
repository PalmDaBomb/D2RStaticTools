/**
 * Creates a searchable dropdown for a given array of items
 * @param {Array} items - Array of objects with a `display` property
 * @param {string} placeholder - Input placeholder text
 * @returns {HTMLElement} container div with input and dropdown
 */
export function createSelectionBox(items, placeholder = "Select...") {
    const container = document.createElement('div');
    container.classList.add('selection-box');

    const input = document.createElement('input');
    input.type = 'text';
    input.placeholder = placeholder;
    input.classList.add('selection-input');

    const dropdown = document.createElement('div');
    dropdown.classList.add('selection-dropdown');

    function updateDropdown(filter = '') {
        dropdown.innerHTML = '';
        const filtered = items.filter(item =>
            item.display.toLowerCase().includes(filter.toLowerCase())
        );
        filtered.forEach(item => {
            const div = document.createElement('div');
            div.textContent = item.display;
            div.classList.add('selection-item');
            div.addEventListener('click', () => {
                input.value = item.display;
                dropdown.innerHTML = '';
                input.dispatchEvent(new Event('input')); // ✅ Trigger update
            });
            dropdown.appendChild(div);
        });
    }

    input.addEventListener('input', () => {
        updateDropdown(input.value);
    });

    input.addEventListener('focus', () => updateDropdown(input.value));
    input.addEventListener('blur', () => setTimeout(() => dropdown.innerHTML = '', 100));

    container.appendChild(input);
    container.appendChild(dropdown);
    return container;
}

/**
 * Creates a numeric input box that calculates Effective MF for different item types.
 * @param {string} placeholder - Input placeholder text
 * @returns {HTMLElement} container div with input and output
 */
export function createMFCalculator(placeholder = "Enter your Magic Find") {
    const container = document.createElement('div');
    container.classList.add('mf-calculator');

    const input = document.createElement('input');
    input.type = 'number';
    input.min = 0;
    input.placeholder = placeholder;
    input.classList.add('selection-input');

    const output = document.createElement('div');
    output.classList.add('rune-display'); // reuse rune-display style

    function calculateMF(value) {
        const rawMF = parseInt(value, 10);
        if (isNaN(rawMF) || rawMF < 0) {
            output.innerHTML = '';
            return;
        }

        const mf = rawMF + 100; // add the base 100 per guide

        const calcEffectiveMF = (factor, mf) => Math.floor((factor * (mf - 100)) / (factor + mf - 100));

        const effectiveUnique = calcEffectiveMF(250, mf);
        const effectiveSet = calcEffectiveMF(500, mf);
        const effectiveRare = calcEffectiveMF(600, mf);
        const effectiveMagic = rawMF; // Magic items use raw MF + 100

        output.innerHTML = `
            <h2>Effective Magic Find</h2>
            <p><strong>Unique Items:</strong> ${effectiveUnique}%</p>
            <p><strong>Set Items:</strong> ${effectiveSet}%</p>
            <p><strong>Rare Items:</strong> ${effectiveRare}%</p>
            <p><strong>Magic Items:</strong> ${effectiveMagic}%</p>
        `;
    }

    input.addEventListener('input', () => calculateMF(input.value));

    container.appendChild(input);
    container.appendChild(output);
    return container;
}