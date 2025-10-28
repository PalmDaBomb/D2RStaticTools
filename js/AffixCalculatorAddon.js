// AffixCalculatorAddon.js
import { loadAllItemsForDropdown } from './assetLoader.js';
import { applyAffixFormula } from './formulas.js'; // formerly calculateAffixLevel

export async function initializeAffixCalculators() {
  const container = document.getElementById('affixlvlCalculator');
  if (!container) return; // just in case

    // Clear any existing content
    container.innerHTML = '';

    // Create inner HTML structure
    container.innerHTML = `
      <h2>Item Affix-lvl Calculator:</h2>
      <div class="input-column">
        <div id="itemDropdownContainer" class="ilvl-calculator">
          <input list="itemDropdown" id="itemSearch" placeholder="Search or select an item..." />
          <datalist id="itemDropdown"></datalist>
        </div>
        <input type="number" id="craftedILvl" min="1" max="99" placeholder="Final Crafted Item i-lvl" />
        <input type="number" id="itemQLvl" min="1" max="99" placeholder="Item Q-Lvl" />
      </div>
      <div class="output-row">
        <input type="number" id="AffixResultBox" min="1" max="99" placeholder="Affix-Lvl" />
        <button id="calcButton2">Calculate</button>
      </div>
    `;

    // Grab the elements we just created
    const itemInput = container.querySelector('#itemSearch');
    const qlvlInput = container.querySelector('#itemQLvl');
    const craftedILvlInput = container.querySelector('#craftedILvl');
    const affixResultInput = container.querySelector('#AffixResultBox');
    const calcButton = container.querySelector('#calcButton2');
    const datalist = container.querySelector('#itemDropdown');

    // Load item dropdown
    try {
      const items = await loadAllItemsForDropdown();
      datalist.innerHTML = '';
      const itemMap = new Map();
      for (const item of items) {
        const option = document.createElement('option');
        option.value = item.name;
        datalist.appendChild(option);
        itemMap.set(item.name.toLowerCase(), item.qLvl || 0);
      }

      // Update q-lvl if item selected
      itemInput.addEventListener('input', () => {
        const selectedName = itemInput.value.toLowerCase();
        if (itemMap.has(selectedName)) {
          qlvlInput.value = itemMap.get(selectedName);
        }
      });
    } catch (err) {
      console.error('Error loading item dropdown:', err);
    }

    // Attach calculation
    calcButton.addEventListener('click', () => {
      const ilvl = Number(craftedILvlInput.value);
      const qlvl = Number(qlvlInput.value);
      const targetAlvl = Number(affixResultInput.value);

      try {
        let result;
        if (!isNaN(ilvl) && !isNaN(qlvl) && (isNaN(targetAlvl) || targetAlvl === 0)) {
          // forward calculation
          result = applyAffixFormula(ilvl, qlvl);
          affixResultInput.value = result;
        } else if (!isNaN(targetAlvl)) {
          // reverse calculation
          result = applyAffixFormula(undefined, qlvl, targetAlvl);
          craftedILvlInput.value = result.ilvl ?? '';
          qlvlInput.value = result.qlvl ?? '';
        }
      } catch (err) {
        alert(err.message);
      }
    });
}

// Auto-run on DOM ready
document.addEventListener('DOMContentLoaded', () => initializeAffixCalculators());