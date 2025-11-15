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

    // Create header wrapper
    const header = document.createElement("div");
    header.classList.add("expandable-header");

    // Create the + icon
    const icon = document.createElement("span");
    icon.classList.add("expand-icon");
    icon.textContent = "+";

    // Create the title text
    const title = document.createElement("span");
    title.classList.add("expand-title");
    title.textContent = sectionConfig.title;

    header.appendChild(icon);
    header.appendChild(title);

    const content = document.createElement("div");
    content.classList.add("expandable-content");
    content.style.display = "none";

    header.addEventListener("click", () => {
        const isOpen = content.style.display !== "none";

        if (isOpen) {
            content.style.display = "none";
            icon.textContent = "+";
            header.classList.remove("open");
        } else {
            content.style.display = "block";
            icon.textContent = "–";
            header.classList.add("open");
        }
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

    section.appendChild(header);
    section.appendChild(content);
    container.appendChild(section);
    return section;
}