/* Modules */
const WebSocketServer = require('ws').Server
const express = require('express');
const os = require('os');
const axios = require('axios');
const cors = require('cors');
const jsonDataServer = require('json-server');
const bodyParser = require('body-parser');
const multer = require('multer');

/* Operational constants */
const jsonServerPort = 3020;
const httpPort = 80;
const ip = 'hms_core';
const DEBUG = true;

/* Objects */
const upload = multer();
const app = new express();
const jsonServer = jsonDataServer.create();
const jsonRouter = jsonDataServer.router(__dirname + '\\DB_user_data.json');
const jsonMiddlewares = jsonDataServer.defaults();

/* Configure json database server */
jsonServer.use(jsonMiddlewares);
jsonServer.use(jsonRouter);
//jsonServer.use();

/* Configure data update webserver */

/* Configure express app */
app.set('views', __dirname + '/views');                 /** Template views dir */
app.set('view engine', 'pug');                          /** PUG as view engine */
app.use(express.static(__dirname + '/public'));         /** Static page dir */
app.use(bodyParser.json());                             /** For parsing application/json */
app.use(bodyParser.urlencoded({ extended: true }));     /** For parsing application/xwww-s */
app.use(upload.array());                                /** For parsing multipart/form data */
app.use(cors());                                        /** For user authentication */

/* Express app routes */
/* Route to home page */
app.get('/', (req, res) => {
    res.send('login');
});

/* Login route */
app.get('/login', (req, res) => {
    res.sendFile(__dirname + '/public/login.html');
});

// todo authenticate portal client
app.get('/oauth/redirect', (req, res) => {
    axios({
        method: 'POST',
        url: `${GITHUB_URL}?client_id=${CLIENT_ID}&client_secret=${CLIENT_SECRET}&code=${req.query.code}`,
        headers: {
            Accept: 'application/json',
        },
    }).then((response) => {
        res.redirect(`http://localhost:${httpPort}/user?access_token=${response.data.access_token}`);
    });
});

/**
 * Gets a page populated with data specific to a user.
 */
app.get('/user/:locator', (req, res) => {
    // Get locator from URL
    let userLocator = req.params.locator;
    if (DEBUG) console.log(userLocator);

    // Get user data using locator from JSON server
    axios.get(`http://${ip}:${jsonServerPort}/users/${userLocator}`)
    .then((response) => {
        try {
            res.render('home', response.data);
        } catch (error) {
            if (DEBUG) console.log(error);
            res.sendStatus(404);
        }
    }).catch((error) => {
        if (DEBUG) console.log(error);
        res.sendStatus(404);
    });
});

/**
 * Gets a user's home monitoring system configuration data
 */
app.get('/resources/:locator/configs', (req, res) => {
    //Get locator from url
    let userLocator = req.params.locator;
    if (DEBUG) console.log(userLocator);

    // Get config object from user settings
    axios.get(`http://${ip}:${jsonServerPort}/users/${userLocator}`)
    .then((response) => {
        if (DEBUG) console.log(response.data.configs);
        res.send(response.data.configs);
    }).catch((error) => {
        if (DEBUG) console.log(error);
        res.sendStatus(404);
    });
});

/**
 * Gets a user's account preferences
 */
app.get('/resources/:locator/preferences', (req, res) => {
    //Get locator from url
    let userLocator = req.params.locator;
    if (DEBUG) console.log(userLocator);

    // Get config object from user settings
    axios.get(`http://${ip}:${jsonServerPort}/users/${userLocator}`)
    .then((response) => {
        if (DEBUG) console.log(response.data.preferences);
        res.send(response.data.preferences);
    }).catch((error) => {
        if (DEBUG) console.log(error);
        res.sendStatus(404);
    });
});

/**
 * Gets a user's registered cameras
 */
app.get('/resources/:locator/cameras', (req, res) => {
    // Get locator from url
    let userLocator = req.params.locator;
    if (DEBUG) console.log(userLocator);

    // Get config object from user settings
    axios.get(`http://${ip}:${jsonServerPort}/users/${userLocator}`)
    .then((response) => {
        if (DEBUG) console.log(response.data.cameras);
        res.send(response.data.cameras);
    }).catch((error) => {
        if (DEBUG) console.log(error);
        res.sendStatus(404);
    });
});

/**
 * Gets a user's contact set
 */
app.get('/resources/:locator/contacts', (req, res) => {
    //Get locator from url
    let userLocator = req.params.locator;
    if (DEBUG) console.log(userLocator);

    // Get config object from user settings
    axios.get(`http://${ip}:${jsonServerPort}/users/${userLocator}`)
    .then((response) => {
        if (DEBUG) console.log(response.data.contacts);
        res.send(response.data.contacts);
    }).catch((error) => {
        if (DEBUG) console.log(error);
        res.sendStatus(404);
    });
});

/**
 * Gets a user's alert set
 */
 app.get('/resources/:locator/alerts', (req, res) => {
    //Get locator from url
    let userLocator = req.params.locator;
    if (DEBUG) console.log(userLocator);

    // Get config object from user settings
    axios.get(`http://${ip}:${jsonServerPort}/users/${userLocator}`)
    .then((response) => {
        if (DEBUG) console.log(response.data.alerts);
        res.send(response.data.alerts);
    }).catch((error) => {
        if (DEBUG) console.log(error);
        res.sendStatus(404);
    });
});

/**
 * Post an update to user preferences
 */
app.post('/resources/:locator/preferences', (req, res) => {
    // Get locator from url
    let userLocator = req.params.locator;
    if (DEBUG) console.log(userLocator);
    
    // Validate schema of preferences update
    let valid = true; // \todo
    console.log('Preferences post updated data');
    console.log(req.body);

    if (valid === true)
    {
        // Patch preferences update to user JSON db entry 
        axios.patch(`http://${ip}:${jsonServerPort}/users/${userLocator}/`, req.body.newPreferences)
        .then((response) => {
            res.sendStatus(response.status);
        }).catch((error) => {
            res.sendStatus(404);
        });
    }
    else
    {
        res.sendStatus(404);
    }
});

/**
 * Post an update to user contacts
 */
app.post('/resources/:locator/contacts', (req, res) => {
    // Get locator from url
    let userLocator = req.params.locator;
    if (DEBUG) console.log(userLocator);
    
    // Validate schema of contacts update
    let valid = true; // \todo
    console.log(req.body);

    if (valid === true)
    {
        // Patch contacts update to user JSON db entry 
        axios.patch(`http://${ip}:${jsonServerPort}/users/${userLocator}`, req.body.newContacts)
        .then((response) => {
            res.sendStatus(response.status);
        }).catch((error) => {
            res.sendStatus(404);
        });
    }
    else
    {
        res.sendStatus(404);
    }
});

/**
 * Post an update to user cameras
 */
app.post('/resources/:locator/cameras', (req, res) => {
    // Get locator from url
    let userLocator = req.params.locator;
    if (DEBUG) console.log(userLocator);
    
    // Validate schema of cameras update
    let valid = true; // \todo
    console.log(req.body);

    if (valid === true)
    {
        // Generate camera update message
        let id = req.body.id;
        axios.get(`http://${ip}:${jsonServerPort}/users/${userLocator}`)
        .then((response) => { 
            let cameras = response.data.cameras;

            cameras.forEach(camera => {
                if (camera.id === id) camera.alive = req.body.alive;});

            console.log(`Sending cameras patch to ${userLocator}: ${JSON.stringify(cameras)}`);

            // Patch cameras update to user JSON db entry 
            axios.patch(`http://${ip}:${jsonServerPort}/users/${userLocator}`, {cameras: cameras})
            .then((response) => {
                res.sendStatus(response.status);
            }).catch((error) => {
                console.log(`Axios.patch error ${error}`);
                res.sendStatus(404);
            });
        }).catch((error) => {
            res.sendStatus(404);
            console.log(`Axios.get error ${error}`);
        });
    }
    else
    {
        res.sendStatus(404);
    }
});

/**
 * Post an update to user alerts
 */
app.post('/resources/:locator/alerts', (req, res) => {
    // Get locator from url
    let userLocator = req.params.locator;
    if (DEBUG) console.log(userLocator);
    
    // Validate schema of contacts update
    let valid = true; // \todo
    console.log(req.body);

    if (valid === true)
    {
        // Patch contacts update to user JSON db entry 
        axios.patch(`http://${ip}:${jsonServerPort}/users/${userLocator}`, req.body.newAlerts)
        .then((response) => {
            res.sendStatus(response.status);
        }).catch((error) => {
            res.sendStatus(404);
        });
    }
    else
    {
        res.sendStatus(404);
    }
});

/**
 * Post an update to user local secured zones
 */
app.post('/resources/:locator/localsecuredzones', (req, res) => {
    // Get locator from url
    let userLocator = req.params.locator;
    if (DEBUG) console.log(userLocator);
    
    // Validate schema of local secured zones update
    let valid = true; // \todo
    console.log(req.body);

    if (valid === true)
    {
        // Patch local secures zones update to user JSON db entry 
        axios.patch(`http://${ip}:${jsonServerPort}/users/${userLocator}`, req.body.newLocalSecuredZones)
        .then((response) => {
            res.sendStatus(response.status);
        }).catch((error) => {
            res.sendStatus(404);
        });
    }
    else
    {
        res.sendStatus(404);
    }
});


app.get('/tester', (req, res) => {
    let camCmd = {
        _C: 43,
        _P: [
            'MV',
            325
        ]
    };
});

/* Start json database server */
jsonServer.listen(jsonServerPort, () => {
    console.log(`HMS Data Server @ http://${ip}:${jsonServerPort}`);
});

/* Start express server */
app.listen(httpPort, () => {
    console.log(`HMS Webserver @ http://${ip}:${httpPort}`);
});