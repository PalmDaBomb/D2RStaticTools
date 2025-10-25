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
  'Q-Lvl': 'Q-Lvl',
  'Min DEF (Eth)': 'Min DEF (Eth)',
  'Max DEF (Eth)': 'Max DEF (Eth)',
  'Avg DEF (Eth)': 'Avg DEF (Eth)',
  'Sockets': 'MaxSockets',
  'Str (Eth)': 'Str (Eth)',
  'Lvl': 'LvlReq',
  'Speed Penalty': 'SpeedPenalty',
  'Block Chance': 'BlockChance',
  'Min DMG': 'MinDmg',
  'Max DMG': 'MaxDmg',
  'Avg DMG': 'AvgDmg'
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