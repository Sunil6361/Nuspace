// ================= SHOW / HIDE SECTIONS =================

function showSection(id){

    alert("Clicked : " + id);

    document.querySelectorAll(".content-section").forEach(function(section){
        section.style.display = "none";
    });

    const selected = document.getElementById(id);

    if(selected){
        selected.style.display = "block";
        selected.scrollIntoView({behavior:"smooth"});
    }

    if(id === "contacts"){
        loadContacts();
    }
    if(id === "about"){
    loadAbout();
}

}


// ================= LOAD CONTACT DATA =================

function loadContacts() {

    fetch("http://localhost:5000/contacts")
        .then(response => response.json())
        .then(data => {

            const tbody = document.querySelector("#contactTable tbody");

            tbody.innerHTML = "";

            data.forEach(contact => {

                tbody.innerHTML += `
                    <tr>
                        <td>${contact.id}</td>
                        <td>${contact.name}</td>
                        <td>${contact.email}</td>
                        <td>${contact.mobile}</td>
                        <td>${contact.message}</td>
                        <td>
                            <button onclick="deleteContact(${contact.id})">
                                Delete
                            </button>
                        </td>
                    </tr>
                `;

            });

        });

}


// ================= DELETE CONTACT =================

function deleteContact(id) {

    if(confirm("Are you sure you want to delete this inquiry?")){

        fetch(`http://localhost:5000/contacts/${id}`, {
            method: "DELETE"
        })
        .then(response => response.json())
        .then(data => {

            alert(data.message);

            loadContacts();

        });

    }

}

// ================= GALLERY UPLOAD =================

const galleryForm = document.getElementById("galleryForm");

if(galleryForm){

    galleryForm.addEventListener("submit", function(e){

        e.preventDefault();

       const files = document.getElementById("galleryImage").files;

if (files.length === 0) {
    alert("Please select one or more images");
    return;
}

       const formData = new FormData();

for (let i = 0; i < files.length; i++) {
    formData.append("image", files[i]);
}

        fetch("http://localhost:5000/gallery",{
            method:"POST",
            body:formData
        })
        .then(res=>res.json())
        .then(data=>{

            document.getElementById("galleryMessage").innerHTML =
                "<p style='color:green;'>" + data.message + "</p>";

            galleryForm.reset();

        })
        .catch(err=>{

            console.log(err);

            document.getElementById("galleryMessage").innerHTML =
                "<p style='color:red;'>Upload Failed</p>";

        });

    });

}

function loadGallery() {

    fetch("http://localhost:5000/gallery")
        .then(res => res.json())
        .then(data => {

            let html = "";

            data.data.forEach(img => {

                html += `
                    <div class="image-card">
                        <img src="http://localhost:5000/uploads/gallery/${img.image}" width="250">

                        <br><br>

                        <button onclick="deleteImage(${img.id})">
                            Delete
                        </button>
                    </div>
                `;

            });

            document.getElementById("adminGalleryContainer").innerHTML = html;

        })
        .catch(err => console.error(err));

}

loadGallery();

function deleteImage(id) {

    if (!confirm("Are you sure you want to delete this image?")) {
        return;
    }

    fetch(`http://localhost:5000/gallery/${id}`, {
        method: "DELETE"
    })
    .then(res => res.json())
    .then(data => {

        alert(data.message);

        loadGallery(); // Refresh gallery

    })
    .catch(err => console.error(err));

}


// ================= CHANGE PASSWORD =================

const changePasswordForm = document.getElementById("changePasswordForm");

if (changePasswordForm) {

    changePasswordForm.addEventListener("submit", function (e) {

        e.preventDefault();

        const email = localStorage.getItem("adminEmail");

        const currentPassword = document.getElementById("currentPassword").value;
        const newPassword = document.getElementById("newPassword").value;
        const confirmPassword = document.getElementById("confirmPassword").value;

        if (newPassword !== confirmPassword) {
            alert("New Password and Confirm Password do not match");
            return;
        }

        fetch("http://localhost:5000/change-password", {

            method: "PUT",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                email,
                currentPassword,
                newPassword
            })

        })
        .then(res => res.json())
        .then(data => {

            document.getElementById("passwordMessage").innerHTML =
                "<p>" + data.message + "</p>";

            if (data.success) {
                changePasswordForm.reset();
            }

        })
        .catch(err => console.log(err));

    });

}

// ================= LOAD ABOUT DATA =================

function loadAbout() {

    fetch("http://localhost:5000/about")

    .then(res => res.json())

    .then(data => {

        document.getElementById("aboutTitle").value =
            data.data.title;

        document.getElementById("aboutDescription").value =
            data.data.description;

        if(data.data.image){

            document.getElementById("aboutPreview").src =
            "http://localhost:5000/uploads/about/" + data.data.image;

            document.getElementById("aboutPreview").style.display =
            "block";

        }

    })

    .catch(err => console.log(err));

}
// ================= UPDATE ABOUT =================

const aboutForm = document.getElementById("aboutForm");

if (aboutForm) {

    aboutForm.addEventListener("submit", function (e) {

        e.preventDefault();

        const formData = new FormData();

        formData.append(
            "title",
            document.getElementById("aboutTitle").value
        );

        formData.append(
            "description",
            document.getElementById("aboutDescription").value
        );

        const image =
            document.getElementById("aboutImage").files[0];

        if (image) {
            formData.append("image", image);
        }

        fetch("http://localhost:5000/about", {

            method: "PUT",

            body: formData

        })
        .then(res => res.json())
        .then(data => {

            document.getElementById("aboutMessage").innerHTML =
                "<p style='color:green;'>" + data.message + "</p>";

            loadAbout();

        })
        .catch(err => console.log(err));

    });

}

// ================= ADD PROJECT =================

const projectForm = document.getElementById("projectForm");

if(projectForm){

projectForm.addEventListener("submit",function(e){

e.preventDefault();

const formData = new FormData();

formData.append(
"image",
document.getElementById("projectImage").files[0]
);

formData.append(
"title",
document.getElementById("projectTitle").value
);

formData.append(
"category",
document.getElementById("projectCategory").value
);

formData.append(
"description",
document.getElementById("projectDescription").value
);

fetch("http://localhost:5000/projects",{

method:"POST",

body:formData

})

.then(res=>res.json())

.then(data=>{

document.getElementById("projectMessage").innerHTML=

"<p style='color:green;'>"+data.message+"</p>";

projectForm.reset();

loadProjects();  

})

.catch(err=>console.log(err));

});

}

// ================= LOAD PROJECTS =================

function loadProjects(){
      console.log("loadProjects called");


    fetch("http://localhost:5000/projects")

    .then(res => res.json())

    .then(data => {
        console.log(data);

        let html = "";

        data.data.forEach(project => {
            console.log(project);

            html += `
                <div class="project-card">

                    <img src="http://localhost:5000/uploads/projects/${project.image}"
                         width="250">

                    <h3>${project.title}</h3>

                    <p><b>Category:</b> ${project.category}</p>

                    <p>${project.description}</p>

                    <button onclick="deleteProject(${project.id})">
                        Delete
                    </button>

                    <hr>

                </div>
            `;

        });

        document.getElementById("projectContainer").innerHTML = html;

    })

    .catch(err => console.log(err));

}

loadProjects();

// ================= DELETE PROJECT =================

function deleteProject(id) {

    if (!confirm("Are you sure you want to delete this project?")) {
        return;
    }

    fetch(`http://localhost:5000/projects/${id}`, {

        method: "DELETE"

    })

    .then(res => res.json())

    .then(data => {

        alert(data.message);

        loadProjects();

    })

    .catch(err => console.log(err));

}