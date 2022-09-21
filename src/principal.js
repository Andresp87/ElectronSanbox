/*FUNCIONES JS DE LA VENTANA PRINCIPAL INDEX.HTML*/
const { ipcRenderer } = require("electron");
const settings = require("electron-settings");

const usersTable = document.querySelector("#tbody-users");
//const cardUser = document.querySelector("#cardUser");
const calendar = document.querySelector("#calendar");
const loginGoogle = document.querySelector("#loginGoogle");
const logoutGoogle = document.querySelector("#logoutGoogle");
//const closeForm = document.querySelector("#closeForm");
const newWindowUser = document.querySelector("#newWindowUser");
const photoUser = document.querySelector("#photoUser");
const nameUser = document.querySelector("#nameUser");
const emailUser = document.querySelector("#emailUser");
const footer = document.querySelector("#footer");

let users = [];
let projects = [];

//FUNCION QUE RECIBE LOS USUARIOS EN BDD Y CARGA LA TABLA
function renderUsers(receivedUsers) {
  usersTable.innerHTML = "";
  receivedUsers.forEach((user, index) => {
    usersTable.innerHTML += `
            <tr>
              <th scope="row">${index + 1}</th>
              <td><img class="rounded-circle" src="${
                user.photo
              }" style="width:3rem;height:3rem"></td>
              <td>${user.firstName}</td>
              <td>${user.lastName}</td>
              <td>${user.email}</td>
              <td>${user.phone}</td>
              <td>
                <button type="button" class="btn btn-outline-danger btn-sm" onclick="deleteUser('${
                  user._id
                }')">
                  <i class="bi bi-x-circle"></i>
                </button>
                <button type="button" class="btn btn-outline-warning btn-sm" onclick="editUser('${
                  user._id
                }')">
                  <i class="bi bi-pencil-square"></i>
                </button>
				<button type="button" class="btn btn-outline-info btn-sm" onclick="windowProjects('${
          user._id
        }')">
		<i class="bi bi-calendar-check-fill"></i>
			  </button>                 
              </td>
            </tr>
        `;
  });
}

//FUNCION PARA ABRIR NUEVA VENTANA
calendar.addEventListener("click", (event) => {
  ipcRenderer.send(
    "newWindow",
    { title: "Calendario", ruta: "../views/calendar.html" },
    true
  ); //LLAMADO AL IPCMAIN PARA CREAR VENTANA PEROSONALIZABLE
});

//FUNCION PARA ABRIR NUEVA VENTANA
newWindowUser.addEventListener("click", (event) => {
  ipcRenderer.send(
    "newWindow",
    { title: "Nuevo Usuario", ruta: "../views/new-user.html" },
    true
  ); //LLAMADO AL IPCMAIN PARA CREAR VENTANA PEROSONALIZABLE
});
//FUNCION PARA LOGIN
// loginGoogle.addEventListener("click", (event) => {
//   ipcRenderer.send("Google"); //LLAMADO AL IPCMAIN QUE REALIZA EL LOGIN DE GOOGLE DESDE EL NAVEGADOR
// });
//FUNCION PARA LOGOUT
logoutGoogle.addEventListener("click", (event) => {
  ipcRenderer.send("logoutGoogle"); //LLAMADO AL IPCMAIN QUE REALIZA EL LOGOUT DEL USUARIO
});

ipcRenderer.send("get-users"); //LLAMADO AL IPCMAIN QUE CONSULTA BDD DE USUARIOS
//ipcRenderer.send("validate-google")//LLAMADO AL IPCMAIN QUE VALIDA SESIÓN DEL USUARIO

//IPCRENDERER QUE RECIBE RESPUESTA DESDE EL MAIN LUEGO DE AGREGAR UN NUEVFO USUARIO
ipcRenderer.on("add-user", (e, arg) => {
  ipcRenderer.send("get-users"); //LLAMADO AL IPCMAIN QUE CONSULTA LA BDD
  ipcRenderer.send("alert-window", {
    title: "Notificación",
    body: "Usuario Agregado Correctamente",
  }); //LLAMADO AL IPCMAIN QUE GENERA NOTIFICACIONES DE ESCRITORIO
});

//*** PROJECTS */
//IPCRENDERER QUE RECIBE RESPUESTA DESDE EL MAIN LUEGO DE AGREGAR UN NUEVFO PROYECTO
ipcRenderer.on("add-project", (e, arg) => {
  ipcRenderer.send("get-projects"); //LLAMADO AL IPCMAIN QUE CONSULTA LA BDD
  ipcRenderer.send("alert-window", {
    title: "Notificación",
    body: "Proyecto Agregado Correctamente",
  }); //LLAMADO AL IPCMAIN QUE GENERA NOTIFICACIONES DE ESCRITORIO
});

//IPCRENDERER QUE RECIBE RESPUESTA DESDE EL MAIN LUEGO DE AGREGAR UN NUEVFO PROYECTO
ipcRenderer.on("get-projects", (e, arg) => {
  ipcRenderer.send("get-projects"); //LLAMADO AL IPCMAIN QUE CONSULTA LA BDD
  ipcRenderer.send("alert-window", {
    title: "Notificación",
    body: "Proyecto Agregado Correctamente",
  }); //LLAMADO AL IPCMAIN QUE GENERA NOTIFICACIONES DE ESCRITORIO
});
//*** END PROJECTS */

//IPCRENDERER QUE RECIBE RESPUESTA DESDE EL MAIN AL VALIDAR EL LOGIN DE USUARIO
ipcRenderer.on(
  "validate-google",
  (e, { given_name: givenName, family_name: familyName, email, picture }) => {
    nameUser.textContent = `${givenName} ${familyName}`;
    emailUser.textContent = email;
    photoUser.src = picture;
    footer.classList.remove("invisible");
    loginGoogle.style.display = "none";
    logoutGoogle.style.display = "block";
    // ipcRenderer.send("alert-window", {
    //   title: "Notificación",
    //   body: "Bienvenido " + args.given_name + " " + args.family_name,
    // }); //LLAMADO AL IPCMAIN QUE GENERA NOTIFICACIONES DE ESCRITORIO
  }
);
/*
//IPCRENDERER QUE RECIBE RESPUESTA DESDE EL MAIN AL
ipcRenderer.on('logoutGoogle', (e, args) =>{
	nameUser.textContent = "";
	emailUser.textContent = "";
	photoUser.src = "../assets/icon_user.png";
	footer.classList.add('invisible');
	loginGoogle.style.display = "block";
	logoutGoogle.style.display = "none";
	ipcRenderer.
	ipcRenderer.send("alert-window",{title:"Notificación",body:"Logout Exitoso"})//LLAMADO AL IPCMAIN QUE GENERA NOTIFICACIONES DE ESCRITORIO
});
*/
//IPCRENDERER QUE RECIBE REPUESTA DEL MAIN AL CONSULTAR LA BDD DE USUARIOS
ipcRenderer.on("get-users", (e, args) => {
  const receivedUsers = JSON.parse(args);
  users = receivedUsers;
  renderUsers(receivedUsers); //LLAMADO A FUNCION DE CREACION DE TABLA DE USUARIOS
});
//IPCRENDERER QUE RECIBE RESPUESTA DEL MAIN AL ACTUALIZAR UN USUARIO
ipcRenderer.on("update-user-success", (e, args) => {
  ipcRenderer.send("get-users");
  ipcRenderer.send("alert-window", {
    title: "Notificación",
    body: "Usuario Editado Correctamente",
  });
});
//IPCRENDERER QUE RECIBE RESPUESTA DEL MAIN AL ELIMINAR UN USUARIO
ipcRenderer.on("delete-user-success", (e, args) => {
  ipcRenderer.send("get-users");
  ipcRenderer.send("alert-window", {
    title: "Notificación",
    body: "Usuario Eliminado Correctamente",
  });
});
//IPCRENDERER QUE RECIBE RESPUESTA DEL MAIN AL LOGUEARSE UN USUARIO GENERANDO ALERTA DE ESCRITORIO Y MOSTRANDO INFO DEL USUARIO EN EL FOOTER
ipcRenderer.on(
  "google-user",
  (e, { given_name: givenName, family_name: familyName, email, picture }) => {
    nameUser.textContent = `${givenName} ${familyName}`;
    emailUser.textContent = email;
    photoUser.src = picture;
    footer.classList.remove("invisible");
    loginGoogle.style.display = "none";
    logoutGoogle.style.display = "block";
    ipcRenderer.send("alert-window", {
      title: "Notificación",
      body: "Logueo Exitoso",
    });
  }
);

//FUNCION PARA BORRAR USUARIO
function deleteUser(id) {
  const response = window.confirm(
    "Esta seguro que quiere eliminar este registro?"
  ); //DIALOGO DE CONFIRMACIÓN
  if (response) {
    ipcRenderer.send("delete-user", id); //LLAMADO AL IPCMAIN QUE ELIMINA AL USUARIO
  }
}

//FUNCION PARA EDITAR UN USUARIO
function editUser(id) {
  const user = users.find((u) => u._id === id); //BUSQUEDA DEL USUARIO POR ID
  ipcRenderer.send(
    "newWindow",
    { title: "Editar Usuario", ruta: "../views/new-user.html", data: user },
    true
  ); //LLAMADO AL IPCMAIN QUE ABRE NUEVA VENTANA CON DATA DEL USUARIO A EDITAR
}

function windowProjects(id) {
  const user = users.find((u) => u._id === id);
  ipcRenderer.send(
    "newWindow",
    { title: "Proyectos", ruta: "../views/user-projects.html", data: user },
    true
  );
}
