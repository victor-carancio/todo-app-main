const body = document.querySelector(".body");
const iconToggle = document.querySelector(".header-icon");

const itemContainer = document.querySelector(".articles-container"); //contenedor de items
const articlesContainer = document.querySelector(".main-item-container");
const input = document.getElementById("add-item");
const toDoLeft = document.querySelector("#main-left-items");

const clearBtn = document.getElementById("clear-btn");
const allBtn = document.querySelectorAll(".all");
const activeBtn = document.querySelectorAll(".active");
const completeBtn = document.querySelectorAll(".completed");

//sortable
Sortable.create(articlesContainer,{
    animation: 150,
    chosenClass: "main-selection",  //agrega estilos cuando se selecciona
    ghostClass: "main-ghost", //agrega estilos al fantasma
    dragClass: "main-drag", //agrega estilos al arrastrar
    onEnd: () => {

    },
    group: "orderList",
    store: {

        //se guarda orden
        set:(sortable) => {
            const order = sortable.toArray();
            localStorage.setItem(sortable.options.group.name, order.join(','));
        },

        //se obtiene orden
        /* get: (sortable) => {
            const order = localStorage.getItem(sortable.options.group.name);
            return order ? order.split(',') : [];

        } */
    }
});

iconToggle.addEventListener("click", () => {
    if(body.classList.contains("dark-theme")){

        body.classList.remove("dark-theme");
        savePageTheme('light');

    } else {

        body.classList.add("dark-theme");
        savePageTheme('dark');
    }
   
});
window.addEventListener("DOMContentLoaded", ()=>{
    
    if(setupThemePage() == 'dark'){
        body.classList.add("dark-theme");
    } else {
        body.classList.remove("dark-theme")
    }
    setupItemsOnLoad();
});

input.addEventListener("keydown", (e) => {
    if (e.key == "Enter") {
        const itemValue = input.value;
        const itemId = new Date().getTime().toString();
        //se crea data-status
        const status = "active";

        if (itemValue) {
            AddItem(itemValue, itemId, status);
            addToLocalStorage(itemId, itemValue, status);
            itemContainer.classList.add("show-container");
            SetDefault();
            DisplayItems("all");
        } else {
            //alerta
        }
    }
});
//borrar completos
clearBtn.addEventListener("click", ClearComplete);

//filtro:  todos
allBtn.forEach((element) => {
    element.addEventListener("click", () => {
        DisplayItems("all");
        element.classList.add("selected");
        BtnSelected(activeBtn);
        BtnSelected(completeBtn);
    });
});
//filtro: activos
activeBtn.forEach((element) => {
    element.addEventListener("click", () => {
        DisplayItems("active");
        element.classList.add("selected");
        BtnSelected(allBtn);
        BtnSelected(completeBtn);
    });
});

//filtro: completos
completeBtn.forEach((element) => {
    element.addEventListener("click", () => {
        DisplayItems("complete");
        element.classList.add("selected");
        BtnSelected(activeBtn);
        BtnSelected(allBtn);
    });
});

function SetDefault() {
    input.value = "";
}

//eliminar item
function DeleteItem(e) {
    const element = e.currentTarget.parentElement.parentElement;
    const id = element.dataset.id;
    articlesContainer.removeChild(element);
    removeFromLocalStorage(id);
    toDoLeft.textContent = CountItems() + " items left";
    if (CountItems() === 0) {
        itemContainer.classList.remove("show-container");
    }
    SetDefault();
}

// completar item
function CompleteItem(e) {
    const element = e.currentTarget.parentElement;

    element.classList.add("complete");
    element.dataset.status = "complete";

    editLocalStorage(element.dataset.id, "complete");
    toDoLeft.textContent = CountItems() + " items left";
    SetDefault();
}

//limpiar completos
function ClearComplete() {
    const allComplete = document.querySelectorAll(".complete");
    allComplete.forEach((element) => {
        const id = element.dataset.id;
        removeFromLocalStorage(id);
        articlesContainer.removeChild(element);
    });
    SetDefault();
}

//cargar items al iniciar pagina
function DisplayItems(statusFilter) {
    const allItem = document.querySelectorAll(".main-item");
    allItem.forEach((element) => {
        articlesContainer.removeChild(element);
    });
    setupItems(statusFilter);
}

function AddItem(value, id, status) {
    // se crea el elemento
    const element = document.createElement("article");
    //se añaden las clases
    element.classList.add("main-article");
    element.classList.add("main-item");
    
    //se crea data-id
    const attr = document.createAttribute("data-id");
    attr.value = id;

    const statusItem = document.createAttribute("data-status");
    statusItem.value = status;
    if (status == "complete") element.classList.add("complete");
    element.setAttributeNode(attr);
    element.setAttributeNode(statusItem);

    //se inserta html
    element.innerHTML = `<div class="main-circle">
                            <img src="./images/icon-check.svg" class="main-check" alt="">
                        </div>
                        <div class="article-text">
                                <p>${value}</p>
                                <div class="cross-img">
                                 <img  src="./images/icon-cross.svg" alt="">
                                </div>
                                 
                        </div>`;

    //button delete
    const deleteBtn = element.querySelector(".cross-img");
    deleteBtn.addEventListener("click", DeleteItem);

    //button complete
    const completeBtn = element.querySelector(".main-circle");
    completeBtn.addEventListener("click", CompleteItem);

    //se agrega el elemento al contenedor de articulos
    articlesContainer.appendChild(element);

    //contador de tareas por hacer

    toDoLeft.textContent = CountItems() + " items left";
}

function CountItems() {
    const allElements = document.querySelectorAll(".main-article");
    let itemLeft = 0;
    allElements.forEach((element) => {
        const complete = element.classList.contains("complete");
        if (!complete) {
            itemLeft++;
        }
    });
    return itemLeft - 1;
}

function BtnSelected(array) {
    array.forEach((element) => {
        element.classList.remove("selected");
    });
}

//Storage

function addToLocalStorage(id, value, status) {
    const toDoList = { id, value, status };
    let items = getLocalStorage();

    items.push(toDoList);
    localStorage.setItem("list", JSON.stringify(items));
}

function removeFromLocalStorage(id) {
    let items = getLocalStorage();
    let elements = getOrderStorage();
    items = items.filter(function (item) {
        if (item.id !== id) {
            return item;
        }
    });

    if(elements.length > 0){
        elements = elements.filter(function (element) {
            if (element !== id) {
                return element;
            }
        });
    localStorage.setItem("orderList", elements.join(','));
    }
    localStorage.setItem("list", JSON.stringify(items));
    
}

function editLocalStorage(id) {
    let items = getLocalStorage();

    items = items.map(function (item) {
        if (item.id === id) {
            item.status = "complete";
        }
        return item;
    });

    localStorage.setItem("list", JSON.stringify(items));
}

function setupItemsOnLoad(){
    let items = getLocalStorage();
    let order = getOrderStorage();

    
    if(order.length == 0){
        setupItems('all');
        console.log(order.length);
    }else {
        if (items.length > 0 ) {
            order.forEach((element) =>{
                const orderList = items.find((item) =>{
                    if(item.id == element){
                        return item;
                    }
                })
                   /*  console.log(orderList); */
                    AddItem(orderList.value, orderList.id, orderList.status);
                    itemContainer.classList.add("show-container");
                    SetDefault();
            })
        }
    }
     

}


function setupItems(statusFilter) {
    let items = getLocalStorage();
    

    if (items.length > 0) {

        items.forEach(function (item) {
            if (item.status == statusFilter || statusFilter == "all")
                AddItem(item.value, item.id, item.status);
                itemContainer.classList.add("show-container");
                SetDefault();

        });
    }
}

function savePageTheme(theme){
    const curretTheme = theme;
    let local = getThemeStorage();

    if(local.length > 0){
        local = local.map((item) => item = curretTheme);

    } else {
        local.push(curretTheme);
    }
    localStorage.setItem("theme", JSON.stringify(local));
}

function setupThemePage(){
    let local = getThemeStorage();
    if(local.length > 0){
        return local.toString();
    }
}

function getLocalStorage() {
    return localStorage.getItem("list")
        ? JSON.parse(localStorage.getItem("list"))
        : [];
}

function getOrderStorage(){ 
    const order = localStorage.getItem("orderList");
            return order ? order.split(',') : [];
}

function getThemeStorage(){
    return localStorage.getItem("theme")
        ? JSON.parse(localStorage.getItem("theme"))
        : [];
}

