// ==============================
// expandableSections.js
// Handles all expandable panels site-wide
// ==============================

document.addEventListener('DOMContentLoaded', () => {
  // Expandable sections
  document.querySelectorAll('.expandable-section').forEach(section => {
    const header = section.querySelector('.expandable-header');
    if (!header) return;
    header.addEventListener('click', () => section.classList.toggle('active'));
  });
});