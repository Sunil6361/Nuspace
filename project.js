// Get project ID from URL
const params = new URLSearchParams(window.location.search);
const projectId = params.get("id");

// Fetch project details
fetch(`/project/${projectId}`)
    .then(res => res.json())
    .then(data => {

        if (!data.success) {
            alert("Project not found");
            return;
        }

        const project = data.data;

        document.getElementById("projectTitle").innerText = project.title;
        document.getElementById("projectCategory").innerText = project.category;
        document.getElementById("projectDescription").innerText = project.description;
        document.getElementById("projectLocation").innerText = project.location;
        document.getElementById("projectArea").innerText = project.area;

       document.getElementById("projectImage").src =
    `/uploads/projects/${project.image}`;

    })
    .catch(err => console.log(err));