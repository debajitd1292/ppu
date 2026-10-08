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

    let [d,m,y] = dateStr.split("-");
    let day = parseInt(d);

    let suffix = "th";

    if(day === 1 || day === 21 || day === 31)
        suffix = "st";
    else if(day === 2 || day === 22)
        suffix = "nd";
    else if(day === 3 || day === 23)
        suffix = "rd";

    const months = [
        "Jan","Feb","Mar","Apr","May","Jun",
        "Jul","Aug","Sep","Oct","Nov","Dec"
    ];

    return day + suffix + " " + months[parseInt(m) - 1];
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

    ghElem.innerText =
        nextGH
            ? formatHolidayDate(nextGH.date) +
              (nextGH.name ? " (" + nextGH.name + ")" : "")
            : "—";

    }


    if(rhElem){

    rhElem.innerText =
        nextRH
            ? formatHolidayDate(nextRH.date) +
              (nextRH.name ? " (" + nextRH.name + ")" : "")
            : "—";

    }

}
