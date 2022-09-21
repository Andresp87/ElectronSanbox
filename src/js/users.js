const { ipcRenderer } = require("electron");

function getDOMFormValues() {
  const userForm = document.querySelector("#userForm");
  const idUser = document.querySelector("#idUser");
  const firstName = document.querySelector("#firstName");
  const lastName = document.querySelector("#lastName");
  const phone = document.querySelector("#phone");
  const email = document.querySelector("#email");
  const addPhoto = document.querySelector("#addPhoto");
  const profilePhoto = document.querySelector("#profilePhoto");
  const linkPhoto = document.querySelector("#linkPhoto");

  return {
    userForm,
    idUser,
    firstName,
    lastName,
    phone,
    email,
    addPhoto,
    profilePhoto,
    linkPhoto,
  };
}

async function onFormSubmit(event) {
  event.preventDefault();
  const { idUser, firstName, lastName, email, phone, linkPhoto } =
    getDOMFormValues();
  const data = {
    firstName: firstName.value,
    lastName: lastName.value,
    email: email.value,
    phone: phone.value,
  };

  if (!linkPhoto.value) {
    // alert("Debe ingresar una foto");
    return ipcRenderer.send("alert-window", {
      title: "Notificación",
      body: "Debe Colocar una foto",
    });
  }
  data.photo = linkPhoto.value;

  // condicional para guardar nuevo o editar
  if (!idUser.value) {
    return ipcRenderer.send("add-user", data);
  }
  return ipcRenderer.send("update-user", { ...data, idUser: idUser.value });
}

async function mapFormData(event, data) {
  const { idUser, firstName, lastName, phone, email, linkPhoto, profilePhoto } =
    getDOMFormValues();
  idUser.value = data._id;
  firstName.value = data.firstName;
  lastName.value = data.lastName;
  phone.value = data.phone;
  email.value = data.email;
  linkPhoto.value = data.photo;
  profilePhoto.src = data.photo;
}

function onAddPhotoClick() {
  ipcRenderer.send("add-photo");
}

function main() {
  const { userForm, addPhoto } = getDOMFormValues();
  // submit del calendario
  userForm.addEventListener("submit", onFormSubmit);

  // llamado funcion para cargar foto
  addPhoto.addEventListener("click", onAddPhotoClick);

  // funcion para cargar data a editar en el formulario
  ipcRenderer.on("get-data", mapFormData);
}

main();
