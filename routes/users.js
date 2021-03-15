var express = require('express');
var router = express.Router();
var bcrypt = require('bcrypt');
router.use(express.json());
router.use(express.urlencoded({ extended: false }));

/* GET users listing. */

router.post("/login", function (req, res) {//ponemos nueva URL que recibe usuario y contraseña
  console.log(req.body)
  let email = req.body.email;
  let password = req.body.password;
  console.log(email, password)
  let dbConnection = req.app.locals.db;
  dbConnection.collection("users")
    .find({ email })//haga un find del usuario
    .toArray(function (err, arrayUser) {//lo que era un objeto lo convierte en parte de un array
      // console.log(arrayUsuario);
      if (err !== null) {
        res.json({ mensaje: "Ha habido un error", status: false });
      } else {
        if (arrayUser.length > 0) {//si encuentra un usuario en el find comparará que la contraseña que hemos metido será la misma que la del parámetro
          if (password === arrayUser[0].password) {
            // if (bcrypt.compareSync(password, arrayUser[0].password)) {//si puede hacerla se logueará correctamente y si no, incorrecta.
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

module.exports = router;
