/**
 * On click handlers for user options.
 */
function onclick_alertLog() 
{
    // Get alert log from server

    // Render alert log on page
}

function onclick_settings() 
{
    // Get settings from server

    console.log('Fetching preference data');

    let getUrl = `${portalUrl}/resources/${getLocator()}/preferences`;
    fetch(getUrl).then(response => response.json())
    .then((data) => {
        console.log(data)
        // Render settings on page

        switchPageContext('settings', data);
    });
}

function onclick_manageCameras() 
{
    // Get camera data from server

    console.log('Fetching camera data');

    let getUrl = `${portalUrl}/resources/${getLocator()}/cameras`;
    fetch(getUrl).then(response => response.json())
    .then((data) => {
        data.id = 'cameras';
        console.log(data)
        // Render camera data in settings esque display
        switchPageContext('settings', data);
    });
}

function onclick_manageAlerts()
{
    // Get alerts data from server

    console.log('Fetching alert data');

    let getUrl = `${portalUrl}/resources/${getLocator()}/alerts`;
    fetch(getUrl).then(response => response.json())
    .then((data) => {
        data.id = 'alerts';
        console.log(data)
        // Render alerts data in settings esque display
        switchPageContext('settings', data);
    });
}

function onclick_manageNotifyees() 
{
    // Get contacts data from server

    console.log('Fetching contact data');

    let getUrl = `${portalUrl}/resources/${getLocator()}/contacts`;
    fetch(getUrl).then(response => response.json())
    .then((data) => {
        data.id = 'contacts';
        console.log(data)
        // Render contacts data in settings esque display
        switchPageContext('settings', data);
    });
}

function onclick_help() 
{
    // Get help data from server

    console.log('Fetching help data');

    // Render help data on page
}

/**
 * Page context switching functions
 */
async function switchPageContext(context, data)
{
    console.log(`Switching page context to [${context}]`);
    let panels = document.getElementById('content');
    if (context === 'settings')
    {
        document.getElementById('cam-panel').hidden = true;
        cleanPanels();
        panels.appendChild(await generateSettingsPanel(data));
    }
    else if (context === 'help')
    {
        document.getElementById('cam-panel').hidden = true;
        cleanPanels();
        panels.appendChild(await generateHelpPanel(data));
    }
    else if (context === 'log')
    {
        document.getElementById('cam-panel').hidden = true;
        cleanPanels();
        panels.appendChild(await generateLogPanel(data));
    }
    else if (context === 'cameras')
    {
        cleanPanels();
        document.getElementById('cam-panel').hidden = false;
    }
}
