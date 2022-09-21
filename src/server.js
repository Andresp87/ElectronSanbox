const express = require("express");
const passport = require("passport");
const cookieSession = require("cookie-session");
const path = require("path");
const { ipcRenderer } = require("electron");

const app = express();

app.use(
  cookieSession({
    name: "google-auth-session",
    keys: ["key1", "key2"],
  })
);
app.use(passport.initialize());
app.use(passport.session());

app.set("view engine", "ejs");

app.get("/", (req, res) => {
  //res.send("<button><a href='/auth'>Login With Google</a></button>")
  //res.sendFile(path.join(__dirname,'/views/login.html'))
  res.render("login");
});
/*
app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname,'/views/login.html'))
});
*/

// Auth
app.get(
  "/auth",
  passport.authenticate("google", { scope: ["email", "profile"] })
);

// Auth Callback
app.get(
  "/callback",
  passport.authenticate("google", {
    successRedirect: "/auth/callback/success",
    failureRedirect: "/auth/callback/failure",
  })
);

// Success
app.get("/auth/callback/success", (req, res) => {
  //console.log("callback: ",req.user)
  if (!req.user || req.user._json.domain !== "sequal.com.co") {
    res.redirect("/auth/callback/failure");
  } else {
    ipcRenderer.send("GoogleAuthSucces", req.user._json);
    res.render("success", { user: req.user._json });
  }

  //res.sendFile(path.join(__dirname,'/views/success.html'))
  //res.send("Welcome " + req.user.email);
});

// failure
app.get("/auth/callback/failure", (req, res) => {
  //ipcRenderer.send("alert-window",{title:"Notificación",body:"Logueo Fallido"})
  ipcRenderer.send("GoogleAuthFail");
  res.render("failure");
});

app.listen(3000, () => {
  console.log("Server Running on port 3000");
});
