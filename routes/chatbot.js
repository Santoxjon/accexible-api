const { ObjectId } = require('mongodb');
var express = require('express');
const chalk = require('chalk');
var router = express.Router();

const FPP = ['yo', 'mi', 'mis', 'conmigo', 'me', 'mio', 'mia'];
const OPP = ["el", "ella", "ello", "ellas", "ellos", "los", "las", "suyo", "suya", "suyos", "suyas"];
const tellMeMore = [
    "Necesito algo más de información para poder ayudarte, por favor, desarrolla un poco lo que quieres comunicarme",
    "¿Puedes explicármelo con más detalles?",
    "¿Puedes profundizar un poco más?",
    "¿Puedes contarme más sobre ello?"
]
const whyAreYouLike = {
    0: [
        '¿Cuando te sientes apartado/da o solo/a, qué otros pensamientos te vienen a la cabeza?',
        '¿A qué recurres cuando te sientes fuera de lugar?',
        '¿Has hablado esto con alguien? ¿Y cómo te ha hecho sentir eso?'
    ],
    1: [
        '¿Qué más cosas o personas te producen tristeza?',
        '¿Ha pasado algo más recientemente que te haya puesto triste?',
        '¿Cuándo te sientes de esta manera recurres al odio?',
        '¿Te ha llevado esta situación a pensar sentimientos autodestructivos?'
    ],
    2: [
        '¿Por qué te sientes de esta forma? ¿Ha habido alguien que te lo haya dicho directamente?',
        '¿Has intentado hablar con otras personas sobre esto?',
        '¿Tener estos sentimientos ha afectado a tus horarios de sueño?'
    ],
    3: [
        '¿Ha habido algo en concreto que te haya bajado la moral hasta tal punto?',
        '¿Ha afectado a tu salud física en algo en concreto?',
        '¿Sabes quién puede ser culpable de este tipo de sentimientos?'
    ],
    4: [
        '¿Has hablado este tema con tu círculo cercano de personas? ¿Amigos, compañeros de trabajo, familia?',
        '¿Este sentimiento lo has generado por soledad, tristeza u otro sentimiento?',
        '¿Cuanto tiempo hace que tienes estos pensamientos?'
    ],
    5: [
        '¿Tienes algún otro sentimiento con tanta frecuencia?',
        '¿Crees que estás en una especie de bucle? ¿Te viene a la cabeza algún otro pensamiento?'
    ],
    6: [
        '¿Tienes algún otro sentimiento con tan poca o nula frecuencia?',
        '¿Crees que estás en una especie de callejón sin salida? ¿Te viene a la cabeza algún otro pensamiento?'
    ],
    7: [
        '¿Han llevado estos sentimientos a que pienses en herir a alguien o a ti mismo?',
        '¿Esta situación de enfado puede venir por algún sentimiento de culpa?'
    ],
    8: [
        '¿Te ha afectado la falta de sueño a tu estado psicológico?',
        '¿Podrías decirme qué crees que ha podido llevarte a esta situación?'
    ],
    9: [
        '¿Qué crees que te ha podido llevar a culparte por lo que sientes?',
        '¿Por qué te sientes responsable de lo que sientes ahora?'
    ],
    10: [
        '¿Has probado a comentar esta situación con tu círculo cercano?',
        '¿Has considerado pedir ayuda?'
    ]
}


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
    let userTime = req.body.responseTime;
    let nowTime = Date.now();
    console.log(`Now time ${nowTime}`, `\nMessage time ${userTime}`);
    console.log(`Response time ${parseInt((nowTime - userTime) / 1000)}`);

    // Get the result row
    req.app.locals.db.collection("results").findOne({ userId, finished: false }, (err, result) => {
        if (err != null) {
            console.log(err);
            res.send({ mensaje: "error: " + err });
        } else {
            // let scoreTest = result.scoreTest;
            let scoreChat = result.scoreChat;
            let mentionedGroups = result.mentioned;
            let fppCounter = +result.fppCounter;
            let oppCounter = +result.oppCounter;
            let wordCounter = +result.wordCounter
            let questionsAsked = result.questionsAsked;
            let rumination = +result.rumination;
            let pronounScoring = +result.pronounScoring;
            let responseTimeScoring = +result.responseTimeScoring;

            if (wordCounter >= 150) {
                req.app.locals.db.collection("results")
                    .updateOne(
                        { userId, finished: false },
                        {
                            $set:
                                { finished: true }
                        }, (err) => {
                            if (err === null) {
                                res.json("Recibido! El link de debajo te llevará a tu resultados&^");
                            }
                            else{
                                console.log(err);
                            }
                        })
            }
            else {
                wordCounter += message.split(" ").length;
                let timeCalc = parseInt((nowTime - userTime) / 1000);
                if (responseTimeScoring < 1) {
                    responseTimeScoring += (message.split(" ").length / timeCalc) < 0.35 ? 0.1 : 0;
                }
                FPP.forEach(fpp => {
                    let matches = message.match(new RegExp(`\\b${fpp}\\b`, "ig"));
                    fppCounter += matches ? matches.length : 0;
                });
                OPP.forEach(opp => {
                    let matches = message.match(new RegExp(`\\b${opp}\\b`, "ig"));
                    oppCounter += matches ? matches.length : 0;
                });

                if ((fppCounter + oppCounter) > 5) {
                    pronounScoring = +(fppCounter / (fppCounter + oppCounter)).toFixed(1);
                }
                else {
                    pronounScoring = 0;
                }

                // Get all the keywords except already mentioned ones
                req.app.locals.db.collection("keywords").find({ mentioned: { $nin: mentionedGroups } }).sort({ "group": -1 }).toArray(function (err, data) {
                    if (err != null) {
                        console.log(err);
                        res.send({ mensaje: "error: " + err });
                    } else {

                        // Update score using keywords value
                        data.forEach(keyword => {
                            if (new RegExp(`\\b${keyword.word}\\b`, "i").test(message)) {

                                // When a word from a new group is said push that group's value to the array if a keyword or keywords from the same groups are repeated rumination's value in slightly increased
                                if (!mentionedGroups.includes(keyword.group)) {
                                    mentionedGroups.push(keyword.group);
                                    scoreChat += keyword.value;
                                }
                                else {
                                    rumination += rumination < 1 ? 0.05 : 1;
                                }
                            }
                        });

                        /* -------------------------------------------------------- */
                        /* ANSWER WITH A QUESTION DEPENDING ON THE USER'S LAST KEYWORD
                        /* -------------------------------------------------------- */
                        let botMessage = "";
                        let lastMentionedGroup = mentionedGroups[mentionedGroups.length - 1];
                        console.log(`Last mentioned group ${lastMentionedGroup}`);
                        if (lastMentionedGroup !== undefined) {
                            let randomIndex = ~~(Math.random() * (whyAreYouLike[lastMentionedGroup].length));
                            let nextQuestion = "";
                            if (message.split(" ").length >= 5) {
                                console.log("He entrado aquí");
                                // Remove questions that have already been asked
                                if (questionsAsked.length > 0) {
                                    let filteredQuestionArray = whyAreYouLike[lastMentionedGroup].filter(question => !questionsAsked.includes(question));
                                    randomIndex = ~~(Math.random() * filteredQuestionArray.length);
                                    nextQuestion = filteredQuestionArray[randomIndex];
                                }
                                else if (mentionedGroups.length > 0) {
                                    console.log(`Last mentioned group ${lastMentionedGroup}`);
                                    console.log(`Random index ${randomIndex}`);
                                    nextQuestion = whyAreYouLike[lastMentionedGroup][randomIndex];
                                }
                                else {
                                    botMessage += `No he detectado nada que poder analizar por favor sigue contándome`;
                                }
                                // Set a response message/question
                                if (nextQuestion !== undefined) {
                                    botMessage += nextQuestion + "&";
                                    questionsAsked.push(nextQuestion);
                                }
                                else {
                                    botMessage += "Entiendo... Por favor cuéntame si hay algo más que te aflija aunque no se de este tema,o si no, puedes contarme como te sientes en estos momentos teniendo en cuenta lo que llevamos hablado&";
                                }
                            }

                        }
                        else {
                            botMessage += `No he detectado nada que poder analizar por favor cuéntame cómo te hace sentir eso`;
                        }

                        req.app.locals.db.collection("results")
                            .updateOne(
                                { userId, finished: false },
                                {
                                    $set:
                                        { scoreChat, mentioned: mentionedGroups, fppCounter, oppCounter, wordCounter, questionsAsked, rumination, pronounScoring, responseTimeScoring }
                                },
                                (err) => {
                                    if (err != null) {
                                        console.log(err);
                                        res.send({ mensaje: "error: " + err });
                                    } else {
                                        if (wordCounter < 150) {
                                            if (message.split(" ").length < 5) {
                                                res.json(tellMeMore[Math.floor(Math.random() * tellMeMore.length)]);
                                            }
                                            else {
                                                // let totalScore = +(scoreChat + scoreTest + pronounScoring + rumination).toFixed(1)
                                                // botMessage += " &";
                                                // botMessage += `Score del test ${scoreTest}&`;
                                                // botMessage += `Score del chat ${scoreChat}&`;
                                                // botMessage += `Score pronombres ${pronounScoring}&`;
                                                // botMessage += `Score rumination ${rumination}&`;
                                                // botMessage += `SCORE TOTAL: ${totalScore} / 15&`;
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
        }
    });
});

module.exports = router;