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