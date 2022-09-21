const { ipcRenderer } = require("electron");

let calendar;
let arrayEvents;
let scrollPane;
let calendarEl = document.getElementById("calendar");

//GENERACION DE TOOLTIPS PARA BOTONES BOOTSTRAP 5
const tooltipTriggerList = [].slice.call(
  document.querySelectorAll('[data-bs-toggle="tooltip"]')
);

const tooltipList = tooltipTriggerList.map(
  (tooltipTriggerEl) => new window.bootstrap.Tooltip(tooltipTriggerEl)
);

//FUNCION PARA CONSULTA DE EVENTOS INICIAL AL ABRIR CALENDARIO
async function consultaBdd() {
  let result = await ipcRenderer.invoke("my-invokable-ipc");
  result = JSON.parse(result);
  //console.log(result)
  if (result.length > 0) {
    //resp = JSON.parse(data)
    result = result.map(({ _id, id, ...rest }) => ({
      id: _id,
      ...rest,
    }));
    //console.log("respuesta: ",result);
  }
  /*
    ipcRenderer.send('get-registro-psp')
    let arrayEvents = await ipcRenderer.on('get-registros-bdd')
    console.log("array: ",arrayEvents)
    return arrayEvents;
    */
  return result;
}

//CARGA DE FORMULARIO DE REGISTRO
function pspWindow(data) {
  //console.log(data)
  ipcRenderer.send(
    "pspWindow",
    { title: "Registrar", ruta: "../views/psp-window.html", data },
    true
  ); //LLAMADO AL IPCMAIN PARA CREAR VENTANA PEROSONALIZABLE
}

//FUNCION ASINCRONA PARA RENDERIZAR CALENDARIO DE EVENTOS
async function cargaCalendar() {
  arrayEvents = await consultaBdd();
  calendar = new window.FullCalendar.Calendar(calendarEl, {
    schedulerLicenseKey: "CC-Attribution-NonCommercial-NoDerivatives", //LICENCIA DE USO GRATUITO
    headerToolbar: { right: "today", left: "title" }, //ELEMENTOS DE HEADER DEL CALENDARIO
    titleFormat: { year: "numeric", month: "long", day: "2-digit" }, //FORMATO PARA LA FECHA
    themeSystem: "bootstrap5", //ESTILO DEL CALENDARIO
    initialView: "resourceTimeGridDay", //TIPO DE VISTA DEL CALENDARIO
    allDaySlot: false, //SECCIÓN ALLDAY, MANTENER EN FALSE
    dayHeaders: true, //CABEZARA DEL CALENDARIO, MANTENER EN TRUE
    editable: true, //PROPIEDAD EDITABLE DE EVENTOS
    initialDate: new Date(), //FECHA INICIAL DEL CALENDARIO
    slotLabelFormat: { hour: "2-digit", minute: "2-digit" }, //FORMATO DE HORA
    nowIndicator: true, //INDICADOR DE HORA DEL DIA ACTUAL
    selectable: true, //PROPIEDAD PARA SELECCIONAR ELEMENTOS
    resources: [
      { id: "a", title: "PSP" }, //PANELES DEL CALENDARIO
      { id: "b", title: "Calendar" }, //PANELES DEL CALENDARIO
    ] /*
    events: [
      { id:'nuevo',title: 'Event 1', start: '2022-09-07T10:30:00', end: '2022-09-07T11:30:00', resourceId: 'a' },
    ],*/,
    events: arrayEvents, //DECLARACION DE EVENTOS AL ABRIR EL CALENDARIO
    businessHours: {
      //DECLARACION DE DIAS Y HORAS LABORALES
      // days of week. an array of zero-based day of week integers (0=Sunday)
      daysOfWeek: [1, 2, 3, 4, 5], // Monday - Thursday
      startTime: "07:30", // a start time (10am in this example)
      endTime: "17:45", // an end time (6pm in this example)
    },
    eventClick: (
      info //Funcion para poder hacerle click a un evento
    ) => {
      const data = {
        start: info.event.startStr,
        end: info.event.endStr,
        resourceId: info.event.getResources()[0]._resource.id,
        id: info.event.id,
        componente: info.event.extendedProps.componente,
        nota: info.event.extendedProps.nota,
        title: info.title,
      };
      if (info.event.extendedProps.comentario) {
        data.comentario = info.event.extendedProps.comentario;
      }
      if (info.event.extendedProps.hu) {
        data.hu = info.event.extendedProps.hu;
      }
      if (info.event.extendedProps.bug) {
        data.bug = info.event.extendedProps.bug;
      }

      pspWindow(data);
      //alert('Event: ' + info.event.title);
      //alert('Coordinates: ' + info.jsEvent.pageX + ',' + info.jsEvent.pageY);
      //console.log('View: ', info.getCurrentData());
      // change the border color just for fun
      //info.el.style.borderColor = 'red';
    },
    eventDrop: (
      info //FUNCION PARA ACTUALIZAR LUEGO DE ARRASTRAR
    ) => {
      //console.log(info.event.startStr);
      //console.log(info.event.endStr);
      //console.log(info.event.title)
      //console.log(info)
      const data = {
        start: info.event.startStr,
        end: info.event.endStr,
        resourceId: info.event.getResources()[0]._resource.id,
        id: info.event.id,
      };
      //console.log("droped: ",data)
      ipcRenderer.send("update-registro-psp", data, false); //LLAMADO FUNCION EDITAR
    },
    select: (
      info //FUNCION PARA AGREGAR NUEVO EVENTO AL CALENDARIO
    ) => {
      const data = {
        start: info.startStr,
        end: info.endStr,
        resourceId: info.resource._resource.id,
      };
      pspWindow(data);
    },
    eventAllow: (
      dropInfo,
      draggedEvent //VALIDACIONES PARA ARRASTRAR EVENTOS
    ) => {
      if (
        draggedEvent.getResources()[0]._resource.id === "b" &&
        dropInfo.resource.id === "a"
      ) {
        return true;
      }
      if (dropInfo.resource.id === "a") {
        return true;
      }
      return false;
    },
    eventResize: (
      info //ACTUALIZACIÒN DE HORAS DEL EVENTO
    ) => {
      let data = {
        start: info.event.startStr,
        end: info.event.endStr,
        resourceId: info.event.getResources()[0]._resource.id,
        id: info.event.id,
      };
      ipcRenderer.send("update-registro-psp", data, false); //LLAMADO FUNCION EDITAR
    },
  });
  const windowHeight = window.innerHeight - window.innerHeight * 0.1;
  calendar.setOption("height", windowHeight); //Set altura del contenerdor del calendario
  calendar.setOption("locale", "es");
  calendar.render();
}
//FUNCION PARA SCROLLEAR ENTRE DIAS
async function loadScroll() {
  scrollPane = document.querySelector(".fc-scroller-liquid-absolute");
  scrollPane.addEventListener("scroll", () => {
    if (
      scrollPane.offsetHeight + scrollPane.scrollTop >=
      scrollPane.scrollHeight
    ) {
      calendar.next();
      calendar.scrollToTime("01:00");
    } else if (scrollPane.scrollTop === 0) {
      calendar.prev();
      calendar.scrollToTime("15:00");
    }
  });
}

//RESPUESTA DE LA BDD AL BORRAR
ipcRenderer.on("delete-event", async (e, args) => {
  let resp = JSON.parse(args);
  //console.log("respuesta: ",resp)
  calendar.getEventById(resp._id).remove(); //ELIMINA EL EVENTO DEL CALENDARIO
});

//LLAMADO DE FUNCIONES ASINCRONAS DE CARGA DE CALENDARIO Y SCROLL DEL CALENDARIO
(async () => {
  await cargaCalendar();
  await loadScroll();
})();
