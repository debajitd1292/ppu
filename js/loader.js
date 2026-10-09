// ===============================
// INITIAL DATA LOADER
// ===============================

updateShiftUrls();

Promise.all([
    fetchCSV(shiftUrlPrev, true),
    fetch(shiftUrl).then(r => r.text()),
    fetchCSV(shiftUrlNext, true),
    fetchCSV(holidayUrl, true),
    fetch(notesUrl).then(r => r.text()),
    fetch(trainingUrl).then(r => r.text()),
    fetch(productionPlanUrl).then(r => r.text()),
    fetch(productionTargetUrl).then(r => r.text()),
    fetchCSV(nonExecUrlPrev, true),
    fetch(nonExecUrl).then(r => r.text()),
    fetch(nonExecUrlNext).then(r => r.text()),
    fetch(seniorityExecUrl).then(r => r.text()),
    fetch(seniorityNonExecUrl).then(r => r.text())
])
.then(([
    shiftTextPrev,
    shiftTextCurrent,
    shiftTextNext,
    holidayText,
    notesText,
    trainingText,
    productionPlanText,
    productionTargetText,
    nonExecTextPrev,
    nonExecTextCurrent,
    nonExecTextNext,
    seniorityExecText,
    seniorityNonExecText
]) => {

    if(!shiftTextCurrent || shiftTextCurrent.trim() === ""){

        document.getElementById("today").innerHTML =
            "<div style='color:red;font-weight:bold;'>SHIFT DATA NOT LOADED</div>";

        return;
    }

    if(!holidayText) holidayText = "";
    if(!notesText) notesText = "";
    if(!trainingText) trainingText = "";
    if(!productionPlanText) productionPlanText = "";
    if(!productionTargetText) productionTargetText = "";
    if(!nonExecTextCurrent) nonExecTextCurrent = "";
    if(!nonExecTextNext) nonExecTextNext = "";
    if(!seniorityExecText) seniorityExecText = "";
    if(!seniorityNonExecText) seniorityNonExecText = "";

    loadSeniority(
        seniorityExecText,
        seniorityNonExecText
    );

    const dataPrev = parseCSV(shiftTextPrev);
    const dataCurrent = parseCSV(shiftTextCurrent);
    const dataNext = parseCSV(shiftTextNext);

    data = mergeShiftData(
        dataPrev,
        dataCurrent,
        dataNext
    );

    header = data[0].map(x => x.trim());

    const nonExecPrev = parseCSV(nonExecTextPrev);
    const nonExecCurrent = parseCSV(nonExecTextCurrent);
    const nonExecNext = parseCSV(nonExecTextNext);

    nonExecData = mergeShiftData(
        nonExecPrev,
        nonExecCurrent,
        nonExecNext
    );

    nonExecHeader =
        nonExecData[0]?.map(x => x.trim()) || [];

    if(!header || header.length < 2){

        console.warn(
            "Shift CSV not available for current period"
        );

        data = [];
        header = [];
    }

    selectedName = "";

    loadHolidayData(holidayText);

    loadTrainingData(trainingText);

    loadNotesData(notesText);

    loadProductionData(
        productionPlanText,
        productionTargetText
    );

    init();

    loadAlerts();

    isDataLoaded = true;

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

    console.error(
        "Data load failed:",
        err
    );

    document.getElementById("today").innerHTML =
        "<div style='color:red;font-weight:bold;'>Data load failed (Offline)</div>";
});
