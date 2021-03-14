var express = require('express');
var router = express.Router();

/** 
 *  GET - Todas las preguntas 
*/
router.get('/', (req, res) => {
    req.app.locals.db.collection("questions").find().sort({ "_id": 1 }).toArray(function (err, data) {
        if (err != null) {
            console.log(err);
            res.send({ mensaje: "error: " + err });
        } else {
            res.json(data)
        }
    });
});

module.exports = router;