let firebase = require('firebase');
let Router = require('express').Router();

module.exports = () => {
    let api = Router();

    api.get('/add', (req, res) => {
        console.log("Received request!");
    });

    return api;
}