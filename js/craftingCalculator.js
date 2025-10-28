// ==============================
// craftingCalculator.js
// Uses formula.js for math logic
// ==============================

import { calculateItemLevel, applyAffixFormula } from './formulas.js';

document.addEventListener('DOMContentLoaded', () => {
  // --- iLvl Calculator ---
  const cLvl = document.getElementById('input1'); // Character level
  const mLvl = document.getElementById('input2'); // Monster/area level
  const iLvl = document.getElementById('input3'); // Crafted item level
  const calcButton = document.getElementById('calcButton');

  if (calcButton) {
    // Add a clear button beside the calculate button
    const clearButton = document.createElement('button');
    clearButton.textContent = 'Clear';
    clearButton.style.marginLeft = '8px';
    calcButton.parentElement.appendChild(clearButton);

    calcButton.addEventListener('click', () => {
      // Convert values to numbers only if input is non-empty
      const cVal = cLvl.value.trim() === '' ? undefined : Number(cLvl.value);
      const mVal = mLvl.value.trim() === '' ? undefined : Number(mLvl.value);
      const iVal = iLvl.value.trim() === '' ? undefined : Number(iLvl.value);

      try {
        const result = calculateItemLevel(cVal, mVal, iVal);

        // Update whichever field was missing
        cLvl.value = result.cLvl ?? '';
        mLvl.value = result.mLvl ?? '';
        iLvl.value = result.iLvl ?? '';
      } catch (err) {
        alert(err.message);
      }
    });

    clearButton.addEventListener('click', () => {
      cLvl.value = 'Character lvl (c-lvl)';
      mLvl.value = 'Mon/Area lvl (Where Item Dropped)';
      iLvl.value = 'i-lvl';
    });
  }
});