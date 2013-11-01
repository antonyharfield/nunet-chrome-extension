function saveOptions() {
  var username = document.getElementById("username").value;
  var password = document.getElementById("password").value;
  localStorage["username"] = username;
  localStorage["password"] = password;

  // Update status to let user know options were saved.
  //var status = document.getElementById("status");
  //status.innerText = "Options saved.";
  
  // Close tab
  chrome.tabs.getCurrent(function(tab) {
	chrome.tabs.remove(tab.id);
  });
}

// Restores select box state to saved value from localStorage.
function restoreOptions() {
  var username = localStorage["username"];
  var password = localStorage["password"];
  if (!username) {
    return;
  }
  document.getElementById("username").value = username;
  document.getElementById("password").value = password;
}

document.addEventListener('DOMContentLoaded', restoreOptions);
document.querySelector('#save').addEventListener('click', saveOptions);

