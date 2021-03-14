var express = require('express');
var router = express.Router();

/** 
 *  GET - Todas las respuestas 
*/
router.get('/', (req, res) => {
    req.app.locals.db.collection("answers").find().sort({ "_id": 1 }).toArray(function (err, data) {
        if (err != null) {
            console.log(err);
            res.send({ mensaje: "error: " + err });
        } else {
            res.json(data)
        }
    });
});

module.exports = router;