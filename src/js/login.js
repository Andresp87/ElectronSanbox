let closeBtn = document.querySelector("#closeBtn");
const loading = document.querySelector("#loading");
const loginGoogle = document.querySelector("#loginGoogle");

closeBtn.addEventListener("click", (event) => {
  ipcRenderer.send("closeLogin");
});

ipcRenderer.send("check-google"); //LLAMADO AL IPCMAIN QUE VALIDA SESIÓN DEL USUARIO

//FUNCION PARA LOGIN
loginGoogle.addEventListener("click", (event) => {
  $("#loading").removeClass("visually-hidden");
  $("#loginGoogle").addClass("visually-hidden");
  ipcRenderer.send("Google"); //LLAMADO AL IPCMAIN QUE REALIZA EL LOGIN DE GOOGLE DESDE EL NAVEGADOR
});

ipcRenderer.on("LoginSuccess", (e) => {
  if (!$("#loginGoogle").hasClass("visually-hidden")) {
    $("#loginGoogle").addClass("visually-hidden");
  }
  $("#loading").addClass("visually-hidden");
  $("#success_login").removeClass("visually-hidden");
  $("#spin_success").removeClass("visually-hidden");
  setTimeout(() => {
    ipcRenderer.send("validate-google");
  }, 5000);
});

ipcRenderer.on("GoogleAuthFail", (e) => {
  $("#loginGoogle").removeClass("visually-hidden");
  $("#fail_login").removeClass("visually-hidden");
  $("#loading").addClass("visually-hidden");
  $("#success_login").addClass("visually-hidden");
  $("#spin_success").addClass("visually-hidden");
  setTimeout(() => {
    $("#fail_login").addClass("visually-hidden");
  }, 5000);
});

//IPCRENDERER QUE RECIBE RESPUESTA DESDE EL MAIN AL
ipcRenderer.on("logoutGoogle", (e, args) => {
  ipcRenderer.send("alert-window", {
    title: "Notificación",
    body: "Logout Exitoso",
  }); //LLAMADO AL IPCMAIN QUE GENERA NOTIFICACIONES DE ESCRITORIO
});
