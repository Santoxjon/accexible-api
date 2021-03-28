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
 *  POST - De cada nuevo resultado del test cerrado en BBDD
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
        scoreChat: 0,
        date: new Date(),
        answers: arrayAnswers
    };

    arrayAnswers.forEach(answer => {
        newResult.scoreTest += mcTestScore[answer];
    });

    newResult.finished = false;
    newResult.mentioned = [];
    newResult.fppCounter = 0;
    newResult.oppCounter = 0;
    newResult.wordCounter = 0;
    newResult.rumination = 0;
    newResult.pronoungScoring = 0;
    newResult.questionsAsked = [];

    dbConnection = req.app.locals.db;
    dbConnection.collection('results').insertOne(newResult, function (err) {
        if (err != null) {
            console.log(err);
            res.send("Ha habido un error: " + error);
        } else if (newResult.scoreTest > 5) {
            res.redirect("http://localhost:3000/chatbot");
        } else {
            res.redirect("http://localhost:3000/chatbot");
        }
    })
});


/* GET ALL THE RESULTS FROM THE USER */
router.get('/resultsuser/:id', (req, res) => {
    let id = new ObjectId(req.params.id);
    // console.log(id);

    dbConnection = req.app.locals.db;
    dbConnection.collection('results').find({ "userId": id }).sort({ "date": -1 }).toArray(function (err, userTestFound) {
        if (err != null) {
            res.send("Ha habido un error: " + err);
        } else {
            if (userTestFound.length === 0) {
                res.send({ message: "NO EXISTEN RESULTADOS A MOSTRAR" });
                console.log("NADA QUE MOSTRAR EN RESULTADOS PARA EL USUARIO");
            } else {
                // console.log(userTestFound);
                res.send(userTestFound);
            }
        }
    });
});

/* GET SPECIFIC TEST RESULT FOR THE USER  */
router.get('/resultsuser/:id/:idtest', (req, res) => {
    let id = new ObjectId(req.params.id);
    let idtest = new ObjectId(req.params.idtest);
    console.log(idtest);


    dbConnection = req.app.locals.db;
    dbConnection.collection('results').findOne({ "_id": idtest }, (function (err, testToShow) {
        if (err != null) {
            res.send("Ha habido un error: " + err);
        } else {
            console.log(testToShow);
            res.json(testToShow);
        }
    }));
});



module.exports = router;