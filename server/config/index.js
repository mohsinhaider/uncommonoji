let secrets = require("./secrets");

module.exports =  {
    firebase: {
        "apiKey": secrets.firebase.apiKey,
        "authDomain": secrets.firebase.authDomain,
        "databaseURL": secrets.firebase.databaseURL,
        "projectId": secrets.firebase.projectId,
        "storageBucket": secrets.firebase.storageBucket,
        "messagingSenderId": secrets.firebase.messagingSenderId
    },
    bodyParser: {
        "bodyLimit": "100kb"
    },
    express: {
        "port": 3005
    }
}