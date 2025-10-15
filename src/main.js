

const apiBaseUrl = "https://mentalhealthfunctions.azurewebsites.net/api";
const uploadAttachmentEndpoint = `${apiBaseUrl}/uploadAttachment`;
const fetchDataEndpoint = `${apiBaseUrl}/fetchData`;
const bookAppointmentEndpoint = `${apiBaseUrl}/sendConfirmationEmail`;

/**
 * 
 * @param {File} 
 */
async function uploadFile(file) {
    const formData = new FormData();
    formData.append("file", file);

    try {
        const response = await fetch(uploadAttachmentEndpoint, {
            method: "POST",
            body: formData,
        });

        if (!response.ok) {
            throw new Error("Failed to upload file");
        }

        const fileUrl = await response.text();
        console.log("File uploaded successfully:", fileUrl);
        alert(`Fichier téléchargé avec succès! Accédez-y ici: ${fileUrl}`);
    } catch (error) {
        console.error("Error uploading file:", error);
        alert("Erreur lors du téléchargement du fichier. Veuillez réessayer.");
    }
}

/**
 * 
 * @param {number} 
 * @param {string} 
 */
async function fetchAvailability(therapistId, date) {
    const slotsList = document.getElementById("slotsList");
    const timeSlotDropdown = document.getElementById("timeSlot");
    const loader = document.getElementById("loadingIndicator");


    slotsList.innerHTML = "";
    timeSlotDropdown.innerHTML = "<option value=''>Sélectionnez une disponibilité</option>";

    loader.style.display = "block";


    const url = `${fetchDataEndpoint}?therapist_id=${therapistId}&date=${date}`;

    try {
        const response = await fetch(url, {
            method: "GET",
        });

        if (!response.ok) {
            if (response.status === 404) {
                slotsList.innerHTML = "<li>Aucune disponibilité trouvée.</li>";
            } else {
                throw new Error("Impossible de récupérer les disponibilités.");
            }
            return;
        }

        const availability = await response.json();
        console.log("Disponibilités récupérées avec succès :", availability);

        if (availability.length === 0) {
            slotsList.innerHTML = "<li>Aucune disponibilité trouvée.</li>";
            return;
        }


        availability.forEach((slot) => {
            const listItem = document.createElement("li");
            listItem.textContent = `Début : ${slot.start_time}, Fin : ${slot.end_time}`;
            slotsList.appendChild(listItem);

            const option = document.createElement("option");
            option.value = slot.start_time;
            option.textContent = `${slot.start_time} - ${slot.end_time}`;
            timeSlotDropdown.appendChild(option);
        });
    } catch (error) {
        console.error("Error fetching availability:", error);
        alert("Erreur lors de la récupération des disponibilités. Veuillez réessayer.");
    } finally {
        loader.style.display = "none";
    }
}

async function bookAppointment() {
    const therapistSelect = document.getElementById("therapistSelect");
    const dateInput = document.getElementById("appointmentDate");
    const nameInput = document.getElementById("name");
    const emailInput = document.getElementById("email");
    const timeSlot = document.getElementById("timeSlot").value;

    const therapist = therapistSelect.options[therapistSelect.selectedIndex].text;
    const date = dateInput.value;
    const name = nameInput.value;
    const email = emailInput.value;

    if (!therapist || !date || !name || !email || !timeSlot) {
        alert("Veuillez remplir tous les champs requis.");
        return;
    }

    const payload = {
        therapist: therapist,
        date: date,
        name: name,
        email: email,
        time: timeSlot,
    };

    try {
        const response = await fetch(bookAppointmentEndpoint, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
        });

        if (!response.ok) {
            throw new Error("Failed to book appointment or send confirmation email");
        }

        alert("Rendez-vous réservé avec succès ! Un email de confirmation a été envoyé.");
    } catch (error) {
        console.error("Error booking appointment:", error);
        alert("Erreur lors de la réservation du rendez-vous. Veuillez réessayer.");
    }
}

function handleFileUpload() {
    const fileInput = document.getElementById("fileInput");
    const file = fileInput.files[0];
    if (file) {
        uploadFile(file);
    } else {
        alert("Veuillez sélectionner un fichier à télécharger.");
    }
}

function handleFetchAvailability() {
    const therapistSelect = document.getElementById("therapistSelect");
    const dateInput = document.getElementById("appointmentDate");

    const therapistId = parseInt(therapistSelect.value, 10);
    const date = dateInput.value;

    if (!therapistId || !date) {
        alert("Veuillez sélectionner un thérapeute et une date.");
        return;
    }

    fetchAvailability(therapistId, date);
}


document.getElementById("uploadButton").addEventListener("click", handleFileUpload);
document.getElementById("getSlotsButton").addEventListener("click", handleFetchAvailability);
document.getElementById("bookButton").addEventListener("click", bookAppointment);
