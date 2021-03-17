var express = require('express');
var router = express.Router();

var bcrypt = require('bcrypt');
const { ObjectId } = require('bson');
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
              res.json({ status: 0, user });
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
router.post('/register', (req, res) => {
  let newUser = req.body;
  let plainPass = newUser.password;
  let contraseniaCifrada = bcrypt.hashSync(plainPass, 10);
  newUser.password = contraseniaCifrada;
  newUser.loginToken = bcrypt.hashSync(new Date().getTime() + newUser.email, 10);

  dbConnection = req.app.locals.db;
  dbConnection.collection('users').find({ "email": newUser.email }).toArray(function (err, datos) {
    if (err != null) {
      //console.log(err);
      res.send("Ha habido un error: " + err);

    } else {
      //console.log(datos); 
      if (datos.length > 0) {
        res.redirect("http://localhost:3000/register")
      } else {
        dbConnection.collection('users').insertOne(newUser, function (err) {
          if (err != null) {
            console.log(err);
            res.send("Ha habido un error: " + error);
          } else {
            res.redirect("http://localhost:3000/login")
          }

        })
      }
    }
  })
});

router.get('/checkToken', (req, res) => {
  let loginToken = req.query.token;
  let _id = new ObjectId(req.query.id);

  dbConnection = req.app.locals.db;
  dbConnection.collection('users').findOne({ _id, loginToken }, function (err, user) {
    if (err != null) {
      res.send("Ha habido un error: " + err);
    } else {
      if (user) {
        res.json(user)
      }
      else {
        res.json(user)
      }
    }
  })
});

router.put('/updateToken', (req, res) => {
  let _id = new ObjectId(req.body._id)
  let email = req.body.email;
  let loginToken = bcrypt.hashSync(new Date().getTime() + email, 10);

  dbConnection = req.app.locals.db;
  dbConnection.collection('users').updateOne({ _id }, { $set: { loginToken } }, function (err) {
    if (err != null) {
      res.send("Ha habido un error: " + err);
    } else {
      res.json({ loginToken, _id });
    }
  })
});

router.put('/updateUser', (req, res) => {
  let _id = new ObjectId(req.body.id);
  let name = req.body.name;
  let email = req.body.email;

  dbConnection = req.app.locals.db;
  dbConnection.collection('users').updateOne({ _id }, { $set: { name, email } }, function (err, user) {
    if (err != null) {
      res.send("Ha habido un error: " + err);
    } else {
      if (user) {
        res.json(user);
      }
    }
  })
});

router.get('/checkEmail', (req, res) => {
  let email = req.query.email;

  dbConnection = req.app.locals.db;
  dbConnection.collection('users').findOne({ email }, function (err, user) {
    if (err != null) {
      res.send("Ha habido un error: " + err);
    } else {
      res.json(user);
    }
  });
});

module.exports = router;

router.put('/changePassword', (req, res) => {
  console.log(req.body)
  let _id = new ObjectId(req.body.id);
  let passwordNuevo = req.body.password;
  let passwordCifrado = bcrypt.hashSync(passwordNuevo, 10)
  dbConnection = req.app.locals.db;
  dbConnection.collection('users').updateOne({ _id }, { $set: {password: passwordCifrado} }, function (err, user) {
    if (err !== null) {
      res.send("Ha habido un error " + err);
    } else {
      if (user) {
        res.json(user);
      }
    }
  })
});