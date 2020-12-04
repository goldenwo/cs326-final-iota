window.addEventListener("load", async function () {
    const usernameResponse = await fetch("/");
    console.log(usernameResponse);
    if (usernameResponse.ok && "username" in usernameResponse) { //if logged in
        const usernameObj = await usernameResponse.json();
        //show user button
        let navBar = document.getElementById("topbar");
        let a_navBar = document.createElement("a");
        a_navBar.classList.add("navbar-brand");
        a_navBar.href = "user.html";
        a_navBar.innerHTML = usernameObj.username;
        navBar.appendChild(a_navBar);
    }
    else { //show login/signupbuttons
        let loginbutton = document.getElementById("buttonleft");
        let a_login = document.createElement("a");
        a_login.classList.add("btn");
        a_login.classList.add("btn-outline-secondary");
        a_login.classList.add("mx-2");
        a_login.innerHTML = "Log In";
        a_login.href = "login.html";
        loginbutton.appendChild(a_login);

        let registerbutton = document.getElementById("buttonright");
        let a_register = document.createElement("a");
        a_register.classList.add("btn");
        a_register.classList.add("btn-primary");
        a_register.classList.add("mx-2");
        a_register.classList.add("border-0");
        a_register.innerHTML = "Sign Up";
        a_register.href = "register.html";
        registerbutton.appendChild(a_register);
    }
});