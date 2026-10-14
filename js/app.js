let data = [];
let selectedName = "";
let header = [];
let nonExecData = [];
let nonExecHeader = [];

let seniorityOrder = [];
let nonExecSeniorityOrder = [];


const shiftLabels = {
"A":"A Shift","B":"B Shift","C":"C Shift",
"G":"General","OFF":"Rest / Off / Holiday",
"D":"Day Shift","N":"Night Shift",
"L":"Leave","T":"Training / Tour"
};


function loadSeniority(execText, nonExecText){

    if(execText && execText.trim()){
        seniorityOrder = execText
            .split(/\r?\n/)
            .slice(1)
            .map(x => x.trim())
            .filter(Boolean);
    }

    if(nonExecText && nonExecText.trim()){
        nonExecSeniorityOrder = nonExecText
            .split(/\r?\n/)
            .slice(1)
            .map(x => x.trim())
            .filter(Boolean);
    }

    console.log("Executive seniority loaded:", seniorityOrder);
    console.log("Non-Executive seniority loaded:", nonExecSeniorityOrder);
}

function sortBySeniority(list){
    return list.sort((a,b)=>{
        let ia = seniorityOrder.indexOf(a.trim());
        let ib = seniorityOrder.indexOf(b.trim());
        if(ia === -1) ia = 999;
        if(ib === -1) ib = 999;
        return ia - ib;
    });
}

function updatePresentShiftIncharge(){

    const current = getCurrentShiftInfo();

    const element =
        document.getElementById("presentShiftIncharge");

    if(!element){
        return;
    }

    if(!current){
        element.innerText = "—";
        return;
    }

    const shifts = getData(current.date);

    const list = shifts[current.shift] || [];

    if(!list.length){
        element.innerText = "—";
        return;
    }

    const firstExecutive = sortBySeniority(
        list.map(x => x.name)
    )[0];

    element.innerText = firstExecutive || "—";
}


function init(){ 

    initTheme(); 

    document.getElementById("today").innerHTML = "Loading..."; 

    updateHeaderDate();

    let savedCategory = localStorage.getItem("selectedCategory"); 
    if(savedCategory){ 
        document.getElementById("categorySelector").value = savedCategory; 
    } 

    populateNames();

    setTimeout(() => {
        let savedName = localStorage.getItem("ppu_name");
        if(savedName){
            selectedName = savedName;
            document.getElementById("nameSelector").value = savedName;
    }
    
    refresh();
    renderNext7Days();

}, 0);

    document.getElementById("todayNote").innerHTML = getTodayNote(); 
   

    renderAlerts();
    updateTrainingHeader(); 
    renderTraining();

    calcHoliday(); 
    refresh(); 
}

function refresh(){
    let calendarToday = formatDate(new Date());

    const currentShiftInfo = getCurrentShiftInfo();
    let today = currentShiftInfo ? currentShiftInfo.date : calendarToday;

    let shift = selectedName ? (getShift(today, selectedName) || "-") : "Select Name";

    const [day, month, year] = today.split("-");
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
                        "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

    document.getElementById("todayTitle").innerText =
    `Today's Shift (${monthNames[parseInt(month, 10) - 1]} ${parseInt(day, 10)}, ${year})`;

let badge = document.getElementById("todayShiftBadge");

if(!selectedName){
    badge.innerText = "Select a name to view shift";
}else{
    badge.innerText = "Today's Shift: " + shift;
}

badge.className = "badge";

if(shift && shift !== "-" && shift !== "Select Name"){

    let primary;

    if(shift.includes("C")) primary = "C";
    else if(shift.includes("B")) primary = "B";
    else if(shift.includes("A")) primary = "A";
    else primary = shift;

    if(primary === "O") primary = "OFF";

    badge.classList.add(primary);
}

render("today", today);

updatePresentShiftIncharge();

renderProductionPlan();
}

function render(id,date){

    console.log("Render called for:", id, date);
    let box=document.getElementById(id);
    box.innerHTML="";

let shifts = (header.indexOf(date) === -1) ? {} : getData(date);

if(Object.keys(shifts).length === 0){

    let msg = (id === "today")
        ? "Shift schedule is not available for today"
        : "Shift schedule is not available for selected date";

    box.innerHTML += `<div style="color:#777;font-weight:bold; margin-bottom:10px;">
    ${msg}
    </div>`;
}

let hasExec = Object.values(shifts).some(arr => arr.length > 0);

if(hasExec){
    box.innerHTML += `<div class="section-header exec-header">Executive</div>`;
}

/* MAIN */
["A","B","C","G","OFF","L","T"].forEach(s=>{

let list=shifts[s]||[];
if(list.length === 0) return;

list = sortBySeniority(list.map(x=>x.name))
       .map(n => list.find(x=>x.name===n));

let alert=(["A","B","C"].includes(s)&&list.length<=2)?" ❗":"";

let chips=list.map(obj=>{
let sel=(selectedName && obj.name===selectedName)?"selected":"";
let multi=obj.multi?" ❕":"";
let active = "";
let current = getCurrentShiftInfo();

if(current && s === current.shift && date === current.date){
    active = "active-shift";
}

return `<span class="chip ${s} ${sel} ${active}">${getFirstName(obj.name)}${multi}</span>`;
}).join("");

let activeClass = "";
let current = getCurrentShiftInfo();

if(current && s === current.shift && date === current.date){
    activeClass = "shift-active-box";
}

box.innerHTML += `
<div class="${activeClass}">
    <div class="shift-title">${shiftLabels[s]} (${list.length})${alert}</div>
    ${chips || "-"}
</div>`;
});

/* D N */
["D","N"].forEach(s=>{

let list=shifts[s]||[];
if(list.length===0) return;

list = sortBySeniority(list.map(x=>x.name))
       .map(n => list.find(x=>x.name===n));

let chips=list.map(obj=>{
let sel=(selectedName && obj.name===selectedName)?"selected":"";
let multi=obj.multi?" ❕":"";
let active = "";
let current = getCurrentShiftInfo();

if(current && s === current.shift && date === current.date){
    active = "active-shift";
}

return `<span class="chip ${s} ${sel} ${active}">${getFirstName(obj.name)}${multi}</span>`;
}).join("");

box.innerHTML+=`<div class="shift-title">${shiftLabels[s]} (${list.length})</div>${chips}`;
});

// ================= NON-EXEC (FIXED - SINGLE RENDER) =================

let nonExecShifts = (nonExecHeader.indexOf(date) === -1) ? {} : getNonExecData(date);

let hasNonExec = Object.values(nonExecShifts).some(arr => arr.length > 0);

if(hasNonExec){

    box.innerHTML += `<hr><div class="section-header nonexec-header">Non-Executive</div>`;

    ["A","B","C","G","OFF","L","T","D","N"].forEach(s=>{

        let list = nonExecShifts[s] || [];
        if(list.length === 0) return;

        list = list.sort((a,b)=>{
            let ia = nonExecSeniorityOrder.indexOf(a.name);
            let ib = nonExecSeniorityOrder.indexOf(b.name);
            if(ia === -1) ia = 999;
            if(ib === -1) ib = 999;
            return ia - ib;
        });

        let alert = (["A","B","C"].includes(s) && list.length <= 2) ? " ❗" : "";
        let chips = list.map(obj=>{
            let sel=(selectedName && obj.name===selectedName)?"selected":"";
            let multi=obj.multi?" ❕":"";
            return `<span class="chip ${s} ${sel}">${getFirstName(obj.name)}${multi}</span>`;
        }).join("");

        let activeClass = "";
let current = getCurrentShiftInfo();

if(current && s === current.shift && date === current.date){
    activeClass = "shift-active-box";
}

box.innerHTML += `
<div class="${activeClass}">
    <div class="shift-title">${shiftLabels[s]} (${list.length})${alert}</div>
    ${chips}
</div>`;
    });
}
}

function autoRefreshData(){

    console.log("🔄 Auto refresh triggered");

    updateShiftUrls();

    Promise.all([
        fetchCSV(shiftUrl),
        fetchCSV(shiftUrlNext, true),
        fetchCSV(holidayUrl, true),
        fetchCSV(notesUrl, true),
        fetchCSV(trainingUrl, true),
        fetchCSV(productionPlanUrl, true),
        fetchCSV(productionTargetUrl, true),
        fetchCSV(nonExecUrl),
        fetchCSV(nonExecUrlNext, true),
        fetchCSV(seniorityExecUrl, true),
        fetchCSV(seniorityNonExecUrl, true),
        fetchCSV(alertsUrl, true),
        fetchCSV(imsUrl, true)
    ])

    .then(([
        shiftTextCurrent,
        shiftTextNext,
        holidayText,
        notesText,
        trainingText,
        productionPlanText,
        productionTargetText,
        nonExecTextCurrent,
        nonExecTextNext,
        seniorityExecText,
        seniorityNonExecText,
        alertsText,
        imsText
    ]) => {

        updateHeaderDate();

        loadSeniority(
            seniorityExecText,
            seniorityNonExecText
        );


if(alertsText !== undefined){

    alertsData = parseCSV(alertsText)
        .slice(1)
        .map(row => {

            return {
                from: row[0]?.trim(),
                to: row[1]?.trim(),
                repeat: row[2]?.trim(),
                text: row[3]?.trim()
            };

        })
        .filter(r =>
            r.from &&
            r.to &&
            r.repeat &&
            r.text
        );

}


        const dataCurrent = parseCSV(shiftTextCurrent);
        const dataNext = parseCSV(shiftTextNext);

        data = mergeShiftData(dataCurrent, dataNext);

        header = data[0]?.map(x => x.trim()) || [];



        loadHolidayData(holidayText);

        loadTrainingData(trainingText);


        loadProductionData(
        productionPlanText,
        productionTargetText
        );


        loadNotesData(notesText);

        if (imsText !== undefined && imsText !== null) {
            loadIMSData(imsText);
        }

        const nonExecCurrent = parseCSV(nonExecTextCurrent);
        const nonExecNext = parseCSV(nonExecTextNext);

        nonExecData = mergeShiftData(
            nonExecCurrent,
            nonExecNext
        );

        nonExecHeader =
            nonExecData[0]?.map(x => x.trim()) || [];


        document.getElementById("todayNote").innerHTML =
            getTodayNote();


        renderAlerts();
        updateTrainingHeader();
        renderTraining();

        refresh();
        renderNext7Days();

        if(document.getElementById("datePicker").value){
            renderSelected();
        }

        calcHoliday();

        console.log("✅ Data refreshed successfully");

        const lastUpdatedEl = document.getElementById("lastUpdated");

        if (lastUpdatedEl) {
            const now = new Date();

            const time = now.toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit"
            });

            const date = now.toLocaleDateString([], {
                day: "2-digit",
                month: "short"
            });

            lastUpdatedEl.innerText =
                "Last Sync: " + date + " • " + time;
        }

    })

    .catch(err => {

        console.error("Auto refresh failed:", err);

        const status = document.getElementById("todayNote");

        if(status){
        status.innerText = "";
        }

    });
}


/* ===== DASHBOARD PAGE NAVIGATION ===== */

function navigateToPage(page, addHistory = true) {
    const validPages = [
        "home",
        "shifts",
        "production",
        "training",
        "more",
        "ims",
        "others"
    ];

    if (!validPages.includes(page)) {
        return;
    }

    if (page !== "more") {
        localStorage.setItem("lastDashboardPage", page);
    }

    const targetPage = document.getElementById("page-" + page);

    if (!targetPage) {
        console.error("Dashboard page not found:", page);
        return;
    }

    document.querySelectorAll(".app-page").forEach(function (section) {
        section.classList.toggle("active", section === targetPage);
    });

    const activeTab = page;

    document.querySelectorAll(".bottom-nav .nav-item").forEach(function (item) {
        const isActive = item.dataset.page === activeTab;

        item.classList.toggle("active", isActive);

        if (isActive) {
            item.setAttribute("aria-current", "page");
        } else {
            item.removeAttribute("aria-current");
        }
    });

    revealActiveNavItem();
    updateNavArrows();

    if (addHistory) {
        history.pushState(
            { dashboardPage: page },
            "",
            "#" + page
        );
    }

    window.scrollTo(0, 0);
}

/* ===== HORIZONTAL BOTTOM NAVIGATION ===== */

function updateNavArrows() {
    const scroller = document.getElementById("navScroll");
    const leftArrow = document.getElementById("navArrowLeft");
    const rightArrow = document.getElementById("navArrowRight");

    if (!scroller || !leftArrow || !rightArrow) return;

    const maxScroll = scroller.scrollWidth - scroller.clientWidth;
    const canScroll = maxScroll > 2;

    leftArrow.classList.toggle(
        "is-visible",
        canScroll && scroller.scrollLeft > 2
    );

    rightArrow.classList.toggle(
        "is-visible",
        canScroll && scroller.scrollLeft < maxScroll - 2
    );
}

function revealActiveNavItem() {
    const scroller = document.getElementById("navScroll");
    const activeItem = document.querySelector(
        "#navScroll .nav-item.active"
    );

    if (!scroller || !activeItem) return;

    const itemLeft = activeItem.offsetLeft;
    const itemRight = itemLeft + activeItem.offsetWidth;
    const visibleLeft = scroller.scrollLeft;
    const visibleRight = visibleLeft + scroller.clientWidth;

    if (itemLeft < visibleLeft) {
        scroller.scrollTo({
            left: itemLeft,
            behavior: "smooth"
        });
    } else if (itemRight > visibleRight) {
        scroller.scrollTo({
            left: itemRight - scroller.clientWidth,
            behavior: "smooth"
        });
    }
}

document.addEventListener("DOMContentLoaded", function () {
    const scroller = document.getElementById("navScroll");
    const leftArrow = document.getElementById("navArrowLeft");
    const rightArrow = document.getElementById("navArrowRight");

    if (!scroller || !leftArrow || !rightArrow) return;

    leftArrow.addEventListener("click", function () {
        scroller.scrollBy({
            left: -Math.max(140, scroller.clientWidth * 0.7),
            behavior: "smooth"
        });
    });

    rightArrow.addEventListener("click", function () {
        scroller.scrollBy({
            left: Math.max(140, scroller.clientWidth * 0.7),
            behavior: "smooth"
        });
    });

    scroller.addEventListener("scroll", updateNavArrows);
    window.addEventListener("resize", updateNavArrows);

    updateNavArrows();
});

window.addEventListener("popstate", function () {
    navigateToPage("home", false);
    history.replaceState({ dashboardPage: "home" }, "", "#home");
});

document.addEventListener("DOMContentLoaded", function () {
    const validPages = [
        "home",
        "shifts",
        "production",
        "training",
        "ims",
        "others"
    ];

    const savedPage = localStorage.getItem("lastDashboardPage");
    const initialPage = validPages.includes(savedPage) ? savedPage : "home";

    navigateToPage(initialPage, false);
    history.replaceState(
        { dashboardPage: initialPage },
        "",
        "#" + initialPage
    );
});

