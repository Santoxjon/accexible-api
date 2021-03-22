var express = require('express');
var router = express.Router();

/** 
 *  PUT - De cada nuevo resultado en BBDD
*/
router.post('/newresult', (req, res) => {
    // let _id = new ObjectId(req.query.id);
    let newTestResult = req.body;
    console.log(newTestResult);

    dbConnection = req.app.locals.db;
    dbConnection.collection('testResults').insertOne(newTestResult, function (err) {
        if (err != null) {
            console.log(err);
            res.send("Ha habido un error: " + error);
        } else {
            res.redirect("http://localhost:3000/results")
        }
    })
});

module.exports = router;