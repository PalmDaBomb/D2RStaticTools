// ==============================
// formFactory.js
// Dynamically creates labeled input sections
// ==============================

export function createInputSection(containerSelector, sectionConfig) {
    const container = document.querySelector(containerSelector);
    if (!container) return;

    // Create expandable wrapper
    const section = document.createElement("div");
    section.classList.add("expandable-section");

    // Header
    const header = document.createElement("div");
    header.classList.add("expandable-header");

    const icon = document.createElement("span");
    icon.classList.add("expand-icon");
    icon.textContent = "+";

    const title = document.createElement("span");
    title.classList.add("expand-title");
    title.textContent = sectionConfig.title;

    header.appendChild(icon);
    header.appendChild(title);

    // Expandable content container
    const content = document.createElement("div");
    content.classList.add("expandable-content");
    content.style.display = "none";

    header.addEventListener("click", () => {
        const open = content.style.display !== "none";
        content.style.display = open ? "none" : "block";
        icon.textContent = open ? "+" : "–";
        header.classList.toggle("open", !open);
    });

    // -------------------------------------
    // ⭐ Inputs + Headers
    // -------------------------------------
    sectionConfig.inputs.forEach(item => {
        // ✓ Header support
        if (item.header) {
            const h = document.createElement("div");
            h.classList.add("input-header");
            h.textContent = item.header;
            content.appendChild(h);
            return;
        }

        // ✓ Input row
        const row = document.createElement("div");
        row.classList.add("input-row");

        const label = document.createElement("label");
        label.textContent = item.label;
        label.setAttribute("for", item.id);

        // -------------------------------
        // ⭐ Item Lists
        // -------------------------------
        if (item.type === "itemList") {
            const select = document.createElement("select");
            select.id = item.id;
            select.dataset.inputId = item.id;

            item.options.forEach(opt => {
                const optionEl = document.createElement("option");
                optionEl.value = opt;
                optionEl.textContent = opt;
                select.appendChild(optionEl);
            });

            row.appendChild(label);
            row.appendChild(select);
            content.appendChild(row);
            return;
        }

        // -------------------------------
        // ⭐ Checkbox
        // -------------------------------
        if (item.type === "checkbox") {
            const checkbox = document.createElement("input");
            checkbox.type = "checkbox";
            checkbox.id = item.id;
            checkbox.dataset.inputId = item.id;

            row.appendChild(label);
            row.appendChild(checkbox);
            content.appendChild(row);
            return;
        }

        // -------------------------------
        // ⭐ Regular input (number/text/etc.)
        // -------------------------------
        const field = document.createElement("input");
        field.type = item.type || "number";
        field.id = item.id;
        field.dataset.inputId = item.id;
        field.placeholder = item.placeholder || "";

        if (item.min !== undefined) field.min = item.min;
        if (item.max !== undefined) field.max = item.max;

        if (item.min !== undefined || item.max !== undefined) {
            field.addEventListener("input", () => {
                if (field.value === "") return;

                let val = Number(field.value);
                if (item.min !== undefined && val < item.min) val = item.min;
                if (item.max !== undefined && val > item.max) val = item.max;
                field.value = val;
            });
        }

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