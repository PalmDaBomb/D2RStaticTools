// ==============================
// necroSummons.js
// ==============================
import { createInputSection } from "./formFactory.js";
import { calculateRaiseSkeleton, calculateRaiseSkeletonMage, calculateBloodGolem } from "./formulas.js";
import { ModalManager } from "./modalManager.js";
import { loadAllWeapons } from "./assetLoader.js";

document.addEventListener("DOMContentLoaded", async () => {
    const modalEl = document.getElementById("resultModal");
    const modalContentEl = document.getElementById("modalContent");
    const closeBtn = document.getElementById("modalClose");
    const modalManager = new ModalManager(modalEl, modalContentEl, closeBtn);

    const { weaponMap, weaponNames } = await loadAllWeapons(); 

    // Build the input form section
    createInputSection(".summon-container", {
        title: "Raise Skeleton Calculator",
        inputs: [
            { header: "Player Related:"},
            { label: "Character Lvl", id: "cLvl", type: "number", placeholder: "1-99", min: 0, max: 99 },
            { header: "Skills:"},
            { label: "Raise Skeleton Skill-Lvl", id: "skillLevel", type: "number", placeholder: "1-99", min: 0, max: 99 },
            { label: "Skeleton Mastery Skill-Lvl", id: "skeletonMastery", type: "number", placeholder: "1-99", min: 0, max: 99 },
            { label: "Summon Resist Skill-Lvl", id: "summonResist", type: "number", placeholder: "1-99", min: 0, max: 99 },
            { header: "Damage & Attack Rating Auras:"},
            { label: "Fanaticism Aura Lvl", id: "fanaticism", type: "number", placeholder: "1-99", min: 0, max: 99 },
            { label: "Concentration Aura Lvl", id: "concentration", type: "number", placeholder: "1-99", min: 0, max: 99 },
            { label: "Might Aura Lvl", id: "might", type: "number", placeholder: "1-99", min: 0, max: 99 },
            { label: "Heart of Wolverine", id: "hWolverine", type: "number", placeholder: "1-99", min: 0, max: 99 },
            { header: "External Life Boosts:"},
            { label: "Oak Sage", id: "hOakSage", type: "number", placeholder: "1-99", min: 0, max: 99 },
            { label: "Battle Orders", id: "battleOrders", type: "number", placeholder: "1-99", min: 0, max: 99 },
            { header: "Defense Auras:"},
            { label: "Defiance", id: "defiance", type: "number", placeholder: "1-99", min: 0, max: 99 },
            { label: "Shout", id: "shout", type: "number", placeholder: "1-99", min: 0, max: 99 },
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
            { header: "Skills:"},
            { label: "Skeletal Mage Skill-Lvl", id: "skillLevel", type: "number", placeholder: "1-99", min: 0, max: 99 },
            { label: "Skeleton Mastery Skill-Lvl", id: "skeletonMastery", type: "number", placeholder: "1-99", min: 0, max: 99 },
            { label: "Summon Resist Skill-Lvl", id: "summonResist", type: "number", placeholder: "1-99", min: 0, max: 99 },
            { header: "Life Auras:"},
            { label: "Oak Sage", id: "hOakSage", type: "number", placeholder: "1-99", min: 0, max: 99 },
            { label: "Battle Orders", id: "battleOrders", type: "number", placeholder: "1-99", min: 0, max: 99 },
            { header: "Defense Auras:"},
            { label: "Defiance", id: "defiance", type: "number", placeholder: "1-99", min: 0, max: 99 },
            { label: "Shout", id: "shout", type: "number", placeholder: "1-99", min: 0, max: 99 },
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
            { header: "Skills:"},
            { label: "Blood Golem Skill-Lvl", id: "skillLevel", type: "number", placeholder: "1-99", min: 0, max: 99 },
            { label: "Golem Mastery Skill-Lvl", id: "golemMastery", type: "number", placeholder: "1-99", min: 0, max: 99 },
            { label: "Summon Resist Skill-Lvl", id: "summonResist", type: "number", placeholder: "1-99", min: 0, max: 99 },
            { header: "Relevant Boosts:"},
            { label: "Clay Golem Base-Lvl", id: "cGolemBase", type: "number", placeholder: "1-20", min: 0, max: 20 },
            { label: "Iron Golem Base-Lvl", id: "iGolemBase", type: "number", placeholder: "1-20", min: 0, max: 20 },
            { label: "Fire Golem Base-Lvl", id: "fGolemBase", type: "number", placeholder: "1-20", min: 0, max: 20 },
            { header: "Damage & Attack Rating Auras:"},
            { label: "Fanaticism Aura Lvl", id: "fanaticism", type: "number", placeholder: "1-99", min: 0, max: 99 },
            { label: "Concentration Aura Lvl", id: "concentration", type: "number", placeholder: "1-99", min: 0, max: 99 },
            { label: "Might Aura Lvl", id: "might", type: "number", placeholder: "1-99", min: 0, max: 99 },
            { label: "Heart of Wolverine", id: "hWolverine", type: "number", placeholder: "1-99", min: 0, max: 99 },
            { header: "Life Auras:"},
            { label: "Oak Sage", id: "hOakSage", type: "number", placeholder: "1-99", min: 0, max: 99 },
            { label: "Battle Orders", id: "battleOrders", type: "number", placeholder: "1-99", min: 0, max: 99 },
            { header: "Defense Auras:"},
            { label: "Defiance", id: "defiance", type: "number", placeholder: "1-99", min: 0, max: 99 },
            { label: "Shout", id: "shout", type: "number", placeholder: "1-99", min: 0, max: 99 },
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
    createInputSection(".summon-container", {
        title: "Iron Golem Calculator",
        inputs: [
            { header: "Skills:"},
            { label: "Iron Golem Skill-Lvl", id: "skillLevel", type: "number", placeholder: "1-99", min: 0, max: 99 },
            { label: "Golem Mastery Skill-Lvl", id: "golemMastery", type: "number", placeholder: "1-99", min: 0, max: 99 },
            { label: "Summon Resist Skill-Lvl", id: "summonResist", type: "number", placeholder: "1-99", min: 0, max: 99 },
            { header: "Weapon Stats:"},
            { label: "Weapon Base", id: "weaponBase", type: "itemList", options: weaponNames },
            { label: "Is Ethereal", id: "isEthereal", type: "checkbox" },
            { header: "Relevant Boosts:"},
            { label: "Clay Golem Base-Lvl", id: "cGolemBase", type: "number", placeholder: "1-20", min: 0, max: 20 },
            { label: "Blood Golem Base-Lvl", id: "bGolemBase", type: "number", placeholder: "1-20", min: 0, max: 20 },
            { label: "Fire Golem Base-Lvl", id: "fGolemBase", type: "number", placeholder: "1-20", min: 0, max: 20 },
            { header: "Damage & Attack Rating Auras:"},
            { label: "Fanaticism Aura (User) Lvl", id: "fanaticismUser", type: "number", placeholder: "1-99", min: 0, max: 99 },
            { label: "Fanaticism Aura (Ally) Lvl", id: "fanaticismAlly", type: "number", placeholder: "1-99", min: 0, max: 99 },
            { label: "Concentration Aura Lvl", id: "concentration", type: "number", placeholder: "1-99", min: 0, max: 99 },
            { label: "Might Aura Lvl", id: "might", type: "number", placeholder: "1-99", min: 0, max: 99 },
            { label: "Heart of Wolverine", id: "hWolverine", type: "number", placeholder: "1-99", min: 0, max: 99 },
            { header: "Life Auras:"},
            { label: "Oak Sage", id: "hOakSage", type: "number", placeholder: "1-99", min: 0, max: 99 },
            { label: "Battle Orders", id: "battleOrders", type: "number", placeholder: "1-99", min: 0, max: 99 },
            { header: "Defense Auras:"},
            { label: "Defiance", id: "defiance", type: "number", placeholder: "1-99", min: 0, max: 99 },
            { label: "Shout", id: "shout", type: "number", placeholder: "1-99", min: 0, max: 99 },
        ],
        buttons: [
            {
                text: "Calculate",
                className: "StandardBTN",
                onClick: async (sectionContent) => {
                    const { skillLevel, masteryLevel, summonResistLevel, weaponBase, boosts, damageAuras, lifeAuras, defAuras } =
                        collectIGolemInputs(sectionContent);

                    const { data, keyMap } = await calculateIronGolem(
                        null,
                        skillLevel,
                        masteryLevel,
                        summonResistLevel,
                        weaponBase,
                        weaponMap,
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
function collectIGolemInputs(sectionContent) {
    const getVal = id => {
        const field = sectionContent.querySelector(`[data-input-id="${id}"]`);
        if (!field) return null;

        // ✅ If it's a checkbox, return checked state
        if (field.type === "checkbox") return field.checked;

        // otherwise return value (number or string)
        return field.value;
    };

    return {
        skillLevel: getVal("skillLevel"),
        masteryLevel: getVal("golemMastery"),
        summonResistLevel: getVal("summonResist"),
        weaponBase: getVal ("weaponBase"),
        isEthereal: getVal("isEthereal"),
        boosts: {
            "ClayGolem" : getVal("cGolemBase"),
            "BloodGolem" : getVal("bGolemBase"),
            "FireGolem" : getVal("fGolemBase")
        },
        damageAuras: {
            "Might": getVal("might"),
            "Concentration": getVal("concentration"),
            "FanaticismUser": getVal("fanaticismUser"),
            "FanaticismAlly": getVal("fanaticismAlly"),
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