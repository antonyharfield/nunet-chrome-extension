var __VIEWSTATE = "";
var __VIEWSTATEGENERATOR = "";
var __EVENTVALIDATION = "";

function checkForInternet() {
	console.log("checking for internet connection...");
	
	pingMCL(function() {
        console.log("we are online");
		chrome.browserAction.setIcon({path: "icon.png"});
		
	}, function(respText) {
		console.log("we are offline!");
		chrome.browserAction.setIcon({path: "icon-offline.png"});
        getValueFromNuNet();
	});
}

function pingMCL(success, fail) {
	var xhrCheck = new XMLHttpRequest();
	xhrCheck.open("GET", "http://www.mobcomlab.com/?_=" + new Date().getTime(), true);
	xhrCheck.onreadystatechange = function() {
        console.log(xhrCheck);
        console.log("Pass1"+xhrCheck.readyState+" "+xhrCheck.status);
		if (xhrCheck.readyState == 4) {
			if (xhrCheck.status === 200 && xhrCheck.responseURL.includes("nu.ac.th") == false) {
                console.log("Pass2");
				success();
			}
            else {
                console.log("Pass3");
				fail(xhrCheck.responseText);
			}
		}
	};
	xhrCheck.send();
}

function getValueFromNuNet() {
    var xhrGet = new XMLHttpRequest();
    xhrGet.open("GET", "https://authen3.nu.ac.th/Login.aspx", true);
    xhrGet.onreadystatechange = function() {
        if (xhrGet.readyState == 4) {
            if (xhrGet.status === 200) {
                var el = document.createElement('html');
                el.innerHTML = xhrGet.responseText;
                var input = el.getElementsByTagName("INPUT");
                getViewState(input);
                connectNuNet();
            }
        }
    };
    xhrGet.send();
}

function getViewState(input) {
    for (var i = 0; i < input.length; i++) {
        switch (input[i].name) {
            case "__VIEWSTATE":
                __VIEWSTATE = replaceOperand(input[i].value);
                break;
            case "__VIEWSTATEGENERATOR":
                __VIEWSTATEGENERATOR = replaceOperand(input[i].value);
                break;
            case "__EVENTVALIDATION":
                __EVENTVALIDATION = replaceOperand(input[i].value);
                break;
            default:
                break;
        }
    }
}

function replaceOperand(str) {
    for (var i = 0; i < str.length; i++) {
        switch (str.charAt(i)) {
            case "/":
                str = str.replace("/", "%2F");
                break;
            case "+":
                str = str.replace("+", "%2B");
                break;
            case "=":
                str = str.replace("=", "%3D");
                break;
            default:
                break;
        }
    }
    return str;
}

function connectNuNet() {
	console.log("connecting to NU-NET");

    var username = localStorage["username"];
    var password = localStorage["password"];

	var xhr = new XMLHttpRequest();
	xhr.open("POST", "https://authen3.nu.ac.th/login.aspx?v=lo", true);
	xhr.setRequestHeader("Content-type","application/x-www-form-urlencoded");
	xhr.onreadystatechange = function() {
		if (xhr.readyState == 4) {
			pingMCL(function() {
				console.log("connect success");
				chrome.browserAction.setIcon({path: "icon.png"});
			}, function(respText) {
				console.log("connect unsuccessful, maybe not NU");
			});
		}
	};
    xhr.send("__VIEWSTATE="+__VIEWSTATE+"&__VIEWSTATEGENERATOR="+__VIEWSTATEGENERATOR+"&__EVENTVALIDATION="+__EVENTVALIDATION+"&txtUsername="+username+"&txtPassword="+password+"&btnLogin=Login");
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
chrome.alarms.create({when: 0, periodInMinutes: 1});

