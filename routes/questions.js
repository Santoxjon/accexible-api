var express = require('express');
var router = express.Router();

/** 
 *  GET - Todas las preguntas 
*/
router.get('/', (req, res) => {
    dbConnection = req.app.locals.db;
    dbConnection.collection('questions').find({}).toArray(function (err, data) {
        if (err != null) {
            console.log(err);
            res.send({ mensaje: "error: " + err });
        } else {
            res.json(data)
            console.log(data);
        }
    });
});


module.exports = router;