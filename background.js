function checkForInternet() {
	console.log("checking for internet connection...");
	
	pingGoogle(function() {
		console.log("we are online");
		chrome.browserAction.setIcon({path: "icon.png"});
		
	}, function(respText) {
		console.log("no internet!")
		chrome.browserAction.setIcon({path: "icon-offline.png"});
							
		// Try find a token in the NU-NET auth page
		var token = grabTokenNuNet(respText);
				
		// If found then lets attempt an auth
		if (token) {
			console.log("NU-NET detected: " + token);
			connectNuNet(token);
		}
	});
}

function pingGoogle(success, fail) {
	var xhr = new XMLHttpRequest();
	xhr.open("GET", "http://clients3.google.com/generate_204", true);
	xhr.onreadystatechange = function() {
		if (xhr.readyState == 4) {
			if (xhr.status === 204) {
				success();
			}
			else {
				fail(xhr.responseText);
			}
		}
	};
	xhr.send();
}

function grabTokenNuNet(respText) {
	var pattern = new RegExp('magic" value="[a-z0-9]+');
	var token = pattern.exec(respText);
	if (token === null)
		return null;
	
	token = token[0].substr(14);
	return token;
}

function connectNuNet(token) {
	console.log("connecting to NU-NET");

    var username = localStorage["username"];
    var password = localStorage["password"];
	
	var xhr = new XMLHttpRequest();
	xhr.open("POST", "https://login.nu.ac.th:1000/", true);
	xhr.setRequestHeader("Content-type","application/x-www-form-urlencoded");
	xhr.onreadystatechange = function() {
		if (xhr.readyState == 4) {
			pingGoogle(function() {
				console.log("connect success");
				chrome.browserAction.setIcon({path: "icon.png"});
			}, function(respText) {
				console.log("connect unsuccessful, maybe not NU");
			});
		}
	};
	xhr.send("magic="+token+"&username="+username+"&password="+password);
}
	
function connectNuWireless() {
	
}

// Default icon is offline
chrome.browserAction.setIcon({path: "icon-offline.png"});

// Open options on button click
chrome.browserAction.onClicked.addListener(function() {
	chrome.tabs.create({url: "options.html"});
});

// Check for internet when the first tab is loaded
chrome.tabs.onCreated.addListener(checkForInternet);
chrome.windows.onCreated.addListener(checkForInternet);

// Set up alarm to check internet every 3 minutes
chrome.alarms.onAlarm.addListener(function() {
  checkForInternet();
});
chrome.alarms.create({when: 0, periodInMinutes: 3});

