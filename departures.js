// API Handler
class APIRequest {
    
    constructor() {
        this.renewToken();
    }
    
    renewToken() {
        fetch("credentials.txt")
        .then(response => response.text())
        .then(text => this.renewHeader(text));
    }

    renewHeader(auth) {
        var header = new Headers();
        header.set("Content-Type", "application/x-www-form-urlencoded");
        header.set("Authorization", auth);

        var myInit = { method: 'POST', headers: header};

        var myRequest = new Request("https://api.vasttrafik.se/token?grant_type=client_credentials&scope=device_1", myInit);
        fetch(myRequest)
        .then(response => response.json())
        .then(responseArr => {
            var token = responseArr["access_token"];
            var headers = new Headers();
            headers.set("Authorization", "Bearer " + token);
            this.init = { method: "GET", headers: headers };
            addListElement(token);
        });
    }

    getDepartures(stop, date=null, time=null) {
        if (date == null || time == null) {
            var currenttime = new Date();
            if (date == null) {
                date = currenttime.getFullYear() + "-" + (currenttime.getMonth()+1) + "-" + currenttime.getDate();
            }
            if (time == null) {
                time = currenttime.getHours() + ":" + currenttime.getMinutes();
            }
        }
        
        time = time.replace(".", ":");
        var url = "https://api.vasttrafik.se/bin/rest.exe/v2/departureBoard?id=" + stop + "&date=" + date + "&time=" + time + "&format=json";
    
        var myRequest = new Request(url, this.init);
        fetch(myRequest)
        .then(response => {
            if (response.status == 401) {
                this.renewToken();
                alert("Invalid credentials, updating... Please try again.");
                return false;
            }
            response.json().then(parsed => displayDepartures(parsed));
        });
    }
}



// Main
var API = new APIRequest();

document.body.onload = changeBg();

function addListElement(text, bgcolor=null, fgcolor=null) { 
    // create a new div element 
    var newRow = document.createElement("li"); 
    // and give it some content 
    var newContent = document.createTextNode(text); 
    // add the text node to the newly created div
    newRow.appendChild(newContent);
    // add class if needed
    if (bgcolor != null && fgcolor != null) {
        newRow.style.background = bgcolor;
        newRow.style.color = fgcolor;
    }

    // add the newly created element and its content into the DOM 
    var listContainer = document.getElementById("list"); 
    listContainer.appendChild(newRow);
}

function changeBg() {
    var red = Math.random();
    var green = Math.random();
    var blue = Math.random();

    color = "rgb(" + red + ", " + green + ", " + blue + ")";
    document.bgColor = color;
    addListElement(color);
    console.log("Changed bg");
}

function clearList() {
    var children = document.getElementById("list").children;
    console.log(children.length);
    var i = 0;
    while (i < children.length) {
        children[0].parentElement.removeChild(children[0]);
    }
    console.log("List cleared")
}

function readFile(file) {
    fetch(file)
    .then(response => response.json())
    .then(jsonResponse => displayDepartures(jsonResponse));
}

function displayDepartures(input) {
    console.log(input);
    var departures = input["DepartureBoard"]["Departure"];
    console.log(departures);

    var i = 0;
    for (var i = 0; i < departures.length; i++) {
        text = departures[i]["name"] + " " + departures[i]["direction"] + " " + departures[i]["time"];

        addListElement(text, departures[i]["fgColor"], departures[i]["bgColor"]);
    }
}