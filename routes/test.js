var express = require('express');
var router = express.Router();
const { ObjectId } = require('mongodb');

const mcTestScore = {
    "a": 0.25,
    "b": 0.50,
    "c": 0.75,
    "d": 1
}

/** 
 *  PUT - De cada nuevo resultado del test cerrado en BBDD
*/
router.post('/newresult', (req, res) => {

    let array = Object.keys(req.body).filter((o) => o.includes("question"));
    let arrayAnswers = [];
    array.forEach((a) => {
        arrayAnswers.push(req.body[a])
    });

    let newResult = {
        userId: new ObjectId(req.body.userId),
        scoreTest: 0,
        scoreChat: -1,
        date: new Date(),
        answers: arrayAnswers
    };

    arrayAnswers.forEach(answer => {
        newResult.scoreTest += mcTestScore[answer];
    });

    dbConnection = req.app.locals.db;
    dbConnection.collection('results').insertOne(newResult, function (err) {
        if (err != null) {
            console.log(err);
            res.send("Ha habido un error: " + error);
        } else if (newResult.scoreTest > 5) {
            res.redirect("http://localhost:3000/chatbot");
        } else {
            res.send("no estas mal de la cabeza");
        }
    })
});

module.exports = router;