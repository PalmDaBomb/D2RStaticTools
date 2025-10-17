import { loadWeaponStats } from './assetLoader.js';

document.addEventListener('DOMContentLoaded', async () => {
  const categorySelect = document.getElementById('categorySelect');
  const weaponFilter = document.getElementById('weaponFilter');
  const tableContainer = document.getElementById('weaponTableContainer');
  const mobileContainer = document.getElementById('mobileWeaponContainer');
  const modal = document.getElementById('weaponModal');
  const modalContent = document.getElementById('weaponDetails');
  const closeButton = document.querySelector('.close-button');

  // Shared key map (used by desktop headers + mobile modal)
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

  // Reverse map for mobile (dataKey → displayName)
  const reverseKeyMap = Object.fromEntries(
    Object.entries(keyMap).map(([displayName, dataKey]) => [dataKey, displayName])
  );

  // Load weapon data
  const weaponCategories = await loadWeaponStats();
  console.log('[weaponStats.js] Loaded weaponCategories:', weaponCategories);

  // Populate category dropdown
  for (const category of weaponCategories.keys()) {
    const option = document.createElement('option');
    option.value = category;
    option.textContent = category;
    categorySelect.appendChild(option);
  }

  // Event listeners
  categorySelect.addEventListener('change', updateView);
  weaponFilter.addEventListener('input', updateView);
  closeButton.addEventListener('click', () => {
    modal.style.display = 'none';
  });
  window.addEventListener('click', (e) => {
    if (e.target === modal) modal.style.display = 'none';
  });

  // Initial render
  updateView();

  function updateView() {
    const selectedCategory = categorySelect.value;
    const filter = weaponFilter.value.trim().toLowerCase();

    if (!selectedCategory) return;

    // Detect mobile and switch display styles:
    if (window.innerWidth <= 768) {
      tableContainer.style.display = 'none';
      mobileContainer.style.display = 'block';
      renderMobile(selectedCategory, filter);
    } else {
      tableContainer.style.display = 'block';
      mobileContainer.style.display = 'none';
      renderDesktop(selectedCategory, filter);
    }
  }

  // --- Desktop Table Rendering ---
  function renderDesktop(category, filter) {
    tableContainer.innerHTML = '';
    const innerMap = weaponCategories.get(category);
    if (!innerMap) return;

    const table = document.createElement('table');
    table.classList.add('weapon-table');

    // Header row
    const headerRow = document.createElement('tr');
    const headers = Object.keys(keyMap);
    headers.forEach(h => {
      const th = document.createElement('th');
      th.textContent = h;
      headerRow.appendChild(th);
    });
    table.appendChild(headerRow);

    // Rows
    let rowIndex = 0;
    for (const [name, data] of innerMap.entries()) {
      if (filter && !name.toLowerCase().includes(filter)) continue;
      const row = document.createElement('tr');
      row.classList.add(rowIndex % 2 === 0 ? 'even-row' : 'odd-row');
      headers.forEach(header => {
        const dataKey = keyMap[header];
        const td = document.createElement('td');
        td.textContent = data[dataKey] ?? '';
        row.appendChild(td);
      });
      table.appendChild(row);
      rowIndex++;
    }

    tableContainer.appendChild(table);
  }

  // --- Mobile List Rendering ---
  function renderMobile(category, filter) {
    mobileContainer.innerHTML = '';
    const innerMap = weaponCategories.get(category);
    if (!innerMap) return;

    innerMap.forEach((data, name) => {
      if (filter && !name.toLowerCase().includes(filter)) return;
      const weaponItem = document.createElement('div');
      weaponItem.className = 'mobile-weapon-item';
      weaponItem.textContent = name;
      weaponItem.addEventListener('click', () => showModal(data));
      mobileContainer.appendChild(weaponItem);
    });
  }

  // --- Modal Rendering (Mobile) ---
    function showModal(data) {
        modalContent.innerHTML = '';
        for (const [dataKey, value] of Object.entries(data)) {
          const displayName = reverseKeyMap[dataKey] || dataKey;

          const row = document.createElement('div');
          row.classList.add('weapon-modal-row');

          const label = document.createElement('span');
          label.classList.add('weapon-modal-label');
          label.textContent = `${displayName}:`;

          const val = document.createElement('span');
          val.classList.add('weapon-modal-value');
          val.textContent = value;

          row.appendChild(label);
          row.appendChild(val);
          modalContent.appendChild(row);
        }
        modal.style.display = 'block';
    }

  // --- Update view on resize ---
    window.addEventListener('resize', updateView);
});