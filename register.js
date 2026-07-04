fetch("http://localhost:5000/check-admin")
.then(res => res.json())
.then(data => {

    if(data.total > 0){

        alert("Registration is disabled. Please login.");

        window.location.href = "login.html";

    }

});  