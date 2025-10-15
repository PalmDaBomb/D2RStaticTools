import { loadRunes } from './assetLoader.js';
import { createSelectionBox } from './selectionBoxFactory.js';

document.addEventListener('DOMContentLoaded', async () => {
    const container = document.querySelector('.rune-container');
    const display = document.querySelector('.rune-display');

    const runes = await loadRunes();
    const selectionBox = createSelectionBox(runes, "Search for a Rune...");

    container.appendChild(selectionBox);

    // Display selected rune stats
    const input = selectionBox.querySelector('input');
    input.addEventListener('input', () => {
        const selected = runes.find(r => r.display === input.value);
        if (!selected) {
            display.innerHTML = '';
            return;
        }

        display.innerHTML = `
            <h2>${selected.display}</h2>
            <p><strong>Creation:</strong> ${selected.creation}</p>
            <p><strong>Combines Into:</strong> ${selected.combinesInto}</p>
            <p><strong>Weapon Effect:</strong> ${selected.weaponEffect}</p>
            <p><strong>Armor Effect:</strong> ${selected.armorEffect}</p>
            <p><strong>Shield Effect:</strong> ${selected.shieldEffect}</p>
            <p><strong>Drop Chance:</strong> ${selected.dropChance}%</p>
            <p><strong>Expected Drop:</strong> ${selected.expectedDrop}</p>
        `;
    });

    // Modal logic
    const infoIcon = document.getElementById("info-icon");
    const modal = document.getElementById("info-modal");
    const closeBtn = document.querySelector(".close-btn");

    infoIcon.addEventListener("click", () => {
        modal.style.display = "flex";
    });

    closeBtn.addEventListener("click", () => {
        modal.style.display = "none";
    });

    window.addEventListener("click", (event) => {
        if (event.target === modal) {
            modal.style.display = "none";
        }
    });
});