// main.js
import { createExpandableSectionSet } from "./sectionFactory.js";
import { createButtonSet } from './buttonFactory.js';

document.addEventListener('DOMContentLoaded', () => {
    createExpandableSectionSet(".home-container", [
        { title: "About D2R Tools", containerId: "About-content", classList: ["home-buttons"] },
        { title: "Items, Runes, & Crafting", containerId: "Item-buttons", classList: ["home-buttons"] },
        { title: "Calculations", containerId: "Calc-buttons", classList: ["home-buttons"] },
    ]);

    // Add some info content to the About section
    const aboutContainer = document.getElementById("About-content");
    if (aboutContainer) {
        const p = document.createElement("p");
        const pp = document.createElement("p");
        const ppp = document.createElement("p");
        p.textContent =
        "- Deckard Cain Tools is a work-in-progress collection of static utilities for Diablo II: Resurrected, based on existing community tools and my own research. " +
        "I’m continually adding new features, improving functionality, and expanding accessibility to D2R-related information. ";

        pp.textContent =
        "- All data has been reformatted, extended, and integrated into custom systems for D2RStaticTools. " +
        "D2RStaticTools is an independent, fan-created site not affiliated with Blizzard Entertainment. ";

        ppp.textContent =
        " - Portions of item and armor data were informed by community research from:";
        
        aboutContainer.appendChild(p);
        aboutContainer.appendChild(pp);
        aboutContainer.appendChild(ppp);
    }

    createButtonSet('#About-content', [
        { text: "Official D2R Wiki", href: "https://diablo2.wiki.fextralife.com/Diablo+2+Resurrected+Wiki", effect: "fast", className: "StandardBTN" },
        { text: "The Amazon Basin", href: "https://www.theamazonbasin.com/wiki/index.php/Diablo_II", effect: "fast", className: "StandardBTN" }
    ]);


    createButtonSet('#Item-buttons', [
        { text: "Runes", href: "html/runes.html", effect: "fast", className: "StandardBTN" },
        { text: "Crafting", href: "html/crafting.html", effect: "fast", className: "StandardBTN" },
        { text: "Weapon Stats", href: "html/weaponStats.html", effect: "fast", className: "StandardBTN" },
        { text: "Armor Stats", href: "html/armorStats.html", effect: "fast", className: "StandardBTN" }
    ]);

    createButtonSet('#Calc-buttons', [
        { text: "MF Calculator", href: "html/mfInfo.html", effect: "fast", className: "StandardBTN" },
        { text: "Summons (Necro)", href: "html/necroSummons.html", effect: "fast", className: "StandardBTN" }
    ]);
});

