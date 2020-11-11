function validEntries() {
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;
 
    if (username === null || username === "") {
        alert("Please enter a username");
        return false;
    }
    else if (username.indexOf(" ") >= 0) {
        alert("Username cannot contain any spaces");
        return false;
    }
    else if (password === null || password === "") {
        alert("Please enter a password");
        return false;
    }
    else if (password.indexOf(" ") >= 0) {
        alert("Password cannot contain any spaces");
        return false;
    }
    else {
        return true;
    }
}
 
async function getUser() {
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;
 
    const response = await fetch('/login', {
        method: 'POST',
        body: JSON.stringify({
            name: username,
            password: password,
        })
    });
}
 
window.addEventListener("load", async function () {
    document.getElementById("loginbutton").addEventListener("click", () => {
        if (validEntries()) {
            getUser();
        } else {
            return;
        }
    });
});