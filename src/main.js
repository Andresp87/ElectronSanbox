const {
  BrowserWindow,
  ipcMain,
  dialog,
  Notification,
  shell,
} = require("electron");
const settings = require("electron-settings");
//const electronGoogleOauth = require("electron-google-oauth");
const path = require("path");
const url = require("url");
const fs = require("fs");
const User = require("./modelos/Usuarios");
const Registro = require("./modelos/Registros");
const Projects = require("./modelos/Projects");
//const { client_id, secret_id } = require('./config')

let loginWindow;
let ventanaPrincipal;
let userAccount = null;
let newWindow;
let pspWindow;

function createLoginWindow() {
  loginWindow = new BrowserWindow({
    width: 600,
    height: 400,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
    autoHideMenuBar: false,
    enableRemoteModule: true,
    frame: false,
    center: true,
    roundedCorners: true,
  });
  /*
  ventanaPrincipal.loadFile(path.join(__dirname,"../views/login.html"));
  */
  loginWindow.loadURL(
    url.format({
      pathname: path.join(__dirname, "../views/login.html"),
      protocol: "file",
      slashes: true,
    })
  );
}

//FUNCION PARA CREACION DE VENTANA PRINCIPAL INDEX.HTML
function createWindow(args) {
  ventanaPrincipal = new BrowserWindow({
    width: 1024,
    height: 768,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
    autoHideMenuBar: false,
    enableRemoteModule: true,
  });
  ventanaPrincipal.loadFile("src/index.html");
  if (args != null) {
    ventanaPrincipal.on("ready-to-show", () => {
      ventanaPrincipal.webContents.send("validate-google", args);
    });
  }
}
//IPCMAIN PARA ABRIR LOGIN DE GOOGLE EN EL NAVEGADOR
ipcMain.on("Google", async (e) => {
  shell.openExternal("http://localhost:3000"); //APERTURA DE LOGIN GOOGLE EN NAVEGADOR CON FUNCION SHELL DE ELECTRO
});
//IPCMAIN QUE RECIBE EL AUTH SUCCES DE GOOGLE
ipcMain.on("GoogleAuthSucces", async (e, user) => {
  //OBJETO CON DATA DEL USUARIO DE GOOGLE PARA GUARDAR EN SETTINGS
  userAccount = {
    name: user.name,
    sub: user.sub,
    given_name: user.given_name,
    family_name: user.family_name,
    email_verified: user.email_verified,
    verified: user.verified,
    language: user.language,
    email: user.email,
    picture: user.picture,
    hd: user.hd,
    domain: user.domain,
  };
  //fs.truncate(path.join(__dirname,'../assets/account.txt'), 0, function(){console.log('limpio')})
  await settings.set({ userAccount }); //GUARDADO DE SESION DEL USUARIO EN SETTINGS LOCALES
  loginWindow.focus();
  loginWindow.show();
  loginWindow.webContents.send("LoginSuccess");
  //console.log(await settings.file(), await settings.get())
  //fs.writeFileSync(path.join(__dirname,'../assets/account.txt'), JSON.stringify(userAccount));
  //ventanaPrincipal.webContents.send("google-user", await settings.get('userAccount'));//ENVIO DE DATA DE USUARIO A VENTANA PRINCIPAL
});

ipcMain.on("GoogleAuthFail", async (e) => {
  loginWindow.focus();
  loginWindow.show();
  loginWindow.webContents.send("GoogleAuthFail");
});

ipcMain.on("check-google", async (e) => {
  if (settings.hasSync("userAccount"))
    loginWindow.webContents.send("LoginSuccess");
});

//VALIDACION DE DATA DE USUARIO EN SETTINGS AL INICIAR LA APP
ipcMain.on("validate-google", async (e) => {
  //await settings.set({...await settings.get(), color:'azul'})//ASI PUEDO AGREGAR NUEVOS ELEMENTOS A EL ARCHIVO SETTINGS
  //userAccount = await settings.get('userAccount')
  if (settings.hasSync("userAccount")) {
    userAccount = await settings.get("userAccount");
    createWindow(userAccount);
    loginWindow.destroy();
    //ventanaPrincipal.webContents.send("validate-google", await settings.get('userAccount'));//ENVIO DE DATA DE SESION DE USUARIO A VENTANA PRINCIPAL
    //e.reply("validate-google", await settings.get('userAccount'));//ENVIO DE DATA DE SESION DE USUARIO A VENTANA PRINCIPAL
  }
});
//IPCMAIN PARA REALIZAR LOGOUT DE GOOGLE
ipcMain.on("logoutGoogle", async (e) => {
  //let previo = await settings.get()//ASI PUEDO BORRAR DATA DE USUARIO Y MANTENER EL RESTO
  //delete previo.userAccount;//ASI PUEDO BORRAR DATA DE USUARIO Y MANTENER EL RESTO
  settings.unsetSync(); //BORRADO DE DATA DE USUARIO EN SETTINGS
  createLoginWindow();
  ventanaPrincipal.destroy();
  //await settings.set(previo)//ASI PUEDO BORRAR DATA DE USUARIO Y MANTENER EL RESTO
  //console.log(await settings.get())//ASI PUEDO BORRAR DATA DE USUARIO Y MANTENER EL RESTO
  loginWindow.focus();
  loginWindow.show();
  loginWindow.webContents.send("logoutGoogle");
});
//IPCMAIN PARA GENERAR NUEVA VENTANA MODAL SOBRE PRINCIPAL, RECIBE TITULO Y RUTA OBLIGATORIO
ipcMain.on("newWindow", async (e, args, menu) => {
  //console.log(args)
  const ruta = args != null ? args.ruta : "views/error.html";
  const title = args != null ? args.title : "Nueva Ventana";
  newWindow = new BrowserWindow({
    width: 800,
    height: 600,
    modal: true,
    parent: ventanaPrincipal,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      devTools: true,
    },
    autoHideMenuBar: false,
    enableRemoteModule: true,
  });
  newWindow.setTitle(title);
  newWindow.webContents.openDevTools();
  if (menu) newWindow.setMenu(null);
  newWindow.loadURL(
    url.format({
      pathname: path.join(__dirname, ruta),
      protocol: "file",
      slashes: true,
    })
  );
  newWindow.on("closed", () => {
    newWindow = null;
  });
  if (args.data != null) {
    newWindow.on("ready-to-show", () => {
      newWindow.webContents.send("get-data", args.data);
    });
  }
});
//IPCMAIN PARA GENERAR NUEVA VENTANA MODAL SOBRE VENTANA SECUNDARIA, RECIBE TITULO Y RUTA OBLIGATORIO
ipcMain.on("pspWindow", async (e, args, menu) => {
  //console.log(args)
  const ruta = args != null ? args.ruta : "views/error.html";
  const title = args != null ? args.title : "Nueva Ventana";
  pspWindow = new BrowserWindow({
    width: 600,
    height: 400,
    modal: true,
    parent: newWindow,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
    autoHideMenuBar: false,
    enableRemoteModule: true,
  });
  pspWindow.setTitle(title);
  if (menu) pspWindow.setMenu(null);
  pspWindow.loadURL(
    url.format({
      pathname: path.join(__dirname, ruta),
      protocol: "file",
      slashes: true,
    })
  );
  pspWindow.on("closed", () => {
    pspWindow = null;
    newWindow.focus();
  });
  if (args.data != null) {
    pspWindow.on("ready-to-show", () => {
      pspWindow.webContents.send("get-data", args.data);
    });
  }
});
//IPCMAIN PARA CIERRE DE VENTANA MODAL
ipcMain.on("closePSP", () => {
  pspWindow.destroy();
  newWindow.focus();
});
ipcMain.on("closeLogin", () => {
  loginWindow.destroy();
});
//IPCMAIN PARA AJUSTAR TAMAÑO DE VENTANA PSP SEGUN CONTENIDO MOSTRADO
ipcMain.on("ajustWindow", async (e, arg) => {
  let height = pspWindow.getSize()[1];
  if (arg) height += 60;
  else height -= 60;
  pspWindow.setSize(600, height);
});
//IPCMAIN PARA RECIBIR CARGA DE IMAGEN PARA PERFIL DE USUARIO
ipcMain.on("add-photo", async (e) => {
  const imagen = await dialog.showOpenDialog({
    title: "Imagen de perfil",
    properties: ["openFile"],
    filters: [{ name: "Images", extensions: ["jpg", "png", "gif"] }],
  });
  if (!imagen.canceled) e.reply("add-photo", imagen.filePaths[0]);
});
//IPCMAIN PARA GUARDAR USUARIO EN BDD
ipcMain.on("add-user", async (e, arg) => {
  const newUser = new User(arg);
  const userSaved = await newUser.save();
  newWindow.destroy();
  ventanaPrincipal.webContents.send("add-user", JSON.stringify(userSaved));
});
//IPCMAIN PARA CONSULTAR USUARIOS EN BDD
ipcMain.on("get-users", async (e, arg) => {
  const users = await User.find();
  e.reply("get-users", JSON.stringify(users));
});
//IPCMAIN PARA EDITAR USUARIO EN BDD
ipcMain.on("update-user", async (e, args) => {
  const updatedUser = await User.findByIdAndUpdate(
    args.idUser,
    {
      firstName: args.firstName,
      lastName: args.lastName,
      email: args.email,
      phone: args.phone,
      photo: args.photo,
    },
    { new: true }
  );
  newWindow.destroy();
  ventanaPrincipal.webContents.send(
    "update-user-success",
    JSON.stringify(updatedUser)
  );
});
/*
ipcMain.on("send-user", async (e, args) => {
  newWindow.webContents.send('send-user', args);
});
*/
//IPCMAIN PARA ELIMINAR USUARIO DE LA BDD
ipcMain.on("delete-user", async (e, args) => {
  const userDeleted = await User.findByIdAndDelete(args);
  e.reply("delete-user-success", JSON.stringify(userDeleted));
});
//IPCMAIN PARA GENERAR ALERTAS DE ESCRITORIO, RECIBE OBLIGATORIO TITLE Y BODY
ipcMain.on("alert-window", async (e, args) => {
  const notification = new Notification({
    title: args.title,
    body: args.body,
    timeoutType: 10,
  });
  notification.show();
});
//IPCMAIN PARA REGISTRAR EVENTOS DE CALENDARIO EN BDD
ipcMain.on("add-registro-psp", async (e, args) => {
  //console.log("recibido desde el front: ",args)
  const newRegistro = new Registro(args);
  const registroSaved = await newRegistro.save();
  //console.log("registrado en la bdd",registroSaved)
  newWindow.webContents.send("get-registro", JSON.stringify(registroSaved));
  pspWindow.destroy();
});
//IPCMAIN PARA ACTUALIZAR EVENTOS DEL CALENDARIO EN BDD
ipcMain.on("update-registro-psp", async (e, args, render) => {
  const { id, ...values } = args;
  //console.log("llamó al editar",id,args)
  const updatedRegistro = await Registro.findByIdAndUpdate(id, values, {
    new: true,
  });
  //console.log(updatedRegistro)
  newWindow.webContents.send("get-registro", JSON.stringify(updatedRegistro));
  if (render)
    //CONDICIONAL PARA CERRAR VENTANA DE FORMULARIO
    pspWindow.destroy();
});
/*
ipcMain.on("get-registro-psp", async (e, args) => {
  console.log(args)
  //let registros = await Registro.find({'$or':[{start:{'$gte':args.start,'$lte':args.end}},{end:{'$gte':args.start,'$lte':args.end}}]})
  let registros = await Registro.find()
  newWindow.webContents.send("get-registros-bdd", JSON.stringify(registros));
});
*/
//IPCMAIN ASINCRONO PARA SOLICITAR EVENTOS EN BDD Y RENDERIZARLOS EN EL CALENDARIO EN EL INICIO
ipcMain.handle("my-invokable-ipc", async (event) => {
  let result = [];
  //result = await Registro.find({'$or':[{start:{'$gte':start,'$lte':end}},{end:{'$gte':start,'$lte':end}}]})
  result = await Registro.find();
  //console.log(JSON.stringify(result))
  return JSON.stringify(result);
});
//IPCMAIN PARA ELIMINAR EVENTOS DEL CALENDARIO DE LA BDD
ipcMain.on("delete-registro-psp", async (e, args) => {
  const pspDeleted = await Registro.findByIdAndDelete(args);
  pspWindow.destroy();
  newWindow.webContents.send("delete-event", JSON.stringify(pspDeleted));
});
//IPCMAIN PARA GUARDAR USUARIO EN BDD
ipcMain.on("add-project", async (values) => {
  const newProject = new Projects(values);
  const projectSaved = await newProject.save();
  newWindow.destroy();
  ventanaPrincipal.webContents.send(
    "add-project",
    JSON.stringify(projectSaved)
  );
});
//IPCMAIN PARA CONSULTAR PROYECTOS EN BDD
ipcMain.on("get-projects", async (e, arg) => {
  const projects = await Projects.find();
  e.reply("get-projects", JSON.stringify(projects));
});

module.exports = { createWindow, createLoginWindow };
