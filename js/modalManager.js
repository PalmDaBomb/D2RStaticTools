export class ModalManager {
  constructor(modalElement, contentElement, closeButton) {
    this.modal = modalElement;
    this.content = contentElement;

    if (closeButton) {
      closeButton.addEventListener('click', () => this.hide());
    }

    window.addEventListener('click', (e) => {
      if (e.target === this.modal) this.hide();
    });
  }

  show(data, keyMap) {
    this.content.innerHTML = '';
    const reverseKeyMap = Object.fromEntries(
      Object.entries(keyMap).map(([display, key]) => [key, display])
    );

    for (const [dataKey, value] of Object.entries(data)) {
      const displayName = reverseKeyMap[dataKey] || dataKey;

      const row = document.createElement('div');
      row.classList.add('modal-row');

      const label = document.createElement('span');
      label.classList.add('modal-label');
      label.textContent = `${displayName}:`;

      const val = document.createElement('span');
      val.classList.add('modal-value');
      val.textContent = value;

      row.appendChild(label);
      row.appendChild(val);
      this.content.appendChild(row);
    }

    this.modal.style.display = 'block';
  }

  hide() {
    this.modal.style.display = 'none';
  }
}