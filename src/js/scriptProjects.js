const { ipcRenderer } = require("electron");
const fs = require("fs").promises;

const Project = require(__dirname + "\\modelos\\Projects");

const userForm = document.querySelector("#userForm");
const idUser = document.querySelector("#idUser");
const firstName = document.querySelector("#firstName");
const lastName = document.querySelector("#lastName");
const phone = document.querySelector("#phone");
const email = document.querySelector("#email");
const addPhoto = document.querySelector("#addPhoto");
const profilePhoto = document.querySelector("#profilePhoto");
const linkPhoto = document.querySelector("#linkPhoto");
const projectName = document.querySelector("#projectName");
const projectURL = document.querySelector("#projectURL");
const projectComments = document.querySelector("#projectComments");

//FUNCION PARA CARGAR DATA A EDITAR EN EL FORMULARIO
ipcRenderer.on("get-data", async (e, data) => {
  profilePhoto.src = data.photo;
});
const onSubmit = (event) => {
  event.preventDefault();
  ipcRenderer.send("add-project", {
    projectName: projectName.value,
    projectURL: projectURL.value,
    projectComments: projectComments.value,
  });
};

userForm.addEventListener("submit", onSubmit);
