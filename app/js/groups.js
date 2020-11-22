window.addEventListener("load", async function () {
    // const response = await fetch('/stockInfo', {
    //     method: 'GET',
    //     body: JSON.stringify({
    //         symbol: 'TSLA',
    //     })
    // });
    // const jsonResponse = await response.json();
    // let price = jsonResponse.json().price;
    // let percentchange = jsonResponse.percentchange;

    const usernameResponse = await fetch("/");
    console.log(usernameResponse);
    if (usernameResponse.ok && "username" in usernameResponse) { //if logged in
    const usernameObj = await usernameResponse.json();

    let rankingsbutton = document.getElementById("buttonleft");
    let a_rankings = document.createElement("a");
    a_rankings.classList.add("btn");
    a_rankings.classList.add("btn-primary");
    a_rankings.classList.add("mx-2");
    a_rankings.classList.add("border-0");
    a_rankings.innerHTML = "Rankings";
    a_rankings.href = "rankings.html";
    rankingsbutton.appendChild(a_rankings);

    let groupbutton = document.getElementById("buttonright");
    let a_group = document.createElement("a");
    a_group.classList.add("btn");
    a_group.classList.add("btn-primary");
    a_group.classList.add("mx-2");
    a_group.classList.add("border-0");
    a_group.innerHTML = "Groups";
    a_group.href = "groups.html";
    groupbutton.appendChild(a_group);

    let navBar = document.getElementById("topbar");
    let a_navBar = document.createElement("a");
    a_navBar.classList.add("navbar-brand");
    a_navBar.href = "user.html";
    a_navBar.innerHTML = usernameObj.username;
    navBar.appendChild(a_navBar);
    }
    else {
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