import { ModalManager } from './modalManager.js';
import { renderTable, renderList, createUpdateView } from './itemTableManager.js';
import { loadCraftingRecipes, loadAllItemsForDropdown } from './assetLoader.js';

const modalManager = new ModalManager(
  document.getElementById('craftingModal'),
  document.getElementById('craftingDetails'),
  document.querySelector('.close-button')
);

const keyMap = {
  'Name': 'Name',
  'Category': 'Category',
  'Base Item': 'Item',
  'Rune Used': 'Rune',
  'Misc Components': 'Misc',
  'Life Steal %': 'LifeSteal%',
  'Life +': 'Life+',
  'Enhanced Damage %': 'EnhancedDMG%',
  'Crushing Blow %': 'CrushingBlow%',
  'Deadly Strike %': 'DeadlyStrike%',
  'Open Wounds %': 'OpenWounds%',
  'Faster Walk/Run %': 'FasterWalk/Run%',
  'Strength +': 'Strength+',
  'Life Regen +': 'LifeRegen+',
  'Demon Kill On Heal +': 'DemonKillOnHeal+',
  'Attacker Takes Damage +': 'AttackerTakesDamage+'
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