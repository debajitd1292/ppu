function initTheme(){

    let toggle = document.getElementById("toggleCheckbox");

    if(!toggle) return;

    let savedTheme =
        localStorage.getItem("theme");


    // Load saved theme

    if(savedTheme === "dark"){

        document.body.classList.add("dark");
        toggle.checked = true;

    }


    // Toggle event

    toggle.addEventListener("change", function(){

        if(this.checked){

            document.body.classList.add("dark");

            localStorage.setItem(
                "theme",
                "dark"
            );

        }else{

            document.body.classList.remove("dark");

            localStorage.setItem(
                "theme",
                "light"
            );

        }

    });

}
