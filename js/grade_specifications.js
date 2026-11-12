
/* =========================================================
   PPU DASHBOARD — GRADE SPECIFICATIONS
   CSV: ./updates/grade_specifications.csv
   ========================================================= */

(function () {
    "use strict";

    const CSV_URL = "./updates/grade_specifications.csv";

    let gradeSpecifications = [];

    const specificationFields = [
        { label: "MFI (Spec Range)", a: "mfiSpecA", b: "mfiSpecB" },
        { label: "MFI (Mix Range)", a: "mfiMixA", b: "mfiMixB" },
        { label: "Xylene Solubles", a: "xyleneA", b: "xyleneB" },
        { label: "Colour (Yellow Index)", a: "colourA", b: "colourB" },
        { label: "Contamination (Nos/Kg)", a: "contaminationA", b: "contaminationB" },
        { label: "Fines (Max Wt %)", a: "finesA", b: "finesB" },
        { label: "Volatiles (ppm)", a: "volatilesA", b: "volatilesB" },
        { label: "Moisture (ppm)", a: "moistureA", b: "moistureB" }
    ];

    function parseCSV(text) {
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
            } else if ((char === "\n" || char === "\r") && !quoted) {
                if (char === "\r" && text[i + 1] === "\n") i++;

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
            value.trim().toLowerCase()
        );

        const requiredHeaders = [
            "grade name", "grade", "novolen equiv grade",
            "mfi spec a", "mfi spec b",
            "mfi mix a", "mfi mix b",
            "xylene a", "xylene b",
            "colour a", "colour b",
            "contamination a", "contamination b",
            "fines a", "fines b",
            "volatiles a", "volatiles b",
            "moisture a", "moisture b"
        ];

        const missing = requiredHeaders.filter(
            header => !headers.includes(header)
        );

        if (missing.length) {
            throw new Error(
                "Missing CSV columns: " + missing.join(", ")
            );
        }

        return rows.map(values => {
            const record = {};

            headers.forEach((header, index) => {
                record[header] = (values[index] || "").trim();
            });

            return {
                gradeName: record["grade name"],
                grade: record["grade"],
                novolen: record["novolen equiv grade"],

                mfiSpecA: record["mfi spec a"],
                mfiSpecB: record["mfi spec b"],

                mfiMixA: record["mfi mix a"],
                mfiMixB: record["mfi mix b"],

                xyleneA: record["xylene a"],
                xyleneB: record["xylene b"],

                colourA: record["colour a"],
                colourB: record["colour b"],

                contaminationA: record["contamination a"],
                contaminationB: record["contamination b"],

                finesA: record["fines a"],
                finesB: record["fines b"],

                volatilesA: record["volatiles a"],
                volatilesB: record["volatiles b"],

                moistureA: record["moisture a"],
                moistureB: record["moisture b"]
            };
        }).filter(item => item.grade);
    }

    function escapeHTML(value) {
        return String(value ?? "").replace(/[&<>"']/g, char => ({
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;"
        })[char]);
    }

    function renderGradeSpecification(grade) {
        const container = document.getElementById(
            "gradeSpecificationContent"
        );

        if (!container) return;

        const item = gradeSpecifications.find(
            record => record.grade === grade
        );

        if (!item) {
            container.innerHTML = `
                <div class="grade-spec-message">
                    No specifications available for this grade.
                </div>
            `;
            return;
        }

        const specificationRows = specificationFields.map(field => {
            const aValue = item[field.a] || "";
            const bValue = item[field.b] || "";

            if (!aValue && !bValue) return "";

            return `
                <div class="grade-spec-row">

                    <div class="grade-spec-label">
                        ${escapeHTML(field.label)}
                    </div>

                    <div class="grade-spec-values">

                        <div class="grade-spec-value grade-spec-a">
                            ${aValue
                                ? escapeHTML(aValue)
                                : '<span class="grade-spec-blank">—</span>'}
                        </div>

                        <div class="grade-spec-value grade-spec-b">
                            ${bValue
                                ? escapeHTML(bValue)
                                : '<span class="grade-spec-blank">—</span>'}
                        </div>

                    </div>

                </div>
            `;
        }).join("");

        container.innerHTML = `
            <div class="grade-spec-info">

                <div class="grade-spec-info-item">
                    <span>Grade Name</span>
                    <strong>${escapeHTML(item.gradeName)}</strong>
                </div>

                <div class="grade-spec-info-item">
                    <span>Grade</span>
                    <strong>${escapeHTML(item.grade)}</strong>
                </div>

                <div class="grade-spec-info-item">
                    <span>Novolen Equiv. Grade</span>
                    <strong>${escapeHTML(item.novolen)}</strong>
                </div>

            </div>

            <div class="grade-spec-comparison">

                <div class="grade-spec-column-headings">
                    <div class="grade-spec-a-heading">A Grade</div>
                    <div class="grade-spec-b-heading">B Grade</div>
                </div>

                ${specificationRows}

            </div>
        `;
    }

    async function loadGradeSpecifications() {
        const container = document.getElementById(
            "gradeSpecificationContent"
        );

        if (!container) return;

        try {
            const response = await fetch(
                `${CSV_URL}?v=${Date.now()}`,
                { cache: "no-store" }
            );

            if (!response.ok) {
                throw new Error(
                    `Unable to load CSV (${response.status})`
                );
            }

            const csvText = await response.text();

            gradeSpecifications = parseCSV(csvText);

            if (!gradeSpecifications.length) {
                throw new Error("No grade records found in CSV.");
            }

        } catch (error) {
            console.error(
                "Grade specifications loading failed:",
                error
            );

            container.innerHTML = `
                <div class="grade-spec-message">
                    Unable to load grade specifications.
                    Please check the CSV file.
                </div>
            `;
        }
    }

    document.addEventListener("DOMContentLoaded", function () {
        const selector = document.getElementById(
            "gradeSpecificationSelect"
        );

        if (!selector) return;

        selector.addEventListener("change", function () {
            renderGradeSpecification(this.value);
        });

        loadGradeSpecifications();
    });

})();
