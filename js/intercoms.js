/* =========================================================
   PPU OPERATIONS DASHBOARD — INTERCOM DIRECTORY
   CSV: ./updates/intercoms.csv
   Columns: Category,Name,Office Intercom,Residence Intercom
   ========================================================= */

(function () {
    "use strict";

  const CSV_URL = "./updates/intercoms.csv";
    let intercomContacts = [];
    let activeCategory = "";
    let searchText = "";

  const categoryStyles = {
    "Emergency": {
        icon: "🚨",
        color: "#dc2626",
        tint: "#fee2e2"
    },
    "Key Officials": {
        icon: "👔",
        color: "#2563eb",
        tint: "#dbeafe"
    },
    "PPU": {
        icon: "🏭",
        color: "#0d9488",
        tint: "#ccfbf1"
    },
    "Electrical": {
        icon: "⚡",
        color: "#d97706",
        tint: "#fef3c7"
    },
    "Mechanical": {
        icon: "🔧",
        color: "#7c3aed",
        tint: "#ede9fe"
    },
    "Instrumentation": {
        icon: "🎛️",
        color: "#0891b2",
        tint: "#cffafe"
    },
    "IOPS": {
        icon: "🛢️",
        color: "#4f46e5",
        tint: "#e0e7ff"
    },
    "Other Units": {
        icon: "🏗️",
        color: "#059669",
        tint: "#d1fae5"
    },
    "Projects": {
        icon: "📋",
        color: "#9333ea",
        tint: "#f3e8ff"
    },
    "Security": {
        icon: "🔐",
        color: "#475569",
        tint: "#e2e8f0"
    },
    "HR": {
        icon: "👥",
        color: "#db2777",
        tint: "#fce7f3"
    },
    "Finance": {
        icon: "💰",
        color: "#65a30d",
        tint: "#ecfccb"
    },
    "IT": {
        icon: "💻",
        color: "#0284c7",
        tint: "#e0f2fe"
    },
    "Telecom": {
        icon: "📡",
        color: "#c026d3",
        tint: "#fae8ff"
    }
};

    // Parse CSV while supporting quoted values and commas.
    function parseIntercomCSV(text) {
        const rows = [];
        let row = [];
        let cell = "";
        let quoted = false;

        for (let i = 0; i < text.length; i++) {
            const char = text[i];

            if (char === '"') {
                if (quoted && text[i + 1] === '"') {
                    cell += '"';
                    i++;
                } else {
                    quoted = !quoted;
                }
            } else if (char === "," && !quoted) {
                row.push(cell.trim());
                cell = "";
            } else if (
                (char === "\n" || char === "\r") &&
                !quoted
            ) {
                if (char === "\r" && text[i + 1] === "\n") {
                    i++;
                }

                row.push(cell.trim());

                if (row.some(value => value !== "")) {
                    rows.push(row);
                }

                row = [];
                cell = "";
            } else {
                cell += char;
            }
        }

        row.push(cell.trim());

        if (row.some(value => value !== "")) {
            rows.push(row);
        }

        if (!rows.length) return [];

        const headers = rows.shift().map(value =>
            value.toLowerCase().replace(/\s+/g, " ")
        );

        const column = name =>
            headers.indexOf(name.toLowerCase());

        const categoryIndex = column("category");
        const nameIndex = column("name");
        const officeIndex = column("office intercom");
        const residenceIndex = column("residence intercom");

        if (
            categoryIndex < 0 ||
            nameIndex < 0 ||
            officeIndex < 0 ||
            residenceIndex < 0
        ) {
            throw new Error(
                "CSV headers must be: Category, Name, Office Intercom, Residence Intercom"
            );
        }

        const psIndex = column("PS");

        return rows.map(values => ({
            category: (values[categoryIndex] || "").trim(),
   	    name: (values[nameIndex] || "").trim(),
            office: (values[officeIndex] || "").trim(),
            residence: (values[residenceIndex] || "").trim(),
            ps: psIndex >= 0 ? (values[psIndex] || "").trim() : ""
        })).filter(item => item.category && item.name);
    }

    // Prevent HTML injection from CSV content.
    function escapeHTML(value) {
        return String(value ?? "").replace(/[&<>"']/g, char => ({
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;"
        })[char]);
    }

    // Return unique category names.
    function getCategories() {
        return [
            ...new Set(intercomContacts.map(item => item.category))
        ];
    }

function getCategoryStyle(category, index) {
    return categoryStyles[category] || {
        icon: "📁",
        color: "#64748b",
        tint: "#e2e8f0"
    };
}

    // Display category cards.
    function renderCategoryCards() {
        const grid = document.getElementById("intercomCategoryGrid");
        const empty = document.getElementById("intercomEmptyState");

        if (!grid) return;

        const query = searchText.toLowerCase();

        const categories = getCategories().filter(category => {
            if (!query) return true;

            return category.toLowerCase().includes(query) ||
                intercomContacts.some(item =>
                    item.category === category &&
                    item.name.toLowerCase().includes(query)
                );
        });

        grid.innerHTML = categories.map(category => {
            const index = getCategories().indexOf(category);
            const style = getCategoryStyle(category, index);

            const count = intercomContacts.filter(
                item => item.category === category
            ).length;

            return `
                <button
                    type="button"
                    class="intercom-category-card"
                    data-category="${escapeHTML(category)}"
                    style="
                        --intercom-accent:${style.color};
                        --intercom-tint:${style.tint}
                    "
                >
                    <span
                        class="intercom-category-icon"
                        aria-hidden="true"
                    >${style.icon}</span>

                    <span class="intercom-category-copy">
                        <strong>${escapeHTML(category)}</strong>
                        <small>
                            ${count}
                            ${count === 1 ? "contact" : "contacts"}
                        </small>
                    </span>

                    <span
                        class="intercom-category-chevron"
                        aria-hidden="true"
                    >›</span>
                </button>
            `;
        }).join("");

        if (empty) {
            empty.hidden = categories.length > 0;

            empty.textContent = query
                ? "No matching category or contact found."
                : "No intercom contacts available.";
        }
    }

    // Open the bottom-sheet popup for a selected category.
    function openCategory(category) {
        activeCategory = category;

        const overlay = document.getElementById(
            "intercomPopupOverlay"
        );

        if (!overlay) return;

        renderPopupContacts();

        overlay.querySelector(
            ".intercom-popup-title"
        ).textContent = category;

        overlay.classList.add("is-open");

        document.body.style.overflow = "hidden";
    }

    // Display contacts inside the selected category.
    function renderPopupContacts() {
    const list = document.getElementById("intercomPopupList");
    const query = searchText.toLowerCase();

    if (!list) return;

    const contacts = intercomContacts.filter(item =>
        item.category === activeCategory &&
        (
            !query ||
            item.name.toLowerCase().includes(query) ||
            item.category.toLowerCase().includes(query)
        )
    );

    list.innerHTML = contacts.length
        ? contacts.map(item => {
            const details = [
                { label: "Office", value: item.office },
                { label: "Residence", value: item.residence },
                { label: "PS", value: item.ps }
            ].filter(field => field.value);

            return `
                <article class="intercom-contact-row">

                    <div class="intercom-contact-name">
                        ${escapeHTML(item.name)}
                    </div>

                    <div class="intercom-contact-numbers">
                        ${
                            details.length
                                ? details.map(field => `
                                    <div class="intercom-number">
                                        <span>${field.label}</span>
                                        <strong>${escapeHTML(field.value)}</strong>
                                    </div>
                                `).join("")
                                : `
                                    <div class="intercom-number-missing">
                                        Not available
                                    </div>
                                `
                        }
                    </div>

                </article>
            `;
        }).join("")
        : `
            <div class="intercom-popup-empty">
                No matching contacts found.
            </div>
        `;
}

    // Close the popup.
    function closePopup() {
        const overlay = document.getElementById(
            "intercomPopupOverlay"
        );

        if (!overlay) return;

        overlay.classList.remove("is-open");

        document.body.style.overflow = "";

        activeCategory = "";
    }

    // Fetch and load the CSV data.
    async function loadIntercoms() {
        const grid = document.getElementById(
            "intercomCategoryGrid"
        );

        if (!grid) return;

        try {
            const response = await fetch(
                `${CSV_URL}?v=${Date.now()}`,
                { cache: "no-store" }
            );

            if (!response.ok) {
                throw new Error(
                    `Unable to load intercom CSV (${response.status})`
                );
            }

            const csvText = await response.text();

            intercomContacts = parseIntercomCSV(csvText);

            renderCategoryCards();

        } catch (error) {
            console.error(
                "Intercom directory loading failed:",
                error
            );

            grid.innerHTML = "";

            const empty = document.getElementById(
                "intercomEmptyState"
            );

            if (empty) {
                empty.hidden = false;

                empty.textContent =
                    "Unable to load intercom directory. Please check the CSV file.";
            }
        }
    }

    // Initialise the Intercoms page.
    document.addEventListener("DOMContentLoaded", function () {

        const search = document.getElementById(
            "intercomSearch"
        );

        const grid = document.getElementById(
            "intercomCategoryGrid"
        );

        const overlay = document.getElementById(
            "intercomPopupOverlay"
        );

        if (!search || !grid || !overlay) return;

        // Search categories and contact names.
        search.addEventListener("input", function () {
            searchText = this.value.trim();

            renderCategoryCards();

            if (activeCategory) {
                renderPopupContacts();
            }
        });

        // Open category popup.
        grid.addEventListener("click", function (event) {
            const card = event.target.closest(
                ".intercom-category-card"
            );

            if (card) {
                openCategory(card.dataset.category);
            }
        });

        // Close popup by clicking outside or close button.
        overlay.addEventListener("click", function (event) {
            if (
                event.target === overlay ||
                event.target.closest(".intercom-popup-close")
            ) {
                closePopup();
            }
        });

        // Close popup using Escape key.
        document.addEventListener("keydown", function (event) {
            if (event.key === "Escape") {
                closePopup();
            }
        });

        loadIntercoms();
    });

})();
