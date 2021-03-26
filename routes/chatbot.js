const { ObjectId } = require('mongodb');
var express = require('express');
const chalk = require('chalk');
const { keyword } = require('chalk');
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

            // Get all the keywords except already mentioned ones
            let score = result.scoreChat;
            let mentionedGroups = result.mentioned;

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
                                score += keyword.value;
                            }
                        }
                    });
                    console.log(chalk.cyan(mentionedGroups));
                    req.app.locals.db.collection("results")
                        .updateOne(
                            { userId, finished: false },
                            {
                                $set:
                                    { scoreChat: score, mentioned: mentionedGroups }
                            },
                            (err) => {
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