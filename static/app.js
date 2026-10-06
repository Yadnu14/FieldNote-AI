let currentMission = null;
let selectedPhoto = null;


const selections = {
    time: "20 minutes",
    energy: "medium",
    setting: "neighborhood"
};


/* -----------------------------------------
   SCREEN MANAGEMENT
----------------------------------------- */

function showScreen(screenId) {

    document.querySelectorAll(".screen").forEach(screen => {
        screen.classList.remove("active");
    });

    const target = document.getElementById(screenId);

    if (target) {
        target.classList.add("active");
    }

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}


/* -----------------------------------------
   CHOICE BUTTONS
----------------------------------------- */

function setupChoices(groupId, key) {

    const group = document.getElementById(groupId);

    if (!group) {
        return;
    }

    group.querySelectorAll("button").forEach(button => {

        button.addEventListener("click", () => {

            group.querySelectorAll("button").forEach(btn => {
                btn.classList.remove("selected");
            });

            button.classList.add("selected");

            selections[key] = button.dataset.value;
        });
    });
}


setupChoices(
    "timeChoices",
    "time"
);

setupChoices(
    "energyChoices",
    "energy"
);

setupChoices(
    "settingChoices",
    "setting"
);


/* -----------------------------------------
   CREATE OUTDOOR MISSION
----------------------------------------- */

async function createMission() {

    showScreen("loading");

    try {

        const response = await fetch(
            "/api/create-mission",
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify(selections)
            }
        );

        const data = await response.json();

        if (!response.ok || !data.success) {

            throw new Error(
                data.error ||
                "Failed to create mission."
            );
        }

        const mission = data.mission;

        currentMission = mission;

        document.getElementById(
            "missionTitle"
        ).textContent = mission.title;

        document.getElementById(
            "missionText"
        ).textContent = mission.mission;

        document.getElementById(
            "observation1"
        ).textContent =
            mission.observations[0];

        document.getElementById(
            "observation2"
        ).textContent =
            mission.observations[1];

        document.getElementById(
            "observation3"
        ).textContent =
            mission.observations[2];

        document.getElementById(
            "missionClosing"
        ).textContent =
            mission.closing;

        showScreen("mission");

    } catch (error) {

        console.error(
            "Mission error:",
            error
        );

        alert(
            "Couldn't create your mission.\n\n" +
            "Make sure Ollama is running and " +
            "Gemma 3:4b is available."
        );

        showScreen("builder");
    }
}


/* -----------------------------------------
   SCREEN EXIT MODE
----------------------------------------- */

function startOutside() {

    showScreen("outside");
}


/* -----------------------------------------
   PHOTO SELECTION
----------------------------------------- */

const photoInput =
    document.querySelector(
        '.photo-box input[type="file"]'
    );


if (photoInput) {

    photoInput.addEventListener(
        "change",
        handlePhotoSelection
    );
}


function handlePhotoSelection(event) {

    const file =
        event.target.files[0];

    if (!file) {
        return;
    }

    selectedPhoto = file;

    const photoBox =
        document.querySelector(".photo-box");

    if (!photoBox) {
        return;
    }

    const reader =
        new FileReader();

    reader.onload = function(event) {

        photoBox.style.backgroundImage =
            `url("${event.target.result}")`;

        photoBox.style.backgroundSize =
            "cover";

        photoBox.style.backgroundPosition =
            "center";

        photoBox.innerHTML = `
            <div class="photo-overlay">
                <strong>Photo added</strong>
                <small>Stored only in your browser</small>
            </div>
        `;
    };

    reader.readAsDataURL(file);
}


/* -----------------------------------------
   CREATE FIELD NOTE
----------------------------------------- */

async function createFieldNote() {

    const reflectionElement =
        document.getElementById(
            "reflectionText"
        );

    const reflection =
        reflectionElement.value.trim();

    if (!reflection) {

        alert(
            "Write at least one thing you noticed."
        );

        reflectionElement.focus();

        return;
    }

    if (!currentMission) {

        alert(
            "Your mission could not be found. " +
            "Please create a new mission."
        );

        showScreen("builder");

        return;
    }

    const button =
        document.querySelector(
            "#reflection .primary-btn"
        );

    button.disabled = true;

    button.innerHTML =
        "Creating your field note...";


    try {

        const response = await fetch(
            "/api/create-field-note",
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    reflection: reflection,

                    mission: JSON.stringify(
                        currentMission
                    )
                })
            }
        );


        const data =
            await response.json();


        if (
            !response.ok ||
            !data.success
        ) {

            throw new Error(
                data.error ||
                "Failed to create field note."
            );
        }


        const note =
            data.field_note;


        document.getElementById(
            "noteTitle"
        ).textContent =
            note.title;


        document.getElementById(
            "noteText"
        ).textContent =
            note.note;


        document.getElementById(
            "noteClosing"
        ).textContent =
            note.closing;


        document.getElementById(
            "noteDate"
        ).textContent =
            new Date()
                .toLocaleDateString(
                    "en-IN",
                    {
                        day: "2-digit",
                        month: "short",
                        year: "numeric"
                    }
                )
                .toUpperCase();


        showScreen("result");


    } catch (error) {

        console.error(
            "Field note error:",
            error
        );

        alert(
            "Couldn't create your field note.\n\n" +
            "Make sure Ollama is running."
        );


    } finally {

        button.disabled = false;

        button.innerHTML =
            'Create my field note <span>→</span>';
    }
}


/* -----------------------------------------
   RESET FOR NEW ADVENTURE
----------------------------------------- */

function resetAdventure() {

    currentMission = null;

    selectedPhoto = null;

    document.getElementById(
        "reflectionText"
    ).value = "";

    if (photoInput) {
        photoInput.value = "";
    }

    showScreen("builder");
}