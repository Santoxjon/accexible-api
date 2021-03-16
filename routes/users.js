var express = require('express');
var router = express.Router();

var bcrypt = require('bcrypt');
router.use(express.json());
router.use(express.urlencoded({ extended: false }));

/* GET users listing. */

router.post("/login", function (req, res) {
  let email = req.body.email;
  let password = req.body.password;

  let dbConnection = req.app.locals.db;
  dbConnection.collection("users")
    .findOne(
      { email },
      (err, user) => {
        if (err !== null) {
          res.json({ mensaje: "Ha habido un error", status: false });
        } else {
          if (user) {
            if (bcrypt.compareSync(password, user.password)) {
              res.json({ status: 0 });
            } else {
              res.json({ status: 1 });
            }
          } else {
            res.json({ status: 2 });
          }
        }
      });
});

/* POST FROM REGISTER FORM. */
router.post('/register', (req, resp) => {
  let newUser = req.body;
  //console.log(newUser);

  let encryptPass = newUser.password;
  //console.log("Contrasena antes de cifrado " + newUser.password);
  let contraseniaCifrada = bcrypt.hashSync(encryptPass, 10); //  la encripta con metodo hash de bcrypt, parametro y nivel de seguridad q daremos a la contrasena
  //console.log("contraseña cifrada:" + contraseniaCifrada); // contraseña cifrada --->     "passw" : "$2b$10$Idr63VLuTACe63fUNeg4seWNU8B/RNfUAn6fchEhO2iVBhoEvt/Qq",
  newUser.password = contraseniaCifrada; // valor contrasena cifrada la asigno como nuevo valor del la clave de la contrasena
  //console.log("Mi usuario con cont cifrada " + JSON.stringify(newUser)); // pinto usuario con contraseña cifrada ---> "passw" : "$2b$10$Idr63VLuTACe63fUNeg4seWNU8B/RNfUAn6fchEhO2iVBhoEvt/Qq",

  dbConnection = req.app.locals.db;
  dbConnection.collection('users').find({ "email": newUser.email }).toArray(function (err, datos) {
    if (err != null) {
      //console.log(err);
      res.send("Ha habido un error: " + err);

    } else {
      //console.log(datos); 
      if (datos.length > 0) {
        resp.redirect("http://localhost:3000/register")
      } else {
        dbConnection.collection('users').insertOne(newUser, function (err, datos) {
          if (err != null) {
            console.log(err);
            res.send("Ha habido un error: " + error);
          } else {
            resp.redirect("http://localhost:3000/login")
          }

        })
      }
    }
  })

});
module.exports = router;
