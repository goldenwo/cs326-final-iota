function validEntries() {
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;
    const confirmPassword = document.getElementById("confirmPassword").value;

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
    else if (password !== confirmPassword) {
        alert("Passwords don't match");
        return false;
    }
    else {
        return true;
    }
}
window.addEventListener("load", async function () {
    document.getElementById("registerbutton").addEventListener("click", () => {
        if (validEntries()) {
            alert("Successfully registered, please log in");
        }
        else {
            return;
        }
    });
});