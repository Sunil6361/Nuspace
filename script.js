document.getElementById("contactForm").addEventListener("submit", async function (e) {

    e.preventDefault();

    const data = {
        name: document.getElementById("name").value,
        email: document.getElementById("email").value,
        mobile: document.getElementById("mobile").value,
        message: document.getElementById("message").value
    };

    try {
        

        const response = await fetch("http://localhost:5000/contact", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(data)
        });

        const result = await response.json();

        alert(result.message);

        document.getElementById("contactForm").reset();

    } catch (error) {

        console.error(error);
        alert("Something went wrong!");
    }

});



function loadWebsiteGallery() {

    fetch("http://localhost:5000/gallery")
        .then(res => res.json())
        .then(data => {

            let topHtml = "";
            let bottomHtml = "";

            data.data.forEach((img, index) => {

                const imageTag = `
                    <img src="http://localhost:5000/uploads/gallery/${img.image}" alt="Gallery Image">
                `;

                if (index % 2 === 0) {
                    topHtml += imageTag;
                } else {
                    bottomHtml += imageTag;
                }

            });

            // Duplicate images for infinite scrolling
            topHtml += topHtml;
            bottomHtml += bottomHtml;

            document.getElementById("topGalleryTrack").innerHTML = topHtml;
            document.getElementById("bottomGalleryTrack").innerHTML = bottomHtml;

        })
        .catch(err => console.log(err));

}

loadWebsiteGallery();

// ================= LOAD ABOUT =================

function loadAboutWebsite(){

    fetch("http://localhost:5000/about")

    .then(res=>res.json())

    .then(data=>{

        document.getElementById("aboutHeading").innerHTML =
        data.data.title;

        document.getElementById("aboutText").innerHTML =
        data.data.description;

        if(data.data.image){

            document.getElementById("aboutImageDisplay").src =
            "http://localhost:5000/uploads/about/" +
            data.data.image;

            document.getElementById("aboutImageDisplay").style.display =
            "block";

        }

    })

    .catch(err=>console.log(err));

}

loadAboutWebsite();

// ================= LOAD WEBSITE PROJECTS =================

function loadWebsiteProjects() {

    fetch("http://localhost:5000/projects")

    .then(res => res.json())

    .then(data => {

        let html = "";

        data.data.forEach(project => {

           html += `
    <div class="project-box">

        <img src="http://localhost:5000/uploads/projects/${project.image}" alt="${project.title}">

        <div class="project-content">

            <h3>${project.title}</h3>

            <span class="project-category">${project.category}</span>

            <p>${project.description}</p>
         <button class="project-btn"
onclick="window.location.href='project.html?id=${project.id}'">
    View Project
</button>

        </div>

    </div>
`;

        });

        document.getElementById("projectContainer").innerHTML = html;

    })

    .catch(err => console.log(err));

}

loadWebsiteProjects();