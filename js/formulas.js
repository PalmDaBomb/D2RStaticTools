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

