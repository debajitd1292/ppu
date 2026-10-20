function updateHeaderDate(){

    let dateElem = document.getElementById("todayDate");
    if(!dateElem) return;

    let now = new Date();

    const weekday = now.toLocaleDateString("en-GB", {
        weekday: "short"
    });

    const formattedDate = now.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric"
    });

dateElem.innerHTML = `
    <div class="header-date">${weekday}, ${formattedDate}</div>
    `;

    const dateText = dateElem.querySelector(".header-date");

    if (dateText) {
    if (isSpecialDay()) {
        dateText.style.color = document.body.classList.contains("dark")
            ? "#FBBF24"
            : "#B45309";
    } else {
        dateText.style.color = "";
    }
  }
}


function getCurrentShiftInfo() {

    let now = new Date();

    let hours = now.getHours();

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
