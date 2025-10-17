export function renderTable(container, dataMap, headers, keyMap, filter = '') {
  container.innerHTML = '';
  const table = document.createElement('table');
  table.classList.add('data-table');

  // Header
  const headerRow = document.createElement('tr');
  headers.forEach(h => {
    const th = document.createElement('th');
    th.textContent = h;
    headerRow.appendChild(th);
  });
  table.appendChild(headerRow);

  // Rows
  let rowIndex = 0;
  for (const [name, data] of dataMap.entries()) {
    if (filter && !name.toLowerCase().includes(filter)) continue;
    const row = document.createElement('tr');
    row.classList.add(rowIndex % 2 === 0 ? 'even-row' : 'odd-row');
    headers.forEach(header => {
      const td = document.createElement('td');
      td.textContent = data[keyMap[header]] ?? '';
      row.appendChild(td);
    });
    table.appendChild(row);
    rowIndex++;
  }

  container.appendChild(table);
}

export function renderList(container, dataMap, filter = '', onClick) {
  container.innerHTML = '';
  dataMap.forEach((data, name) => {
    if (filter && !name.toLowerCase().includes(filter)) return;
    const item = document.createElement('div');
    item.className = 'list-item';
    item.textContent = name;
    if (onClick) item.addEventListener('click', () => onClick(data));
    container.appendChild(item);
  });
}

export function createUpdateView({categorySelect, filterInput, tableContainer, mobileContainer, dataMap, keyMap, modalManager}) {
  function update() {
    const category = categorySelect.value;
    const filter = filterInput.value.trim().toLowerCase();
    if (!category) return;
    const innerMap = dataMap.get(category);
    if (!innerMap) return;

    if (window.innerWidth <= 768) {
      tableContainer.style.display = 'none';
      mobileContainer.style.display = 'block';
      renderList(mobileContainer, innerMap, filter, (data) => modalManager.show(data, keyMap));
    } else {
      tableContainer.style.display = 'block';
      mobileContainer.style.display = 'none';
      renderTable(tableContainer, innerMap, Object.keys(keyMap), keyMap, filter);
    }
  }

  window.addEventListener('resize', update);
  categorySelect.addEventListener('change', update);
  filterInput.addEventListener('input', update);

  return update; // returns the function if you want to call it manually
}