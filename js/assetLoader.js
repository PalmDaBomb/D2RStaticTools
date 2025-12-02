/**
 * Loads RuneInfo.txt and returns an array of rune objects
 * @returns {Promise<Array>}
 */
export async function loadRunes() {
    const response = await fetch('../assets/Runes/RuneInfo.txt');
    const text = await response.text();
    const lines = text.split('\n');

    const runes = lines
        .filter(line => line.trim() && !line.startsWith('RuneNumber')) // skip empty and header
        .map(line => {
            const parts = line.split('|').map(p => p.trim());
            const number = parseInt(parts[0], 10);
            const name = parts[1];
            return {
                number,
                name,
                display: `${name} (#${number})`,
                creation: parts[2],
                combinesInto: parts[3],
                weaponEffect: parts[4],
                armorEffect: parts[5],
                shieldEffect: parts[6],
                dropChance: parseFloat(parts[7]),
                expectedDrop: parseFloat(parts[8])
            };
        });
    return runes;
}

export async function loadWeaponStats() {
    const weaponsRoot = '../assets/WeaponStats';
    const weaponCategories = new Map();

    // List of category files
    const files = [
      'Axes.txt',
      '2HAxes.txt',
      'Polearms.txt',
      'Swords.txt',
      '2HSwords.txt',
      'Maces.txt',
      'Hammers.txt',
      '2HHammers.txt',
      '2HSpears.txt',
      'Bows.txt',
    ];

  for (const file of files) {
      const categoryName = file.replace('.txt', '');
      const response = await fetch(`${weaponsRoot}/${file}`);
      const text = await response.text();

      const lines = text.split('\n').map(line => line.trim()).filter(line => line);
      const innerMap = new Map();

      // Determine if this category supports ethereal
      const isEtherealCapable = !categoryName.toLowerCase().includes('bow');

      // Skip header line
      for (let i = 1; i < lines.length; i++) {
        const parts = lines[i].split('|').map(p => p.trim());
        if (parts.length < 2) continue;

        const minDmg = parseFloat(parts[3]);
        const maxDmg = parseFloat(parts[4]);
        const avgDmg = ((minDmg + maxDmg) / 2).toFixed(2);

        let minDmgEth, maxDmgEth, avgDmgEth;
        let strEth, dexEth;

        if (isEtherealCapable) {
          minDmgEth = Math.floor(minDmg * 1.5);
          maxDmgEth = Math.floor(maxDmg * 1.5);
          avgDmgEth = (avgDmg * 1.5).toFixed(2);

          const str = parseInt(parts[8], 10);
          const dex = parseInt(parts[9], 10);
          strEth = Math.max(str - 10, 0);
          dexEth = Math.max(dex - 10, 0);
        } else {
          minDmgEth = maxDmgEth = avgDmgEth = 'N/A';
          strEth = dexEth = 'N/A';
        }

        const weaponData = {
          Name: parts[0],
          Tier: parts[1],
          QualityLevel: parts[2],
          MinDamage: `${minDmg} (${minDmgEth})`,
          MaxDamage: `${maxDmg} (${maxDmgEth})`,
          AverageDamage: `${avgDmg} (${avgDmgEth})`,
          BaseSpeed: parts[5],
          MaxSockets: parts[6],
          Range: parts[7],
          StrengthReq: `${parts[8]} (${strEth})`,
          DexterityReq: `${parts[9]} (${dexEth})`,
          LevelReq: parts[10],
        };

        innerMap.set(parts[0], weaponData);
      }

      weaponCategories.set(categoryName, innerMap);
    }

    return weaponCategories;
}

export async function loadArmorStats() {
  const armorsRoot = '../assets/ArmorStats';
  const armorCategories = new Map();

  // List of category files
  const files = [
    'BodyArmors.txt',
    'Boots.txt',
    'Necro Shields.txt',
    'Paladin Shields.txt',
    'Shields.txt',
    'Gloves.txt',
    'BarbarianHelms.txt',
    'Belts.txt',
    'Circlets.txt',
    'DruidHelms.txt',
    'Helms.txt'
  ];

  for (const file of files) {
    const categoryName = file.replace('.txt', '');
    const response = await fetch(`${armorsRoot}/${file}`);
    const text = await response.text();

    const lines = text.split('\n').map(line => line.trim()).filter(line => line);
    if (lines.length < 2) continue;

    const innerMap = new Map();
    const headers = lines[0].split('|').map(h => h.trim());
    const isEtherealCapable = !categoryName.toLowerCase().includes('bow');

    // Parse each armor line
    for (let i = 1; i < lines.length; i++) {
      const parts = lines[i].split('|').map(p => p.trim());
      if (parts.length !== headers.length) continue;

      const armorData = {};

      // Build base object from headers
      for (let j = 0; j < headers.length; j++) {
        armorData[headers[j]] = parts[j];
      }

      // --- Defense calculations ---
      const minDef = parseFloat(armorData['MinDef']) || 0;
      const maxDef = parseFloat(armorData['MaxDef']) || 0;
      const avgDef = ((minDef + maxDef) / 2).toFixed(2);

      let minDefEth = 'N/A', maxDefEth = 'N/A', avgDefEth = 'N/A';
      let strEth = 'N/A';

      if (isEtherealCapable && minDef && maxDef) {
        minDefEth = Math.floor(minDef * 1.5);
        maxDefEth = Math.floor(maxDef * 1.5);
        avgDefEth = (avgDef * 1.5).toFixed(2);

        const str = parseInt(armorData['StrengthReq'], 10);
        if (!isNaN(str)) {
          strEth = Math.max(str - 10, 0);
        }
      }

      // --- Damage calculations (for boots, etc.) ---
      const minDmg = parseFloat(armorData['MinDmg']) || 0;
      const maxDmg = parseFloat(armorData['MaxDmg']) || 0;

      if (minDmg && maxDmg) {
        const avgDmg = ((minDmg + maxDmg) / 2).toFixed(2);
        armorData['AvgDmg'] = `${avgDmg}`;
      }

      // Apply final display-friendly values
      armorData['Min DEF (Eth)'] = `${minDef} (${minDefEth})`;
      armorData['Max DEF (Eth)'] = `${maxDef} (${maxDefEth})`;
      armorData['Avg DEF (Eth)'] = `${avgDef} (${avgDefEth})`;

      if (armorData['StrengthReq'])
        armorData['Str (Eth)'] = `${armorData['StrengthReq']} (${strEth})`;

      // Add to innerMap
      innerMap.set(armorData['Name'], armorData);
    }

    armorCategories.set(categoryName, innerMap);
  }

  return armorCategories;
}

export async function loadCraftingRecipes() {
  const craftingRoot = '../assets/Crafting';
  const craftingCategories = new Map();

  const files = [
    'BloodRecipes.txt',
    'CasterRecipes.txt',
    'SafetyRecipes.txt'
  ];

  for (const file of files) {
    const categoryName = file.replace('.txt', '');
    const response = await fetch(`${craftingRoot}/${file}`);
    const text = await response.text();

    const entries = text.split(/\n\s*\n/);
    const innerMap = new Map();

    for (const entry of entries) {
      const lines = entry.trim().split('\n');
      if (lines.length === 0) continue;

      let name = '';
      const ingredients = [];
      const presetMods = new Map();
      const maxPossible = new Map();

      for (const line of lines) {
        if (line.startsWith('Name:')) {
          name = line.split(':')[1].trim();
        } 
        else if (line.startsWith('Ingredients:')) {
          ingredients.push(...line.split(':')[1].split('|').map(v => v.trim()));
        } 
        else if (line.startsWith('PresetMod:')) {
          const [, key, value] = line.match(/PresetMod:\s*(.*?)\s*\|\s*(.*)/) || [];
          if (key && value) presetMods.set(key.trim(), value.trim());
        } 
        else if (line.startsWith('MaxPossible:')) {
          const [, key, value] = line.match(/MaxPossible:\s*(.*?)\s*\|\s*(.*)/) || [];
          if (key && value) maxPossible.set(key.trim(), value.trim());
        }
      }

      // Base info
      const recipeData = {
        Name: name,
        Category: categoryName,
        Item: ingredients[0] || '',
        Rune: ingredients[2] || '',
        Misc: `${ingredients[1] || ''} + ${ingredients[3] || ''}`,
      };

      // Dynamically merge in preset mod + max values
      for (const [modName, range] of presetMods.entries()) {
        const max = maxPossible.get(modName) || '';
        recipeData[modName] = max ? `${range} (Max ${max})` : range;
      }

      innerMap.set(name, recipeData);
    }

    craftingCategories.set(categoryName, innerMap);
  }

  return craftingCategories;
}

export async function loadAllItemsForDropdown() {
  try {
    const [armorCategories, weaponCategories] = await Promise.all([
      loadArmorStats(),
      loadWeaponStats()
    ]);

    const items = [];

    // Internal Function to get the item name and the quality, and the type/category since I'll probs need
    // them later:
    function extractItems(categoryMap, type) {
      if (!categoryMap || !(categoryMap instanceof Map)) return;
      for (const [categoryName, catMap] of categoryMap.entries()) {
        if (!(catMap instanceof Map)) continue;
        for (const [itemName, itemData] of catMap.entries()) {
          items.push({
            name: itemName,
            qLvl: itemData['Q-Lvl'] || itemData['QualityLevel'] || '',
            type,
            category: categoryName || 'Unknown'
          });
        }
      }
    }

    extractItems(armorCategories, 'Armor');
    extractItems(weaponCategories, 'Weapon');
    items.push({
      name: 'Ring',
      qLvl: 1,
      type: 'Jewelry',   // explicitly set
      category: 'Jewelry'
    });
    items.push({
      name: 'Amulet',
      qLvl: 1,
      type: 'Jewelry',   // explicitly set
      category: 'Jewelry'
    });

    // Sort alphabetically by name
    items.sort((a, b) => a.name.localeCompare(b.name));

    return items;
  } catch (error) {
    console.error('Error loading item data for dropdown:', error);
    return [];
  }
}

let cachedMonStats = null;

export async function loadMonStats() {
  if (cachedMonStats) return cachedMonStats;

  const monStatsFile= '../assets/MonStats/MonStats.txt';
  const response = await fetch(monStatsFile);
  const text = await response.text();

  const monStatsMap = new Map();

  const lines = text.trim().split(/\r?\n/);
  // Skip header line if present
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    // Split by tabs or multiple spaces
    const parts = line.split(/\s+/);
    if (parts.length < 4) continue;

    const level = parseInt(parts[0], 10);
    const normal = parseInt(parts[1], 10);
    const nightmare = parseInt(parts[2], 10);
    const hell = parseInt(parts[3], 10);

    monStatsMap.set(level, {
      Normal: normal,
      Nightmare: nightmare,
      Hell: hell
    });
  }

  cachedMonStats = monStatsMap;
  return monStatsMap;
}

/**
 * Loads all weapons from the assets folder into a Map in the browser.
 * Key: weapon name
 * Value: array of stats (with category as last element)
 */
export async function loadIGCompatibleWeapons() {
    const weaponMap = new Map();

    const files = [
        'Axes.txt',
        '2HAxes.txt',
        'Polearms.txt',
        'Swords.txt',
        '2HSwords.txt',
        'Maces.txt',
        'Hammers.txt',
        '2HHammers.txt',
        '2HSpears.txt',
    ];

    // Create all fetch promises up front (parallel)
    const fetchJobs = files.map(file => {
        const category = file.replace('.txt', '');
        const filePath = `../assets/WeaponStats/${file}`;

        return fetch(filePath)
            .then(resp => {
                if (!resp.ok) {
                    console.warn(`Weapon file not found: ${filePath}`);
                    return null;
                }
                return resp.text().then(content => ({ content, category }));
            })
            .catch(err => {
                console.error(`Error loading ${filePath}:`, err);
                return null;
            });
    });

    // Wait for ALL files to finish fetching (parallel)
    const results = await Promise.all(fetchJobs);

    for (const result of results) {
        if (!result) continue;
        const { content, category } = result;

        const lines = content.split(/\r?\n/);

        for (const line of lines) {
            if (!line.trim()) continue;
            const cols = line.split("|").map(c => c.trim());
            if (cols[0] == "Crystal Sword" || cols[0] == "Dimensional Blade" || cols[0] == "Phase Blade"
              || cols[0] == "Club" || cols[0] == "Cudgel" || cols[0] == "Tyrant Club"
            ) continue;
            cols.push(category);
            const weaponName = cols[0];
            weaponMap.set(weaponName, cols);
        }
    }

    const weaponNames = [
        "---",
        ...Array.from(weaponMap.keys()).sort((a, b) => a.localeCompare(b))
    ];

    return { weaponMap, weaponNames };
}

export async function loadRuneWords() {
    const files = [
      '2SocketWeapon.txt',
      '3SocketWeapon.txt'
    ];

    const rootPath = '../assets/Runewords/Weapons/';

    const fetchJobs = files.map(async file => {
      const category = file.replace('.txt', '');
      const filePath = `${rootPath}${file}`;

      try {
        const resp = await fetch(filePath);
        if (!resp.ok) {
          console.warn(`File not found: ${filePath}`);
          return null;
        }

        const content = await resp.text();
        const runewords = parseRuneWords(content);

        return { category, runewords };

      } catch (err) {
        console.error(`Error loading ${filePath}:`, err);
        return null;
      }
    });

    const results = await Promise.all(fetchJobs);

    const runeWordMap = {};
    const filterObject = [];

    for (const r of results) {
      if (!r) continue;
      for (const rw of r.runewords) {
        // Full map for stats & other usage
        runeWordMap[rw.name] = rw;

        // Simplified object for filtering
        filterObject.push({
          name: rw.name,
          allowed: rw.compatibleItems,
          sockets: rw.sockets
        });
      }
    }

    return { runeWordMap, filterObject };
}

function parseRuneWords(rawText) {
  const entries = rawText
    .split(/Entry:/g)
    .map(e => e.trim())
    .filter(e => e.length > 0);

  return entries.map(parseSingleRuneWord);
}

function parseSingleRuneWord(block) {
  const lines = block
    .split('\n')
    .map(l => l.trim())
    .filter(l => l.length > 0);

  const name = lines[0];

  const rw = {
    name,
    image: "",
    runeOrder: [],
    sockets: 0,
    compatibleItems: [],
    stats: [],

    data: {},
    keyMap: {}
  };

  for (const line of lines.slice(1)) {

    if (line.startsWith("ImageURL:")) {
      rw.image = line.replace("ImageURL:", "").trim();
    }

    else if (line.startsWith("RuneOrder:")) {
      rw.runeOrder = line.replace("RuneOrder:", "")
        .trim().split("|").map(x => x.trim());
      
      // Count sockets based on number of runes
      rw.sockets = rw.runeOrder.length;
    }

    else if (line.startsWith("CompatibleItems:")) {
      var tempCompatibleItems = line.replace("CompatibleItems:", "")
        .trim().split("|").map(x => x.trim());
      if (tempCompatibleItems.includes("All Weapons")) {
        rw.compatibleItems = compatibleWeaponLists("All Weapons");
      } else if (tempCompatibleItems.includes("Melee Weapons")) {
        rw.compatibleItems = compatibleWeaponLists("Melee Weapons");
      } else if (tempCompatibleItems.includes("Ranged Weapons")) {
        rw.compatibleItems = compatibleWeaponLists("Ranged Weapons");
      } else {
        rw.compatibleItems = tempCompatibleItems;
      }

    }

    else if (line.startsWith("Stat:")) {
      const parsed = parseStatLine(line.replace("Stat:", "").trim());

      if (parsed) {
        // store the structured stat object
        rw.stats.push(parsed.stat);

        // merge modal data
        Object.assign(rw.data, parsed.data);

        // merge modal keyMap
        Object.assign(rw.keyMap, parsed.keyMap);
      }
    }
  }

  // --- Log modal-ready data/keyMap for this rune word ---
  console.log(`RuneWord: ${rw.name}`);
  console.log("  Data:", rw.data);
  console.log("  KeyMap:", rw.keyMap);
  // --------------------------------------------

  return rw;
}

function parseStatLine(text) {
  for (const parser of STAT_PARSERS) {
    const result = parser(text);
    if (result) return result;
  }
  return parseGenericStat(text);
}

function parseCtc(text) {
  if (!text.startsWith("ChanceToCast")) return null;

  const parts = text.split("|").map(p => p.trim());
  const rawLevel = parts[2].replace("Level:", "").trim(); 
  const { min, max, avg } = parseRangeValue(rawLevel); 

  const stat = {
    type: "ChanceToCast",
    skill: parts[1],
    levelMin: min,
    levelMax: max,
    levelAvg: avg,
    chance: Number(parts[3].replace(/%Chance:?/i, "").trim()),
    trigger: parts[4]
  };

  // Create a variable name for data (like your other constants)
  const dataKey = `${stat.type}${stat.skill}`;
  const dataValue = maxMinDisplay(stat.levelMax, stat.levelMin, stat.levelAvg);

  const data = {
    [dataKey]: ""
  };

  const keyMap = {
    [`${stat.chance}% Chance to Cast a Level ${dataValue} ${stat.skill} (${stat.trigger})`]: dataKey
  };

  return { stat, data, keyMap };
}

function parseAura(text) {
  if (!text.startsWith("Aura")) return null;

  const parts = text.split("|").map(p => p.trim());
  parts[2] = parts[2].replace("Level:", "").trim();
  const { min, max, avg } = parseRangeValue(parts[2]);

  // Structured stat object for calculations
  const stat = {
    type: "Aura",
    aura: parts[1],
    levelMin: min,
    levelMax: max,
    levelAvg: avg
  };

  // Create a variable name for data (like your other constants)
  const dataKey = stat.aura.replace(/\s+/g, ""); // e.g., "Fanaticism"
  const dataValue = maxMinDisplay(stat.levelMax, stat.levelMin, stat.levelAvg);

  const data = {
    [dataKey]: dataValue
  };

  const keyMap = {
    [`${stat.aura} Aura Level`]: dataKey
  };

  return { stat, data, keyMap };
}

function parseSkill(text) {
  if (!text.startsWith("Skill")) return null;

  const parts = text.split("|").map(p => p.trim());
  const { min, max, avg } = parseRangeValue(parts[2]);

  const stat = {
    type: "Skill",
    skill: parts[1],
    levelMin: min,
    levelMax: max,
    levelAvg: avg,
    class: parts[3] || "All"
  };

  const dataKey = stat.skill.replace(/\s+/g, "");
  const dataValue = maxMinDisplay(stat.levelMax, stat.levelMin, stat.levelAvg);

  const data = {
    [dataKey]: dataValue
  };

  const keyMap = {
    [`${stat.skill} (${stat.class})`]: dataKey
  };

  return { stat, data, keyMap };
}

function parseCharges(text) {
  if (!text.startsWith("Charges")) return null;

  const parts = text.split("|").map(p => p.trim());

  const match = parts[1].match(/(.+)\((\d+)\)/);
  const { min, max, avg } = parseRangeValue(match[2]);

  const stat = {
    type: "Charges",
    skill: match[1].trim(),
    levelMin: min,
    levelMax: max,
    levelAvg: avg,
    charges: Number(parts[2])
  };

  const dataKey = stat.skill;
  const dataValue = maxMinDisplay(stat.levelMax, stat.levelMin, stat.levelAvg);

  const data = {
    [dataKey]: dataValue
  };

  const keyMap = {
    [`${stat.skill} (${stat.charges} Charges)`]: dataKey
  };

  return { stat, data, keyMap };
}

function parseAfterEachKill(text) {
  if (!text.startsWith("AfterEachKill")) return null;

  const parts = text.split("|").map(p => p.trim());
  const { min, max, avg } = parseRangeValue(parts[3]);

  const stat = {
    type: "AfterEachKill",
    resource: parts[1],         // "Life"
    target: parts[2],           // "Demon"
    min: min,
    max: max,
    avg: avg    // 15
  };

  const dataKey = `${stat.resource}${stat.target}Kills`
  const dataValue = maxMinDisplay(stat.max, stat.min, stat.avg);

  var target = "";
  if (stat.target == "Demon" || stat.target == "Undead") {
    target = stat.target;
  }

  const data = {
    [dataKey]: dataValue
  };

  const keyMap = {
    [`${stat.resource} After Each ${target} Kill`]: dataKey
  };

  return { stat, data, keyMap };
}

function parseAttackRating(text) {
  if (!text.startsWith("AttackRating")) return null;

  const parts = text.split("|").map(p => p.trim());
  const { min, max, avg } = parseRangeValue(parts[3]);

  const stat = {
    type: "AttackRating",
    target: parts[1],         // "All, Demon, Undead"
    subtype: parts[2],           // "Additive, Percent"
    min: min,
    max: max,
    avg: avg
  };

  const dataKey = ` ${stat.subtype}AttackRating${stat.target}`;
  const dataValue = maxMinDisplay(stat.max, stat.min, stat.avg);

  const data = {
    [dataKey]: dataValue
  };

  const keyMap = {
    [`Attack Rating ${stat.subtype} (${stat.target})`]: dataKey
  };

  return { stat, data, keyMap };
}

function parseGenericStat(text) {
  const parts = text.split("|").map(p => p.trim());

  const stat = { type: parts[0] };

  let min = 0, max = 0, avg = 0; // <-- define here

  if (parts.length >= 2) stat.subtype = parts[1];
  if (parts.length >= 3) {
    stat.value = parts[2];
    ({ min, max, avg } = parseRangeValue(stat.value)); // <-- destructure here
    stat.minPossible = min;
    stat.maxPossible = max;
    stat.avg = avg;
  }

  // Safety bit for weird extra values
  if (parts.length > 3) {
    stat.extra = parts.slice(3);
  }

  // ---- Add modal-compatible data / keyMap ----
  const dataKey = `${stat.type}(${stat.subtype || ""})`;
  const dataValue = maxMinDisplay(min, max, avg);

  const data = {
    [dataKey]: dataValue
  };

  const keyMap = {
    [`${stat.type} (${stat.subtype || ""})`]: dataKey
  };
  // --------------------------------------------

  return { stat, data, keyMap };
}

function parseRangeValue(valueStr) {
  if (!valueStr) return { min: 0, max: 0, avg: 0 };

  let min, max;

  if (valueStr.includes("-")) {
    const [minStr, maxStr] = valueStr.split("-").map(s => s.trim());
    min = Number(minStr);
    max = Number(maxStr);
  } else {
    min = max = Number(valueStr.trim());
  }

  if (isNaN(min)) min = 0;
  if (isNaN(max)) max = 0;

  const avg = Math.floor((min + max) / 2);

  return { min, max, avg };
}

function compatibleWeaponLists(list) {
  const MELEE_WEAPONS = [
    "Swords", "2HSwords",
    "Axes", "2HAxes",
    "Hammers", "2HHammers",
    "Maces",
    "Clubs",
    "Daggers",
    "Claws",
    "Spears", "2HSpears",
    "Wands",
    "Scepters",
    "Polearms"
  ];

  const RANGED_WEAPONS = [
    "Bows",
    "Crossbows"
  ];

  const ALL_WEAPONS = [...MELEE_WEAPONS, ...RANGED_WEAPONS];

    if (list == "All Weapons") {
      return ALL_WEAPONS;
    } else if (list == "Melee Weapons") {
      return MELEE_WEAPONS;
    } else if (list == "Ranged Weapons") {
      return RANGED_WEAPONS;
    } else {
      return "ERROR"
    }
}

function maxMinDisplay(max,min,avg) {
  if (max == min && max == avg) {
    return `${avg}`;
  } else {
    return `${min}-${max} (${avg})`;
  }
}

const STAT_PARSERS = [
  parseCtc,
  parseAura,
  parseSkill,
  parseCharges,
  parseAfterEachKill,
  parseAttackRating
];
