/* Modules */
const webSocketServer = require('ws').Server;
const express = require('express');
const rocky = require('rocky');
const fs = require('fs');
const crypto = require('crypto');
const axios = require('axios');

/* Operational constants */
const wssCameraManagerPort = 8090;
const wssPortalInterfacePort = 8095;
const httpPort = 8080;
const proxyPort = 3000;
const MAX_CODE = 150;
const MIN_CODE = -1;
const DEBUG = true;

/* Operational paramters */
var config = JSON.parse(fs.readFileSync('./WEB_local/config.json', 'utf8'));
//const userHash = crypto.createHash('sha256').update(config.user).digest('hex');
//const passHash = crypto.createHash('sha256').update(config.pass).digest('hex');
const authHash = crypto.createHash('sha256').update(config.user.concat(config.salt.concat(config.pass))).digest('hex');;

if (DEBUG) console.log(config);
if (DEBUG) console.log(authHash);

/* Objects */
var cameras = [];
var clients = [];
const app = new express();
const wssCameraManager = new webSocketServer(
    {  
        clientTracking: true, 
        maxPayload: 512000, 
        port: wssCameraManagerPort,
        httpServer: app
    }
);
wssCameraManager.binaryType = 'arraybuffer';
const wssPortalInterface = new webSocketServer(
    {
        maxPayload: 512000, 
        port: wssPortalInterfacePort,
        httpServer: app
    }
);
wssPortalInterface.binaryType = 'arraybuffer';
const proxy = new rocky({ws: true});

/* Configure proxy */
proxy.forward(`ws://localhost:${wssPortalInterfacePort}`);
proxy.useWs((req, socket, head, next) => {
    next();
});

/* Configure express app */
app.use(proxy.middleware());

app.get('/configs', (req, res) => {
    res.sendStatus(404);
});

app.get('/camstats', (req, res) => {
    res.sendStatus(404);
});

app.get('/zonestats', (req, res) => {
    res.sendStatus(404);
});

/* Client manager websocket server routes*/
wssPortalInterface.on('connection', (ws, req) => {
    if (DEBUG) console.log(`New client server connection from: ${req.socket.remoteAddress}`);

    // Only allow the connection if there are fewer than the maximum number of clients
    if (clients.length >= config.maxClients) 
    {
        if (DEBUG) console.log('Too many clients connected');
        ws.terminate();
        return;
    }

    ws.isAlive = true;
    ws.clientInfo = {};
    ws.clientInfo.isClient = true;
    ws.clientInfo.rxingStream = false;

    clients.push(ws);

    // Add ws open handler
    ws.on('open', function() {});

    // Add message handler
    ws.on('message', (data, isBinary) => {
        // Messages are sent as text JSONs, each message must be authenticated
        if (isBinary === true)
        {
            // Binary data is image data, check if this socket should be receiving binary data
            // \todo more complex streaming pairs of clients and cameras
            if (ws.clientInfo.rxingStream === true)
            {
                // SHould be receiving stream, pass to portal client
                //ws.send(data);
                console.log(data.byteLength);
            }
        }
        else
        {
            try {
                let jsonData = JSON.parse(data);
                let camWs = findCameraById(jsonData['meta']['camId']);
                if (jsonData['meta']['authcode'] === authHash && camWs !== undefined && camWs !== null)
                {
                    if (DEBUG) console.log('authenticated');
                    // Validate messages and content
                    if (isValidCode(jsonData['_C']) && hasValidParamSet(jsonData['_P']))
                    {
                        switch (jsonData['_C']) 
                        {
                            case -1:
                                // Recevied HMS_MSG_INVALID (-1), handle error
                                // \todo
                                break;
                            case 43:
                                // Received HMS_MSG_CONFIG_UPT_PY (43), pass to destination camera
                                delete jsonData.meta;
                                camWs.send(JSON.stringify(jsonData));
                                break;
                            case 65:
                                // Received HMS_MSG_CMD_REQ_SP_CHANGE_OUTPUTS (65), pass to destination camera
                                delete jsonData.meta;
                                camWs.send(JSON.stringify(jsonData));
                                break;
                            case 66:
                                // Received HMS_MSG_CMD_REQ_PY_STATUS (66), pass to destination camera
                                delete jsonData.meta;
                                camWs.send(JSON.stringify(jsonData));
                                break;
                            case 67:
                                // Received HMS_MSG_CMD_REQ_PY_CONFIGS (67), pass to destination camera 
                                delete jsonData.meta;
                                camWs.send(JSON.stringify(jsonData));
                                break;
                            case 72:
                                // Received HMS_MSG_CMD_REQ_CAM_START (72). pass to destination camera
                                // \todo add behavior to manage multiple cameras streaming to different clients

                                // Set client streaming to true
                                ws.clientInfo.rxingStream = true;

                                // Set camera streaming to true
                                camWs.camInfo.txingStream = true;

                                // Pass message to camera
                                delete jsonData.meta;
                                camWs.send(JSON.stringify(jsonData));
                                break;
                            case 73:
                                // Received HMS_MSG_CMD_REQ_CAM_STOP (73). pass to destination camera

                                // Set client streaming to false
                                ws.clientInfo.rxingStream = false;

                                // Set camera streaming to false
                                camWs.camInfo.txingStream = false;

                                delete jsonData.meta;
                                camWs.send(JSON.stringify(jsonData));
                                break; 
                            default:
                                throw('Portal invalid msg handler');
                                break;
                        }
                    }
                    else
                    {
                        throw('Invalid message rx-ed');
                    }
                }
                else
                {
                    if (DEBUG) console.log('authentication failed');
                }
            } catch (error) {
                if (DEBUG) console.log(error);
            }
        }
    });

    // Add keep alive handler
    ws.on('pong', function() {
        ws.isAlive = true;
    });

    // Add error handler
    ws.on('error', (err) => {

    });

    // Add close handler
    ws.on('close', (code, buff) => {
        // Remove ws from clients array 
        removeClient(ws);
    });    
}); 

/* Camera manager websocket server routes */
wssCameraManager.on('connection', (ws, req) => {
    if (DEBUG) console.log(`New camera server connection from: ${req.socket.remoteAddress}`);

    ws.isAlive = true;
    ws.camInfo = {};
    ws.camInfo.isCamera = false;
    ws.camInfo.txingStream = false;

    if (DEBUG) console.log(ws.camInfo);

    // Add connect handler
    ws.on('open', function() {
        // \todo 
    });

    // Add message handler
    ws.on('message', (data, isBinary) => {
        // Ignore data from non-cameras
        //console.log(data.byteLength);
        if (ws.camInfo.isCamera === true)
        {
            if (isBinary === true)
            {
                if (DEBUG) console.log(`Received ${data.length} from ${ws.camInfo.id} of type ${typeof data}`);
                // Should only accept binary data if camera is txing stream
                if (ws.camInfo.txingStream === true)
                {                    
                    // Pass to client
                    // \todo handle behavior with more camera client pairs
                    //let ab = data.buffer.slice(data.byteOffset, data.byteOffset + data.byteLength);
                    //let streamClient = clients.find(client => client.clientInfo.rxingStream === true);
                    //streamClient.send(base64ToArrayBuffer(ab));
                    wssPortalInterface.clients.forEach((ws) => {
                        ws.send(data);
                    });
                }
                else
                {
                    // Incorrect behavior, send commands to stop stream
                    ws.send('{"_C":73,"_P":[]}');
                }
            }
            else
            {
                // Handle text data, attempt to parse into a JSON
                try {
                    // Parse text into a JSON
                    let jsonData = JSON.parse(data);
                    //console.log(jsonData);

                    // Validate code and param set
                    if (isValidCode(jsonData['_C']) && hasValidParamSet(jsonData['_P']))
                    {
                        switch (jsonData['_C']) 
                        {
                            case -1:
                                // Recevied HMS_MSG_INVALID (-1), handle error
                                // \todo
                                break;
                            case 11:
                                // Received HMS_MSG_ALERT_MOTION (11), handle motion alert
                                // \todo
                                break;
                            case 25:
                                // Recevied HMS_MSG_STATUS_PY_STATUS (25), add to camera latest
                                for (let index = 0; index < jsonData['_P'].length; index+=2) 
                                {
                                    let field = jsonData['_P'][index];
                                    ws.camInfo.latest[field] = jsonData['_P'][index+1];
                                }

                                //if (DEBUG) console.log(ws.camInfo);
                                //if (DEBUG) console.log(jsonData['_P']);
                                
                                break;
                            
                            case 43:
                                break;
                            case 65:
                                break;
                            case 66:
                                break;
                            case 67:
                                break;
                            default:
                                console.log(jsonData);
                                throw "Camera invalid msg handler";
                                break;
                        }
                    }
                    else
                    {
                        // Throw error
                        throw "Invalid message rx-ed";
                    }
                } catch (error) {
                    // Bad text data, was not a JSON
                    if (DEBUG) console.log(error);
                }
            }
        }
        else
        {
            // If device is not registered as a camera, only attempt to access text data
            if (isBinary === false)
            {
                // Handle text data, attempt to parse into a JSON
                try {
                    // Parse text into a JSON
                    let jsonData = JSON.parse(data);

                    // Validate code and param set
                    if (isValidCode(jsonData['_C']) && hasValidParamSet(jsonData['_P']))
                    {
                        switch (jsonData['_C']) 
                        {
                            case 28:
                                // Received HMS_MSG_STATUS_PR_STATUS (28), validate id
                                if (isValidId(jsonData['_P'][1]))
                                {
                                    // Aggregate camera data
                                    ws.camInfo.isCamera = true;
                                    ws.camInfo.id = jsonData['_P'][1];
                                    ws.camInfo.ip = ws._socket.remoteAddress;
                                    ws.camInfo.latest = {};

                                    // Add to camera array
                                    addCamera(ws);

                                    if (DEBUG) cameras.forEach(cam => { console.log(cam.camInfo); });
                                }
                                else
                                {
                                    // Not a camera
                                    throw "Invalid device ID rx-ed";
                                }
                                break;
                            default:
                                break;
                        }
                    }
                    else
                    {
                        // Throw error
                        throw "Invalid message rx-ed";
                    }
                } catch (error) {
                    // Bad text data, was not a JSON
                    if (DEBUG) console.log(error);
                }
            }
        }
    });

    // Add keep alive handler
    ws.on('pong', function() {
        ws.isAlive = true;
    });

    // Add error handler
    ws.on('error', (err) => {
        if (DEBUG) console.log(`Camera ${ws.camInfo.id} threw an error`);
        //if (DEBUG) console.log(err);
    });

    // Add close handler
    ws.on('close', (code, buff) => {
        if (DEBUG) console.log(`Camera ${ws.camInfo.id} closed connection`);
        if (DEBUG) console.log(code);
        if (DEBUG) console.log(buff);

        // Remove device if it was a camera
        if (ws.camInfo.isCamera == true)
        {
            removeCamera(ws);
        }
    });
});

/* Helpers */
const interval_keepAlivePort = setInterval(function() {
    wssPortalInterface.clients.forEach((ws) => {
        if (ws.isAlive === false)
        {
            // If device was in the client array, remove it
            removeClient(ws);

            // If client hasn't returned ping, terminate it
            return ws.terminate();
        }
        else
        {
            // If client has returned ping, ping again
            ws.isAlive = false;
            ws.ping();
        }
    });
    // 1 minute ping intervals
}, 60000);

const interval_updatePortals = setInterval(function() {
    // Get update from cameras if clients are connected
    if (cameras.length > 0)
    {
        cameras.forEach((cam) => {
            requestCameraDataUpdate(cam);
        });
    }
    
    // Send updates to portal clients
    wssPortalInterface.clients.forEach((ws) => {
        let updateMessage = {};
        updateMessage.id = 1;

        // Compile meta data for local zone
        updateMessage.meta = {};
        updateMessage.meta.camsConnected = false;
        updateMessage.meta.camCount = cameras.length;
        updateMessage.meta.ids = [];
        
        // Add camera data if cameras are present
        updateMessage.cameraLatest = [];
        if (cameras.length > 0)
        {
            updateMessage.meta.camsConnected = true;
            cameras.forEach((cam) => {
                updateMessage.meta.ids.push(cam.camInfo.id);
                updateMessage.cameraLatest.push(packageCameraData(cam));
            });
        }

        // Send as JSON string
        ws.send(JSON.stringify(updateMessage));
    });

    // 5 Second intervals
}, 5000);

const interval_keepAliveCamera = setInterval(function() {
    wssCameraManager.clients.forEach((ws) => {
        if (ws.isAlive === false)
        {
            // If device was a camera, remove it from the camera array
            if (ws.camInfo.isCamera === true)
            {
                removeCamera(ws);
            }

            // If client hasn't returned ping, terminate it
            return ws.terminate();
        }
        else
        {
            // If client has returned ping, ping again
            ws.isAlive = false;
            ws.ping();
        }
    })
    // 10 minute ping intervals
}, 600000);

function isValidCode(code)
{
    // Valid type as number
    if (code !== undefined && code != null && code.constructor == Number) return (code <= MAX_CODE && code >= MIN_CODE);
    else return false;
}

function hasValidParamSet(params)
{
    // \todo
    return true;
}

function isValidId(id)
{
    // \todo
    return true;
}

async function addCamera(cam)
{
    cameras.push(cam);

    // Generate JSON for updating server camera data
    let newCamData = {
        id: cam.camInfo.camId,
        alive: true
    };

    // Post camera alive update to server
    console.log(`${config.portalUrl}/resources/${config.user}/cameras`);
    axios.post(`${config.portalUrl}/resources/${config.user}/cameras`, newCamData)
    .catch((error) => {
        console.log(error);
    });
}

async function removeCamera(cam)
{
    let index = cameras.indexOf(cam);
    if (index > -1) cameras.splice(index, 1);

    // Generate JSON for updating server camera data
    let newCamData = {
        id: cam.camInfo.camId,
        alive: false
    };

    // Post camera alive update to server
    console.log(`${config.portalUrl}/resources/${config.user}/cameras`);
    axios.post(`${config.portalUrl}/resources/${config.user}/cameras`, newCamData)
    .catch((error) => {
        console.log('Error');
        //console.log(error);
    });
}

function removeCameraById(id)
{
    let index = cameras.indexOf(findCameraById(id));
    removeCamera(cameras[index]);
}

function findCameraById(id)
{
    return cameras.find(cam => cam.camInfo.id === id);
}

function removeClient(client)
{
    let index = clients.indexOf(client);
    if (index > -1) clients.splice(index, 1);
}

function requestCameraDataUpdate(cam)
{
    cam.send('{"_C":66,"_P":[]}');
}

function packageCameraData(cam)
{
    let packagedCamData = {};
    packagedCamData.id = cam.camInfo.id;
    packagedCamData.latest = cam.camInfo.latest;
    return packagedCamData;
}

function base64ToArrayBuffer(base64) {
    var binary_string = Buffer.from(base64, 'base64').toString('binary');
    var len = binary_string.length;
    var bytes = new Uint8Array(len);
    for (var i = 0; i < len; i++) {
        bytes[i] = binary_string.charCodeAt(i);
    }    

    return bytes.buffer;
}

/* Start servers */
app.listen(httpPort, () => {
    console.log(`HMS Webserver on port ${httpPort}`);
});
console.log(`Camera Manager Websocket Server on port ${wssCameraManagerPort}`);
console.log(`Portal Interface Websocket Server on port ${wssPortalInterfacePort}`);
proxy.listen(proxyPort);
console.log(`Proxy Server on port ${proxyPort}`);