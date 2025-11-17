// ==============================
// necroSummons.js
// ==============================
import { createInputSection } from "./formFactory.js";
import { calculateRaiseSkeleton, calculateRaiseSkeletonMage, calculateBloodGolem } from "./formulas.js";
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
            { label: "Character Lvl", id: "cLvl", type: "number", placeholder: "1-99" },
            { label: "Raise Skeleton Skill-Lvl", id: "skillLevel", type: "number", placeholder: "1-99" },
            { label: "Skeleton Mastery Skill-Lvl", id: "skeletonMastery", type: "number", placeholder: "1-99" },
            { label: "Summon Resist Skill-Lvl", id: "summonResist", type: "number", placeholder: "1-99" },
            { label: "Fanaticism Aura Lvl", id: "fanaticism", type: "number", placeholder: "1-99" },
            { label: "Concentration Aura Lvl", id: "concentration", type: "number", placeholder: "1-99" },
            { label: "Might Aura Lvl", id: "might", type: "number", placeholder: "1-99" },
            { label: "Heart of Wolverine", id: "hWolverine", type: "number", placeholder: "1-99" },
            { label: "Heart of OakSage", id: "hOakSage", type: "number", placeholder: "1-99" },
            { label: "Battle Orders", id: "battleOrders", type: "number", placeholder: "1-99" },
            { label: "Defiance", id: "defiance", type: "number", placeholder: "1-99" },
            { label: "Shout", id: "shout", type: "number", placeholder: "1-99" },
        ],
        buttons: [
            {
                text: "Calculate",
                className: "StandardBTN",
                onClick: async (sectionContent) => {
                    const { skillLevel, masteryLevel, summonResistLevel, damageAuras, lifeAuras, defAuras, cLvl } = collectRaiseSkeletonInputs(sectionContent);

                    const { data, keyMap } = await calculateRaiseSkeleton(
                        null,
                        skillLevel,
                        masteryLevel,
                        summonResistLevel,
                        damageAuras,
                        lifeAuras,
                        defAuras,
                        cLvl
                    );

                    modalManager.show(data, keyMap);
                }
            },
            {
                text: "Clear",
                className: "StandardBTN",
                onClick: (sectionContent) => clearInputs(sectionContent)
            }
        ]
    });
    // Build the input form section
    createInputSection(".summon-container", {
        title: "Raise Skeletal Mage Calculator",
        inputs: [
            { label: "Skeletal Mage Skill-Lvl", id: "skillLevel", type: "number", placeholder: "1-99" },
            { label: "Skeleton Mastery Skill-Lvl", id: "skeletonMastery", type: "number", placeholder: "1-99" },
            { label: "Summon Resist Skill-Lvl", id: "summonResist", type: "number", placeholder: "1-99" },
            { label: "Heart of OakSage", id: "hOakSage", type: "number", placeholder: "1-99" },
            { label: "Battle Orders", id: "battleOrders", type: "number", placeholder: "1-99" },
            { label: "Defiance", id: "defiance", type: "number", placeholder: "1-99" },
            { label: "Shout", id: "shout", type: "number", placeholder: "1-99" },
        ],
        buttons: [
            {
                text: "Calculate",
                className: "StandardBTN",
                onClick: async (sectionContent) => {
                    const { skillLevel, masteryLevel, summonResistLevel, lifeAuras, defAuras } = collectRaiseSkeletalMageInputs(sectionContent);

                    const { data, keyMap } = await calculateRaiseSkeletonMage(
                        null,
                        skillLevel,
                        masteryLevel,
                        summonResistLevel,
                        lifeAuras,
                        defAuras
                    );

                    modalManager.show(data, keyMap);
                }
            },
            {
                text: "Clear",
                className: "StandardBTN",
                onClick: (sectionContent) => clearInputs(sectionContent)
            }
        ]
    });
    createInputSection(".summon-container", {
        title: "Blood Golem Calculator",
        inputs: [
            { label: "Blood Golem Skill-Lvl", id: "skillLevel", type: "number", placeholder: "1-99" },
            { label: "Golem Mastery Skill-Lvl", id: "golemMastery", type: "number", placeholder: "1-99" },
            { label: "Summon Resist Skill-Lvl", id: "summonResist", type: "number", placeholder: "1-99" },
            { label: "Clay Golem Base-Lvl", id: "cGolemBase", type: "number", placeholder: "1-20" },
            { label: "Iron Golem Base-Lvl", id: "iGolemBase", type: "number", placeholder: "1-20" },
            { label: "Fire Golem Base-Lvl", id: "fGolemBase", type: "number", placeholder: "1-20" },
            { label: "Fanaticism Aura Lvl", id: "fanaticism", type: "number", placeholder: "1-99" },
            { label: "Concentration Aura Lvl", id: "concentration", type: "number", placeholder: "1-99" },
            { label: "Might Aura Lvl", id: "might", type: "number", placeholder: "1-99" },
            { label: "Heart of Wolverine", id: "hWolverine", type: "number", placeholder: "1-99" },
            { label: "Heart of OakSage", id: "hOakSage", type: "number", placeholder: "1-99" },
            { label: "Battle Orders", id: "battleOrders", type: "number", placeholder: "1-99" },
            { label: "Defiance", id: "defiance", type: "number", placeholder: "1-99" },
            { label: "Shout", id: "shout", type: "number", placeholder: "1-99" },
        ],
        buttons: [
            {
                text: "Calculate",
                className: "StandardBTN",
                onClick: async (sectionContent) => {
                    const { skillLevel, masteryLevel, summonResistLevel, boosts, damageAuras, lifeAuras, defAuras } =
                        collectBGolemInputs(sectionContent);

                    const { data, keyMap } = await calculateBloodGolem(
                        null,
                        skillLevel,
                        masteryLevel,
                        summonResistLevel,
                        boosts,
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
                onClick: (sectionContent) => clearInputs(sectionContent)
            }
        ]
    });
});

// Collects all user inputs into structured aura maps
function collectRaiseSkeletonInputs(sectionContent) {
    const getVal = id => {
        const input = sectionContent.querySelector(`input[data-input-id="${id}"]`);
        return parseFloat(input?.value) || 0;
    };

    return {
        skillLevel: getVal("skillLevel"),
        masteryLevel: getVal("skeletonMastery"),
        summonResistLevel: getVal("summonResist"),
        cLvl: getVal("cLvl"),
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

function collectRaiseSkeletalMageInputs(sectionContent) {
    const getVal = id => {
        const input = sectionContent.querySelector(`input[data-input-id="${id}"]`);
        return parseFloat(input?.value) || 0;
    };

    return {
        skillLevel: getVal("skillLevel"),
        masteryLevel: getVal("skeletonMastery"),
        summonResistLevel: getVal("summonResist"),
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

function collectBGolemInputs(sectionContent) {
    const getVal = id => {
        const input = sectionContent.querySelector(`input[data-input-id="${id}"]`);
        return parseFloat(input?.value) || 0;
    };

    return {
        skillLevel: getVal("skillLevel"),
        masteryLevel: getVal("golemMastery"),
        summonResistLevel: getVal("summonResist"),
        boosts: {
            "ClayGolem" : getVal("cGolemBase"),
            "IronGolem" : getVal("iGolemBase"),
            "FireGolem" : getVal("fGolemBase")
        },
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
function clearInputs(sectionContent) {
    sectionContent.querySelectorAll("input").forEach(input => input.value = "");
}