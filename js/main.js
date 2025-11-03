// main.js
import { createExpandableSectionSet } from "./sectionFactory.js";
import { createButtonSet } from './buttonFactory.js';

document.addEventListener('DOMContentLoaded', () => {
    createExpandableSectionSet(".home-container", [
        { title: "Items, Runes, & Crafting", containerId: "Item-buttons", classList: ["home-buttons"] },
        { title: "Calculations", containerId: "Calc-buttons", classList: ["home-buttons"] },
    ]);

    createButtonSet('#Item-buttons', [
        { text: "Runes", href: "html/runes.html", effect: "fast", className: "StandardBTN" },
        { text: "Crafting", href: "html/crafting.html", effect: "fast", className: "StandardBTN" },
        { text: "Weapon Stats", href: "html/weaponStats.html", effect: "fast", className: "StandardBTN" },
        { text: "Armor Stats", href: "html/armorStats.html", effect: "fast", className: "StandardBTN" }
    ]);

    createButtonSet('#Calc-buttons', [
        { text: "MF Calculator", href: "html/mfInfo.html", effect: "fast", className: "StandardBTN" }
    ]);
});

