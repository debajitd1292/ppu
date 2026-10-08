function updateHeaderDate(){

    let dateElem = document.getElementById("todayDate");
    if(!dateElem) return;

    let now = new Date();

    dateElem.innerText = now.toDateString();

    if(isSpecialDay()){
        dateElem.style.color = "#ffd600";
        dateElem.style.fontWeight = "600";
    } else {
        dateElem.style.color = "";
        dateElem.style.fontWeight = "";
    }
}


function getCurrentShiftInfo() {

    let now = new Date();

    let hours = now.getHours();
    let minutes = now.getMinutes();

    let currentDate = formatDate(now);

    // previous date
    let prev = new Date(now);
    prev.setDate(prev.getDate() - 1);
    let prevDate = formatDate(prev);

    // A Shift: 06:00–14:00
    if(hours >= 6 && hours < 14){
        return { shift: "A", date: currentDate };
    }

    // B Shift: 14:00–22:00
    if(hours >= 14 && hours < 22){
        return { shift: "B", date: currentDate };
    }

    // C Shift split logic
    if(hours >= 22){
        // same day C
        return { shift: "C", date: currentDate };
    }

    if(hours < 6){
        // 🔴 IMPORTANT: after midnight → previous date C shift
        return { shift: "C", date: prevDate };
    }

    return null;
}
