const STORAGE_KEY = "anot_folders";

const foldersContainer = document.getElementById("foldersContainer");

const addFolderBtn = document.getElementById("addFolderBtn");

const folderModal = document.getElementById("folderModal");

const folderTitle = document.getElementById("folderTitle");

const createFolderBtn =
    document.getElementById("createFolderBtn");

const cancelFolderBtn =
    document.getElementById("cancelFolderBtn");

let folders =
    JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];

addFolderBtn.addEventListener("click", () => {

    folderTitle.value = "";

    folderModal.style.display = "flex";
});

cancelFolderBtn.addEventListener("click", () => {

    folderModal.style.display = "none";
});

createFolderBtn.addEventListener("click", () => {

    const title = folderTitle.value.trim();

    if (!title) return;

    folders.push({

        id: Date.now(),

        titulo: title,

        aberto: false,

        deleteMode: false,

        notas: []
    });

    saveFolders();

    renderFolders();

    folderModal.style.display = "none";
});

window.addEventListener("click", e => {

    if (e.target === folderModal) {

        folderModal.style.display = "none";
    }
});

function saveFolders(){

    localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(folders)
    );
}

function renderFolders(){

    foldersContainer.innerHTML = "";

    folders.forEach(folder => {

        const card = document.createElement("div");

        card.className = "folder-card";

        const contentClass =
            folder.aberto
                ? "folder-content open"
                : "folder-content";

        card.innerHTML = `
            <div class="folder-header">

                <div class="folder-title">
                    ${folder.titulo}
                </div>

                <div
                    class="folder-menu"
                    data-folder="${folder.id}"
                >
                    ☰
                </div>

            </div>

            <div class="${contentClass}">

                <div class="notes-list">

                    ${renderNotes(folder)}

                </div>

                <div class="folder-actions">

                    <button
                        class="folder-btn add-note-btn"
                        data-folder="${folder.id}"
                    >
                        +
                    </button>

                    <button
                        class="folder-btn delete-mode-btn
                        ${folder.deleteMode ? "active" : ""}"
                        data-folder="${folder.id}"
                    >
                        🗑
                    </button>

                </div>

            </div>
        `;

        foldersContainer.appendChild(card);
    });

    bindFolderEvents();
}

function renderNotes(folder){

    let html = "";

    folder.notas.forEach(note => {

        const selectable =
            folder.deleteMode
                ? "selectable"
                : "";

        const selected =
            note.selected
                ? "selected"
                : "";

        html += `
            <div
                class="note-item"
                data-folder="${folder.id}"
                data-note="${note.id}"
            >

                <div
                    class="note-dot
                    ${selectable}
                    ${selected}"
                ></div>

                <div class="note-title">

                    ${note.titulo}

                </div>

            </div>
        `;
    });

    return html;
}

function bindFolderEvents(){

    document
        .querySelectorAll(".folder-menu")
        .forEach(btn => {

            btn.addEventListener("click", () => {

                const folderId =
                    Number(btn.dataset.folder);

                const folder =
                    folders.find(
                        f => f.id === folderId
                    );

                folder.aberto =
                    !folder.aberto;

                saveFolders();

                renderFolders();
            });
        });

    document
        .querySelectorAll(".add-note-btn")
        .forEach(btn => {

            btn.addEventListener("click", () => {

                const folderId =
                    btn.dataset.folder;

                localStorage.setItem(
                    "currentFolder",
                    folderId
                );

                localStorage.removeItem(
                    "currentNote"
                );

                window.location.href =
                    "./anotar/index.html";
            });
        });

    document
        .querySelectorAll(".delete-mode-btn")
        .forEach(btn => {

            btn.addEventListener("click", () => {

                const folderId =
                    Number(btn.dataset.folder);

                const folder =
                    folders.find(
                        f => f.id === folderId
                    );

                // Caderno vazio
                if(
                    !folder.deleteMode &&
                    folder.notas.length === 0
                ){

                    const excluirCaderno =
                        confirm(
                            `O arquivo "${folder.titulo}" está vazio.\n\nDeseja excluí-lo?`
                        );

                    if(excluirCaderno){

                        folders =
                            folders.filter(
                                f => f.id !== folder.id
                            );

                        saveFolders();

                        renderFolders();
                    }

                    return;
                }

                // Confirmar exclusão de notas
                if(folder.deleteMode){

                    const selectedNotes =
                        folder.notas.filter(
                            n => n.selected
                        );

                    if(
                        selectedNotes.length > 0 &&
                        confirm(
                            `Excluir ${selectedNotes.length} nota(s)?`
                        )
                    ){

                        folder.notas =
                            folder.notas.filter(
                                n => !n.selected
                            );
                    }

                    folder.notas.forEach(
                        n => n.selected = false
                    );

                    folder.deleteMode = false;
                }
                else{

                    folder.deleteMode = true;
                }

                saveFolders();

                renderFolders();
            });
        });

    document
        .querySelectorAll(".note-item")
        .forEach(item => {

            item.addEventListener("click", () => {

                const folderId =
                    Number(item.dataset.folder);

                const noteId =
                    Number(item.dataset.note);

                const folder =
                    folders.find(
                        f => f.id === folderId
                    );

                const note =
                    folder.notas.find(
                        n => n.id === noteId
                    );

                if(folder.deleteMode){

                    note.selected =
                        !note.selected;

                    saveFolders();

                    renderFolders();

                    return;
                }

                localStorage.setItem(
                    "currentFolder",
                    folderId
                );

                localStorage.setItem(
                    "currentNote",
                    noteId
                );

                window.location.href =
                    "./anotar/index.html";
            });
        });
}

renderFolders();