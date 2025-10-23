// ==============================
// calculators.js
// Handles iLvl and Affix calculators
// ==============================

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
      const cVal = Number(cLvl.value);
      const mVal = Number(mLvl.value);
      const iVal = Number(iLvl.value);

      const filled = [!isNaN(cVal) && cLvl.value, !isNaN(mVal) && mLvl.value, !isNaN(iVal) && iLvl.value]
        .filter(Boolean).length;

      if (filled < 2) {
        alert('Please enter any TWO values to calculate the third.');
        return;
      }
      if (filled === 3) {
        alert('Please leave one box empty to calculate it.');
        return;
      }

      let result;
      if (!iLvl.value) {
        result = ((cVal / 2) + (mVal / 2)).toFixed(0);
        iLvl.value = result;
      } else if (!cLvl.value) {
        result = ((iVal * 2) - mVal).toFixed(0);
        cLvl.value = result;
      } else if (!mLvl.value) {
        result = ((iVal * 2) - cVal).toFixed(0);
        mLvl.value = result;
      }
    });

    clearButton.addEventListener('click', () => {
      cLvl.value = '';
      mLvl.value = '';
      iLvl.value = '';
    });
  }

  // --- Affix Calculator ---
  const craftedILvl = document.getElementById('craftedILvl');
  const itemQLvl = document.getElementById('itemQLvl');
  const affixResult = document.getElementById('AffixResultBox');
  const affixButton = document.getElementById('calcButton2');

  if (affixButton) {
    affixButton.addEventListener('click', () => {
      const val1 = Number(craftedILvl.value);
      const val2 = Number(itemQLvl.value);

      if (isNaN(val1) || isNaN(val2)) {
        alert('Please enter valid numbers between 1 and 99.');
        return;
      }

      const result = Math.max(val1 - Math.floor(val2 / 2), val1 * 2 - 99);
      affixResult.value = `${result} Affix Lvl`;
    });
  }
});