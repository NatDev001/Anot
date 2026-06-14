const STORAGE_KEY = "anot_folders";

const editor =
    document.getElementById("editor");

const noteTitle =
    document.getElementById("noteTitle");

const saveBtn =
    document.getElementById("saveBtn");

const backBtn =
    document.getElementById("backBtn");

let folders =
    JSON.parse(
        localStorage.getItem(STORAGE_KEY)
    ) || [];

const currentFolderId =
    Number(
        localStorage.getItem("currentFolder")
    );

const currentNoteId =
    Number(
        localStorage.getItem("currentNote")
    );

const folder =
    folders.find(
        f => f.id === currentFolderId
    );

let currentNote = null;

if (
    currentNoteId &&
    folder
){

    currentNote =
        folder.notas.find(
            n => n.id === currentNoteId
        );

    if(currentNote){

        noteTitle.value =
            currentNote.titulo || "";

        loadLines();
    }
}
else{

    createLine();

    setTimeout(() => {

        const first =
            document.querySelector(
                ".line-text"
            );

        if(first){

            first.focus();
        }

    }, 50);
}

function createLine(data = {}){

    const line =
        document.createElement("div");

    line.className = "line-block";

    line.innerHTML = `

        <div class="line-header">

            <span
                class="diamond
                ${
                    data.topico
                        ? ""
                        : "hidden-diamond"
                }
            ">
                ${data.topico ? "◈" : "◇"}
            </span>

            <div
                class="line-text"
                contenteditable="true"
            >${data.texto || ""}</div>

        </div>

        <div
            class="topic-description
            ${
                data.expandido
                    ? ""
                    : "hidden"
            }
        "
            contenteditable="true"
        >${data.descricao || ""}</div>

    `;

    const diamond =
        line.querySelector(".diamond");

    const text =
        line.querySelector(".line-text");

    const description =
        line.querySelector(
            ".topic-description"
        );

    let isTopic =
        data.topico || false;

    text.addEventListener(
        "focus",
        () => {

            document
                .querySelectorAll(
                    ".diamond"
                )
                .forEach(d => {

                    if(
                        d.textContent !== "◈"
                    ){

                        d.classList.add(
                            "hidden-diamond"
                        );
                    }
                });

            if(!isTopic){

                diamond.classList.remove(
                    "hidden-diamond"
                );
            }
        }
    );

    text.addEventListener(
        "blur",
        () => {

            setTimeout(() => {

                if(
                    !isTopic &&
                    !text.matches(":focus")
                ){

                    diamond.classList.add(
                        "hidden-diamond"
                    );
                }

            }, 10);
        }
    );

    diamond.addEventListener(
        "mousedown",
        e => {

            e.preventDefault();

            isTopic = !isTopic;

            if(isTopic){

                diamond.textContent = "◈";

                diamond.classList.remove(
                    "hidden-diamond"
                );

                description.classList.remove(
                    "hidden"
                );
            }
            else{

                diamond.textContent = "◇";

                description.classList.add(
                    "hidden"
                );

                if(
                    !text.matches(":focus")
                ){

                    diamond.classList.add(
                        "hidden-diamond"
                    );
                }
            }

            text.focus();
        }
    );

    text.addEventListener(
        "keydown",
        e => {

            if(e.key === "Enter"){

                e.preventDefault();

                const newLine =
                    createLine();

                editor.insertBefore(
                    newLine,
                    line.nextSibling
                );

                const focusTarget =
                    newLine.querySelector(
                        ".line-text"
                    );

                setTimeout(() => {

                    focusTarget.focus();

                }, 10);
            }
        }
    );

    return editor.appendChild(line);
}

function collectLines(){

    const blocks = [];

    document
        .querySelectorAll(".line-block")
        .forEach(line => {

            const diamond =
                line.querySelector(
                    ".diamond"
                );

            const text =
                line.querySelector(
                    ".line-text"
                );

            const description =
                line.querySelector(
                    ".topic-description"
                );

            if(
                !text.textContent.trim() &&
                !description.textContent.trim()
            ){
                return;
            }

            blocks.push({

                texto:
                    text.textContent,

                topico:
                    diamond.textContent === "◈",

                descricao:
                    description.textContent,

                expandido:
                    !description.classList.contains(
                        "hidden"
                    )
            });
        });

    return blocks;
}

function loadLines(){

    editor.innerHTML = "";

    if(
        !currentNote.blocos ||
        currentNote.blocos.length === 0
    ){

        createLine();

        return;
    }

    currentNote.blocos.forEach(
        bloco => {

            createLine(bloco);
        }
    );
}

saveBtn.addEventListener(
    "click",
    () => {

        if(!folder){

            alert(
                "Nenhum caderno selecionado."
            );

            return;
        }

        const titulo =
            noteTitle.value.trim();

        if(!titulo){

            alert(
                "Digite um título."
            );

            return;
        }

        const blocos =
            collectLines();

        if(currentNote){

            currentNote.titulo =
                titulo;

            currentNote.blocos =
                blocos;
        }
        else{

            folder.notas.push({

                id: Date.now(),

                titulo,

                blocos,

                selected:false
            });
        }

        localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify(folders)
        );

        alert("Salvo.");
    }
);

backBtn.addEventListener(
    "click",
    () => {

        localStorage.removeItem(
            "currentNote"
        );

        window.location.href =
            "../index.html";
    }
);