// ==============================
// necroSummons.js
// ==============================
import { createInputSection } from "./formFactory.js";
import { calculateRaiseSkeleton } from "./formulas.js";
import { ModalManager } from "./modalManager.js";

document.addEventListener("DOMContentLoaded", () => {
    const modalEl = document.getElementById("resultModal");
    const modalContentEl = document.getElementById("modalContent");
    const closeBtn = document.getElementById("modalClose");
    const modalManager = new ModalManager(modalEl, modalContentEl, closeBtn);

    // Build the input form section
    createInputSection(".summon-container", {
        title: "Raise Skeleton Calculator",
        inputs: [
            { label: "Skill Lvl", id: "skillLevel", type: "number", placeholder: "e.g. 25" },
            { label: "Skeleton Mastery Lvl", id: "skeletonMastery", type: "number", placeholder: "e.g. 25" },
            // Damage/Attack Rating Auras:
            { label: "Fanaticism Aura Lvl", id: "fanaticism", type: "number", placeholder: "e.g. 5" },
            { label: "Concentration Aura Lvl", id: "concentration", type: "number", placeholder: "e.g. 10" },
            { label: "Might Aura Lvl", id: "might", type: "number", placeholder: "e.g. 8" },
            { label: "Heart of Wolverine", id: "hWolverine", type: "number", placeholder: "e.g 10" },
            // Life Auras:
            { label: "Heart of OakSage", id: "hOakSage", type: "number", placeholder: "e.g. 5" },
            { label: "Battle Orders", id: "battleOrders", type: "number", placeholder: "e.g. 10" },
            // Defense Auras:
            { label: "Defiance", id: "defiance", type: "number", placeholder: "e.g. 5" },
            { label: "Shout", id: "shout", type: "number", placeholder: "e.g. 10" },
        ],
        buttons: [
            {
                text: "Calculate",
                className: "StandardBTN",
                onClick: async () => {
                    const { skillLevel, masteryLevel, damageAuras, lifeAuras, defAuras } = collectSummonInputs();

                    const { data, keyMap } = await calculateRaiseSkeleton(
                        null,
                        skillLevel,
                        masteryLevel,
                        damageAuras,
                        lifeAuras,
                        defAuras
                    );

                    modalManager.show(data, keyMap);
                }
            },
            {
                text: "Clear",
                className: "StandardBTN",
                onClick: () => clearInputs([
                    "skillLevel", "skeletonMastery", "fanaticism", "concentration",
                    "might", "hWolverine", "hOakSage", "battleOrders", "defiance", "shout"
                ])
            }
        ]
    });
});

// Collects all user inputs into structured aura maps
function collectSummonInputs() {
    const getVal = id => parseFloat(document.getElementById(id)?.value) || 0;

    return {
        skillLevel: getVal("skillLevel"),
        masteryLevel: getVal("skeletonMastery"),
        damageAuras: {
            "Might": getVal("might"),
            "Concentration": getVal("concentration"),
            "Fanaticism": getVal("fanaticism"),
            "Wolverine": getVal("hWolverine")
        },
        lifeAuras: {
            "BattleOrders": getVal("battleOrders"),
            "OakSage": getVal("hOakSage")
        },
        defAuras: {
            "Defiance": getVal("defiance"),
            "Shout": getVal("shout")
        }
    };
}

// Clears all input fields
function clearInputs(ids) {
    ids.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.value = "";
    });
}