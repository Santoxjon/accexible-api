var express = require('express');
var router = express.Router();
var bcrypt = require('bcrypt');
router.use(express.json());
router.use(express.urlencoded({ extended: false }));

/* GET users listing. */

router.post("/login", function (req, res) {
  console.log(req.body)
  let email = req.body.email;
  let password = req.body.password;
  console.log(email, password)
  let dbConnection = req.app.locals.db;
  dbConnection.collection("users")
    .findOne(
      { email },
      (err, user) => {
        if (err !== null) {
          res.json({ mensaje: "Ha habido un error", status: false });
        } else {
          if (user) {
            // if (password === arrayUser[0].password) {
            if (bcrypt.compareSync(password, user.password)) {//si puede hacerla se logueará correctamente y si no, incorrecta.
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
