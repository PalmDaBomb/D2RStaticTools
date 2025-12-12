// ==============================
// necroSummons.js
// ==============================
import { createInputSection } from "./formFactory.js";
import { calculateRaiseSkeleton, calculateRaiseSkeletonMage, calculateClayGolem, calculateBloodGolem, calculateIronGolem} from "./formulas.js";
import { ModalManager } from "./modalManager.js";
import { loadIGCompatibleWeapons, loadRuneWords } from "./assetLoader.js";

document.addEventListener("DOMContentLoaded", async () => {
    const modalEl = document.getElementById("resultModal");
    const modalContentEl = document.getElementById("modalContent");
    const closeBtn = document.getElementById("modalClose");
    const modalManager = new ModalManager(modalEl, modalContentEl, closeBtn);

    const { weaponMap, weaponNames } = await loadIGCompatibleWeapons(); 
    const { runeWordMap, filterObject: dummyRunewords } = await loadRuneWords();

    // Log a single runeword from the map
    console.log("Example full runeword object:", runeWordMap[Object.keys(runeWordMap)[0]]);

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
        title: "Clay Golem Calculator",
        inputs: [
            { header: "Skills:"},
            { label: "Clay Golem Skill-Lvl", id: "skillLevel", type: "number", placeholder: "1-99", min: 0, max: 99 },
            { label: "Golem Mastery Skill-Lvl", id: "golemMastery", type: "number", placeholder: "1-99", min: 0, max: 99 },
            { label: "Summon Resist Skill-Lvl", id: "summonResist", type: "number", placeholder: "1-99", min: 0, max: 99 },
            { header: "Relevant Boosts:"},
            { label: "Blood Golem Base-Lvl", id: "bGolemBase", type: "number", placeholder: "1-20", min: 0, max: 20 },
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
                        collectCGolemInputs(sectionContent);

                    const { data, keyMap } = await calculateClayGolem(
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
            {
                label: "Runewords",
                id: "runeWordSelect",
                type: "itemList",
                options: dummyRunewords,
                dependsOn: "weaponBase",
                filter: (weaponName, runeWord) => {
                    const weapon = weaponMap.get(weaponName); // use outer-scoped weaponMap
                    if (!weapon) return false;

                    const sockets = Number(weapon[6]);
                    const category = weapon[weapon.length - 1];

                    return (
                        runeWord.allowed.includes(category) &&
                        runeWord.sockets <= sockets
                    );
                }
            },
            { label: "Is Ethereal", id: "isEthereal", type: "checkbox" },
            { header: "Relevant Boosts:"},
            { label: "Clay Golem Base-Lvl", id: "cGolemBase", type: "number", placeholder: "1-20", min: 0, max: 20 },
            { label: "Blood Golem Base-Lvl", id: "bGolemBase", type: "number", placeholder: "1-20", min: 0, max: 20 },
            { label: "Fire Golem Base-Lvl", id: "fGolemBase", type: "number", placeholder: "1-20", min: 0, max: 20 },
            { header: "Damage & Attack Rating Auras:"},
            { label: "Fanaticism Aura (Ally) Lvl", id: "fanaticismAlly", type: "number", placeholder: "1-99", min: 0, max: 99 },
            { label: "Concentration Aura (Ally) Lvl", id: "concentration", type: "number", placeholder: "1-99", min: 0, max: 99 },
            { label: "Might Aura (Ally) Lvl", id: "might", type: "number", placeholder: "1-99", min: 0, max: 99 },
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
                    const { skillLevel, masteryLevel, summonResistLevel, weaponBase, runeWord, isEthereal, boosts, damageAuras, lifeAuras, defAuras } =
                        collectIGolemInputs(sectionContent, weaponMap, runeWordMap);

                    const { data, keyMap } = await calculateIronGolem(
                        null,
                        skillLevel,
                        masteryLevel,
                        summonResistLevel,
                        weaponBase,
                        runeWord,
                        isEthereal,
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

function collectCGolemInputs(sectionContent) {
    const getVal = id => {
        const input = sectionContent.querySelector(`input[data-input-id="${id}"]`);
        return parseFloat(input?.value) || 0;
    };

    return {
        skillLevel: getVal("skillLevel"),
        masteryLevel: getVal("golemMastery"),
        summonResistLevel: getVal("summonResist"),
        boosts: {
            "BloodGolem" : getVal("bGolemBase"),
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

function collectIGolemInputs(sectionContent, weaponMap, runeWordMap) {
    // Helper to get the value of any input
    const getVal = id => {
        const field = sectionContent.querySelector(`[data-input-id="${id}"]`);
        if (!field) return null;

        switch (field.type) {
            case "checkbox": return field.checked;
            case "number":   return Number(field.value) || 0;
            default:         return field.value;
        }
    };

    // Map all inputs in one place
    const skillLevel = getVal("skillLevel");
    const masteryLevel = getVal("golemMastery");
    const summonResistLevel = getVal("summonResist");
    const weaponBase = weaponMap.get(getVal("weaponBase"));
    const runeWord = runeWordMap[getVal("runeWordSelect")];
    const isEthereal = getVal("isEthereal");
    console.log(isEthereal);

    // Boosts
    const boosts = {
        ClayGolem: getVal("cGolemBase"),
        BloodGolem: getVal("bGolemBase"),
        FireGolem: getVal("fGolemBase")
    };

    // Damage Auras
    const damageAuras = {
        Might: getVal("might"),
        Concentration: getVal("concentration"),
        FanaticismAlly: getVal("fanaticismAlly"),
        Wolverine: getVal("hWolverine")
    };

    // Life Auras
    const lifeAuras = {
        BattleOrders: getVal("battleOrders"),
        OakSage: getVal("hOakSage")
    };

    // Defense Auras
    const defAuras = {
        Defiance: getVal("defiance"),
        Shout: getVal("shout")
    };

    return {
        skillLevel,
        masteryLevel,
        summonResistLevel,
        weaponBase,
        runeWord,
        isEthereal,
        boosts,
        damageAuras,
        lifeAuras,
        defAuras
    };
}

function clearInputs(sectionContent) {
    sectionContent.querySelectorAll("input").forEach(input => {
        if (input.type === "checkbox") {
            input.checked = false; // reset checkbox properly
        } else {
            input.value = "";      // reset other inputs
        }
    });
}