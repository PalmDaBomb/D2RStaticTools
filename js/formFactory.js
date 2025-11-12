// ==============================
// formFactory.js
// Dynamically creates labeled input sections
// ==============================

export function createInputSection(containerSelector, sectionConfig) {
    const container = document.querySelector(containerSelector);
    if (!container) return;

    // Create the expandable wrapper
    const section = document.createElement("div");
    section.classList.add("expandable-section");

    const title = document.createElement("h3");
    title.textContent = sectionConfig.title;
    title.classList.add("expandable-title");

    const content = document.createElement("div");
    content.classList.add("expandable-content");
    content.style.display = "none";

    // Toggle expand/collapse
    title.addEventListener("click", () => {
        content.style.display = (content.style.display === "none") ? "block" : "none";
    });

    // Generate labeled input fields
    sectionConfig.inputs.forEach(input => {
        const row = document.createElement("div");
        row.classList.add("input-row");

        const label = document.createElement("label");
        label.textContent = input.label;
        label.setAttribute("for", input.id);

        const field = document.createElement("input");
        field.type = input.type || "number";
        field.id = input.id;
        field.dataset.inputId = input.id;
        field.placeholder = input.placeholder || "";

        row.appendChild(label);
        row.appendChild(field);
        content.appendChild(row);
    });

    // Buttons
    if (sectionConfig.buttons?.length) {
        const buttonContainer = document.createElement("div");
        buttonContainer.classList.add("button-container");

        sectionConfig.buttons.forEach(btnConfig => {
            const btn = document.createElement("button");
            btn.textContent = btnConfig.text;
            btn.className = btnConfig.className || "";

            btn.addEventListener("click", () => {
                // give handler access to this section
                btnConfig.onClick?.(content);
            });

            buttonContainer.appendChild(btn);
        });

        content.appendChild(buttonContainer);
    }

    section.appendChild(title);
    section.appendChild(content);
    container.appendChild(section);
    return section;
}