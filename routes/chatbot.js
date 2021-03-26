const { ObjectId } = require('mongodb');
var express = require('express');
const chalk = require('chalk');
var router = express.Router();

const FPP = ['yo', 'mi', 'conmigo', 'me', 'mio', 'mia'];
const OPP = ["el", "ella", "ello", "ellas", "ellos", "los", "las", "suyo", "suya", "suyos", "suyas"];
let tellMeMore = [
    "Necesito algo más de información para poder ayudarte, por favor, desarrolla un poco lo que quieres comunicarme",
    "¿Puedes explicármelo con más detalles?",
    "¿Puedes profundizar un poco más?",
    "¿Puedes contarme más sobre ello?"
]

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

    /**
     * Me everytime I see this code:
     * ლ(ಠ_ಠლ)
     */

    let message = req.body.message.toLowerCase();
    let userId = new ObjectId(req.body.userId);

    // Get the result row
    req.app.locals.db.collection("results").findOne({ userId, finished: false }, (err, result) => {
        if (err != null) {
            console.log(err);
            res.send({ mensaje: "error: " + err });
        } else {

            let scoreTest = result.scoreTest;
            let scoreChat = result.scoreChat;
            let mentionedGroups = result.mentioned;
            let fppCounter = +result.fppCounter;
            let oppCounter = +result.oppCounter;
            let wordCounter = +result.wordCounter
            if (wordCounter < 150) {
                wordCounter += message.split(" ").length;
            }
            else {
                res.json("Recivido! Dame un momento y te llevaré a los resultados...");
            }

            FPP.forEach(fpp => {
                let matches = message.match(new RegExp(`\\b${fpp}\\b`, "ig"));
                fppCounter += matches ? matches.length : 0;
            });
            OPP.forEach(opp => {
                let matches = message.match(new RegExp(`\\b${opp}\\b`, "ig"));
                oppCounter += matches ? matches.length : 0;
            });

            // Get all the keywords except already mentioned ones
            req.app.locals.db.collection("keywords").find({ mentioned: { $nin: mentionedGroups } }).sort({ "group": -1 }).toArray(function (err, data) {
                if (err != null) {
                    console.log(err);
                    res.send({ mensaje: "error: " + err });
                } else {

                    // Update score using keywords value
                    data.forEach(keyword => {
                        if (new RegExp(`\\b${keyword.word}\\b`, "i").test(message)) {
                            // When a word from a new group is said push that group's value to the array
                            if (!mentionedGroups.includes(keyword.group)) {
                                mentionedGroups.push(keyword.group);
                                scoreChat += keyword.value;
                            }
                        }
                    });

                    req.app.locals.db.collection("results")
                        .updateOne(
                            { userId, finished: false },
                            {
                                $set:
                                    { scoreChat, mentioned: mentionedGroups, fppCounter, oppCounter, wordCounter }
                            },
                            (err) => {
                                if (err != null) {
                                    console.log(err);
                                    res.send({ mensaje: "error: " + err });
                                } else {
                                    if (wordCounter < 150) {
                                        if (message.split(" ").length < 5) {
                                            res.json(tellMeMore[Math.floor(Math.random() * tellMeMore.length)] + " Tu score del chat: " + scoreChat);
                                        }
                                        else {
                                            let botMessage = `Score del test ${scoreTest}.&`;
                                            botMessage += `Score del chat ${scoreChat}&`;
                                            botMessage += `FPP: ${fppCounter}&`;
                                            botMessage += `OPP: ${oppCounter}&`;
                                            botMessage += `FPP%: ${fppCounter * (100 / (oppCounter + fppCounter))}&`
                                            botMessage += fppCounter * (100 / (oppCounter + fppCounter)) > 65 ? "Predominan pronombres de primera persona&" : "Predominan otros pronombres&";
                                            botMessage += `Total de palabras: ${wordCounter}&`
                                            botMessage += `SCORE TOTAL: ${scoreChat + scoreTest}&`;
                                            res.json(botMessage);
                                        }
                                    }
                                    else {
                                        res.json("Creo tener suficientes datos para poder evaluarte, aún así si te ha quedado algo por contarme puedes hacerlo o en caso contrario decirme que has terminado.")
                                    }
                                }
                            });
                }
            });
        }
    });
});

module.exports = router;