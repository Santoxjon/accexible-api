var express = require('express');
var router = express.Router();

/** 
 *  GET - Todas las respuestas 
*/

router.get('/', (req, res) => {
    req.app.locals.db.collection("keywords").find().sort({ "value": -1 }).toArray(function (err, data) {
        if (err != null) {
            console.log(err);
            res.send({ mensaje: "error: " + err });
        } else {
            res.json(data)
        }
    });
});

router.post('/checkMessage', (req, res) => {
    let score = 0;
    let message = req.body.message.toLowerCase();
    req.app.locals.db.collection("keywords").find().sort({ "value": -1 }).toArray(function (err, data) {
        if (err != null) {
            console.log(err);
            res.send({ mensaje: "error: " + err });
        } else {
            data.forEach(keyword => {
                if (new RegExp(`\\b${keyword.word}\\b`, "i").test(message)) {
                    score += keyword.value;
                }
            });
            res.json(score);
        }
    });
});

module.exports = router;