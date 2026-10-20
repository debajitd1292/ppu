let holidays = [];

function loadHolidayData(holidayText){

    if(!holidayText){
        holidays = [];
        return;
    }

    const holidayRows = parseCSV(holidayText);

    holidays = holidayRows
        .slice(1)
        .map(r => {
            return {
                date: r[0]?.trim(),
                type: r[1]?.trim(),
                name: r[2]?.trim()
            };
        })
        .filter(r => r.date);
}


function formatHolidayDate(dateStr){

    let [d, m, y] = dateStr.split("-");

    const months = [
        "Jan", "Feb", "Mar", "Apr", "May", "Jun",
        "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
    ];

    return d + "-" + months[parseInt(m, 10) - 1] + "-" + y;
}


function isSpecialDay(){

    let today = new Date();

    let day = today.getDay(); // 0=Sun, 6=Sat
    let date = today.getDate();

    /* Sunday */

    if(day === 0)
        return true;


    /* 2nd & 4th Saturday */

    if(day === 6){

        let week = Math.ceil(date / 7);

        if(week === 2 || week === 4)
            return true;
    }

    /* GH check */

    let todayStr = formatDate(today);

    let isGH = holidays.some(h =>
        h.date === todayStr &&
        h.type === "GH"
    );


    /* RH check */

    let isRH = holidays.some(h =>
        h.date === todayStr &&
        h.type === "RH"
    );


    if(isGH || isRH)
        return true;


    return false;
}

function updateTodayReason(){
    const reasonElem = document.getElementById("todayReason");
    if(!reasonElem) return;

    const today = new Date();
    const day = today.getDay();
    const date = today.getDate();
    const todayStr = formatDate(today);

    let reason = "";

    // Check GH/RH holiday first
    const holiday = holidays.find(h => h.date === todayStr);

    if(holiday && holiday.type === "GH"){
        reason = `GH - ${holiday.name}`;
    } else if(holiday && holiday.type === "RH"){
        reason = `RH - ${holiday.name}`;
    } else if(day === 6){
        const week = Math.ceil(date / 7);

        if(week === 2){
            reason = "2nd Saturday";
        } else if(week === 4){
            reason = "4th Saturday";
        }
    }

    reasonElem.textContent = reason ? `(${reason})` : "";
}


function calcHoliday(){

    let today = new Date();

    today.setHours(0,0,0,0);


    let nextGH = null;
    let nextRH = null;


    holidays.forEach(h => {

        if(!h.date)
            return;


        let [d,m,y] = h.date.split("-");


        let hd = new Date(
            parseInt(y),
            parseInt(m) - 1,
            parseInt(d)
        );


        hd.setHours(0,0,0,0);


        // Ignore today and past dates

        if(hd <= today)
            return;


        // Find nearest GH

        if(h.type === "GH"){

            if(!nextGH || hd < nextGH.dateObj){

                nextGH = {
                    ...h,
                    dateObj: hd
                };

            }
        }


        // Find nearest RH

        if(h.type === "RH"){

            if(!nextRH || hd < nextRH.dateObj){

                nextRH = {
                    ...h,
                    dateObj: hd
                };

            }
        }

    });


    const ghElem =
        document.getElementById("nextGH");

    const rhElem =
        document.getElementById("nextRH");


    if(ghElem){

    ghElem.innerHTML = nextGH
        ? `<div class="holiday-date-main">${formatHolidayDate(nextGH.date)}</div>
           <div class="holiday-name">${nextGH.name || ""}</div>`
        : "—";
    }

    if(rhElem){

    rhElem.innerHTML = nextRH
    ? `<div class="holiday-date-main">${formatHolidayDate(nextRH.date)}</div>
       <div class="holiday-name">${nextRH.name || ""}</div>`
    : "—";
    }
}
