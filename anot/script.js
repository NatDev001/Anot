const addBtn = document.getElementById("addBtn");
const modal = document.getElementById("modal");
const saveBtn = document.getElementById("saveBtn");
const cancelBtn = document.getElementById("cancelBtn");

const noteInput = document.getElementById("note");
const categoryInput = document.getElementById("category");

const notesContainer = document.getElementById("notesContainer");

let categories = JSON.parse(localStorage.getItem("notes")) || {};

renderAllNotes();

addBtn.addEventListener("click", () => {
    modal.style.display = "flex";
});

cancelBtn.addEventListener("click", closeModal);

saveBtn.addEventListener("click", () => {

    const category = categoryInput.value.trim();
    const content = noteInput.value.trim();

    if (!category || !content) return;

    const title = content.split("\n")[0];

    if (!categories[category]) {
        categories[category] = [];
    }

    categories[category].push({
        titulo: title,
        conteudo: content
    });

    saveNotes();
    renderAllNotes();
    closeModal();
});

function saveNotes() {
    localStorage.setItem("notes", JSON.stringify(categories));
}

function renderAllNotes() {

    notesContainer.innerHTML = "";

    for (const category in categories) {

        const section = document.createElement("div");
        section.classList.add("category");

        section.innerHTML = `
            <div class="category-title">• ${category}</div>
            <div class="notes-list"></div>
        `;

        const list = section.querySelector(".notes-list");

        categories[category].forEach(note => {

            const noteObj =
                typeof note === "string"
                    ? {
                        titulo: note,
                        conteudo: note
                    }
                    : note;

            const card = document.createElement("div");
            card.classList.add("note-card");
            card.style.cursor = "pointer";
            card.style.position = "relative";

            card.innerHTML = `
                <div class="note-content">
                    <div class="dot"></div>
                    <span>${noteObj.titulo}</span>
                </div>

                <div class="menu">☰</div>

                <div class="dropdown-menu" style="
                    display:none;
                    position:absolute;
                    right:20px;
                    top:60px;
                    background:white;
                    border:1px solid #ddd;
                    border-radius:10px;
                    overflow:hidden;
                    z-index:1000;
                    box-shadow:0 4px 10px rgba(0,0,0,.2);
                ">
                    <button class="delete-btn" style="
                        border:none;
                        background:white;
                        padding:12px 20px;
                        cursor:pointer;
                        width:100%;
                        text-align:left;
                        color:red;
                    ">
                        Excluir
                    </button>
                </div>
            `;

            const menuBtn = card.querySelector(".menu");
            const dropdown = card.querySelector(".dropdown-menu");
            const deleteBtn = card.querySelector(".delete-btn");

            // Abrir anotação ao clicar no card
            card.addEventListener("click", () => {
                openNote(noteObj);
            });

            // Abrir menu
            menuBtn.addEventListener("click", (e) => {

                e.stopPropagation();

                document.querySelectorAll(".dropdown-menu")
                    .forEach(menu => {
                        if (menu !== dropdown) {
                            menu.style.display = "none";
                        }
                    });

                dropdown.style.display =
                    dropdown.style.display === "block"
                        ? "none"
                        : "block";
            });

            // Excluir anotação
            deleteBtn.addEventListener("click", (e) => {

                e.stopPropagation();

                if (!confirm(`Excluir "${noteObj.titulo}"?`)) {
                    return;
                }

                categories[category] =
                    categories[category].filter(item => {

                        const current =
                            typeof item === "string"
                                ? {
                                    titulo: item,
                                    conteudo: item
                                }
                                : item;

                        return !(
                            current.titulo === noteObj.titulo &&
                            current.conteudo === noteObj.conteudo
                        );
                    });

                if (categories[category].length === 0) {
                    delete categories[category];
                }

                saveNotes();
                renderAllNotes();
            });

            list.appendChild(card);
        });

        notesContainer.appendChild(section);
    }
}

function openNote(note) {

    const noteModal = document.createElement("div");
    noteModal.classList.add("modal");
    noteModal.style.display = "flex";

    noteModal.innerHTML = `
        <div class="modal-content">
            <h2>${note.titulo}</h2>

            <textarea
                readonly
                style="
                    width:100%;
                    height:300px;
                    resize:none;
                    margin-top:15px;
                    padding:10px;
                "
            >${note.conteudo}</textarea>

            <div class="actions" style="margin-top:15px;">
                <button id="closeNoteBtn">Fechar</button>
            </div>
        </div>
    `;

    document.body.appendChild(noteModal);

    document
        .getElementById("closeNoteBtn")
        .addEventListener("click", () => {
            noteModal.remove();
        });

    noteModal.addEventListener("click", (e) => {
        if (e.target === noteModal) {
            noteModal.remove();
        }
    });
}

function closeModal() {
    modal.style.display = "none";
    noteInput.value = "";
    categoryInput.value = "";
}

window.addEventListener("click", (e) => {
    if (e.target === modal) {
        closeModal();
    }
});

// Fechar menus ao clicar fora
document.addEventListener("click", () => {
    document.querySelectorAll(".dropdown-menu")
        .forEach(menu => {
            menu.style.display = "none";
        });
});