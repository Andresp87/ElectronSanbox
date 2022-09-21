const { ipcRenderer } = require("electron");

const closeBtn = document.querySelector("#closeBtn");
const huBtn = document.querySelector("#huBtn");
const comentsBtn = document.querySelector("#comentsBtn");
const trashBtn = document.querySelector("#trashBtn");
const pspForm = document.querySelector("#pspForm");
const idRegistro = document.querySelector("#idRegistro");
const resourceId = document.querySelector("#resourceId");
const start = document.querySelector("#start");
const end = document.querySelector("#end");
const componente = document.querySelector("#componente");
const nota = document.querySelector("#nota");
const comentario = document.querySelector("#comentario");
const hu = document.querySelector("#hu");
const bug = document.querySelector("#bug");

//EVENTO SUBMIT DEL FORMULARIO DE REGISTRO Y EDICION DE EVENTOS
pspForm.addEventListener("submit", (e) => {
  e.preventDefault();
  let data = {
    resourceId: resourceId.value,
    start: start.value,
    end: end.value,
    componente: componente.value,
    title: componente.value,
    nota: nota.value,
  };

  if (idRegistro.value) {
    data.id = idRegistro.value;
  }

  if (comentario.value) {
    data.comentario = comentario.value;
  }

  if (hu.value) {
    data.hu = hu.value;
  }

  if (bug.value) {
    data.bug = bug.value;
  }

  if (!idRegistro.value) {
    return ipcRenderer.send("add-registro-psp", data);
  }
  return ipcRenderer.send("update-registro-psp", data, true);
});

//FUNCION PARA CERRAR FORMULARIO DESDE CODIGO HTML
closeBtn.addEventListener("click", (event) => {
  ipcRenderer.send("closePSP");
});

//FUNCION PARA MOSTRAR CAMPOS DE HU Y BUG Y AJUSTAR VENTANA
huBtn.addEventListener("click", (event) => {
  if ($("#divHU").hasClass("d-none")) {
    $("#divHU").removeClass("d-none");
    ipcRenderer.send("ajustWindow", true);
  } else {
    $("#divHU").addClass("d-none");
    ipcRenderer.send("ajustWindow", false);
  }
});

//FUNCION PARA MOSTRAR CAMPO COMENTARIO Y AJUSTAR VENTANA
comentsBtn.addEventListener("click", (event) => {
  if ($("#divComments").hasClass("d-none")) {
    $("#divComments").removeClass("d-none");
    ipcRenderer.send("ajustWindow", true);
  } else {
    $("#divComments").addClass("d-none");
    ipcRenderer.send("ajustWindow", false);
  }
});

//FUNCION PARA ELIMINAR EVENTOS
trashBtn.addEventListener("click", (event) => {
  const response = window.confirm(
    "Esta seguro que quiere eliminar este registro?"
  ); //DIALOGO DE CONFIRMACIÓN
  if (response) {
    ipcRenderer.send("delete-registro-psp", idRegistro.value); //LLAMADO AL IPCMAIN QUE ELIMINA AL USUARIO
  }
});

//FUNCION PARA CARGAR DATA A EDITAR EN EL FORMULARIO
ipcRenderer.on("get-data", (e, args) => {
  if (args.id != null) {
    idRegistro.value = args.id;
    $("#trashBtn").removeClass("d-none");
  }
  if (args.componente != null) componente.value = args.componente;
  if (args.nota != null) nota.value = args.nota;
  if (args.comentario != null) {
    comentario.value = args.comentario;
    comentsBtn.click();
  }
  if (args.hu != null) hu.value = args.hu;

  if (args.bug != null) bug.value = args.bug;

  if (args.hu != null || args.bug != null) huBtn.click();

  resourceId.value = args.resourceId;
  start.value = args.start;
  end.value = args.end;
});
