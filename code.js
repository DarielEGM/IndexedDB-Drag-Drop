"use strict";

const IDBRequest = indexedDB.open("daltobase",1);

IDBRequest.addEventListener("upgradeneeded", ()=>{
    const db = IDBRequest.result;
    db.createObjectStore("names",{
        autoIncrement: true
    });
})

IDBRequest.addEventListener("success", ()=>{
    readObject();
})

IDBRequest.addEventListener("error", ()=>{
    console.log("hubo un error");
})

document.getElementById('add').addEventListener("click", ()=>{
    let name = document.getElementById("name").value;
    if(name.length > 0){
        if(document.querySelector(".posible") != undefined){
            if(confirm("There are unsaved items: Do you want to continue?")){
                addObject({name});
                readObject();
            }
        }else{
            addObject({name});
            readObject();
        }
    }
})

const addObject = object =>{
    const IDBData = getIDBData("readwrite", "object added");
    IDBData.add(object);
    
}


const readObject = () =>{
    const IDBData = getIDBData("readonly");
    const cursor = IDBData.openCursor();
    const fragment =  document.createDocumentFragment();
    document.querySelector(".names").innerHTML = "";
    cursor.addEventListener("success", ()=>{
        if(cursor.result){
            let element = namesHTML(cursor.result.key, cursor.result.value);
            fragment.appendChild(element);
            cursor.result.continue();
        }else{
            document.querySelector(".names").appendChild(fragment);
        }
    })
}


const updateObject = (key,object) =>{
    const IDBData = getIDBData("readwrite", "object updated");
    IDBData.put(object, key); 
}


const deleteObject = key =>{
    const IDBData = getIDBData("readwrite", "object deleted");
    IDBData.delete(key);
}

const getIDBData = (mode, msg)=>{
    const db = IDBRequest.result;
    const IDBtransaction = db.transaction("names", mode);
    const objectStore = IDBtransaction.objectStore("names");
    IDBtransaction.addEventListener("complete", ()=>{
        console.log(msg);
    })
    return objectStore;
}


const namesHTML = (id, name)=>{
    const container = document.createElement("DIV");
    const h2 = document.createElement("h2");
    const options = document.createElement("DIV");
    const saveButton = document.createElement("button");
    const deleteButton = document.createElement("button");

    container.classList.add("name");
    options.classList.add("options");
    saveButton.classList.add("imposible");
    deleteButton.classList.add("delete");

    saveButton.textContent = "Save";
    deleteButton.textContent = "Delete";
    
    h2.textContent= name.name;
    h2.setAttribute("contenteditable", "true");
    h2.setAttribute("spellcheck", "false");

    options.appendChild(saveButton);
    options.appendChild(deleteButton);

    container.appendChild(h2);
    container.appendChild(options);

    h2.addEventListener("keyup", ()=>{
        saveButton.classList.replace("imposible", "posible");
    })

    saveButton.addEventListener("click", ()=>{
        if(saveButton.className=="posible"){
            updateObject(id, {name:h2.textContent});
            saveButton.classList.replace("posible", "imposible");
        }
    })

    deleteButton.addEventListener("click", ()=>{
        deleteObject(id);
        document.querySelector(".names").removeChild(container);
    })

    return container;
}