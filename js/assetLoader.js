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

  // List of category files (you can manually list them or dynamically fetch if hosted)
  const files = [
    'Axes.txt',
    '2HAxes.txt',
    'Polearms.txt',
    'Swords.txt',
    '2HSwords.txt',
    'Maces.txt',
    '2HMaces.txt',
    '2HSpears.txt',
    'Bows.txt',
  ];

  for (const file of files) {
    const categoryName = file.replace('.txt', '');
    const response = await fetch(`${weaponsRoot}/${file}`);
    const text = await response.text();

    const lines = text.split('\n').map(line => line.trim()).filter(line => line);
    const innerMap = new Map();

    // Skip header line
    for (let i = 1; i < lines.length; i++) {
        const parts = lines[i].split('|').map(p => p.trim());
        if (parts.length < 2) continue;

        const minDmg = parseFloat(parts[3]);
        const maxDmg = parseFloat(parts[4]);
        const avgDmg = ((minDmg + maxDmg) / 2).toFixed(2);

        const minDmgEth = Math.floor(minDmg * 1.5);
        const maxDmgEth = Math.floor(maxDmg * 1.5);
        const avgDmgEth = (avgDmg * 1.5).toFixed(2);

        // Strength and Dexterity ethereal values
        const str = parseInt(parts[8], 10);
        const dex = parseInt(parts[9], 10);
        const strEth = Math.max(str - 10, 0);
        const dexEth = Math.max(dex - 10, 0);

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
            StrengthReq: `${str} (${strEth})`,
            DexterityReq: `${dex} (${dexEth})`,
            LevelReq: parts[10],
      };

        innerMap.set(parts[0], weaponData);
    }

    weaponCategories.set(categoryName, innerMap);
  }

  return weaponCategories;
}