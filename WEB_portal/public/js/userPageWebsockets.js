const portalUrl = 'http://hms_core:80';
const DEBUG = true;
var config;
var camDataWebsocket;

window.onopen = onOpen();
window.onresize = onResize;

/**
 * On load of page, make request to portal server for user data. Then,
 * upgrade connection to websockets for the local secure zones.
 */
async function getConfig() 
{ 
    if(DEBUG) console.log('Getting user data');
    
    let path = window.location.pathname;
    let userName = path.substring(path.lastIndexOf('/') + 1);

    if(DEBUG) console.log(userName);
    let response = await fetch(`${portalUrl}/resources/${userName}/configs`);

    if (response.status == 200)
    {
        config = await response.json();
        if(DEBUG) console.log(config);
    }
    else
    {
        if(DEBUG) console.log(response.status);
        throw new Error(response.status);
    }
}

async function upgradeToWebsocket()
{
    // \todo handle more than 1 zone
    camDataWebsocket = new WebSocket(`${config.localSecureZones[0].url}`);
    camDataWebsocket.binaryType = 'arraybuffer';

    camDataWebsocket.onopen = function(event) {
        if(DEBUG) console.log('[WS] Succesful open!');
        if(DEBUG) console.log(event);
    };
    
    camDataWebsocket.onmessage = function(event) {
        //if(DEBUG) console.log('[WS] Data!');
        //if(DEBUG) console.log(event.data);
    
        //  JSONify the message
        try {
            let dataJson = JSON.parse(event.data);
    
            // Handle message type
            if (dataJson.id === 1)
            {
                // Camera update
                handle_camUpdate(dataJson);
            }
            else
            {
                // todo
                if(DEBUG) console.log('Not a local zone update...');
            }
    
        } catch (error) {
            // \todo make this actually work as intended
            // Check if data is stream data
            if (event.data.length > 512 /* Check if expecting a stream */)
            {
                
            }

            // Place into img frame for now
            var img = document.getElementById('stream-img');
            img.src = arraybufferToJpgSrc(event.data);

            //if(DEBUG) console.log(error);
        }
    };
    
    camDataWebsocket.onerror = function(event) {
        if(DEBUG) console.log('[WS] Error :(');
        if(DEBUG) console.log(event);
    };
    
    camDataWebsocket.onclose = function(event) {
        if(DEBUG) console.log('[WS] Succesful close!');
        if(DEBUG) console.log(event);
    };
    
}

async function onOpen()
{
    await getConfig();
    await upgradeToWebsocket();
}

function onResize()
{
    // Get stream tile div
    let streamTile = document.getElementById('stream-tile');

    // Resize to multiple of cam tile (350px) + margin (15px)
    let numCamTiles = Math.floor((document.body.clientWidth - 267) / 350);
    streamTile.style.width = `${(350 * numCamTiles) + (15 * (numCamTiles - 1))}px`;

    if(DEBUG) console.log(`Stream camtile width: ${numCamTiles}`);
}

function handle_camUpdate(newCamData)
{
    // Validate new message
    // \todo

    // Parse meta data
    // \todo

    // Handle message based on meta data response
    // \todo

    // Collect ids of all cam tiles
    let camIds = [];
    $('.cam-tile').each(function(){camIds.push(this.id);});

    if(DEBUG) console.log(camIds);

    for(const cam of newCamData.cameraLatest)
    {
        // Remove this cam id from the list of ids
        let index = camIds.indexOf(cam.id);
        if (index > -1) camIds.splice(index, 1);

        // If new error alert status, apply change
        if (cam.hasOwnProperty('error')) {
            
        }

        // If new alive alert status, apply change
        if (cam.hasOwnProperty('alive')) {
            if (cam.alive)
            {
                document.getElementById(cam.id + '-alert-alive').classList.remove('dead');
                document.getElementById(cam.id + '-alert-alive').classList.add('alive');
            }
            else
            {
                document.getElementById(cam.id + '-alert-alive').classList.remove('alive');
                document.getElementById(cam.id + '-alert-alive').classList.add('dead');
            }
        }

        // If new motion alert status, apply change
        if (cam.hasOwnProperty('latest') && cam.latest.hasOwnProperty('MV')) {
            if (cam.latest.MV)
            {
                document.getElementById(cam.id + '-alert-motion').classList.add('motion');
            }
            else
            {
                document.getElementById(cam.id + '-alert-motion').classList.remove('motion');
            }
        }

        // Update all new status informations in latest
        for (const [key, val] of Object.entries(cam.latest))
        {
            try {
                if (key === 'ST')
                {
                    // Special case for time
                    document.getElementById(`${cam.id}-${key}`).innerText = val / 1000;
                }
                else
                {
                    document.getElementById(`${cam.id}-${key}`).innerText = val;
                }
            } catch (error) {
                ;
            }
        }
    }

    // Only dead cameras remain
    camIds.forEach((camId) => {
        document.getElementById(camId + '-alert-alive').classList.remove('alive');
        document.getElementById(camId + '-alert-alive').classList.add('dead');
        document.getElementById(camId + '-alert-motion').classList.remove('motion');
    })
}

function testRadarThresh(thresh)
{
    let camCmd = {
        meta: {
            authcode: "CB35695F7916425F24DCA418EAEC992C97B20C36D12E24991669D44F0D7AFD17",
            camId: "6969420",
        },
        _C: 43,
        _P: [
            'TO',
            thresh
        ]
    };

    console.log(`Sending: ${JSON.stringify(camCmd)}`);
    camDataWebsocket.send(JSON.stringify(camCmd));
}

function testGetConfigs()
{
    let camCmd = {
        meta: {
            authcode: "CB35695F7916425F24DCA418EAEC992C97B20C36D12E24991669D44F0D7AFD17",
            camId: "6969420",
        },
        _C: 67,
        _P: []
    };

    console.log(`Sending: ${JSON.stringify(camCmd)}`);
    camDataWebsocket.send(JSON.stringify(camCmd));
}
