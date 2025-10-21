import { ModalManager } from './modalManager.js';
import { renderTable, renderList, createUpdateView } from './itemTableManager.js';
import { loadCraftingRecipes, loadWeaponStats } from './assetLoader.js';

const modalManager = new ModalManager(
  document.getElementById('weaponModal'),
  document.getElementById('weaponDetails'),
  document.querySelector('.close-button')
);

const keyMap = {
  'Name': 'Name',
  'Tier': 'Tier',
  'QLvl': 'QualityLevel',
  'Min DMG (Eth)': 'MinDamage',
  'Max DMG (Eth)': 'MaxDamage',
  'Avg DMG (Eth)': 'AverageDamage',
  'Speed': 'BaseSpeed',
  'Sockets': 'MaxSockets',
  'Range': 'Range',
  'Str (Eth)': 'StrengthReq',
  'Dex (Eth)': 'DexterityReq',
  'Lvl': 'LevelReq'
};
const weaponCategories = await loadWeaponStats();

// Populate category dropdown
for (const category of weaponCategories.keys()) {
  const option = document.createElement('option');
  option.value = category;
  option.textContent = category;
  categorySelect.appendChild(option);
}

const updateView = createUpdateView({
  categorySelect: document.getElementById('categorySelect'),
  filterInput: document.getElementById('weaponFilter'),
  tableContainer: document.getElementById('weaponTableContainer'),
  mobileContainer: document.getElementById('mobileWeaponContainer'),
  dataMap: weaponCategories,
  keyMap,
  modalManager
});

updateView()