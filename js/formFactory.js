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
    const createLabel = (text, forId) => {
        const label = document.createElement("label");
        label.textContent = text;
        label.htmlFor = forId;
        return label;
    };

    const clampValue = (field, min, max) => {
        field.addEventListener("input", () => {
            if (!field.value) return;
            let val = Number(field.value);
            if (min !== undefined) val = Math.max(min, val);
            if (max !== undefined) val = Math.min(max, val);
            field.value = val;
        });
    };

    // ==============================
    // Inputs
    // ==============================
    sectionConfig.inputs.forEach(item => {

        // Section header
        if (item.header) {
            const h = document.createElement("div");
            h.classList.add("input-header");
            h.textContent = item.header;
            content.appendChild(h);
            return;
        }

        const row = document.createElement("div");
        row.classList.add("input-row");

        const label = createLabel(item.label, item.id);

        // ---- Item list (select) ----
        if (item.type === "itemList") {
            const select = document.createElement("select");
            select.id = item.id;
            select.dataset.inputId = item.id;

            item.options.forEach(opt => {
                const op = document.createElement("option");
                op.value = opt.name ?? opt;      // support simple strings or objects
                op.textContent = opt.name ?? opt;
                select.appendChild(op);
            });

            row.append(label, select);
            content.appendChild(row);

            // Register dependency (if any)
            if (item.dependsOn) {
                if (!content.dependencyMap) content.dependencyMap = new Map();

                content.dependencyMap.set(item.id, {
                    targetId: item.dependsOn,
                    filterFn: item.filter,
                    options: item.options
                });
            }

            return;
        }

        // ---- Checkbox ----
        if (item.type === "checkbox") {
            const checkbox = document.createElement("input");
            checkbox.type = "checkbox";
            checkbox.id = item.id;
            checkbox.dataset.inputId = item.id;

            row.append(label, checkbox);
            content.appendChild(row);
            return;
        }

        // ---- Standard input ----
        const field = document.createElement("input");
        field.type = item.type || "number";
        field.id = item.id;
        field.dataset.inputId = item.id;
        field.placeholder = item.placeholder ?? "";

        if (item.min !== undefined) field.min = item.min;
        if (item.max !== undefined) field.max = item.max;

        if (item.min !== undefined || item.max !== undefined) {
            clampValue(field, item.min, item.max);
        }

        row.append(label, field);
        content.appendChild(row);

        // Standard input can also have dependency rules
        if (item.dependsOn) {
            if (!content.dependencyMap) content.dependencyMap = new Map();

            content.dependencyMap.set(item.id, {
                targetId: item.dependsOn,
                filterFn: item.filter,
                options: item.options,
                context: item.context
            });
        }
    });
    // Activate dependency listeners
    if (content.dependencyMap) {
        content.dependencyMap.forEach((config, childId) => {
            const targetElement = content.querySelector(`#${config.targetId}`);
            const childElement = content.querySelector(`#${childId}`);

            if (!targetElement || !childElement) return;

            targetElement.addEventListener("change", () => {
                const selectedValue = targetElement.value;

                // Rebuild options for dependent select
                childElement.innerHTML = "";

                config.options.forEach(opt => {
                    if (!config.filterFn || config.filterFn(selectedValue, opt, config.context)) {
                        const op = document.createElement("option");
                        op.value = opt.name ?? opt;   // support both objects and strings
                        op.textContent = opt.name ?? opt;
                        childElement.appendChild(op);
                    }
                });
            });
        });
    }

    // ==============================
    // Buttons
    // ==============================
    if (sectionConfig.buttons?.length) {
        const buttonContainer = document.createElement("div");
        buttonContainer.classList.add("button-container");

        sectionConfig.buttons.forEach(btnConfig => {
            const btn = document.createElement("button");
            btn.textContent = btnConfig.text;
            if (btnConfig.className) btn.className = btnConfig.className;

            btn.addEventListener("click", () => {
                btnConfig.onClick?.(content);
            });

            buttonContainer.appendChild(btn);
        });

        content.appendChild(buttonContainer);
    }

    // Build final
    section.append(header, content);
    container.appendChild(section);

    return section;
}