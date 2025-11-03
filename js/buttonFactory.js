/**
 * Creates a button element
 * @param {string} text - button label
 * @param {string} href - optional link
 * @param {string} effect - "fast", "slow", or "" (none)
 * @param {string} className - button style class
 */
export function createFlameButton(
    text,
    href = "#",
    effect = "",
    className = "StandardBTN",
) {
    const btn = document.createElement('a');
    btn.classList.add(className);
    if (effect) btn.classList.add(`flame-hover-${effect}`);
    btn.textContent = text;
    btn.href = href;

    return btn;
}

/**
 * Measures the widest text width (in pixels) for a list of strings.
 * @param {string[]} textList - Array of button labels
 * @param {string} font - CSS font string (should match button style)
 * @returns {number} The widest measured width
 */
export function getMaxTextWidth(textList, font = '16px Exocet, serif') {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    ctx.font = font;
    return Math.ceil(
        textList.reduce((max, text) => Math.max(max, ctx.measureText(text).width), 0)
    );
}

/**
 * Creates a uniform set of buttons inside a container.
 * Automatically sorts alphabetically and normalizes widths.
 * 
 * @param {string} containerSelector - Query selector for the container
 * @param {Object[]} buttonsData - Array of button configs
 * @param {string} buttonsData[].text - Button label
 * @param {string} buttonsData[].href - Button href
 * @param {string} buttonsData[].effect - Flame speed ("fast", "slow", etc.)
 * @param {string} buttonsData[].className - CSS class for styling
 * @param {string} [font] - Optional font for measuring text width
 */
export function createButtonSet(containerSelector, buttonsData, font = '16px Exocet, serif') {
    const container = document.querySelector(containerSelector);
    if (!container) return;

    // Sort alphabetically
    buttonsData.sort((a, b) => a.text.localeCompare(b.text, undefined, { sensitivity: 'base' }));

    // Get the widest button width
    const maxWidth = getMaxTextWidth(buttonsData.map(b => b.text), font);

    // Create and append all buttons
    buttonsData.forEach(btnData => {
        const btn = createFlameButton(btnData.text, btnData.href, btnData.effect, btnData.className);
        btn.style.minWidth = `${maxWidth + 40}px`; // Padding buffer
        container.appendChild(btn);
    });
}