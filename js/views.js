// ===============================
// DATE & UPCOMING SHIFT VIEWS
// ===============================

async function renderSelected(){

    let val = document.getElementById("datePicker").value;

    if(!val) return;

    let d = new Date(val);

    let formatted = d.toLocaleDateString("en-US", {
        month: "short",
        day: "2-digit",
        year: "numeric"
    });

    let renderDate = formatDate(d);

    document.getElementById("selectedTitle").innerText =
        "Selected Date Shift (" + formatted + ")";


    /* =========================================
       CHECK WHETHER SELECTED DATE IS ALREADY
       LOADED
       ========================================= */

    if(header.indexOf(renderDate) === -1){

        const month =
            String(d.getMonth() + 1).padStart(2, "0");

        const year =
            String(d.getFullYear()).slice(-2);

        const monthKey =
            month + year;


        /* =========================================
           LOAD SELECTED MONTH
           ========================================= */

        const selectedExecUrl =
            baseUrl +
            "exec/shift_exec_" +
            monthKey +
            ".csv?v=" +
            Date.now();

        const selectedNonExecUrl =
            baseUrl +
            "nonexec/shift_nonexec_" +
            monthKey +
            ".csv?v=" +
            Date.now();


        try{

            const [
                selectedExecText,
                selectedNonExecText
            ] = await Promise.all([

                fetchCSV(
                    selectedExecUrl,
                    false
                ),

                fetchCSV(
                    selectedNonExecUrl,
                    true
                )

            ]);


            /* =====================================
               MERGE SELECTED MONTH WITH
               ALREADY LOADED DATA
               ===================================== */

            const selectedExecData =
                parseCSV(selectedExecText);

            if(
                selectedExecData &&
                selectedExecData.length
            ){

                data = mergeShiftData(
                    selectedExecData,
                    data
                );

                header =
                    data[0]?.map(x => x.trim()) || [];
            }


            const selectedNonExecData =
                parseCSV(selectedNonExecText);

            if(
                selectedNonExecData &&
                selectedNonExecData.length
            ){

                nonExecData = mergeShiftData(
                    selectedNonExecData,
                    nonExecData
                );

                nonExecHeader =
                    nonExecData[0]?.map(x => x.trim()) || [];
            }

        }catch(err){

            console.warn(
                "Selected month schedule not available:",
                monthKey,
                err
            );

        }

    }


    /* =========================================
       RENDER SELECTED DATE
       ========================================= */

    render("selected", renderDate);
}



function renderNext7Days(){

    const box = document.getElementById("next7Days");

    if(!box) return;

    if(!header || header.length === 0 || !data || data.length === 0){

        box.innerHTML =
            "<div style='color:#777;font-weight:bold;'>Shift schedule is not available</div>";

        return;
    }

    if(!selectedName){

        box.innerHTML =
            "<div style='color:#777;'>Select name to view shifts</div>";

        return;
    }

    const today = new Date();

    const heading = document.getElementById("shiftCalendarHeading");

    if (heading) {
        heading.textContent = "My Shift Schedule for " +
            today.toLocaleDateString("en-US", {
                month: "long",
                year: "numeric"
            });
    }

    const year = today.getFullYear();
    const month = today.getMonth();
    const todayDate = today.getDate();

    const firstDay = new Date(year, month, 1);
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    // Monday-first calendar
    const startOffset = firstDay.getDay();

    const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

        let html = `
        <div class="calendar-grid">
    `;

    // Weekday headings
    weekdays.forEach(day => {
        html += `<div class="calendar-weekday">${day}</div>`;
    });

    // Empty cells before the first day
    for(let i = 0; i < startOffset; i++){
        html += `<div class="calendar-empty"></div>`;
    }

    // All dates in the current month
    for(let day = 1; day <= daysInMonth; day++){

        const d = new Date(year, month, day);

        const dd = String(day).padStart(2, "0");
        const mm = String(month + 1).padStart(2, "0");
        const dateStr = `${dd}-${mm}-${year}`;

        const rawShift = getShift(dateStr, selectedName) || "-";

        let shiftClass;

        if(rawShift === "-"){
            shiftClass = "NA";
        }else if(rawShift === "OFF"){
            shiftClass = "OFF";
        }else{
            shiftClass = rawShift.match(/[A-Z]/)?.[0] || "";
        }

        const isToday = day === todayDate;

        html += `
            <div class="calendar-day ${isToday ? "calendar-today" : ""}">
                <div class="calendar-date">${day}</div>
                <div class="calendar-shift">
                    <span class="day-shift ${shiftClass}">${rawShift}</span>
                </div>
            </div>
        `;
    }

    html += `
        </div>
    `;

    box.innerHTML = html;
}

