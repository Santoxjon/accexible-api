const { ObjectId } = require('mongodb');
var express = require('express');
const chalk = require('chalk');
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
    let message = req.body.message.toLowerCase();
    let userId = new ObjectId(req.body.userId);

    req.app.locals.db.collection("results").findOne({ userId, finished: false }, (err, result) => {
        if (err != null) {
            console.log(err);
            res.send({ mensaje: "error: " + err });
        } else {
            
            let score = result.scoreChat;
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
                    req.app.locals.db.collection("results").updateOne({ userId, finished: false }, { $set: { scoreChat: score } }, (err) => {
                        if (err != null) {
                            console.log(err);
                            res.send({ mensaje: "error: " + err });
                        } else {
                            res.json(score);
                        }
                    });
                }
            });
        }
    });
});

module.exports = router;