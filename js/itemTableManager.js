export function renderTable(container, dataMap, headers, keyMap, filter = '') {
  container.innerHTML = '';
  const table = document.createElement('table');
  table.classList.add('data-table');

  // Step 1: Filter dataset based on search
  const filteredEntries = Array.from(dataMap.entries()).filter(([name]) =>
    !filter || name.toLowerCase().includes(filter)
  );

  if (filteredEntries.length === 0) {
    container.textContent = 'No results found.';
    return;
  }

  // Step 2: Determine which headers have at least one non-empty value
  const activeHeaders = headers.filter(header => {
    const key = keyMap[header];
    return filteredEntries.some(([_, data]) => {
      const val = data[key];
      return val !== undefined && val !== null && val !== '';
    });
  });

  // Step 3: Create header row with only active columns
  const headerRow = document.createElement('tr');
  activeHeaders.forEach(h => {
    const th = document.createElement('th');
    th.textContent = h;
    headerRow.appendChild(th);
  });
  table.appendChild(headerRow);

  // Step 4: Populate rows
  let rowIndex = 0;
  for (const [name, data] of filteredEntries) {
    const row = document.createElement('tr');
    row.classList.add(rowIndex % 2 === 0 ? 'even-row' : 'odd-row');

    activeHeaders.forEach(header => {
      const key = keyMap[header];
      const value = data[key];
      const td = document.createElement('td');
      td.textContent = value ?? ''; // empty string fallback
      row.appendChild(td);
    });

    table.appendChild(row);
    rowIndex++;
  }

  // Step 5: Render
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

  return update;
}