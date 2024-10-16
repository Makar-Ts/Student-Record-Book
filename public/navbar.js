document.getElementById("account_logout").addEventListener("click", function(e) {
    fetch("/api/logout", {
        method: "POST"
    }).then(function(response) {
        if(response.ok) {
            window.location.href = "/";
        } else {
            throw new Error("Failed to log out");
        }
    })
})