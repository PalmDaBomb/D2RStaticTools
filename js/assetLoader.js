/**
 * Loads RuneInfo.txt and returns an array of rune objects
 * @returns {Promise<Array>}
 */
export async function loadRunes() {
    const response = await fetch('/assets/Runes/RuneInfo.txt');
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