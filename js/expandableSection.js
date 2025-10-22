// ==============================
// expandableSections.js
// Handles all expandable panels site-wide
// ==============================

document.addEventListener('DOMContentLoaded', () => {
  // Select all expandable sections
  const expandableSections = document.querySelectorAll('.expandable-section');

  expandableSections.forEach(section => {
    const header = section.querySelector('.expandable-header');
    if (!header) return; // skip if missing

    header.addEventListener('click', () => {
      // Toggle open/close state
      section.classList.toggle('active');
    });
  });
});

document.addEventListener('DOMContentLoaded', () => {
  const input1 = document.getElementById('input1');
  const input2 = document.getElementById('input2');
  const resultBox = document.getElementById('resultBox');
  const calcButton = document.getElementById('calcButton');

  calcButton.addEventListener('click', () => {
    const val1 = parseInt(input1.value, 10);
    const val2 = parseInt(input2.value, 10);

    if (isNaN(val1) || isNaN(val2)) {
      alert('Please enter valid numbers between 1 and 99.');
      return;
    }

    const result = ((val1/2) + (val2/2)).toFixed(0);

    resultBox.value = `${result} Crafted Item i-lvl`;
  });
});

document.addEventListener('DOMContentLoaded', () => {
  const input1 = document.getElementById('craftedILvl');
  const input2 = document.getElementById('itemQLvl');
  const resultBox = document.getElementById('AffixResultBox');
  const calcButton = document.getElementById('calcButton2');

  calcButton.addEventListener('click', () => {
    const val1 = parseInt(input1.value, 10);
    const val2 = parseInt(input2.value, 10);

    if (isNaN(val1) || isNaN(val2)) {
      alert('Please enter valid numbers between 1 and 99.');
      return;
    }

    // Example calculation: sum of the two inputs
    const result = Math.max(val1 - Math.floor(val2 / 2), val1 * 2 - 99);

    resultBox.value = `${result} Affix Lvl`;
  });
});