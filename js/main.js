// main.js
import { createFlameButton } from './buttonFactory.js'; // relative path to the module

document.addEventListener('DOMContentLoaded', () => {
    const container = document.querySelector('.home-buttons');

    const buttonsData = [
        { text: "Runes", href: "html/runes.html", effect: "fast", className: "StandardBTN" },
        { text: "MF Calculator", href: "html/mfInfo.html", effect: "fast", className: "StandardBTN" }
    ];

    buttonsData.forEach(btnData => {
        const btn = createFlameButton(btnData.text, btnData.href, btnData.effect, btnData.className);
        container.appendChild(btn);
    });
});