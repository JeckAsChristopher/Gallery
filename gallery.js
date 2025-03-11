const socket = io("https://median-solomon-participating-acoustic.trycloudflare.com/");

async function uploadFile() {
    const fileInput = document.getElementById("fileInput");
    if (!fileInput.files.length) return alert("Select a file!");

    const formData = new FormData();
    formData.append("file", fileInput.files[0]);

    const response = await fetch("https://median-solomon-participating-acoustic.trycloudflare.com/upload", {
        method: "POST",
        body: formData
    });

    if (response.ok) {
        alert("Uploaded!");
        // Emit event to notify server about new file
        const fileName = fileInput.files[0].name;
        socket.emit("newFile", fileName);  // Emit file name to server
        fileInput.value = "";  // Reset file input
        document.getElementById("fileName").style.display = "none";  // Hide the file name
    } else {
        alert("Upload failed!");
    }
}

async function loadGallery() {
    document.getElementById("images").innerHTML = "";
    document.getElementById("videos").innerHTML = "";
    document.getElementById("music").innerHTML = "";

    const response = await fetch("https://median-solomon-participating-acoustic.trycloudflare.com/files");
    const files = await response.json();

    files.forEach(file => {
        addFileToGallery(file);
    });

    // Check for empty sections
    checkNoContent("videos");
    checkNoContent("music");
    checkNoContent("images");
}

function addFileToGallery(file) {
    const ext = file.split(".").pop();
    const url = `https://median-solomon-participating-acoustic.trycloudflare.com/uploads/${file}`;

    let element;
    if (["jpg", "jpeg", "png"].includes(ext)) {
        element = `<img src="${url}" alt="Image">`;
        document.getElementById("images").innerHTML += element;
    } else if (ext === "mp4") {
        element = `<video controls><source src="${url}" type="video/mp4"></video>`;
        document.getElementById("videos").innerHTML += element;
    } else if (["mp3", "m4a"].includes(ext)) {
        element = `<audio controls><source src="${url}" type="audio/mpeg"></audio>`;
        document.getElementById("music").innerHTML += element;
    }
}

// Check if a section has no content and display a message
function checkNoContent(sectionId) {
    const container = document.getElementById(sectionId);
    const noContentMessage = document.querySelector(`.${sectionId}-no-content`);

    if (container.children.length === 0) {
        // Only show the message if it doesn't exist
        if (!noContentMessage) {
            const message = document.createElement("p");
            message.textContent = `No ${sectionId.charAt(0).toUpperCase() + sectionId.slice(1)} Has Been Displayed`;
            message.classList.add(`${sectionId}-no-content`);
            container.appendChild(message);
        }
    } else {
        // Remove the "No Content" message if content is present
        if (noContentMessage) {
            noContentMessage.remove();
        }
    }
}

// Load gallery on page load
loadGallery();

// Listen for real-time file uploads
socket.on("newFile", (file) => {
    addFileToGallery(file);
    // Recheck for no content in each section
    checkNoContent("videos");
    checkNoContent("music");
    checkNoContent("images");
});

// Show file name when a file is selected
document.getElementById("fileInput").addEventListener("change", function () {
    const fileNameSpan = document.getElementById("fileName");

    if (this.files.length > 0) {
        fileNameSpan.textContent = this.files[0].name;
        fileNameSpan.style.display = "block"; // Show file name
    } else {
        fileNameSpan.style.display = "none"; // Hide if no file is chosen
    }
});