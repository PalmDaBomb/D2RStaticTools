/// sectionFactory.js

/**
 * Creates an expandable section with a header and a single content container (like a button group div).
 * @param {string} title - The title displayed in the header.
 * @param {string} containerId - The ID for the inner content div (used later by other scripts).
 * @param {string[]} [containerClasses=[]] - Optional extra classes for the inner div.
 * @returns {HTMLElement} The complete expandable section element.
 */
export function createExpandableSection(title, containerId, containerClasses = []) {
    const section = document.createElement('section');
    section.classList.add('expandable-section');

    // Header
    const header = document.createElement('div');
    header.classList.add('expandable-header');

    const icon = document.createElement('span');
    icon.classList.add('expand-icon');
    icon.textContent = '+';

    const titleSpan = document.createElement('span');
    titleSpan.classList.add('expand-title');
    titleSpan.textContent = title;

    header.appendChild(icon);
    header.appendChild(titleSpan);
    section.appendChild(header);

    // Content area
    const contentDiv = document.createElement('div');
    contentDiv.classList.add('expandable-content');

    // Inner container (e.g., button holder)
    const innerContainer = document.createElement('div');
    innerContainer.id = containerId;
    innerContainer.classList.add(...containerClasses);

    contentDiv.appendChild(innerContainer);
    section.appendChild(contentDiv);

    // Click toggle logic
    section.style.cursor = 'pointer';
    section.addEventListener('click', (event) => {
        if (event.target.closest('.expandable-header')) {
            section.classList.toggle('active');
        }
    });

    return section;
}

/**
 * Creates multiple expandable sections, appends them to a container, and ensures uniform sizing.
 * @param {HTMLElement|string} container - The parent element or selector to append sections to.
 * @param {Array<Object>} sections - Array of section definitions:
 *   { title: string, containerId: string, classList?: string[] }
 */
export function createExpandableSectionSet(container, sections, minWidth = 300) {
    const parent =
        typeof container === "string"
            ? document.querySelector(container)
            : container;

    if (!parent) {
        console.error("Container not found for createExpandableSectionSet:", container);
        return;
    }

    const sectionElements = [];
    const tempSpan = document.createElement("span");
    tempSpan.style.visibility = "hidden";
    tempSpan.style.position = "absolute";
    tempSpan.style.whiteSpace = "nowrap";
    document.body.appendChild(tempSpan);

    // First pass: create sections and measure titles
    let maxTitleWidth = 0;
    sections.forEach(({ title, containerId, classList = [] }) => {
        tempSpan.textContent = title;
        const titleWidth = tempSpan.getBoundingClientRect().width;
        if (titleWidth > maxTitleWidth) maxTitleWidth = titleWidth;

        const section = createExpandableSection(title, containerId, classList);
        parent.appendChild(section);
        sectionElements.push(section);
    });

    document.body.removeChild(tempSpan);

    // Apply uniform width, respecting minimum
    const finalWidth = Math.max(maxTitleWidth + 60, minWidth); // add padding/margin
    sectionElements.forEach(section => {
        section.style.width = `${finalWidth}px`;
    });
}