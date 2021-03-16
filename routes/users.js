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

router.get("/checkToken", function (req, res) {
  let loginToken = req.query.token;
  let _id = new ObjectId(req.query.id);

  dbConnection = req.app.locals.db;
  dbConnection.collection('users').findOne({ _id, loginToken }, function (err, user) {
    if (err != null) {
      res.send("Ha habido un error: " + err);
    } else {
      if(user) {
        res.json(true)
      }
      else {
        res.json(false)
      }
    }
  })
});

router.get('/checkloggeduser', (req, res) => {
  let userLoginToken = req.query.loginToken
  let userObjectId = new ObjectId(req.query.userId)
  console.log(userLoginToken, userObjectId)
  dbConnection = req.app.locals.db;
  dbConnection.collection('users').findOne({ "loginToken": userLoginToken, "_id": userObjectId}, function (err, user) {
    if (err != null) {
      res.send("Ha habido un error: " + err);
    } else {
      if (user) {
        res.json(user) 
      }
    }
  })
})
module.exports = router;
