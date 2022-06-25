const express = require("express");
const bodyParser = require("body-parser");
const app = express();

app.use(bodyParser.json());

var ldap = require("ldapjs");
var client = ldap.createClient({
  url: "ldap://x.x.x.x:389",
});

let user = {
  username: "",
  password: "",
};

let respuesta = {
  error: false,
  codigo: 200,
  mensaje: "",
};

let UsuarioLdap = "";
/*update the url according to your ldap address*/

/*use this to create connection*/

/*use this to create connection*/
function authenticateDN(username, password) {
  return new Promise((resolve, reject) => {
    client.bind(username, password, (err) => {
      if (err) {
        resolve(false);
      }
      console.log("Success");
      resolve(true);
    });
  });
}

async function buscaUsuario(username) {
  return new Promise((resolve, reject) => {
    const opts = {
      filter: `(cn=${username})`,
      scope: "sub",
      attributes: ["givenName", "sn", "cn"],
    };
    client.search("o=sjd", opts, (err, res) => {
      res.on("searchRequest", (searchRequest) => {
        console.log("searchRequest: ", searchRequest.messageID);
      });
      res.on("searchEntry", (entry) => {
        resolve(entry.object);
      });
      res.on("searchReference", (referral) => {
        console.log("referral: " + referral.uris.join());
      });
      res.on("error", (err) => {
        reject("Error al buscar");
        console.error("error: " + err.message);
      });
      res.on("end", (result) => {
        console.log("status: " + result.status);
      });
    });
  });
}

app.post("/prueba", function (req, res) {
  console.log(req.body);
  console.log(req.body.username);

  res.send(req.body);
});

app.post("/validate", function (req, res) {
  let resultado = false;
  let mensajeout;

  async function validar() {
    resultado = await authenticateDN(
      "cn=" + req.body.username + ",o=sjd",
      req.body.password
    );
    console.log("resultado:" + resultado);
    if (resultado) {
      mensajeout = await buscaUsuario(req.body.username);
    }
    console.log("mensaje:" + mensajeout);

    if (resultado) {
      respuesta = {
        error: false,
        codigo: 200,
        mensaje: { mensajeout },
      };
    } else {
      respuesta = {
        error: true,
        codigo: 400,
        mensaje: "Login erroneo",
      };
    }
    res.send(respuesta);
  }

  validar();
});

app.get("/hola", function (req, res) {
  res.send("Saludos desde Express");
});

app.listen(8000, () => {
  console.log("El servidor esta escuchando el puerto 8000");
});
