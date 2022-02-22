function onTileMouseover(tile)
{
	var children = tile.children;
	
	for(var i = 0; i < children.length; i++)
	{
		if(children[i].className === "cam-tile-status")
		{		
			// Unhide the status overlay div
			children[i].hidden = false;
			break;
		}
	}
}

function onTileMouseout(tile)
{
	var children = tile.children;
	
	for(var i = 0; i < children.length; i++)
	{
		if(children[i].className === "cam-tile-status")
		{
			// Hide the status overlay div
			children[i].hidden = true;
			break;
		}
	}
}

function onStartVideoButton(camId)
{
	let btn = document.getElementById(`${camId}-stream`);
	btn.classList.replace('add', 'delete');
	btn.innerText = 'Stop Stream';
	btn.onclick = function() { onStopVideoButton(camId) };
	document.getElementById('stream-tile').hidden = false;
	camDataWebsocket.send(JSON.stringify(generate_startCamStreamCmd(camId)));
}

function onStopVideoButton(camId)
{
	let btn = document.getElementById(`${camId}-stream`);
	btn.classList.replace('delete', 'add');
	btn.innerText = 'Start Stream';
	btn.onclick = function() { onStartVideoButton(camId) };
	document.getElementById('stream-tile').hidden = true;
	camDataWebsocket.send(JSON.stringify(generate_stopCamStreamCmd(camId)));
}
