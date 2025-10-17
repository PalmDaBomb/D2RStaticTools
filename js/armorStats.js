import { ModalManager } from './modalManager.js';
import { renderTable, renderList, createUpdateView } from './itemTableManager.js';
import { loadArmorStats } from './assetLoader.js';

const modalManager = new ModalManager(
  document.getElementById('armorModal'),
  document.getElementById('armorDetails'),
  document.querySelector('.close-button')
);

const keyMap = {
  'Name': 'Name',
  'Tier': 'Tier',
  'QLvl': 'QualityLevel',
  'Min DMG (Eth)': 'MinDefense',
  'Max DMG (Eth)': 'MaxDefense',
  'Avg DMG (Eth)': 'AverageDefense',
  'Sockets': 'MaxSockets',
  'Str (Eth)': 'StrengthReq',
  'Lvl': 'LevelReq',
  'Speed Penalty' : 'SpeedPenalty'
};
const armorCategories = await loadArmorStats();

// Populate category dropdown
for (const category of armorCategories.keys()) {
  const option = document.createElement('option');
  option.value = category;
  option.textContent = category;
  categorySelect.appendChild(option);
}

const updateView = createUpdateView({
  categorySelect: document.getElementById('categorySelect'),
  filterInput: document.getElementById('armorFilter'),
  tableContainer: document.getElementById('armorTableContainer'),
  mobileContainer: document.getElementById('mobilearmorContainer'),
  dataMap: armorCategories,
  keyMap,
  modalManager
});

updateView()