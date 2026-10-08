let productionPlans = [];
let productionTargets = [];


function loadProductionData(productionPlanText, productionTargetText){

    const productionPlanRows = parseCSV(productionPlanText);

    productionPlans = productionPlanRows
        .slice(1)
        .map(r => {

            return {
                from: r[0]?.trim(),
                to: r[1]?.trim(),
                grade: r[2]?.trim()
            };

        })
        .filter(r => r.from && r.to && r.grade);


    const productionTargetRows = parseCSV(productionTargetText);

    productionTargets = productionTargetRows
        .slice(1)
        .map(r => {

            return {
                month: r[0]?.trim(),
                grade: r[1]?.trim(),
                quantity: r[2]?.trim()
            };

        })
        .filter(r => r.month && r.grade && r.quantity);
}


function renderProductionPlan(){

    const title = document.getElementById("productionPlanMonth");
    const targetBox = document.getElementById("productionTargets");
    const body = document.getElementById("productionPlanBody");

    if(!title || !targetBox || !body){
        return;
    }

    const today = new Date();

    const monthName = today.toLocaleString("en-US", {
        month: "long"
    });

    const currentMonth =
        String(today.getMonth() + 1).padStart(2, "0");

    const currentYear =
        today.getFullYear();

    const currentMonthKey =
        currentMonth + "-" + currentYear;


    /* MONTH TITLE */

    title.innerText = monthName + " " + currentYear;


    /* =========================
       PRODUCTION TARGETS
       ========================= */

    const targetOrder = ["WH034", "IH120N", "FH110N"];

    const targets = productionTargets
        .filter(r => r.month === currentMonthKey)
        .sort((a, b) =>
            targetOrder.indexOf(a.grade) - targetOrder.indexOf(b.grade)
        );


    targetBox.innerHTML = "";

    if(targets.length){

        targetBox.innerHTML = targets.map((r, i) => {

            const gradeClass =
                i === 0 ? "grade1" :
                i === 1 ? "grade2" :
                "grade3";

            return `
                <span class="production-target ${gradeClass}">
                    ${r.grade}: ${r.quantity} MT
                </span>
            `;

        }).join("");

    }


    /* =========================
       PRODUCTION PLAN
       ========================= */

    const plans = productionPlans.filter(r => {

        const parts = r.from.split("-");

        if(parts.length !== 3){
            return false;
        }

        const month = parts[1];
        const year = parts[2];

        return month === currentMonth &&
               Number(year) === currentYear;
    });


    body.innerHTML = "";


    if(!plans.length){

        document.getElementById("productionEmpty").style.display = "block";
        document.getElementById("productionTableWrap").style.display = "none";

        body.innerHTML = "";

        return;
    }


    /* =========================
       PLAN ROWS
       ========================= */

    document.getElementById("productionEmpty").style.display = "none";
    document.getElementById("productionTableWrap").style.display = "block";


    plans.forEach(plan => {

        const fromParts =
            plan.from.split("-").map(Number);

        const toParts =
            plan.to.split("-").map(Number);


        const fromDate =
            new Date(
                fromParts[2],
                fromParts[1] - 1,
                fromParts[0]
            );


        const toDate =
            new Date(
                toParts[2],
                toParts[1] - 1,
                toParts[0]
            );


        const days =
            Math.floor(
                (toDate - fromDate) /
                (1000 * 60 * 60 * 24)
            ) + 1;


        const isToday =
            today >= fromDate &&
            today <= toDate;

        const isPast =
            toDate < today;


        const duration =
            fromParts[1] === toParts[1]
                ? `${String(fromParts[0]).padStart(2,"0")}-${String(toParts[0]).padStart(2,"0")} ${fromDate.toLocaleString("en-US",{month:"short"})}`
                : `${String(fromParts[0]).padStart(2,"0")} ${fromDate.toLocaleString("en-US",{month:"short"})}-${String(toParts[0]).padStart(2,"0")} ${toDate.toLocaleString("en-US",{month:"short"})}`;


        const row =
            document.createElement("tr");


        if(isToday){
            row.classList.add("production-today");
        }else if(isPast){
            row.classList.add("production-past");
        }


        row.innerHTML = `
            <td>
                <div class="production-duration">${duration}</div>
            </td>
            <td>
                <div class="production-days">${days}</div>
            </td>
            <td>
                <div class="production-grade">${plan.grade}</div>
            </td>
        `;


        body.appendChild(row);

    });

}
