function getLocator() 
{
    let path = window.location.pathname;
    let userName = path.substring(path.lastIndexOf('/') + 1);
    
    // \todo add encryptiony stuff
    
    return userName;
}

function cleanPanels()
{
    let panels = document.getElementById('content').children;
    for (let i = 0; i < panels.length; i++)
    {
        if (panels[i].id !== 'user-panel' && panels[i].id !== 'cam-panel')
        {
            document.getElementById(panels[i].id).remove();
        }
    }
}

function getFormData($form)
{
    let unindexedArray = $form.serializeArray();
    let indexedArray = {};
    $.map(unindexedArray, function(n, i) {
        indexedArray[n['name']] = n['value'];
    });

    return indexedArray;
}

function generateBackToCamerasButton()
{
    let backBtnImg = document.createElement('img');
    backBtnImg.id = 'back-btn-image';
    backBtnImg.src = '/img/icons/icon-return-to-cams.svg';
    backBtnImg.classList.add('back-icon-img');

    let backBtn = document.createElement('div');
    backBtn.id = 'back-btn';
    backBtn.classList.add('back-icon');
    backBtn.alt = 'Return To Camera View';
    backBtn.onclick = function() { switchPageContext('cameras'); };
    backBtn.appendChild(backBtnImg);

    return backBtn;
}

function generatePanelTopbar(name)
{
    let backBtn = generateBackToCamerasButton();

    let title = document.createElement('h1');
    title.innerText = name;
    title.style.paddingTop = '10px';

    let topbar = document.createElement('div');
    topbar.id = 'settings-topbar';
    topbar.classList.add('panel-topbar');
    topbar.appendChild(backBtn);
    topbar.appendChild(title);

    return topbar;
}

async function generateUserAvatarSelection(setterFunction)
{
    let userAvatarList = await fetch('/dat/userAvatars.json');
    let data = await userAvatarList.json();

    let selectionContainer = document.createElement('div');
    selectionContainer.classList.add('avatar-icon-container');
    
    for (let i = 0; i < data.imgFileNames.length; i++)
    {
        let avatarImg = document.createElement('img');
        avatarImg.classList.add('avatar-icon-img');
        avatarImg.src = '/img/icons/' + data.imgFileNames[i];

        let avatarImgContainer = document.createElement('div');
        avatarImgContainer.classList.add('avatar-icon');
        avatarImgContainer.onclick = function() { 
            // Remove selected class from all other icons
            let parent = this.parentElement;
            for (let j = 0; j < parent.children.length; j++)
            {
                if (parent.children[j].classList.contains('selected'))
                {
                    parent.children[j].classList.remove('selected');
                }
            }

            // Add selected class to this icon
            avatarImgContainer.classList.add('selected');

            // Call setter function with image filename
            setterFunction(data.imgFileNames[i]); 
        };
        avatarImgContainer.appendChild(avatarImg);
        selectionContainer.appendChild(avatarImgContainer);
    }

    return selectionContainer;
}

async function generateCameraAvatarSelection(setterFunction)
{
    let cameraAvatarList = await fetch('/dat/cameraAvatars.json');
    let data = await cameraAvatarList.json();

    let selectionContainer = document.createElement('div');
    selectionContainer.classList.add('avatar-icon-container');
    selectionContainer.classList.add('for-cameras');
    
    for (let i = 0; i < data.imgFileNames.length; i++)
    {
        let avatarImg = document.createElement('img');
        avatarImg.classList.add('avatar-icon-img');
        avatarImg.src = '/img/icons/' + data.imgFileNames[i];

        let avatarImgContainer = document.createElement('div');
        avatarImgContainer.classList.add('avatar-icon');
        avatarImgContainer.onclick = function() { 
            // Remove selected class from all other icons
            let parent = this.parentElement;
            for (let j = 0; j < parent.children.length; j++)
            {
                if (parent.children[j].classList.contains('selected'))
                {
                    parent.children[j].classList.remove('selected');
                }
            }

            // Add selected class to this icon
            avatarImgContainer.classList.add('selected');

            // Call setter function with image filename
            setterFunction(data.imgFileNames[i]); 
        };
        avatarImgContainer.appendChild(avatarImg);
        selectionContainer.appendChild(avatarImgContainer);
    }

    return selectionContainer;
}

async function generateContactSelection(setterFunction, methodSetterFunction)
{
    // Get user contact data
    let getUrl = `${portalUrl}/resources/${getLocator()}/contacts`;
    let cameraList = await fetch(getUrl);
    let data = await cameraList.json();

    let selectionContainer = document.createElement('div');
    selectionContainer.classList.add('camera-tile-connector');
    selectionContainer.innerText = 'Alert Notifyees';

    for (let i = 0; i < data.length; i++)
    {
        let contactSelectionContainer = document.createElement('div');
        contactSelectionContainer.classList.add('camera-selection-container');

        // Add contact selection buttons (contact, methods)
        let contactSelectionButton = document.createElement('div');
        contactSelectionButton.classList.add('camera-selection-button');
        contactSelectionButton.onclick = function() {
            if (this.classList.contains('selected')) 
            {
                this.classList.remove('selected');
                setterFunction(data[i].id, 'remove');
            }
            else 
            {
                this.classList.add('selected');
                setterFunction(data[i].id, 'add');
            }
        }

        let contactName = document.createElement('div');
        contactName.innerText = data[i].name;
        contactName.classList.add('camera-selection-text');

        let phoneMethodButton = document.createElement('div');
        phoneMethodButton.innerText = 'Text Notifications';
        phoneMethodButton.classList.add('camera-selection-field');
        phoneMethodButton.onclick = function() {
            if (this.classList.contains('selected')) 
            {
                this.classList.remove('selected');
                methodSetterFunction('phone', 'remove');
            }
            else 
            {
                this.classList.add('selected');
                methodSetterFunction('phone', 'add');
            }
        }

        let emailMethodButton = document.createElement('div');
        emailMethodButton.innerText = 'Email Notifications';
        emailMethodButton.classList.add('camera-selection-field');
        emailMethodButton.onclick = function() {
            if (this.classList.contains('selected')) 
            {
                this.classList.remove('selected');
                methodSetterFunction('email', 'remove');
            }
            else 
            {
                this.classList.add('selected');
                methodSetterFunction('email', 'add');
            }
        }

        contactSelectionContainer.appendChild(contactSelectionButton);
        contactSelectionContainer.appendChild(contactName);
        contactSelectionContainer.appendChild(phoneMethodButton);
        contactSelectionContainer.appendChild(emailMethodButton);

        selectionContainer.appendChild(contactSelectionContainer);
    }

    return selectionContainer;
}

async function generateCameraSelection(setterFunction, alertSetterFunction)
{
    // Get user camera data
    let getUrl = `${portalUrl}/resources/${getLocator()}/cameras`;
    let cameraList = await fetch(getUrl);
    let data = await cameraList.json();

    let selectionContainer = document.createElement('div');
    selectionContainer.classList.add('camera-tile-connector');
    selectionContainer.innerText = 'Attached Cameras';

    for (let i = 0; i < data.length; i++)
    {
        let cameraSelectionContainer = document.createElement('div');
        cameraSelectionContainer.classList.add('camera-selection-container');
        cameraSelectionContainer.id = data[i].id;

        // Add camera selection buttons (device, alerts)
        let cameraSelectButton = document.createElement('div');
        cameraSelectButton.classList.add('camera-selection-button');
        cameraSelectButton.onclick = function() {
            if (this.classList.contains('selected')) 
            {
                this.classList.remove('selected');
                setterFunction(data[i].id, 'remove');
            }
            else 
            {
                this.classList.add('selected');
                setterFunction(data[i].id, 'add');
            }
        };

        let cameraName = document.createElement('div');
        cameraName.innerText = data[i].nickname;
        cameraName.classList.add('camera-selection-text');

        let motionAlertSelectButton = document.createElement('div');
        motionAlertSelectButton.innerText = 'Motion Detected';
        motionAlertSelectButton.classList.add('camera-selection-field');
        motionAlertSelectButton.onclick = function() {
            if (this.classList.contains('selected')) 
            {
                this.classList.remove('selected');
                alertSetterFunction('MV', 'remove');
            }
            else 
            {
                this.classList.add('selected');
                alertSetterFunction('MV', 'add');
            }
        };

        let dayNightAlertSelectButton = document.createElement('div');
        dayNightAlertSelectButton.innerText = 'Day/Night Transition';
        dayNightAlertSelectButton.classList.add('camera-selection-field');
        dayNightAlertSelectButton.onclick = function() {
            if (this.classList.contains('selected')) 
            {
                this.classList.remove('selected');
                alertSetterFunction('DN', 'remove');
            }
            else 
            {
                this.classList.add('selected');
                alertSetterFunction('DN', 'add');
            }
        };

        let tempFaultAlertSelectButton = document.createElement('div');
        tempFaultAlertSelectButton.innerText = 'Temperature Fault';
        tempFaultAlertSelectButton.classList.add('camera-selection-field');
        tempFaultAlertSelectButton.onclick = function() {
            if (this.classList.contains('selected')) 
            {
                this.classList.remove('selected');
                alertSetterFunction('TH,TL', 'remove');
            }
            else 
            {
                this.classList.add('selected');
                alertSetterFunction('TH,TL', 'add');
            }
        };

        let batFaultAlertSelectButton = document.createElement('div');
        batFaultAlertSelectButton.innerText = 'Battery Fault';
        batFaultAlertSelectButton.classList.add('camera-selection-field');
        batFaultAlertSelectButton.onclick = function() {
            if (this.classList.contains('selected')) 
            {
                this.classList.remove('selected');
                alertSetterFunction('BH,BL,BI', 'remove');
            }
            else 
            {
                this.classList.add('selected');
                alertSetterFunction('BH,BL,BI', 'add');
            }
        };

        let auxFaultAlertSelectButton = document.createElement('div');
        auxFaultAlertSelectButton.innerText = 'Auxiliary Fault';
        auxFaultAlertSelectButton.classList.add('camera-selection-field');
        auxFaultAlertSelectButton.onclick = function() {
            if (this.classList.contains('selected')) 
            {
                this.classList.remove('selected');
                alertSetterFunction('AI', 'remove');
            }
            else 
            {
                this.classList.add('selected');
                alertSetterFunction('AI', 'add');
            }
        };

        cameraSelectionContainer.appendChild(cameraSelectButton);
        cameraSelectionContainer.appendChild(cameraName);
        cameraSelectionContainer.appendChild(motionAlertSelectButton);
        cameraSelectionContainer.appendChild(dayNightAlertSelectButton);
        cameraSelectionContainer.appendChild(tempFaultAlertSelectButton);
        cameraSelectionContainer.appendChild(batFaultAlertSelectButton);
        cameraSelectionContainer.appendChild(auxFaultAlertSelectButton);

        selectionContainer.appendChild(cameraSelectionContainer);
    }

    return selectionContainer;
}

function parseFormKeyValPairsIntoArrayOfObjects(data, name)
{
    let parsed = [];
    let lastIdx = -1;
    for (var [key, val] of data.entries())
    {
        // Parse out fields
        key = key.replaceAll(name, '');
        let regex = /(?<=\[).*?(?=\])/g;
        let fields = key.match(regex);

        // Parse out object idx
        let idx = parseInt(fields[0]);
        if (idx > lastIdx)
        {
            parsed.push({});
            lastIdx = idx;
        }

        // Assign val to correct idx / data field
        parsed[idx][fields[1]] = val;
    }

    return parsed;
}

function generate_startCamStreamCmd(camId)
{
    // \todo generate authcode
    let camCmd = {
        meta: {
            authcode: "4117498b01e82d40324a010b1c705afc94c3ba625a8a5fd16cc54797a8f27f23",
            camId: `${camId}`,
        },
        _C: 72,
        _P: []
    };

    return camCmd;
}

function generate_stopCamStreamCmd(camId)
{
    // \todo generate authcode
    let camCmd = {
        meta: {
            authcode: "4117498b01e82d40324a010b1c705afc94c3ba625a8a5fd16cc54797a8f27f23",
            camId: `${camId}`,
        },
        _C: 73,
        _P: []
    };

    return camCmd;
}

function generate_getCamConfig(camId)
{
    // \todo generate authcode
    let camCmd = {
        meta: {
            authcode: "4117498b01e82d40324a010b1c705afc94c3ba625a8a5fd16cc54797a8f27f23",
            camId: `${camId}`,
        },
        _C: 67,
        _P: []
    };

    return camCmd;
}

function arraybufferToJpgSrc(buf)
{
    var bytes = new Uint8Array(buf);
    var binary= '';
    var len = bytes.byteLength;

    for (var i = 0; i < len; i++) 
    {
        binary += String.fromCharCode(bytes[i])
    }

    return 'data:image/jpg;base64,'+window.btoa(binary);
}

function modulo(a, n)
{
    return ((a % n ) + n ) % n;
}