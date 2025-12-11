// ==============================
// formulas.js:
// Pure math functions for iLvl and Affix calculations
// ==============================

import { getIronGolemDisplay, getElementalTotals, getStatValues } from "./runewordFunctions.js";

/**
 * Calculates the missing iLvl, cLvl, or mLvl based on the other two values present.
 * Formula: iLvl = (cLvl / 2) + (mLvl / 2)
 * @param {number} cLvl - Character level (optional)
 * @param {number} mLvl - Monster or area level (optional)
 * @param {number} iLvl - Item level (optional)
 * @returns {object} - { cLvl, mLvl, iLvl } with all fields filled
 */
export function calculateItemLevel(cLvl, mLvl, iLvl) {
  const isValid = n => typeof n === 'number' && !isNaN(n);

  // count how many are provided
  const provided = [isValid(cLvl), isValid(mLvl), isValid(iLvl)].filter(Boolean).length;
  if (provided < 2) throw new Error('At least two values are required.');
  if (provided === 3) throw new Error('Leave one box empty to calculate it.');

  let result = { cLvl, mLvl, iLvl };

  if (!isValid(iLvl)) {
    result.iLvl = Math.round((cLvl / 2) + (mLvl / 2));
  } else if (!isValid(cLvl)) {
    result.cLvl = Math.round((iLvl * 2) - mLvl);
  } else if (!isValid(mLvl)) {
    result.mLvl = Math.round((iLvl * 2) - cLvl);
  }

  return result;
}

/**
 * Calculates affix level using Diablo II’s formula.
 * Formula (from Amazon Basin):
 * IF MAX(ilvl, qlvl) < (99 - INT(qlvl/2))
 *     alvl = MAX(ilvl, qlvl) - INT(qlvl/2)
 * ELSE
 *     alvl = 2 * MAX(ilvl, qlvl) - 99
 * @param {number} ilvl - Crafted item iLvl
 * @param {number} qlvl - Base item qLvl
 * @returns {number} - Affix level (1–99)
 */
export function calculateAffixLevel(ilvl, qlvl) {
  if (
    typeof ilvl !== 'number' || isNaN(ilvl) || ilvl < 1 || ilvl > 99 ||
    typeof qlvl !== 'number' || isNaN(qlvl) || qlvl < 1 || qlvl > 99
  ) {
    throw new Error('Values must be numbers between 1 and 99.');
  }

  const maxVal = Math.max(ilvl, qlvl);
  const threshold = 99 - Math.floor(qlvl / 2);
  let alvl;

  if (maxVal < threshold) {
    alvl = maxVal - Math.floor(qlvl / 2);
  } else {
    alvl = 2 * maxVal - 99;
  }

  return Math.min(Math.max(alvl, 1), 99); // clamp between 1–99
}

/**
 * Calculates or reverses affix level using Diablo II’s formula.
 * Given any **two** of ilvl, qlvl, or alvl, it computes the missing one.
 * @param {object} params - Object with any two of { ilvl, qlvl, alvl }
 * @returns {object} - All three values filled { ilvl, qlvl, alvl }
 */
export function applyAffixFormula({ ilvl, qlvl, alvl }) {
  const isValid = n => typeof n === 'number' && !isNaN(n);

  const provided = [isValid(ilvl), isValid(qlvl), isValid(alvl)].filter(Boolean).length;
  if (provided < 2) throw new Error('Provide at least two of ilvl, qlvl, or alvl.');
  if (provided > 2) throw new Error('Leave one parameter undefined to calculate it.');

  let computedILvl = ilvl;
  let computedQLvl = qlvl;
  let computedALvl = alvl;

  // Helper: compute threshold for a given qlvl
  const threshold = q => 99 - Math.floor(q / 2);

  // --- Case 1: calculate alvl ---
  if (!isValid(alvl)) {
    const maxVal = Math.max(ilvl, qlvl);
    const thres = threshold(qlvl);
    if (maxVal < thres) {
      computedALvl = maxVal - Math.floor(qlvl / 2);
    } else {
      computedALvl = 2 * maxVal - 99;
    }
    computedALvl = Math.min(Math.max(computedALvl, 1), 99); // clamp
  }

  // --- Case 2: calculate ilvl ---
  else if (!isValid(ilvl)) {
    const thres = threshold(qlvl);
    // Branch 1: maxVal < threshold => alvl = maxVal - floor(qlvl/2)
    const candidate1 = alvl + Math.floor(qlvl / 2);
    if (candidate1 < thres) {
      computedILvl = Math.max(candidate1, qlvl); // maxVal = max(ilvl, qlvl)
    } else {
      // Branch 2: alvl = 2*maxVal - 99
      computedILvl = Math.max(Math.ceil((alvl + 99) / 2), qlvl);
    }
    computedILvl = Math.min(Math.max(computedILvl, 1), 99);
  }

  // --- Case 3: calculate qlvl ---
  else if (!isValid(qlvl)) {
    // We must try both branches and pick a valid solution
    // Branch 2 candidate (maxVal >= threshold) is easier
    let candidate = Math.ceil((alvl + 99 - 2 * ilvl) * 2); // approximate
    if (candidate < 1) candidate = 1;

    // Branch 1: alvl = max(ilvl, qlvl) - floor(qlvl/2)
    // Solve qlvl from: alvl = ilvl - floor(qlvl/2) => floor(qlvl/2) = ilvl - alvl
    const branch1QLvl = (ilvl - alvl) * 2;
    if (branch1QLvl > 0 && branch1QLvl <= 99) candidate = branch1QLvl;

    computedQLvl = Math.min(Math.max(candidate, 1), 99);
  }

  return {
    ilvl: computedILvl,
    qlvl: computedQLvl,
    alvl: computedALvl
  };
}

//=======================================================[AURA DAMAGE CALCULATIONS]
function mightCalculation(skillLvl) {
  if (!skillLvl) return 0;
  return 30 + (10 * skillLvl);
}

function concentrationCalculation(skillLvl) {
  if (!skillLvl) return 0;
  return 45 + (15 * skillLvl);
}

// Fanaticism calculation with optional ally/user parameter
export function fanaticismCalculation(skillLvl, isAlly = true) {
  if (!skillLvl) return [0, 0]; // [damage%, AR%]

  let damage = (33 + (17 * skillLvl)); // base formula
  const attackRating = 35 + (5 * skillLvl);

  // Halve the damage if it's an ally
  if (isAlly) {
    damage /= 2;
  }

  return [damage, attackRating];
}

function hWolverineCalculation(skillLvl) {
  if (!skillLvl) return [0, 0]; // [damage%, AR%]
  const damage = 13 + (7 * skillLvl);
  const attackRating = 18 + (7 * skillLvl);
  return [damage, attackRating];
}

/**
 * Calculates the total damage and attack rating multipliers
 * for summons based on the active aura skill levels.
 *
 * Each aura contributes additively to the total % bonuses,
 * and these bonuses are converted to relevant multipliers
 *
 * @param {number} mSkillLvl - Might aura skill level
 * @param {number} cSkillLvl - Concentration aura skill level
 * @param {number} fSkillLvl - Fanaticism aura skill level
 * @param {number} wSkillLvl - Heart of Wolverine aura skill level
 * @param {[number, number]} skillValues An array where:
 *   - [0] = total Damage PERCENTAGE increased directly by the skill
 *   - [1] = total Attack Rating PERCENTAGE increased directly by the skill
 * @returns {[number, number]} An array where:
 *   - [0] = total damage MULTIPLIER (float)
 *   - [1] = total attack rating MULTIPLIER (float)
 */
export function totalAuraArAndDamageCalculation(
  mSkillLvl,
  cSkillLvl,
  fSkillLvl,
  wSkillLvl,
  skillValues,
  fanaticismAlly = true
) {
  const [fanatDamage, fanatAR] = fanaticismCalculation(fSkillLvl, fanaticismAlly);
  const [wolfDamage, wolfAR] = hWolverineCalculation(wSkillLvl);
  const skillValueDamage = skillValues[0];
  const skillValueAttackRating = skillValues[1];

  // Convert % bonuses to multipliers (e.g., +500% = x6)
  const totalDamageMultiplier = 1 + ((
    mightCalculation(mSkillLvl) +
    concentrationCalculation(cSkillLvl) +
    fanatDamage + wolfDamage + skillValueDamage) / 100);

  const totalARMultiplier = 1 + ((fanatAR + wolfAR + skillValueAttackRating) / 100);

  return [totalDamageMultiplier, totalARMultiplier];
}

//=======================================================[AURA Life CALCULATIONS]
function boCalculation(skillLvl) {
  if (!skillLvl) return 0;
  return 32 + (3 * skillLvl);
}

function hOakSageCalculation(skillLvl) {
  if (!skillLvl) return 0;
  return 25 + (5 * skillLvl);
}

/**
 * Calculates the total life multiplier from active aura skill levels.
 *
 * This multiplier is intended to be applied to a summon’s base life.
 * It does **not** include the life granted directly by the skill itself,
 * since that is multiplicative with this value.
 *
 * @param {number} boSkillLvl - Battle Orders skill level
 * @param {number} osSkillLvl - Heart of Oak aura skill level
 * @returns {number} - Total life multiplier (e.g., 1.50 = +50% life)
 */
export function totalLifeCalculation(boSkillLvl, osSkillLvl) {
  const totalLifeMultiplier = 1 + ((boCalculation(boSkillLvl) + hOakSageCalculation(osSkillLvl)) / 100);
  return totalLifeMultiplier;
}

//=======================================================[DEFENSE CALCULATIONS]
function defianceCalculation(skillLvl) {
  if (!skillLvl) return 0;
  return 60 + (10 * skillLvl);
}

function shoutCalculation(skillLvl) {
  if (!skillLvl) return 0;
  return 90 + (10 * skillLvl);
}

function resistanceCalculation(baseResistances = {}, summonResistLvl = 0) {
  // Default all types to 0 if not provided
  const defaultTypes = ["Fire", "Cold", "Lightning", "Poison", "Magic", "Physical"];
  const resistances = {};
  for (const type of defaultTypes) {
    resistances[type] = baseResistances[type] || 0;
  }

  // Calculate general bonus resistance
  const allResist = summonResistLvl > 0
    ? Math.min(20 + (55 * ((110 * summonResistLvl) / (summonResistLvl + 6) / 100)), 75)
    : 0;

  const resistanceMap = {};

  // Types that receive the allResist bonus
  ["Fire", "Cold", "Lightning", "Poison"].forEach(type => {
    resistanceMap[type] = `<span class='${type.toLowerCase()}'>${allResist + resistances[type]}%</span>`;
  });

  // Types that do NOT receive the allResist bonus
  ["Magic", "Physical"].forEach(type => {
    resistanceMap[type] = `<span class='${type.toLowerCase()}'>${resistances[type]}%</span>`;
  });

  return resistanceMap;
}

function displayValue(className, value) {
  return `<span class="${className}">${value}</span>`;
}

function displayMaxMinAvg(className, min, max, avg) {
  return `<span class="${className}">${min}-${max} (${avg})</span>`;
}

function displayDifficultyValues(normalValue, nightmareValue, hellValue) {
  const displayReturn = 
  `<span class="nrm">${normalValue}</span> /
   <span class="nmt">${nightmareValue}</span> /
   <span class="hell">${hellValue}</span>`;
  
   return displayReturn;
}

/**
 * Calculates the total Defense multiplier from active aura skill levels.
 *
 * This multiplier is intended to be applied to a summon’s base defense,
 * including any increased percent defense from the skill itself.
 *
 * @param {number} defianceSkillLvl - Defiance Aura skill level
 * @param {number} shoutSkillLvl - Shout skill level
 * @param {number} skillLvlValue - Any percent Increases from the Summon Skill itself
 * @returns {number} - Total Defense multiplier (e.g., 1.50 = +50% life)
 */
export function totalDefCalculation(defianceSkillLvl, shoutSkillLvl, skillLvlValue) {
  return (1 + ((skillLvlValue + defianceCalculation(defianceSkillLvl) + shoutCalculation(shoutSkillLvl)) / 100));
}


import { loadMonStats } from './assetLoader.js';

/**
 * Calculates Necromancer's Raise Skeleton stats based on skill levels, mastery,
 * and active aura bonuses.
 * @param {Map} monStatsMap - (optional) Cached MonStats map from loadMonStats().
 * @param {number} skillLvl - Raise Skeleton skill level.
 * @param {number} mSkillLvl - Skeleton Mastery skill level.
 * @param {[string],number} damageAuraMap - Total Damage Aura Levels (might, fanat, con, wolverine).
 * @param {[string],number} lifeAuraMap - Total Life Aura Levels (battle orders, oaksage).
 * @param {[string],number} defAuraMap - Total def Aura Levels (defiance, shout).
 * @returns {Promise<object>} - Promise resolving to computed skeleton stats.
 */
export async function calculateRaiseSkeleton(monStatsMap, skillLvl, mSkillLvl, summonResistLvl, damageAuraMap, lifeAuraMap, defAuraMap, cLvl) {
  if (!monStatsMap) {
    monStatsMap = await loadMonStats();
  }

  const monStat = monStatsMap.get(skillLvl);
  if (!monStat) {
    console.warn(`No MonStats entry found for level ${skillLvl}`);
    return null;
  }

  console.log("monStatsMap:", monStatsMap);
  console.log("monStat for skillLvl", skillLvl, ":", monStat);


  // ===============[ATTACK RATING & DAMAGE]===================
  let cLvlBonusNormal = 0;
  let cLvlBonusNightmare = 0;
  let cLvlBonusHell = 0;

  if (cLvl > 0) {
    cLvlBonusNightmare = (((cLvl -1) * 18) + 108);
    cLvlBonusHell = (((cLvl -1) * 38) + 216);
  }

  if (cLvl > 6) {
    cLvlBonusNormal = (((cLvl -1) * 11) + 45);
  }
  //3940 + 716 + 1176
  //Base Attack Rating:
  const normalAr = (5 + (15 * (skillLvl + mSkillLvl))) + monStat.Normal + cLvlBonusNormal;
  const nightmareAr = (4 + (15 * (skillLvl + mSkillLvl))) + monStat.Nightmare + cLvlBonusNightmare;
  const hellAr = (6 + (15 * (skillLvl + mSkillLvl))) + monStat.Hell + cLvlBonusHell;

  //Percent Attacking Rating Increase from Skill:
  const percentageAttackRating = 0; // No Percentage Attack rating Increase from skill

  //Base Damage:
  let minBaseDamage = 0;
  let maxBaseDamage = 0;

  if (skillLvl <= 8) {
    minBaseDamage = 1 + (2 * mSkillLvl);
    maxBaseDamage = 2 + (2 * mSkillLvl);
  } else if (skillLvl <= 16) {
    minBaseDamage = (skillLvl - 7) + (2 * mSkillLvl);
    maxBaseDamage = (skillLvl - 6) + (2 * mSkillLvl);
  } else if (skillLvl <= 22) {
    minBaseDamage = (skillLvl * 2 - 23) + (2 * mSkillLvl);
    maxBaseDamage = (skillLvl * 2 - 22) + (2 * mSkillLvl);
  } else if (skillLvl <= 28) {
    minBaseDamage = (skillLvl * 3 - 45) + (2 * mSkillLvl);
    maxBaseDamage = (skillLvl * 3 - 44) + (2 * mSkillLvl);
  } else {
    minBaseDamage = (skillLvl * 4 - 73) + (2 * mSkillLvl);
    maxBaseDamage = (skillLvl * 4 - 72) + (2 * mSkillLvl);
  }

  //Skill Percent Damage Increase:
  let percentageDamage;

  if (skillLvl < 4) {
    percentageDamage = 0;
  } else {
    percentageDamage = ((7 * skillLvl) - 21);
  }

  const damageAndArMultipliers = totalAuraArAndDamageCalculation(
                                 damageAuraMap["Might"], 
                                 damageAuraMap["Concentration"],
                                 damageAuraMap["Fanaticism"], 
                                 damageAuraMap["Wolverine"],
                                 [percentageDamage,percentageAttackRating]);
  console.log("Damage & AR Multipliers:", damageAndArMultipliers);

  //Critical Hits:
  const critChance = 0.05;
  const critMultiplier = 2;
  const avgCritDamageIncrease = 1 + (critChance * critMultiplier);

  // Total Damage Calculation:
  var totalDamageMultiplier = damageAndArMultipliers[0];
  var displayBaseMinDamage = Math.floor(minBaseDamage * (1 + (percentageDamage / 100)));
  var displayBaseMaxDamage = Math.floor(maxBaseDamage * (1 + (percentageDamage / 100)));
  var totalMinDamage = Math.floor(minBaseDamage * totalDamageMultiplier * avgCritDamageIncrease);
  var totalMaxDamage = Math.floor(maxBaseDamage * totalDamageMultiplier * avgCritDamageIncrease);
  var totalAverageDamage = Math.round((totalMinDamage + totalMaxDamage) / 2 * 100) / 100;
  const displayDamage = `${totalMinDamage} - ${totalMaxDamage} (${totalAverageDamage})`;

  // Total Attack Rating calculation:
  var totalAttackRatingMultiplier = damageAndArMultipliers[1];
  var totalAttackRatingNormal = Math.floor(normalAr * totalAttackRatingMultiplier);
  var totalAttackRatingNightmare = Math.floor(nightmareAr * totalAttackRatingMultiplier);
  var totalAttackRatingHell = Math.floor(hellAr * totalAttackRatingMultiplier);
  const displayAR = 
  `<span class="nrm">${totalAttackRatingNormal}</span> /
   <span class="nmt">${totalAttackRatingNightmare}</span> /
   <span class="hell">${totalAttackRatingHell}</span>`;

  // ===============[SKELETON DEFENSE]===================
  const normalDef = 5 + (15 * (skillLvl + mSkillLvl)) + monStat.Normal;
  const nightmareDef = 5 + (15 * (skillLvl + mSkillLvl)) + monStat.Nightmare;
  const hellDef = 6 + (15 * (skillLvl + mSkillLvl)) + monStat.Hell;
  const percentageDef = 0; // No percent defense increases granted from skill

  const defenseMultiplier = totalDefCalculation(defAuraMap["Defiance"], defAuraMap["Shout"], percentageDef);
  var totalNormalDef = Math.floor(normalDef * defenseMultiplier);
  var totalNightmareDef = Math.floor(nightmareDef * defenseMultiplier);
  var totalHellDef = Math.floor(hellDef * defenseMultiplier);
  const defenseDisplay =
  `<span class="nrm">${totalNormalDef}</span> /
   <span class="nmt">${totalNightmareDef}</span> /
   <span class="hell">${totalHellDef}</span>`;

   var allResist = 0;
   if (summonResistLvl > 0) {
      allResist = Math.min(20 + (55 * ((110 * summonResistLvl) / (summonResistLvl + 6) / 100)), 75);
   }
   var totalFireResist = `<span class='fire'>${allResist}%</span>`;
   var totalColdResist =  `<span class='cold'>${allResist}%</span>`;
   var totalLightningResist = `<span class='lightning'>${allResist}%</span>`;
   var totalPoisonResist = `<span class='poison'>${allResist}%</span>`;
   var totalMagicResist = `<span class='magic'>${0}%</span>`;


  // ===============[SKELETON COUNT & LIFE]===================
  let maximumSkeles;
  let percentageLife;

  if (skillLvl < 4) {
    maximumSkeles = skillLvl;
    percentageLife = 0;
  } else {
    maximumSkeles = Math.floor(2 + (skillLvl / 3));
    percentageLife = 1 + ((50 * (skillLvl-3)) / 100);
  }

  //Base Life (Including Skill Multipliers):
  const normalLife = (21 + (8 * mSkillLvl)) * percentageLife;
  const nightmareLife = (30 + (8 * mSkillLvl)) * percentageLife;
  const hellLife = (42 + (8 * mSkillLvl)) * percentageLife;

  //Aura Multiplier calculation:
  const auraLifeMultiplier = totalLifeCalculation(lifeAuraMap["BattleOrders"], lifeAuraMap["OakSage"]);
  const totalNormalLife = normalLife * auraLifeMultiplier;
  const totalNightmareLife = nightmareLife * auraLifeMultiplier;
  const totalHellLife = hellLife * auraLifeMultiplier;
  const displayLife = 
  `<span class="nrm">${totalNormalLife}</span> /
   <span class="nmt">${totalNightmareLife}</span> /
   <span class="hell">${totalHellLife}</span>`;

  //Managing Return values for modal display:
  const critChanceNote = `Total Damages Include Average Critical Hit Damage Output <strong>(~10% Damage Increase)</strong>`;
  const ARNote = `Sources are inconsistent with the Attack Rating formula. The above values consider <strong>Character Level Bonuses</strong> & <strong>Monstat Increases</strong>`;

  const data = {
    maximumSkeles,
    displayDamage,
    displayAR,
    displayLife,
    defenseDisplay,
    totalFireResist,
    totalLightningResist,
    totalColdResist,
    totalPoisonResist,
    totalMagicResist,
    critChanceNote,
    ARNote
  };

  const keyMap = {
    "Maximum Skeletons": "maximumSkeles",
    "Damage (All Difficulties)": "displayDamage",
    "Attack Rating (Norm/Night/Hell)": "displayAR",
    "Total Life (Norm/Night/Hell)": "displayLife",
    "Defense (Norm/Night/Hell)" : "defenseDisplay",
    "<span class='fire'>Fire Resist</span>" : "totalFireResist",
    "<span class='cold'>Cold Resist</span>" : "totalColdResist",
    "<span class='lightning'>Lightning Resist</span>" : "totalLightningResist",
    "<span class='poison'>Poison Resist</span>" : "totalPoisonResist",
    "<span class='magic'>Magic Resist</span>" : "totalMagicResist",
    "Crit Chance" : "critChanceNote",
    "AttackRating Note" : "ARNote"
  };

  return { data, keyMap };
}

function computeSkeletalMageDamage(skelMageLvl, skelMasteryLvl) {
  const bonus = (skelMageLvl < 4) ? 0 : Math.floor((skelMageLvl - 2) / 2);
  const missileLevel = skelMasteryLvl + bonus;

  const mageData = {
    Poison: { EMin: 12, MinELev: [8,10,14,18,24], EMax: 12, MaxELev: [8,10,14,18,24] },
    Cold: { EMin: 2,  MinELev: [1,2,4,7,9],     EMax: 4,  MaxELev: [1,2,4,7,9] },
    Fire: { EMin: 2,  MinELev: [2,3,5,7,9],     EMax: 6,  MaxELev: [2,3,5,7,9] },
    Lightning: { EMin: 1,  MinELev: [1,1,1,1,1],     EMax: 7,  MaxELev: [3,5,8,11,17] }
  };

  const tiers = [
    { start: 2, end: 8 },
    { start: 9, end: 15 },
    { start: 16, end: 22 },
    { start: 23, end: 29 },
    { start: 30, end: 99 }
  ];

  const result = { missileLevel };

  // 🔥 Single combined loop:
  for (const [element, data] of Object.entries(mageData)) {
    let min = data.EMin;
  let max = data.EMax;

  for (let i = 0; i < tiers.length; i++) {
    const tier = tiers[i];
    if (missileLevel < tier.start) break;

    const end = Math.min(missileLevel, tier.end);
    const levelsInTier = end - tier.start + 1;

    // only add extra after tier start > 1
    min += data.MinELev[i] * levelsInTier;
    max += data.MaxELev[i] * levelsInTier;
  }

    // Calculate avg (2 decimals)
    const avg = Number(((min + max) / 2).toFixed(2));

    // Add duration based on element
    let duration = 0;
    if (element === "Cold") duration = missileLevel;  // freeze length
    if (element === "Poison") duration = 4;             // seconds
    // fire & lightning stay 0

    result[element] = { min, max, avg, duration };
  }

  return result;
}

/**
 * Calculates Necromancer's Raise SkeletalMage stats based on skill levels, mastery,
 * and active aura bonuses.
 * @param {Map} monStatsMap - (optional) Cached MonStats map from loadMonStats().
 * @param {number} skillLvl - Raise Skeleton skill level.
 * @param {number} mSkillLvl - Skeleton Mastery skill level.
 * @param {number} summonResistLvl - Skill level of Summon Resist.
 * @param {[string],number} lifeAuraMap - Total Life Aura Levels (battle orders, oaksage).
 * @param {[string],number} defAuraMap - Total def Aura Levels (defiance, shout).
 * @returns {Promise<object>} - Promise resolving to computed skeleton stats.
 */
export async function calculateRaiseSkeletonMage(monStatsMap, skillLvl, mSkillLvl, summonResistLvl, lifeAuraMap, defAuraMap) {
  if (!monStatsMap) {
      monStatsMap = await loadMonStats();
    }

    const monStat = monStatsMap.get(skillLvl);
    if (!monStat) {
      console.warn(`No MonStats entry found for level ${skillLvl}`);
      return null;
    }
  
  let necroMageNum = 0;
  if (skillLvl < 4) {
    necroMageNum = 0;
  } else {
    necroMageNum = Math.floor(2 + (skillLvl / 3));
  }

  // ===============[DAMAGE]===================
  const mageDamages = computeSkeletalMageDamage(skillLvl, mSkillLvl);

  const displayMap = {};

  for (const [element, stats] of Object.entries(mageDamages)) {
    if (element === "missileLevel") continue;

    const { min, max, avg, duration } = stats;

    if (element == "Poison") {
      displayMap[element] = `<span class='poison'>${min} (Over ${duration} Seconds)</span>`
    } else {
      displayMap[element] = displayMaxMinAvg(
        element.toLowerCase(),
        min,
        max,
        avg
      );
    }
  }

  // ===============[DEFENSES]===================
  const normalDef = 24 + (10 * (skillLvl + mSkillLvl)) + monStat.Normal;
  const nightmareDef = 26 + (10 * (skillLvl + mSkillLvl)) + monStat.Nightmare;
  const hellDef = 28 + (10 * (skillLvl + mSkillLvl)) + monStat.Hell;
  const percentageDef = 0; // No percent defense increases granted from skill

  const defenseMultiplier = totalDefCalculation(defAuraMap["Defiance"], defAuraMap["Shout"], percentageDef);
  var totalNormalDef = Math.floor(normalDef * defenseMultiplier);
  var totalNightmareDef = Math.floor(nightmareDef * defenseMultiplier);
  var totalHellDef = Math.floor(hellDef * defenseMultiplier);

  const displayDef = displayDifficultyValues(totalNormalDef, totalNightmareDef, totalHellDef);
  const resistances = resistanceCalculation({},summonResistLvl);

  // ===============[LIFE]===================
  const normalBaseLife = (mSkillLvl * 8) + 61;
  const nightmareBaseLife = (mSkillLvl * 8) + 88;
  const hellBaseLife = (mSkillLvl * 8) + 123;

  var lifeModifier = 0;
  if (skillLvl > 3) {
    lifeModifier = 1 + ((50 * (skillLvl-3)) / 100);
  }

  const otherLifeModifers = totalLifeCalculation(lifeAuraMap["BattleOrders"], lifeAuraMap["OakSage"]);
  const totalNormalLife = Math.floor(normalBaseLife * lifeModifier * otherLifeModifers);
  const totalNightmareLife = Math.floor(nightmareBaseLife * lifeModifier * otherLifeModifers);
  const totalHellLife = Math.floor(hellBaseLife * lifeModifier * otherLifeModifers);

  const displayLife = displayDifficultyValues(totalNormalLife, totalNightmareLife, totalHellLife);
  const lifeNote = `There are inconsistencies with %Life Increase values. The formula in <strong>skills.txt</strong> reads:
  <strong> 50 x (skillLvl - 3)</strong> but other sources use <strong>(10 x skillLvl) - 21</strong>. The calculation above 
  uses the formula in skills.txt`;
  const resistNote = `A few sources state that NecroMages have higher resistance, particularly to the element that they fight with.
  This is not supported in any of the data files and may be a misinterpretation of the general characteristics of enemy mages.`

  const data = {
    necroMageNum,
    Poison: displayMap["Poison"],
    Fire: displayMap["Fire"],
    Cold: displayMap["Cold"],
    Lightning: displayMap["Lightning"],
    displayLife,
    displayDef,
    totalFireResist: resistances["Fire"],
    totalLightningResist: resistances["Lightning"],
    totalColdResist: resistances["Cold"],
    totalPoisonResist: resistances["Poison"],
    totalMagicResist: resistances["Magic"],
    totalPhysicalResist: resistances["Physical"],
    lifeNote,
    resistNote
  };

  const keyMap = {
    "Maximum NecroMages": "necroMageNum",
    "Poison Mage Damage": "Poison",
    "Fire Mage Damage": "Fire",
    "Cold Mage Damage": "Cold",
    "Lightning Mage Damage": "Lightning",
    "Total Life (Norm/Night/Hell)": "displayLife",
    "Defense (Norm/Night/Hell)" : "displayDef",
    "<span class='fire'>Fire Resist</span>" : "totalFireResist",
    "<span class='cold'>Cold Resist</span>" : "totalColdResist",
    "<span class='lightning'>Lightning Resist</span>" : "totalLightningResist",
    "<span class='poison'>Poison Resist</span>" : "totalPoisonResist",
    "<span class='magic'>Magic Resist</span>" : "totalMagicResist",
    "%Life Note" : "lifeNote",
    "ResistNote" : "resistNote"
  };

  return { data, keyMap };
}

/**
 * Calculates Necromancer's Blood stats based on skill levels, mastery, boosts
 * and active aura bonuses.
 * @param {Map} monStatsMap - (optional) Cached MonStats map from loadMonStats().
 * @param {number} skillLvl - Blood Golem skill level.
 * @param {number} gmSkillLvl - Golem Mastery skill level.
 * @param {[string],number} boostsMap - Total Levels of Boost Skills.
 * @param {[string],number} damageAuraMap - Total Damage Aura Levels (might, fanat, con, wolverine).
 * @param {[string],number} lifeAuraMap - Total Life Aura Levels (battle orders, oaksage).
 * @param {[string],number} defAuraMap - Total def Aura Levels (defiance, shout).
 * @returns {Promise<object>} - Promise resolving to computed skeleton stats.
 */
export async function calculateBloodGolem(monStatsMap, skillLvl, gmSkillLvl, summonResistLvl, boostsMap, damageAuraMap, lifeAuraMap, defAuraMap) {
  console.log(typeof skillLvl, skillLvl);
  if (!monStatsMap) {
      monStatsMap = await loadMonStats();
    }

    const monStat = monStatsMap.get(skillLvl);
    if (!monStat) {
      console.warn(`No MonStats entry found for level ${skillLvl}`);
      return null;
    }
  
  // ===============[ATTACK RATING & DAMAGE]===================
  // Damage does not incease with skillLevel, Just difficulty:
  var hellMinDmg = 12;
  var hellMaxDmg = 33;

  var normalARBase = (60 + monStat.Normal) + (gmSkillLvl * 25) + (boostsMap["ClayGolem"] * 20);
  var nightmareARBase = (104 + monStat.Nightmare) + (gmSkillLvl * 25)+ (boostsMap["ClayGolem"] * 20);
  var hellARBase = (148 + monStat.Hell) + (gmSkillLvl * 25)+ (boostsMap["ClayGolem"] * 20);

  // Percent Damage increases with skill increase and points in Fire Golem. This is additive with 
  // the damage Auras. No Percent increases to Attack Rating from Skills. 
  const percentDamageSkills = ((skillLvl - 1) * 55) + (6 * boostsMap["FireGolem"]);
  const percentAttackRating = 0;
  const damageAndArMultipliers = totalAuraArAndDamageCalculation(
                                 damageAuraMap["Might"], 
                                 damageAuraMap["Concentration"],
                                 damageAuraMap["Fanaticism"], 
                                 damageAuraMap["Wolverine"],
                                 [percentDamageSkills,percentAttackRating]);

  var damageMultiplier = damageAndArMultipliers[0];
  var arMultiplier = damageAndArMultipliers[1];

  // Hell Damage:
  var totalHellMinDmg = Math.floor(hellMinDmg * damageMultiplier);
  var totalHellMaxDmg = Math.floor(hellMaxDmg * damageMultiplier);
  var hellAvgDmg = Math.round((totalHellMinDmg + totalHellMaxDmg) / 2 * 100) / 100;

  // Interpolated strings for Return
  const hellDamage = `${totalHellMinDmg} - ${totalHellMaxDmg} (${hellAvgDmg})`;
  const normalAR = Math.floor(normalARBase * arMultiplier);
  const nightmareAR = Math.floor(nightmareARBase * arMultiplier);
  const hellAR = Math.floor(hellARBase * arMultiplier);
  const displayAR = `<span class="nrm">${normalAR}</span> /
   <span class="nmt">${nightmareAR}</span> /
   <span class="hell">${hellAR}</span>`;

  // ===============[LIFE STEAL]===================
  const rawLS = ((110 * skillLvl) * (150 - 75)) / (100 * (skillLvl + 6)) + 75;
  const lifeStolenPercentage = (Math.min(150, Math.max(75, rawLS))) / 100;
  // Max Life steal will occur if the golem is fully healed and does maximum damage. Otherwise, the min life stolen
  // is 30% (if the golem is weaked he takes up to 70% of the life stolen). So the min life stolen would occur 
  // if a weakened golem does his min damage and only transfers 30% life to the caster:

  const normalMaxLS = Math.floor(lifeStolenPercentage * totalHellMaxDmg);
  const normalMinLS = Math.floor((lifeStolenPercentage * 0.30) * totalHellMinDmg);
  const normalAvgLS = ((normalMaxLS + normalMinLS) / 2).toFixed(2);
  // Nightmare = 1/2
  const nightmareMaxLS = Math.floor(normalMaxLS / 2);
  const nightmareMinLS = Math.floor(normalMinLS / 2);
  const nightmareAvgLS = ((nightmareMaxLS + nightmareMinLS) / 2).toFixed(2);
  // Hell = 1/3
  const hellMaxLS = Math.floor(normalMaxLS / 3);
  const hellMinLS = Math.floor(normalMinLS / 3);
  const hellAvgLS = ((hellMaxLS + hellMinLS) / 2).toFixed(2);

  // Interpolated strings for Return:
  const lifeStolen = Math.floor(lifeStolenPercentage * 100);
  const normalLifeReturned = `${normalMinLS} - ${normalMaxLS} (${normalAvgLS})`;
  const nightmareLifeReturned = `${nightmareMinLS} - ${nightmareMaxLS} (${nightmareAvgLS})`;
  const hellLifeReturned = `${hellMinLS} - ${hellMaxLS} (${hellAvgLS})`;

  // ===============[DEFENSE & RESIST]===================
  var normalBaseDef = 120 + monStat.Normal + (35 * boostsMap["IronGolem"]);
  var nightmareBaseDef = 120 + monStat.Nightmare + (35 * boostsMap["IronGolem"]);
  var hellBaseDef = 120 + monStat.Hell + (35 * boostsMap["IronGolem"]);
  const percentageDef = 0; // No percent defense increases granted from skill

  const defenseMultiplier = totalDefCalculation(defAuraMap["Defiance"], defAuraMap["Shout"], percentageDef);
  const totalNormalDef = Math.floor(normalBaseDef * defenseMultiplier);
  const totalNightmareDef = Math.floor(nightmareBaseDef * defenseMultiplier);
  const totalHellDef = Math.floor(hellBaseDef * defenseMultiplier);
  const defenseDisplay =
  `<span class="nrm">${totalNormalDef}</span> /
   <span class="nmt">${totalNightmareDef}</span> /
   <span class="hell">${totalHellDef}</span>`;

   var allResist = 0;
   if (summonResistLvl > 0) {
      allResist = Math.min(20 + (55 * ((110 * summonResistLvl) / (summonResistLvl + 6) / 100)), 75);
   }
   var totalFireResist = `<span class='fire'>${allResist}%</span>`;
   var totalColdResist =  `<span class='cold'>${allResist}%</span>`;
   var totalLightningResist = `<span class='lightning'>${allResist}%</span>`;
   var totalPoisonResist = `<span class='poison'>${allResist + 20}%</span>`;
   var totalMagicResist = `<span class='magic'>${20}%</span>`;
  

  // ===============[LIFE]===================
  const baseLife = 637 * (1 + ((((skillLvl - 1) * 20) + (gmSkillLvl * 20)) / 100));
  const lifeMultiplier = totalLifeCalculation(lifeAuraMap["BattleOrders"], lifeAuraMap["OakSage"]);
  var totalLife = Math.floor(baseLife * lifeMultiplier);


  const data = {
    hellDamage,
    displayAR,
    lifeStolen,
    normalLifeReturned,
    nightmareLifeReturned,
    hellLifeReturned,
    totalLife,
    defenseDisplay,
    totalFireResist,
    totalLightningResist,
    totalColdResist,
    totalPoisonResist,
    totalMagicResist
  };

  const keyMap = {
    "Damage (All Difficulties)": "hellDamage",
    "Attack Rating (Norm/Night/Hell)": "displayAR",
    "Life Stolen (%)": "lifeStolen",
    "Caster Life Returned (Normal)": "normalLifeReturned",
    "Caster Life Returned (Nightmare)": "nightmareLifeReturned",
    "Caster Life Returned (Hell)": "hellLifeReturned",
    "Blood Golem Life" : "totalLife",
    "Defense (Norm/Night/Hell)" : "defenseDisplay",
    "<span class='fire'>Fire Resist</span>" : "totalFireResist",
    "<span class='cold'>Cold Resist</span>" : "totalColdResist",
    "<span class='lightning'>Lightning Resist</span>" : "totalLightningResist",
    "<span class='poison'>Poison Resist</span>" : "totalPoisonResist",
    "<span class='magic'>Magic Resist</span>" : "totalMagicResist",
  };

  return { data, keyMap };
}

function getIronGolemResistance(runeWord) {
 const resistanceTypes = ["Fire", "Cold", "Lightning", "Poison", "Magic", "Physical", "All"];

 //Base Iron Golem has 50 lightning resistance and 100 Poison Resistance:
 const baseResist = {
  Fire: 0,
  Cold: 0,
  Lightning: 50,
  Poison: 100,
  Magic: 0,
  Physical: 0
 }

 const allResist = getStatValues(runeWord, "Resistance", "All").avg || 0;
 if (allResist !== 0) {
  ["Fire", "Cold", "Lightning", "Poison"].forEach(type => {
    baseResist[type] += allResist;
  });
 }

 for (const type of resistanceTypes) {
    if (type === "All") continue; // handled already

    const { avg } = getStatValues(runeWord, "Resistance", type);

    if (avg !== 0) {
      baseResist[type] += avg;
    }
  }

  return baseResist;

}

export function weaponPhysicalDamageCalc(weaponBase, runeWord, isEthereal, isIronGolem = false) {
  // Base Weapon Damage
  let [, , , baseMin, baseMax] = weaponBase;
  if (isEthereal) {
    baseMin = Math.floor(baseMin * 1.5);
    baseMax = Math.floor(baseMax * 1.5);
  }
  console.log("baseMin", baseMin);
  console.log("baseMax", baseMax);

  //Retrieve relevant runeword stats:
  const ed = getStatValues(runeWord, "EnhancedDamage", "All");
  // Accounting for superior on weapon base, which is added here:
  ed.max = ed.max + 15;
  ed.avg = Math.floor((ed.max + ed.min) / 2);
  const addedMin = getStatValues(runeWord, "AddedMinDamage", "Physical");
  const addedMax = getStatValues(runeWord, "AddedMaxDamage", "Physical");
  const addedDamage = getStatValues(runeWord, "AddedDamage", "Physical");
  console.log(weaponBase);
  console.log("Raw ED:", ed);
  console.log("AddedMin:", addedMin);
  console.log("AddedMax:", addedMax);
  console.log("AddedDamage:", addedDamage);

  // -------------------------------
  // Iron Golem per-difficulty bonuses
  // -------------------------------
  const IG_BONUS = {
    Normal:    { min: 7,  max: 19 },
    Nightmare: { min: 11, max: 30 },
    Hell:      { min: 12, max: 33 }
  };

  // Helper: deep clone of stat objects
  function cloneStat(s) {
    return { min: s.min, avg: s.avg, max: s.max };
  }

  const elemental = getElementalTotals(runeWord);
  console.log("ElementalTotals:", elemental);

  // Internal helper for worst/avg/best
  const calcScenario = (minBase, maxBase, edValues, addMin, addMax, addFlat, elemental) => {
    const worstMin = Math.floor(minBase * (1 + edValues.min / 100) + addMin.min + addFlat.min + elemental.min);
    const worstMax = Math.floor(maxBase * (1 + edValues.min / 100) + addMin.max + addFlat.max + elemental.max);
    const worstAvg = Math.floor((worstMin + worstMax) / 2);

    const avgMin = Math.floor(minBase * (1 + edValues.avg / 100) + addMin.avg + addFlat.avg + elemental.avg);
    const avgMax = Math.floor(maxBase * (1 + edValues.avg / 100) + addMax.avg + addFlat.avg + elemental.avg);
    const avgAvg = Math.floor((avgMin + avgMax) / 2);

    const bestMin = Math.floor(minBase * (1 + edValues.max / 100) + addMax.min + addFlat.min + elemental.max);
    const bestMax = Math.floor(maxBase * (1 + edValues.max / 100) + addMax.max + addFlat.max + elemental.max);
    const bestAvg = Math.floor((bestMin + bestMax) / 2);

    return {
      worstCase: [worstMin, worstMax, worstAvg],
      avgCase:   [avgMin,  avgMax,  avgAvg],
      bestCase:  [bestMin, bestMax, bestAvg]
    };
  };

  // -------------------------------
  // Build difficulty-specific damage
  // -------------------------------
  const difficulties = ["Normal", "Nightmare", "Hell"];
  const output = {};

  for (const diff of difficulties) {
    const minAdd = cloneStat(addedMin);
    const maxAdd = cloneStat(addedMax);

    if (isIronGolem) {
      const typeField = weaponBase[11] || "";
      const isTwoHanded = typeField.includes("2H") || typeField.includes("Polearm");

      if (!isTwoHanded) {
        // add flat IG bonus for this difficulty
        const ig = IG_BONUS[diff];
        minAdd.min += ig.min;
        minAdd.avg += ig.min;
        minAdd.max += ig.min;

        maxAdd.min += ig.max;
        maxAdd.avg += ig.max;
        maxAdd.max += ig.max;
      }
    }

    output[diff] = calcScenario(
      baseMin, baseMax,
      ed,
      minAdd, maxAdd,
      addedDamage, elemental
    );
    console.log("=== IG + WeaponDamageOutputs ===");
    console.log(diff)
    console.log(output[diff]);
  }

  return output;
}

export function getAttackRatingValues(runeWord) {
  console.log("=== getAttackRatingValues ===");
  if (!runeWord?.stats) {
    console.log("No stats found in runeWord");
    return {
      All: { Additive: {min:0,max:0,avg:0}, Percent: {min:0,max:0,avg:0} },
      Demon: { Additive: {min:0,max:0,avg:0}, Percent: {min:0,max:0,avg:0} },
      Undead: { Additive: {min:0,max:0,avg:0}, Percent: {min:0,max:0,avg:0} }
    };
  }

  // template for easy zero fallback
  function empty() {
    return { min: 0, max: 0, avg: 0 };
  }

  const result = {
    All: {
      Additive: empty(),
      Percent: empty()
    },
    Demon: {
      Additive: empty(),
      Percent: empty()
    },
    Undead: {
      Additive: empty(),
      Percent: empty()
    }
  };

  // scan all stats
  for (const stat of runeWord.stats) {
    if (stat.type !== "AttackRating") continue;

    const target = stat.target || "All";      // All, Demon, Undead
    const subtype = stat.subtype || "Additive"; // Additive or Percent

    // Safety: only handle known targets
    if (!result[target]) continue;

    result[target][subtype] = {
      min: stat.min ?? 0,
      max: stat.max ?? 0,
      avg: stat.avg ?? 0
    };
    console.log(`Processed AR stat - Target: ${target}, Subtype: ${subtype}`, result[target][subtype]);
  }
  console.log("Final Attack Rating Values:", result);
  return result;
}

function buildAttackRatingTable(baseAR, weaponAR) {
  console.log("=== buildAttackRatingTable ===");
  console.log("Base AR:", baseAR);
  console.log("Weapon AR:", weaponAR);

  const difficulties = ["Normal", "Nightmare", "Hell"];
  const targets = ["All", "Demon", "Undead"];
  const modes = ["Additive", "Percent"];

  const results = {};

  for (const diff of difficulties) {
    results[diff] = {};

    for (const target of targets) {
      results[diff][target] = {};

      for (const mode of modes) {
        const mod = weaponAR[target]?.[mode];
        if (!mod) continue;

        if (mode === "Additive") {
          // Correct → Additive directly modifies the base AR
          results[diff][target][mode] = {
            min: baseAR[diff] + mod.min,
            max: baseAR[diff] + mod.max,
            avg: baseAR[diff] + mod.avg
          };
        } else {
          // Percent AR → stored AS percent, do not merge into base
          results[diff][target][mode] = {
            min: mod.min,
            max: mod.max,
            avg: mod.avg
          };
          console.log(`AR Table - Diff: ${diff}, Target: ${target}, Mode: ${mode}`, results[diff][target][mode]);
        }
      }
    }
  }
  console.log("Final Attack Rating Table:", results);
  return results;
}

/**
 * Compare all relevant damage auras between a rune word and active party auras.
 * Returns effective min/max/avg levels for each aura.
 * For Fanaticism, also returns the source (user or ally) so we can apply full/half effect.
 *
 * @param {Object} runeWord - Parsed rune word object
 * @param {Object} damageAuraMap - Active party auras (e.g., { Fanaticism: 8, Might: 12 })
 * @param {Array<string>} auraNames - List of aura names to check
 * @param {boolean} isUser - Whether the summon counts as the user (true) or ally (false)
 * @returns {Object} - { Fanaticism: { min: [level, source], ... }, Might: { min: level, ... }, ... }
 */
function getEffectiveAuraLevelsAll(runeWord, damageAuraMap, auraNames, isUser = true) {
  const result = {};

  for (const auraName of auraNames) {
    let runeWordAura = { min: 0, max: 0, avg: 0 };

    if (runeWord.stats) {
      for (const stat of runeWord.stats) {
        if (stat.type === "Aura" && stat.aura === auraName) {
          runeWordAura.min = stat.levelMin;
          runeWordAura.max = stat.levelMax;
          runeWordAura.avg = stat.levelAvg;
          break;
        }
      }
    }

    const partyLevel = damageAuraMap[auraName] || 0;

    if (auraName === "Fanaticism") {
      // Determine which source wins for each scenario
      const minLevel = Math.max(runeWordAura.min, partyLevel);
      const maxLevel = Math.max(runeWordAura.max, partyLevel);
      const avgLevel = Math.max(runeWordAura.avg, partyLevel);

      // If the runeword level is higher, treat as user; otherwise ally
      const minSource = runeWordAura.min >= partyLevel ? "user" : "ally";
      const maxSource = runeWordAura.max >= partyLevel ? "user" : "ally";
      const avgSource = runeWordAura.avg >= partyLevel ? "user" : "ally";

      result[auraName] = {
        min: [minLevel, minSource],
        max: [maxLevel, maxSource],
        avg: [avgLevel, avgSource],
      };
    } else {
      // Other auras just return level (source irrelevant)
      result[auraName] = {
        min: partyLevel,
        max: partyLevel,
        avg: partyLevel,
      };
    }
  }

  console.log("============== [Aura Comparisons with Source] ==================");
  console.log(result);
  return result;
}

function calculateWeaponDamageAndARWithEnemyED(runeWord, damageAuraMap, boostsMap, skillLvl, attackRatingTable) {
  const auraNames = ["Fanaticism", "Might", "Concentration"];
  const effectiveAuras = getEffectiveAuraLevelsAll(runeWord, damageAuraMap, auraNames);

  // AR % rolls from runeword (no %AR to demons/undead)
  const ar = attackRatingTable?.Normal?.All?.Percent || { min: 0, max: 0, avg: 0 };
  const arVals = { worst: ar.min, avg: ar.avg, best: ar.max };

  console.log("============== [Attack Rating Percents] ==================");
  console.log(arVals);

  const percentDamageSkills = 6 * (boostsMap["FireGolem"] || 0);

  const undeadED = getStatValues(runeWord, "EnhancedDamage", "Undead");
  const demonED  = getStatValues(runeWord, "EnhancedDamage", "Demons");

  const scenarioTypes = ["worst", "avg", "best"];
  const scenarioMap = { worst: "min", avg: "avg", best: "max" };
  const multipliers = { normal: {}, undead: {}, demon: {} };

  for (const type of scenarioTypes) {
    const key = scenarioMap[type];

    const m = effectiveAuras["Might"][key] ?? 0;
    const c = effectiveAuras["Concentration"][key] ?? 0;

    // For Fanaticism, unpack the tuple [level, source]
    const fTuple = effectiveAuras["Fanaticism"][key] ?? [0, "user"];
    const fLevel = fTuple[0];
    const fSource = fTuple[1];

    const w = damageAuraMap["Wolverine"] ?? 0;
    const arBonus = arVals[type] ?? 0;

    console.log(`--- Scenario: ${type} ---`);
    console.log({ m, c, fLevel, fSource, w, arBonus });

    // Pass source info to totalAuraArAndDamageCalculation
    const base = totalAuraArAndDamageCalculation(
      m,
      c,
      fLevel,
      w,
      [percentDamageSkills, arBonus],
      fSource === "ally" // fanaticismAlly = true if source is ally
    );

    multipliers.normal[`${type}Case`] = [...base];
    multipliers.undead[`${type}Case`] = [
      base[0] + (undeadED[key] ?? 0) / 100,
      base[1]
    ];
    multipliers.demon[`${type}Case`] = [
      base[0] + (demonED[key] ?? 0) / 100,
      base[1]
    ];
  }

  console.log("============== [All Multipliers] ==================");
  console.log("Normal:", multipliers.normal);
  console.log("Undead:", multipliers.undead);
  console.log("Demon:", multipliers.demon);

  return multipliers;
}

function mergeFinalDamageAndAR(weaponBaseDamage, auraResults, attackRatingTable) {
  const scenarios = ["worstCase", "avgCase", "bestCase"];
  const enemies = ["normal", "undead", "demon"];
  const difficulties = ["Normal", "Nightmare", "Hell"];

  const final = {};

  // Helper: pick additive AR value for (difficulty, target, scenario)
  function getAdditiveARValue(diff, target, scenario) {
    const targetObj = attackRatingTable?.[diff]?.[target];
    const allObj    = attackRatingTable?.[diff]?.All;

    const additive = targetObj?.Additive ?? allObj?.Additive;
    if (!additive) return 0;

    if (scenario === "worstCase") return additive.min;
    if (scenario === "bestCase")  return additive.max;
    return additive.avg;
  }

  for (const enemy of enemies) {
    final[enemy] = {};

    for (const diff of difficulties) {
      final[enemy][diff] = {};

      for (const scenario of scenarios) {

        // -------------------------------
        // Get aura multipliers (same for all difficulties)
        // -------------------------------
        const [dmgMult, arMult] = auraResults[enemy][scenario];

        // -------------------------------
        // Get the correct base damage for this difficulty + scenario
        // -------------------------------
        const [baseMin, baseMax, baseAvg] =
          weaponBaseDamage[diff][scenario];

        // Final damage after multiplier
        const finalMin = Math.floor(baseMin * dmgMult);
        const finalMax = Math.floor(baseMax * dmgMult);
        const finalAvg = Math.round(((finalMin + finalMax) / 2) * 100) / 100;

        // -------------------------------
        // Final AR for this difficulty
        // -------------------------------
        const arTarget =
          enemy === "normal" ? "All" :
          enemy === "undead" ? "Undead" :
          "Demon";

        const additiveAR = getAdditiveARValue(diff, arTarget, scenario);

        const finalAR = Math.floor(additiveAR * arMult);

        final[enemy][diff][scenario] = {
          damage: [finalMin, finalMax, finalAvg],
          attackRating: finalAR
        };
      }
    }
  }

  return final;
}

/**
 * Format an array of notes for modal display
 * @param {string[]} notes - Array of strings for notes
 * @returns {[Object, Object]} [data, keyMap] in modal-compatible format
 */
function formatNotesForModal(notes) {
  const data = {};
  const keyMap = {};

  notes.forEach((note, idx) => {
    const key = `Assumption ${idx + 1}`;
    data[key] = note;
    keyMap[key] = key;
  });

  return [data, keyMap];
}

/**
 * Merge multiple data/keyMap pairs into one
 * @param  {...any} sections - Each section is [data, keyMap]
 * @returns {[Object, Object]} merged [data, keyMap]
 */
function mergeModalSections(...sections) {
  const mergedData = {};
  const mergedKeyMap = {};

  sections.forEach(([data, keyMap]) => {
    Object.assign(mergedData, data);
    Object.assign(mergedKeyMap, keyMap);
  });

  return [mergedData, mergedKeyMap];
}

function formatHellDamageForModal(final) {
  const damageHeaderKey = "__damageHeader";
  const damageKeyMapLabel = `<span style="color:#FFFF00;"><u><strong>DAMAGE & ATTACK RATING</strong></u></span>`;
  const enemies = ["normal", "undead", "demon"];
  const scenarios = ["worstCase", "avgCase", "bestCase"];

  const data = {};
  const keyMap = {};

  // Add header for modal
  data[damageHeaderKey] = "";                  // placeholder value
  keyMap[damageKeyMapLabel] = damageHeaderKey; // display label -> header key

  // Color mapping for D2R-style
  const colorMap = {
    worstCase: "#FFFF66",   // light yellow
    avgCase: "#66CCFF",     // lighter blue
    bestCase: "#FFDD55"     // greenish gold
  };

  const normalHellData = final["normal"]["Hell"];

  for (const enemy of enemies) {
    let html = ``;
    const hellData = final[enemy]["Hell"];
    let anyShown = false; // flag to know if we show at least one scenario

    for (const scenario of scenarios) {
      const [min, max, avg] = hellData[scenario].damage;
      const [normMin, normMax, normAvg] = normalHellData[scenario].damage;

      // Always show for "normal", otherwise only if different
      if (enemy !== "normal" && min === normMin && max === normMax && avg === normAvg) {
        continue; // skip this scenario
      }

      anyShown = true;
      const label = scenario === "worstCase" ? "Worst" :
                    scenario === "avgCase"   ? "Average" :
                    "Best";
      const color = colorMap[scenario];

      html += `${label}: <span style="color:${color}; font-weight:bold">${min}</span> - <span style="color:${color}; font-weight:bold">${max}</span> (<span style="color:${color}; font-weight:bold">${avg}</span>)<br/>`;
    }

    // Only add to data if at least one scenario was shown
    if (anyShown) {
      html += "<br/>";
      // Override label for "normal"
      const key =
        enemy === "normal"
          ? "Damage"
          : `${enemy.charAt(0).toUpperCase() + enemy.slice(1)} Damage`;

      data[key] = html;
      keyMap[key] = key;
    }
  }

  return [data, keyMap];
}

export async function calculateIronGolem(monStatsMap, skillLvl, gmSkillLvl, summonResistLvl, weaponBase, runeWord, isEthereal,
   boostsMap, damageAuraMap, lifeAuraMap, defAuraMap) {
    console.log(isEthereal);
  
  if (!monStatsMap) {
      monStatsMap = await loadMonStats();
    }

  const monStat = monStatsMap.get(skillLvl);
  if (!monStat) {
    console.warn(`No MonStats entry found for level ${skillLvl}`);
    return null;
  }

  // Weapon Stats, considered equipped by Iron Golem and includes iron golem damage:
  const weaponPhysicalDamages = weaponPhysicalDamageCalc(weaponBase, runeWord, isEthereal, true);
  const weaponAttackRating = getAttackRatingValues(runeWord);

  // ===============[DEFENSE & RESISTANCE]===================
  var baseResistances = getIronGolemResistance(runeWord);
  var resistances = resistanceCalculation(baseResistances, summonResistLvl);
  const defenseHeaderKey = "__defenseHeader";

  const defenseData = {
    [defenseHeaderKey]: "",
    totalFireResist: resistances["Fire"],
    totalLightningResist: resistances["Lightning"],
    totalColdResist: resistances["Cold"],
    totalPoisonResist: resistances["Poison"],
    totalMagicResist: resistances["Magic"],
    totalPhysicalResist: resistances["Physical"],
  };

  const defenseKeyMapLabel = `<span style="color:#FFFF00;"><u><strong>RESISTANCES & DEFENSE</strong></u></span>`;

  const defenseKeyMap = {
    [defenseKeyMapLabel]: defenseHeaderKey,
    "<span class='fire'>Fire Resist</span>": "totalFireResist",
    "<span class='cold'>Cold Resist</span>": "totalColdResist",
    "<span class='lightning'>Lightning Resist</span>": "totalLightningResist",
    "<span class='poison'>Poison Resist</span>": "totalPoisonResist",
    "<span class='magic'>Magic Resist</span>": "totalMagicResist",
    "<span class='physical'>Physical Resist</span>": "totalPhysicalResist",
  };

  // Combine into an array like your other display functions
  const defenseArray = [defenseData, defenseKeyMap];


  // ===============[ATTACK RATING & DAMAGE]===================

  const baseAR = {
    Normal:    (80 + monStat.Normal)    + (gmSkillLvl * 25) + (boostsMap["ClayGolem"] * 20),
    Nightmare: (138 + monStat.Nightmare)+ (gmSkillLvl * 25) + (boostsMap["ClayGolem"] * 20),
    Hell:      (197 + monStat.Hell)     + (gmSkillLvl * 25) + (boostsMap["ClayGolem"] * 20)
  };

  // Combines the Iron golem's attack rating with any attack rating added from the weapon, organized
  // by All, Undead, and Demon values. 
  const attackRatingTable = buildAttackRatingTable(baseAR, weaponAttackRating);

  // Percent Damage increases with skill increase and points in Fire Golem. This is additive with 
  // the damage Auras as well as undead/demon bonuses:
  const result = calculateWeaponDamageAndARWithEnemyED(runeWord, damageAuraMap, boostsMap, skillLvl, attackRatingTable);

  const finalMerged = mergeFinalDamageAndAR(
    weaponPhysicalDamages,
    result,
    attackRatingTable
  );

  const damageSection = formatHellDamageForModal(finalMerged);
  const notesSection = formatNotesForModal([
    "[<strong>Base Weapon Damage</strong> x <strong>Weapon Modifers</strong>] x [<strong>Aura Damage Multipliers</strong> + <strong>Fire Golem Boost</strong>]",
    "I treat <strong>Iron Golem's Added Base Damage</strong> like other sources of Added Damage. <strong>It doesn't get added to 2 Handed Weapon bases</strong>",
    "I add <strong>Undead</strong> & <strong>Demon Enhanced Damage</strong> with the Aura/Fire Golem Boost Enhanced Damage Multipliers"
  ]);

  

  // Merge sections into one final object
  const runeWordDisplay = getIronGolemDisplay(runeWord);
  const [finalData, finalKeyMap] = mergeModalSections(damageSection, defenseArray, runeWordDisplay);

// ✅ Return in the same format as your other functions

  return { data: finalData, keyMap: finalKeyMap };
}