import { ModalManager } from './modalManager.js';
import { renderTable, renderList, createUpdateView } from './itemTableManager.js';
import { loadCraftingRecipes, loadAllItemsForDropdown } from './assetLoader.js';

// This is for the drop down list in the Affix calculator:
document.addEventListener('DOMContentLoaded', async () => {
  const datalist = document.getElementById('itemDropdown');
  const itemInput = document.getElementById('itemSearch');
  const qlvlInput = document.getElementById('itemQLvl');

  if (datalist && itemInput && qlvlInput) {
    try {
      const items = await loadAllItemsForDropdown();

      // Clear previous (if reloaded)
      datalist.innerHTML = '';

      // Create a lookup map for fast q-lvl access later
      const itemMap = new Map();

      // Populate datalist and map
      for (const item of items) {
        const option = document.createElement('option');
        option.value = item.name;
        datalist.appendChild(option);

        // Use your qLvl field name
        itemMap.set(item.name.toLowerCase(), item.qLvl || 0);
      }

      console.log(`✅ Loaded ${items.length} items into dropdown.`);

      // Listen for selection / typing changes
      itemInput.addEventListener('input', () => {
        const selectedName = itemInput.value.toLowerCase();
        if (itemMap.has(selectedName)) {
          const qlvl = itemMap.get(selectedName);
          qlvlInput.value = qlvl;
        } else {
          qlvlInput.value = ''; // clear if invalid
        }
      });

    } catch (err) {
      console.error('Error populating item dropdown:', err);
    }
  }
});

const modalManager = new ModalManager(
  document.getElementById('craftingModal'),
  document.getElementById('craftingDetails'),
  document.querySelector('.close-button')
);

const keyMap = {
  'Name': 'Name',
  'Base Item': 'Item',
  'Rune Used': 'Rune',
  'Misc Components': 'Misc',
  'Life Steal %': 'LifeSteal%',
  'Mana Steal': 'ManaSteal%',
  'Life +': 'Life+',
  'Increased Mana':'Mana+',
  'Enhanced Damage %': 'EnhancedDMG%',
  'Crushing Blow %': 'CrushingBlow%',
  'Deadly Strike %': 'DeadlyStrike%',
  'Open Wounds %': 'OpenWounds%',
  'Faster Walk/Run %': 'FasterWalk/Run%',
  'Increased Strength': 'Strength+',
  'Increased Energy': 'Energy+',
  'Increased Dexterity': 'Dex+',
  'Increased Vitality': 'Vitality+',
  'Life Regen +': 'LifeRegen+',
  'Demon Kill On Heal +': 'DemonKillOnHeal+',
  'Attacker Takes Damage +': 'AttackerTakesDamage+',
  'Faster Cast Rate (%)' : 'FasterCastRate%',
  'Increased Block Chance (%)': 'BlockChanceIncrease%',
  'Mana Regeneration': 'RegenMana%',
  'Increased Maximum Mana' : 'MaxManaIncrease%',
  'Mana Per Kill' : 'ManaPerKill',
  'Damage Reduced By' : 'ReducedDMG',
  'Magic Damage Reduced By' : 'ReducedMagicDMG',
  'Increased Block Chance' : 'IncreasedBlockChance%',
  'Fire Resist' : 'FireResist%',
  'Cold Resist' : 'ColdResist%',
  'Lightning Resist' : 'LightningResist%',
  'Poison Resist' : 'PoisonResist%',
  'Magic Resist' : 'MagicResist%',
  'Enhanced Defence' : 'EnhancedDef%',
  'Half Freeze Duration' : 'HalfFreezeDuration',
};

const craftingCategories = await loadCraftingRecipes();

// Populate category dropdown
for (const category of craftingCategories.keys()) {
  const option = document.createElement('option');
  option.value = category;
  option.textContent = category;
  categorySelect.appendChild(option);
}

const updateView = createUpdateView({
  categorySelect: document.getElementById('categorySelect'),
  filterInput: document.getElementById('craftingFilter'),
  tableContainer: document.getElementById('craftingTableContainer'),
  mobileContainer: document.getElementById('mobileCraftingContainer'),
  dataMap: craftingCategories,
  keyMap,
  modalManager
});

updateView()