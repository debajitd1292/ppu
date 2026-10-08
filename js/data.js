function parseCSV(text){

    if(!text) return [];

    return text
        .split(/\r?\n/)
        .filter(row => row.trim() !== "")
        .map(row => {

            const result = [];
            let current = "";
            let insideQuotes = false;

            for(let i = 0; i < row.length; i++){

                const char = row[i];

                if(char === '"'){
                    insideQuotes = !insideQuotes;
                    continue;
                }

                if((char === "," || char === ";") && !insideQuotes){
                    result.push(current.trim());
                    current = "";
                }else{
                    current += char;
                }
            }

            result.push(current.trim());

            return result;
        });
}

function mergeShiftData(previous, current, next) {

    const months = [
        previous,
        current,
        next
    ].filter(month =>
        month && month.length
    );

    if(!months.length){
        return [];
    }

    /*
       Find the first available month as the base.
       This ensures the app still works even if
       previous or next month CSV is unavailable.
    */

    const base = months[0];

    const merged = [];

    /* ===============================
       HEADER
       =============================== */

    const header = [base[0][0]];

    for(const month of months){

        header.push(
            ...month[0].slice(1)
        );

    }

    merged.push(header);


    /* ===============================
       COLLECT ALL EMPLOYEE NAMES
       =============================== */

    const employeeNames = new Set();

    for(const month of months){

        for(let i = 1; i < month.length; i++){

            const name =
                month[i]?.[0]?.trim();

            if(name){
                employeeNames.add(name);
            }

        }

    }


    /* ===============================
       BUILD EMPLOYEE ROWS
       =============================== */

    for(const name of employeeNames){

        const row = [name];

        for(const month of months){

            const monthRow =
                month.find(r =>
                    r?.[0]?.trim() === name
                );

            if(monthRow){

                row.push(
                    ...monthRow.slice(1)
                );

            }else{

                /*
                   Employee not present in this
                   month's schedule.
                */

                row.push(
                    ...new Array(
                        month[0].length - 1
                    ).fill("")
                );

            }

        }

        merged.push(row);

    }

    return merged;
}

function fetchCSV(url, optional = false){

    return fetch(url, { cache: "no-store" })
        .then(response => {

            if(!response.ok){
                throw new Error("CSV not found: " + url);
            }

            return response.text();
        })
        .catch(err => {

            console.warn("CSV load failed:", url, err);

            if(optional){
                return "";
            }

            throw err;
        });
}
