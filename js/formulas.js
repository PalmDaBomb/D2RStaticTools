// ==============================
// formulas.js:
// Pure math functions for iLvl and Affix calculations
// ==============================

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

function fanaticismCalculation(skillLvl) {
  if (!skillLvl) return [0, 0]; // [damage%, AR%]
  const damage = (33 + (17 * skillLvl)) / 2;
  const attackRating = 35 + (5 * skillLvl);
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
export function totalAuraArAndDamageCalculation(mSkillLvl, cSkillLvl, fSkillLvl, wSkillLvl, skillValues) {
  const [fanatDamage, fanatAR] = fanaticismCalculation(fSkillLvl);
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
export async function calculateRaiseSkeleton(monStatsMap, skillLvl, mSkillLvl, summonResistLvl, damageAuraMap, lifeAuraMap, defAuraMap) {
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
  
  //Base Attack Rating:
  const normalAr = 5 + (15 * (skillLvl + mSkillLvl)) + monStat.Normal;
  const nightmareAr = 4 + (15 * (skillLvl + mSkillLvl)) + monStat.Nightmare;
  const hellAr = 6 + (15 * (skillLvl + mSkillLvl)) + monStat.Hell;

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
    percentageLife = 1 + (((50 * skillLvl) - 150)/100);
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
  const note = "Total Damages Include Average Critical Hit Damage Output (~10% Damage Increase)"

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
    note
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
    "Notes" : "note"
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
    lifeModifier = 1 + (((10 * skillLvl) - 21) / 100);
  }

  const otherLifeModifers = totalLifeCalculation(lifeAuraMap["BattleOrders"], lifeAuraMap["OakSage"]);
  const totalNormalLife = Math.floor(normalBaseLife * lifeModifier * otherLifeModifers);
  const totalNightmareLife = Math.floor(nightmareBaseLife * lifeModifier * otherLifeModifers);
  const totalHellLife = Math.floor(hellBaseLife * lifeModifier * otherLifeModifers);

  const displayLife = displayDifficultyValues(totalNormalLife, totalNightmareLife, totalHellLife);

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