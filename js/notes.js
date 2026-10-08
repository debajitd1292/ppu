let notes = [];


function loadNotesData(notesText){

    if(!notesText){
        notes = [];
        return;
    }

    const noteRows = parseCSV(notesText);

    notes = noteRows
        .slice(1)
        .map(r => {
            return {
                date: r[0]?.trim(),
                type: r[1]?.trim(),
                name: r[2]?.trim(),
                message: r[3]?.trim()
            };
        })
        .filter(r => r.date);
}


function getTodayNote(){

    let today = new Date();

    let key =
        ("0" + today.getDate()).slice(-2) +
        "-" +
        ("0" + (today.getMonth() + 1)).slice(-2);


    let todaysNotes =
        notes.filter(n => n.date === key);


    if(todaysNotes.length === 0)
        return "";


    return todaysNotes.map(n => {

        if(n.type === "BIRTHDAY"){
            return `Happy Birthday ${n.name} 🎂`;
        }


        if(n.type === "REPUBLIC DAY"){
            return `${n.message} 🇮🇳`;
        }


        if(n.type === "INDEPENDENCE DAY"){
            return `${n.message} 🇮🇳`;
        }


        if(n.type === "FOUNDATION DAY"){
            return `${n.message} 🎉`;
        }


        if(n.type === "NEW YEAR"){
            return `${n.message} 🎉`;
        }


        return n.message;

    }).join("<br>");
}
