function generateAddNewButton(name)
{
    let newButton = document.createElement('div');
    newButton.id = 'add-camera-button';
    newButton.classList.add('settings-button');
    newButton.classList.add('add');
    newButton.innerText = 'Add ' + name;

    return newButton;
}

async function generatePreferencesSettings(data)
{
    let tileContainer = document.createElement('div');

    // Create objects to add to form
    let label_userName = document.createElement('label');
    label_userName.for = 'userName';
    label_userName.innerText = 'User Name';
    let break_userName = document.createElement('br');
    let input_userName = document.createElement('input');
    input_userName.name = 'userName';
    input_userName.type = 'text';
    input_userName.value = data.userName;
    let break_userNameEnd = document.createElement('br');
    tileContainer.appendChild(label_userName);
    tileContainer.appendChild(break_userName);
    tileContainer.appendChild(input_userName);
    tileContainer.appendChild(break_userNameEnd);

    let label_name = document.createElement('label');
    label_name.for = 'name';
    label_name.innerText = 'Name';
    let break_name = document.createElement('br');
    let input_name = document.createElement('input');
    input_name.name = 'name';
    input_name.type = 'text';
    input_name.value = data.name;
    let break_nameEnd = document.createElement('br');
    tileContainer.appendChild(label_name);
    tileContainer.appendChild(break_name);
    tileContainer.appendChild(input_name);
    tileContainer.appendChild(break_nameEnd);

    let label_avatar = document.createElement('label');
    label_avatar.for = 'avatar';
    label_avatar.innerText = 'Avatar';
    let input_avatar = document.createElement('input');
    input_avatar.name = 'avatar';
    input_avatar.type = 'text';
    input_avatar.value = data.avatar;
    input_avatar.hidden = true;
    tileContainer.appendChild(label_avatar);
    tileContainer.appendChild(input_avatar);
    tileContainer.appendChild(await generateUserAvatarSelection(
        function(imgSrc) {
            input_avatar.value = imgSrc;
        })
    );

    return tileContainer;
}

async function generateCameraSettingsTile(data, idx)
{
    // Tile form parts
    let tileContainer = document.createElement('div');
    tileContainer.classList.add('settings-tile');

    let input_id = document.createElement('input');
    input_id.name = `cameras[${idx}][id]`;
    input_id.value = data.id;
    input_id.hidden = true;
    tileContainer.appendChild(input_id);

    let label_nickname = document.createElement('label');
    label_nickname.for = `cameras[${idx}][nickname]`;
    label_nickname.innerText = 'Camera Nickname';
    let break_nickname = document.createElement('br');
    let input_nickname = document.createElement('input');
    input_nickname.name = `cameras[${idx}][nickname]`;
    input_nickname.type = 'text';
    input_nickname.value = data.nickname;
    tileContainer.appendChild(label_nickname);
    tileContainer.appendChild(break_nickname);
    tileContainer.appendChild(input_nickname);
    
    let label_avatar = document.createElement('label');
    label_avatar.for = `cameras[${idx}][avatar]`;
    label_avatar.innerText = 'Avatar';
    let break_avatar = document.createElement('br');
    let input_avatar = document.createElement('input');
    input_avatar.name = `cameras[${idx}][avatar]`;
    input_avatar.type = 'text';
    input_avatar.value = data.avatar;
    input_avatar.hidden = true;
    tileContainer.appendChild(break_avatar);
    tileContainer.appendChild(label_avatar);
    tileContainer.appendChild(input_avatar);
    tileContainer.appendChild(await generateCameraAvatarSelection(
        function(imgSrc) {
            input_avatar.value = imgSrc;
        })
    );

    // Tile delete button
    let deleteCamButton = document.createElement('div');
    deleteCamButton.id = data.id + '-delete-camera-button';
    deleteCamButton.classList.add('settings-button');
    deleteCamButton.classList.add('delete');
    deleteCamButton.innerText = 'Remove Camera';
    deleteCamButton.onclick = function() { /* Call cam delete function */  };
    tileContainer.appendChild(deleteCamButton);

    return tileContainer;
}

async function generateAlertSettingsTile(data, idx)
{
    // Tile form parts
    let tileContainer = document.createElement('div');
    tileContainer.classList.add('settings-tile');

    let input_id = document.createElement('input');
    input_id.name = `alerts[${idx}][id]`;
    input_id.value = data.id;
    input_id.hidden = true;
    tileContainer.appendChild(input_id);

    let label_name = document.createElement('label');
    label_name.for = `alerts[${idx}][name]`;
    label_name.innerText = 'Alert Name';
    let break_avatar = document.createElement('br');
    let input_name = document.createElement('input');
    input_name.name = `alerts[${idx}][name]`;
    input_name.type = 'text';
    input_name.value = data.name;
    tileContainer.appendChild(label_name);
    tileContainer.appendChild(break_avatar);
    tileContainer.appendChild(input_name);

    let input_contact = document.createElement('input');
    input_contact.name = `alerts[${idx}][contact]`;
    input_contact.type = 'text';
    input_contact.value = data.contact + ',';
    input_contact.hidden = true;
    tileContainer.appendChild(input_contact);

    let input_camera = document.createElement('input');
    input_camera.name = `alerts[${idx}][camera]`;
    input_camera.type = 'text';
    input_camera.value = data.camera + ',';
    input_camera.hidden = true;
    tileContainer.appendChild(input_camera);

    let input_methods = document.createElement('input');
    input_methods.name = `alerts[${idx}][methods]`;
    input_methods.type = 'text';
    input_methods.value = data.methods + ',';
    input_methods.hidden = true;
    tileContainer.appendChild(input_methods);

    let input_triggers = document.createElement('input');
    input_triggers.name = `alerts[${idx}][triggers]`;
    input_triggers.type = 'text';
    input_triggers.value = data.triggers + ',';
    input_triggers.hidden = true;
    tileContainer.appendChild(input_triggers);

    tileContainer.appendChild(await generateContactSelection(
        function(contactId, addOrRemove) {
            if (addOrRemove === 'add')
            {
                if (input_contact.value.includes(`${contactId}`) === false)
                {
                    input_contact.value = input_contact.value.concat(`${contactId},`);
                }
            }
            else if (addOrRemove === 'remove')
            {
                input_contact.value = input_contact.value.replaceAll(`${contactId},`,'');
            }
        },
        function(method, addOrRemove) {
            if (addOrRemove === 'add')
            {
                if (input_methods.value.includes(`${method}`) === false)
                {
                    input_methods.value = input_methods.value.concat(`${method},`);
                }
            }
            else if (addOrRemove === 'remove')
            {
                input_methods.value = input_methods.value.replaceAll(`${method},`,'');
            }
        }
    ));

    tileContainer.appendChild(await generateCameraSelection(
        function(camId, addOrRemove) {
            if (addOrRemove === 'add')
            {
                if (input_camera.value.includes(`${camId},`) === false)
                {
                    input_camera.value = input_camera.value.concat(`${camId},`);
                }
            }
            else if (addOrRemove === 'remove')
            {
                input_camera.value = input_camera.value.replaceAll(`${camId},`,'');
            }
        },
        function(alert, addOrRemove) {
            if (addOrRemove === 'add')
            {
                if (input_triggers.value.includes(`${alert},`) === false)
                {
                    input_triggers.value = input_triggers.value.concat(`${alert},`);
                }
            }
            else if (addOrRemove === 'remove')
            {
                input_triggers.value = input_triggers.value.replaceAll(`${alert},`,'');
            }
        }
    ));

    // Tile delete button
    let deleteAlertButton = document.createElement('div');
    deleteAlertButton.id = data.id + '-delete-alert-button';
    deleteAlertButton.classList.add('settings-button');
    deleteAlertButton.classList.add('delete');
    deleteAlertButton.innerText = 'Remove Alert';
    deleteAlertButton.onclick = function() { /* Call alert delete function */ this.delete(); };
    tileContainer.appendChild(deleteAlertButton);

    return tileContainer;
}

async function generateContactSettingsTile(data, idx)
{
    // Tile form parts
    let tileContainer = document.createElement('div');
    tileContainer.classList.add('settings-tile');

    let input_id = document.createElement('input');
    input_id.name = `contacts[${idx}][id]`;
    input_id.value = data.id;
    input_id.hidden = true;
    tileContainer.appendChild(input_id);

    let label_name = document.createElement('label');
    label_name.for = `contacts[${idx}][name]`;
    label_name.innerText = 'Contact Name';
    let break_name = document.createElement('br');
    let input_name = document.createElement('input');
    input_name.name = `contacts[${idx}][name]`; //'name[]';
    input_name.type = 'text';
    input_name.value = data.name;
    let break_nameEnd = document.createElement('br');
    tileContainer.appendChild(label_name);
    tileContainer.appendChild(break_name);
    tileContainer.appendChild(input_name);
    tileContainer.appendChild(break_nameEnd);

    let label_phone = document.createElement('label');
    label_phone.for = `contacts[${idx}][phone]`;
    label_phone.innerText = 'Phone Number';
    let break_phone = document.createElement('br');
    let input_phone = document.createElement('input');
    input_phone.name = `contacts[${idx}][phone]`; //'phone[]';
    input_phone.type = 'text';
    input_phone.value = data.phone;
    let break_phoneEnd = document.createElement('br');
    tileContainer.appendChild(label_phone);
    tileContainer.appendChild(break_phone);
    tileContainer.appendChild(input_phone);
    tileContainer.appendChild(break_phoneEnd);

    let label_email = document.createElement('label');
    label_email.for = `contacts[${idx}][email]`;
    label_email.innerText = 'Email Address';
    let break_email = document.createElement('br');
    let input_email = document.createElement('input');
    input_email.name = `contacts[${idx}][email]`; //'email[]';
    input_email.type = 'text';
    input_email.value = data.email;
    tileContainer.appendChild(label_email);
    tileContainer.appendChild(break_email);
    tileContainer.appendChild(input_email);

    // Tile delete button
    let deleteContactButton = document.createElement('div');
    deleteContactButton.id = data.id + '-delete-contact-button';
    deleteContactButton.classList.add('settings-button');
    deleteContactButton.classList.add('delete');
    deleteContactButton.innerText = 'Remove Contact';
    deleteContactButton.onclick = function() { /* Call contact delete function */ };
    tileContainer.appendChild(deleteContactButton);

    return tileContainer;
}

async function generateSettingsPanel(data)
{
    // Generate settings specific topbar
    let topbar = generatePanelTopbar('Settings');

    // Generate common form elements
    let submitButton = document.createElement('input');
    submitButton.type = 'submit';
    submitButton.value = 'Apply Changes';
    submitButton.classList = '';
    submitButton.classList.add('settings-button');
    submitButton.classList.add('submit');

    let settingsForm = document.createElement('form');
    settingsForm.id = 'settings-form';
    settingsForm.name = 'settings-form';
    settingsForm.method = 'POST';
    //settingsForm.target = 'invisible';

    // Add other form elements to an array
    let objsToAdd = [];

    // Fill in settings panel based on data to potentially update
    switch (data.id) {
        case 'preferences':
            // Preferences settings page
            console.log('Preferences page settings...');

            // Action post destination
            settingsForm.action = `${portalUrl}/resources/${getLocator()}/preferences`

            // Generate preferences tile
            objsToAdd.push(await generatePreferencesSettings(data));

            // Append all elements after creating them
            for (let i = 0; i < objsToAdd.length; i++)
            {
                settingsForm.appendChild(objsToAdd[i]);
                settingsForm.appendChild(document.createElement('br'));
            }

            break;
        case 'cameras':
            console.log('Cameras page settings...');
            
            // Action post destination
            settingsForm.action = `${portalUrl}/resources/${getLocator()}/cameras`

            // Strip id
            delete data.id;

            // Generate cameras tiles
            for (let i = 0; i < data.length; i++)
            {
                objsToAdd.push(await generateCameraSettingsTile(data[i], i));
            }

            // Create add new camera button
            let newCamButton = generateAddNewButton('Camera');
            newCamButton.onclick = function() { /* Call cam add function */};
            objsToAdd.push(newCamButton);

            // Append all elements after creating them
            for (let i = 0; i < objsToAdd.length; i++)
            {
                settingsForm.appendChild(objsToAdd[i]);
                settingsForm.appendChild(document.createElement('br'));
            }

            break;
        case 'alerts':
            console.log('Alerts page settings...');

            // Action post destination
            settingsForm.action = `${portalUrl}/resources/${getLocator()}/alerts`

            // Strip id
            delete data.id;
            
            // Generate alerts tiles
            for (let i = 0; i < data.length; i++)
            {
                objsToAdd.push(await generateAlertSettingsTile(data[i], i));
            }

            // Create add new alert button
            let newAlertButton = generateAddNewButton('Alert');
            newAlertButton.onclick = function() { /* Call alert add function */};
            objsToAdd.push(newAlertButton);

            // Append all elements after creating them
            for (let i = 0; i < objsToAdd.length; i++)
            {
                settingsForm.appendChild(objsToAdd[i]);
                settingsForm.appendChild(document.createElement('br'));
            }

            break;
        case 'contacts':
            console.log('Contacts page settings...');

            // Action post destination
            settingsForm.action = `${portalUrl}/resources/${getLocator()}/contacts`

            // Strip id
            delete data.id;

            // Generate contact tiles
            for (let i = 0; i < data.length; i++)
            {
                objsToAdd.push(await generateContactSettingsTile(data[i], i));
            }

            // Create add new contacts button
            let newContactButton = generateAddNewButton('Contact');
            newContactButton.onclick = function() { /* Call contact add function */};
            objsToAdd.push(newContactButton);

            // Append all elements after creating them
            for (let i = 0; i < objsToAdd.length; i++)
            {
                settingsForm.appendChild(objsToAdd[i]);
                settingsForm.appendChild(document.createElement('br'));
            }

            break;
        default:
            break;
    }
    settingsForm.appendChild(submitButton);
    settingsForm.onsubmit = function(event) {
        // Prevent default submission
        event.preventDefault();

        // Format into expected JSON format
        let form = {};
        let url = $(this).attr('action');
        let target = url.substring(url.lastIndexOf('/') + 1);
        let data = new FormData(event.target);

        console.log(data);

        switch (target) {
            case 'preferences':
                form = {
                    newPreferences: 
                    {
                        preferences: 
                        {
                            id: 'preferences',
                            userName: data.get('userName'),
                            name: data.get('name'),
                            avatar: data.get('avatar')
                        }
                    }
                };
                break;
            case 'contacts':
                form = {
                    newContacts:
                    {
                        contacts: parseFormKeyValPairsIntoArrayOfObjects(data, 'contacts')
                    }
                }
                break;    
            case 'cameras':
                form = {
                    newCameras:
                    {
                        cameras: parseFormKeyValPairsIntoArrayOfObjects(data, 'cameras')
                    }
                }
                break;
            case 'alerts':
                form = {
                    newAlerts:
                    {
                        alerts: parseFormKeyValPairsIntoArrayOfObjects(data, 'alerts')
                    }
                }
                
                // Strip trailing commas from contact, camera, methods, and triggers
                for (let i = 0; i < form.newAlerts.alerts.length; i++)
                {
                    form.newAlerts.alerts[i].contact = form.newAlerts.alerts[i].contact.slice(0, -1);
                    form.newAlerts.alerts[i].camera = form.newAlerts.alerts[i].camera.slice(0, -1);
                    form.newAlerts.alerts[i].methods = form.newAlerts.alerts[i].methods.slice(0, -1);
                    form.newAlerts.alerts[i].triggers = form.newAlerts.alerts[i].triggers.slice(0, -1);
                }
                break;
            default:
                break;
        }

        console.log(form);

        // Send to intended destination
        $.ajax({type: 'POST', url: url, data: form});
    };

    let settingsFormContainer = document.createElement('div');
    settingsFormContainer.appendChild(settingsForm);

    let settingsPanel = document.createElement('div');
    settingsPanel.id = 'settings-panel';
    settingsPanel.classList.add('settings-col');
    settingsPanel.appendChild(topbar);
    settingsPanel.appendChild(settingsFormContainer);
    // \todo

    return settingsPanel;
}
