
export function getStatValues(runeWord, type, subtype = null) {
  if (!runeWord || !runeWord.stats) return { min: 0, max: 0, avg: 0 };

  const stat = runeWord.stats.find(s =>
    s.type === type && (subtype === null || s.subtype === subtype)
  );

  if (!stat) return { min: 0, max: 0, avg: 0 };

  // support multiple naming conventions
  const min = stat.minPossible ?? stat.levelMin ?? stat.min ?? 0;
  const max = stat.maxPossible ?? stat.levelMax ?? stat.max ?? 0;
  const avg = stat.avg ?? stat.levelAvg ?? Math.floor((min + max) / 2);

  return { min, max, avg };
}

export function getRuneWordModalData(runeWord) {
  if (!runeWord) return { data: {}, keyMap: {} };
  
  // Just return the existing data and keyMap
  return {
    data: runeWord.data,
    keyMap: runeWord.keyMap
  };
}

export function getIronGolemDisplay(runeWord) {
  if (!runeWord) return { data: {}, keyMap: {} };

  const excludePatterns = ["resist", "enhanced", "life", "defense", "rating", "attribute", "mana"];

  const filteredData = {};
  const filteredKeyMap = {};

  // Add a header for Runeword-specific stats
  const headerKey = "__runewordHeader";
  filteredData[headerKey] = ""; 
  filteredKeyMap[`<span style="color:#FFFF00;"><u><strong>RUNEWORD SPECIFIC STATS</strong></u></span>`] = headerKey;

  for (const [label, key] of Object.entries(runeWord.keyMap)) {
    // Exclude if any pattern matches
    const exclude = excludePatterns.some(p => 
      label.toLowerCase().includes(p.toLowerCase()) || key.toLowerCase().includes(p.toLowerCase())
    );

    if (!exclude) {
      filteredData[key] = runeWord.data[key];
      filteredKeyMap[label] = key;
    }
  }

  return [filteredData, filteredKeyMap];
}