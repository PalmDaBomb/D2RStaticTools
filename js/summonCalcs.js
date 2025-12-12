/**
 * Inserts section headers into a {data, keyMap} pair.
 * @param {object} data 
 * @param {object} keyMap 
 * @param {object} sections - Example:
 * {
 *    "Damage & Attack Rating": ["Damage (All Difficulties)", "Attack Rating (Norm/Night/Hell)"],
 *    "Life": ["Life Stolen (%)", "Caster Life Returned (Normal)", ...],
 *    "Defenses": ["Defense (Norm/Night/Hell)", "<span...>Fire Resist</span>", ...],
 *    "Misc": ["Some Other Label"]
 * }
 */
export function injectSectionHeaders(data, keyMap, sections) {

  const newData = {};
  const newKeyMap = {};

  // For each section, add a header + its fields
  for (const [headerLabel, fieldLabels] of Object.entries(sections)) {

    // Make a unique internal key
    const headerKey = "__" + headerLabel.replace(/\s+/g, "_").toLowerCase();

    // Add placeholder section header into data + map
    newData[headerKey] = "";
    newKeyMap[`<span style="color:#FFFF00;"><u><strong>${headerLabel}</strong></u></span>`] = headerKey;

    // Append all fields belonging to this section (in the provided order)
    for (const fieldLabel of fieldLabels) {
      if (fieldLabel in keyMap) {
        const internalKey = keyMap[fieldLabel];
        newData[internalKey] = data[internalKey];
        newKeyMap[fieldLabel] = internalKey;
      }
    }

    // Add spacing between sections
    const spacerKey = headerKey + "_spacer";
    newData[spacerKey] = "<br/>";
    newKeyMap[""] = spacerKey; // Empty display label
  }

  return { data: newData, keyMap: newKeyMap };
}

function calculateRegen(regenValue, totalHealth) {
    const percentPerFrame = regenValue / 4096;
    const percentPerSecond = (regenValue * 25) / 4096;
    const healthPerFrame = percentPerFrame * totalHealth;
    const healthPerSecond = percentPerSecond * totalHealth;

    return {
        percentPerFrame: Number(percentPerFrame.toFixed(2)),
        percentPerSecond: Number(percentPerSecond.toFixed(2)),
        healthPerFrame: Number(healthPerFrame.toFixed(2)),
        healthPerSecond: Number(healthPerSecond.toFixed(2))
    };
}

export function getSummonHealthRegen(summonName, totalHealth) {
    const summonRegenValues = {
        clay: 3,
        claygolem: 3,
        cgolem: 3,

        blood: 3,
        bloodgolem: 3,
        bgolem: 3,

        iron: 3,
        irongolem: 3,
        igolem: 3,

        skeleton: 4,
        raiseskeleton: 4,
        rskeleton: 4,
        skeles: 4,

        mage: 4,
        skelemage: 4,
        necromage: 4

    };

    const key = summonName.toLowerCase();
    const regenValue = summonRegenValues[key] || 0;  // default 0 if unknown

    return calculateRegen(regenValue, totalHealth).healthPerSecond;
}