const todos = [];
const RENDER_EVENT = "render-todo";
const SAVED_EVENT = "saved-todo"
const STORAGE_KEY = "TODO-APPS";

function isStorageExist(){
    if(typeof(Storage)===undefined){
        alert("Browser-mu Tidak Mendukung Web Storage")
        return false;
    }
    return true;
}

function saveData(){
    if(isStorageExist()){
        const parsed = JSON.stringify(todos);
        localStorage.setItem(STORAGE_KEY, parsed);
        document.dispatchEvent(new Event(SAVED_EVENT));
    }
}

function loadDataFromStorage(){
    const serializeData = localStorage.getItem(STORAGE_KEY);
    let data = JSON.parse(serializeData);
    if(data!==null){
        for(let todo of data){
            todos.push(todo);
        }
    }
    document.dispatchEvent(new Event(RENDER_EVENT));
}

function addTodo(){
    const textTodo = document.getElementById("title").value;
    const timeStamp = document.getElementById("date").value;

    const generateID = new Date();
    const todoObject = generateTodoObject(generateID, textTodo, timeStamp, false);
    todos.push(todoObject);

    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();
    Swal.fire({
        title: 'Berhasil!',
        text: 'Kamu Berhasil Menambahkan Kegiatan Baru',
        icon: 'success',
        confirmButtonText: 'OK',
        allowOutsideClick: false,
    })
}

function generateTodoObject(id,task,timeStamp,isCompleted){
    return {
        id,
        task,
        timeStamp,
        isCompleted
    }
}

function findTodo(todoId){
    for(todoItem of todos){
        if(todoItem.id === todoId){
            return todoItem
        }
    }
    return null
}

function findTodoIndex(todoId) {
    for(index in todos){
        if(todos[index].id === todoId){
            return index
        }
    }
    return -1
}

function addTaskToCompleted(todoId) { 
    const todoTarget = findTodo(todoId);
    if(todoTarget == null) return;
  
    todoTarget.isCompleted = true;
    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();
    Swal.fire({
        title: 'Berhasil!',
        text: 'Kegiatan Telah Selesai Dilakukan',
        icon: 'success',
        confirmButtonText: 'OK',
        allowOutsideClick: false,
    })
}

function removeTaskFromCompleted(todoId) {
    const todoTarget = findTodoIndex(todoId);
    Swal.fire({
        title: 'Apakah Anda Yakin?',
        text: "Kegiatan ini akan dihapus!",
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Ya, hapus!'
    }).then((result) => {
        if(todoTarget === -1){
            return;
        } 
        else if (result.isConfirmed) {
            Swal.fire(
                'Kegiatan Telah Dihapus!',
                '',
                'success'
            )
            todos.splice(todoTarget, 1);   
            document.dispatchEvent(new Event(RENDER_EVENT));
            saveData();
        }
    })
    
    
}
   
   
function undoTaskFromCompleted(todoId){
    const todoTarget = findTodo(todoId);
    if(todoTarget == null) return;
    todoTarget.isCompleted = false;
    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();
}

function makeTodo(todoObject){
    const textTitle = document.createElement("h2");
    textTitle.innerText = todoObject.task;

    const textTimeStamp = document.createElement("p");
    textTimeStamp.innerText = todoObject.timeStamp;

    const textContainer = document.createElement("div");
    textContainer.classList.add("inner");
    textContainer.append(textTitle,textTimeStamp);

    const container = document.createElement("div");
    container.classList.add("item","shadow")
    container.append(textContainer);
    container.setAttribute("id",`todo-${todoObject.id}`);

    if(todoObject.isCompleted){
        const undoButton = document.createElement("button");
        undoButton.classList.add("undo-button");
        undoButton.addEventListener("click", function () {
            undoTaskFromCompleted(todoObject.id);
        });
        const trashButton = document.createElement("button");
        trashButton.classList.add("trash-button");
        trashButton.addEventListener("click", function () {
            removeTaskFromCompleted(todoObject.id);
        });
        container.append(undoButton, trashButton);
    } else {
        const checkButton = document.createElement("button");
        checkButton.classList.add("check-button");
        checkButton.addEventListener("click", function () {
            addTaskToCompleted(todoObject.id);
        });
        container.append(checkButton);
    }

    return container;
}

document.addEventListener("DOMContentLoaded",function(){
    let timerInterval
    Swal.fire({
    title: 'Mohon Tunggu Sebentar',
    html: 'Halaman akan terbuka dalam <b></b> milliseconds.',
    timer: 5000,
    timerProgressBar: true,
    allowOutsideClick: false,
    didOpen: () => {
        Swal.showLoading()
        const b = Swal.getHtmlContainer().querySelector('b')
        timerInterval = setInterval(() => {
        b.textContent = Swal.getTimerLeft()
        }, 100)
    },
    willClose: () => {
        clearInterval(timerInterval)
    }
    }).then((result) => {
    /* Read more about handling dismissals below */
    if (result.dismiss === Swal.DismissReason.timer) {
        console.log('I was closed by the timer')
    }
    });
    const submitForm = document.getElementById("form")
    submitForm.addEventListener("submit",function(event){
        event.preventDefault();
        addTodo();
    });
    if(isStorageExist()){
        loadDataFromStorage();
    }
});

document.addEventListener(RENDER_EVENT,function(){
    const uncompletedTODOList = document.getElementById("todos");
    uncompletedTODOList.innerHTML = "";

    const completedTODOList = document.getElementById("completed-todos");
    completedTODOList.innerHTML = "";

    for(todoItem of todos){
        const todoElement = makeTodo(todoItem);
        if(todoItem.isCompleted == false){
            uncompletedTODOList.append(todoElement);
        } else{
            completedTODOList.append(todoElement);
        }
    }
})