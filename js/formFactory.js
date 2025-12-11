// ==============================
// formFactory.js
// Dynamically creates labeled input sections
// ==============================

export function createInputSection(containerSelector, sectionConfig) {
    const container = document.querySelector(containerSelector);
    if (!container) return;

    const section = document.createElement("div");
    section.classList.add("expandable-section");

    // ==============================
    // Header + Toggle
    // ==============================
    const header = document.createElement("div");
    header.classList.add("expandable-header");

    const icon = document.createElement("span");
    icon.classList.add("expand-icon");
    icon.textContent = "+";

    const title = document.createElement("span");
    title.classList.add("expand-title");
    title.textContent = sectionConfig.title;

    header.append(icon, title);

    const content = document.createElement("div");
    content.classList.add("expandable-content");
    content.style.display = "none";

    header.addEventListener("click", () => {
        const open = content.style.display !== "none";
        content.style.display = open ? "none" : "block";
        icon.textContent = open ? "+" : "–";
        header.classList.toggle("open", !open);
    });

    // ==============================
    // Helpers
    // ==============================
    const clampValue = (field, min, max) => {
        field.addEventListener("input", () => {
            if (!field.value) return;
            let val = Number(field.value);
            if (min !== undefined) val = Math.max(min, val);
            if (max !== undefined) val = Math.min(max, val);
            field.value = val;
        });
    };

    const createLabel = (text) => {
        const label = document.createElement("label");
        label.textContent = text;
        return label;
    };

    // Dependency registry
    const dependencyMap = new Map();

    // ==============================
    // Inputs
    // ==============================
    sectionConfig.inputs.forEach(item => {

        // Section header inside inputs
        if (item.header) {
            const h = document.createElement("div");
            h.classList.add("input-header");
            h.textContent = item.header;
            content.appendChild(h);
            return;
        }

        const row = document.createElement("div");
        row.classList.add("input-row");

        const label = createLabel(item.label);

        // ------------------------------
        // SELECT (Item List)
        // ------------------------------
        if (item.type === "itemList") {
            const select = document.createElement("select");
            select.dataset.inputId = item.id;

            item.options.forEach(opt => {
                const op = document.createElement("option");
                op.value = opt.name ?? opt;
                op.textContent = opt.name ?? opt;
                select.appendChild(op);
            });

            row.append(label, select);
            content.appendChild(row);

            // Register dependency
            if (item.dependsOn) {
                dependencyMap.set(item.id, {
                    targetId: item.dependsOn,
                    filterFn: item.filter,
                    options: item.options
                });
            }

            return;
        }

        // ------------------------------
        // CHECKBOX
        // ------------------------------
        if (item.type === "checkbox") {
            const checkbox = document.createElement("input");
            checkbox.type = "checkbox";
            checkbox.dataset.inputId = item.id;
            checkbox.checked = false;

            row.append(label, checkbox);
            content.appendChild(row);
            return;
        }

        // ------------------------------
        // STANDARD INPUT FIELD
        // ------------------------------
        const field = document.createElement("input");
        field.type = item.type || "number";
        field.dataset.inputId = item.id;
        field.placeholder = item.placeholder ?? "";

        if (item.min !== undefined) field.min = item.min;
        if (item.max !== undefined) field.max = item.max;

        if (item.min !== undefined || item.max !== undefined) {
            clampValue(field, item.min, item.max);
        }

        row.append(label, field);
        content.appendChild(row);

        // Register dependency if any
        if (item.dependsOn) {
            dependencyMap.set(item.id, {
                targetId: item.dependsOn,
                filterFn: item.filter,
                options: item.options,
                context: item.context
            });
        }
    });

    // ==============================
    // Apply Dependency Logic
    // ==============================
    dependencyMap.forEach((config, childId) => {

        const targetElement = content.querySelector(
            `[data-input-id="${config.targetId}"]`
        );

        const childElement = content.querySelector(
            `[data-input-id="${childId}"]`
        );

        if (!targetElement || !childElement) return;

        targetElement.addEventListener("change", () => {
            const selectedValue = targetElement.value;

            // Only rebuild options for select-type children
            if (childElement.tagName === "SELECT") {
                childElement.innerHTML = "";

                config.options.forEach(opt => {
                    if (!config.filterFn || config.filterFn(selectedValue, opt, config.context)) {
                        const op = document.createElement("option");
                        op.value = opt.name ?? opt;
                        op.textContent = opt.name ?? opt;
                        childElement.appendChild(op);
                    }
                });
            }
        });
    });

    // ==============================
    // Buttons
    // ==============================
    if (sectionConfig.buttons?.length) {
        const buttonContainer = document.createElement("div");
        buttonContainer.classList.add("button-container");

        sectionConfig.buttons.forEach(btnConfig => {
            const btn = document.createElement("button");
            btn.textContent = btnConfig.text;

            if (btnConfig.className) {
                btn.className = btnConfig.className;
            }

            btn.addEventListener("click", () => {
                btnConfig.onClick?.(content);
            });

            buttonContainer.appendChild(btn);
        });

        content.appendChild(buttonContainer);
    }

    // ==============================
    // Final Assembly
    // ==============================
    section.append(header, content);
    container.appendChild(section);

    return section;
}