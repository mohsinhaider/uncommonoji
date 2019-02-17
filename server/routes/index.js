/*
    File: server.js
    Description: Base router configuration and Firebase + Controller setup
    Author: @mohsinhaider
*/

let express = require('express');
let config = require('../config');
let firebase = require('firebase');
// let Story = require('../controller/story');

let router = express();

// TODO: Initialize Firebase
// router.use('/story', Story({}));
let FirebaseApp = firebase.initializeApp(config.firebase);
let db = FirebaseApp.database();

router.post('/story/add', (req, res) => {
    db.ref('stories/').push({
        points: req.body.points
    }).then((res) => {
        const newUserID = res.key;
    })
})


module.exports = router;