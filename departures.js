// API Handler
class APIRequest {
    
    constructor() {
        this.renewToken();
    }
    
    // Get credentials from saved file
    renewToken() {
        fetch("credentials.txt")
        .then(response => response.text())
        .then(text => this.renewHeader(text));
    }

    // Request new token
    renewHeader(auth) {
        var header = new Headers();
        header.set("Content-Type", "application/x-www-form-urlencoded");
        header.set("Authorization", auth);

        var myInit = { method: 'POST', headers: header};

        var myRequest = new Request("https://api.vasttrafik.se/token?grant_type=client_credentials&scope=device_1", myInit);
        fetch(myRequest)
        .then(response => response.json())
        .then(responseArr => {
            // Get token and add it to header and init for use in future requests
            var token = responseArr["access_token"];
            var headers = new Headers();
            headers.set("Authorization", "Bearer " + token);
            this.init = { method: "GET", headers: headers };
            addListElement(token);
        });
    }

    // Request departures from stop
    getDepartures(stop, date=null, time=null) {
        // Use current time if not provided
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
                // If token is invalid
                this.renewToken();
                alert("Invalid credentials, updating... Please try again.");
                return false;
            }
            response.json().then(parsed => displayDepartures(parsed));
        });
    }

    //Search for stops
    getStops(name) {
        var url = "https://api.vasttrafik.se/bin/rest.exe/v2/location.name?input=" + name + "&format=json";
        var myRequest = new Request(url, this.init);
        
        fetch(myRequest)
        .then(response => {
            if (response.status == 401) {
                // If token is invalid
                this.renewToken();
                alert("Invalid credentials, updating... Please try again.");
                return false;
            }
            response.json().then(parsed => displayStops(parsed));
        })
    }
}



// Main

var API = new APIRequest();

document.body.onload = changeBg();

// Add a row to the list
function addListElement(text, attributes=[]) { 
    // Create a new li element 
    var newRow = document.createElement("li"); 
    // And give it some content 
    var newContent = document.createTextNode(text); 
    // Add the text node to the newly created li
    newRow.appendChild(newContent);
    
    // Add provided attributes
    console.log(attributes);
    try {
        if ( attributes != null && attributes[0].constructor != Array) {
            newRow.setAttribute(attributes[0], attributes[1]);
        } else {
            for (var i = 0; i < attributes.length; i++) {
                newRow.setAttribute(attributes[i][0], attributes[i][1]);
            }
        }
    } catch(e) {
        console.log("No attributes provided")
    }
    
    // Add the newly created element and its content into the DOM 
    var listContainer = document.getElementById("list"); 
    listContainer.appendChild(newRow);
}

// Change background to a random colour
function changeBg() {
    var red = Math.random();
    var green = Math.random();
    var blue = Math.random();
    var average = (blue + green + red) / 3;

    // If colour is dark then make headline white
    var h1 = document.getElementById("h1");
    if (average > 0.5) {
        h1.classList.add("whiteh1");
    } else {
        h1.classList.remove("whiteh1");
    }

    // Change background
    color = "rgb(" + red + ", " + green + ", " + blue + ")";
    document.bgColor = color;
    addListElement(color);
    console.log("Changed bg");
}

// Clear the ul from all li elements
function clearList() {
    var children = document.getElementById("list").children;
    console.log(children.length);
    while (0 < children.length) {
        children[0].parentElement.removeChild(children[0]);
    }
    console.log("List cleared")
}

// Read saved deps file used for testing
function readFile(file) {
    fetch(file)
    .then(response => response.json())
    .then(jsonResponse => displayDepartures(jsonResponse));
}

// Add the departures to the list
function displayDepartures(input) {
    console.log(input);
    var departures = input["DepartureBoard"]["Departure"];
    console.log(departures);

    // Go through all departures and add them to the list
    var i = 0;
    for (var i = 0; i < departures.length; i++) {
        // Get delay and format it
        var delay = getDelay(departures[i]);
        if (delay >= 0 && delay !== "") {
            delay = "+" + delay;
        }

        var text = departures[i]["name"] + " " + departures[i]["direction"] + " " + departures[i]["time"] + " " + delay;
        var styles = "background-color: " + departures[i]["fgColor"] + "; color: " + departures[i]["bgColor"] + ";";
        addListElement(text, ["style", styles]);
    }
}

// Get the delay for a departure
function getDelay(departure) {
    // Get the data
    var timetable = departure["time"];
    var realtime = departure["rtTime"];

    // If no realtime data is available
    if (realtime == null) {
        console.log("No realtime information provided");
        return "";
    }

    // Get more data
    var ttDate = departure["date"];
    var rtDate = departure["rtDate"];
    var tth = timetable.split(":")[0];
    var rth = realtime.split(":")[0];
    var ttm = timetable.split(":")[1];
    var rtm = realtime.split(":")[1];

    // Convert to numbers
    tth = Number(tth);
    rth = Number(rth);
    ttm = Number(ttm);
    rtm = Number(rtm);

    // If delay goes over midnight
    if (ttDate != rtDate) {
        if (rth < tth) {
            rth += 24;
        } else {
            tth += 24;
        }
    }

    // Turn hours into minutes and calculate delay
    ttm += tth*60;
    rtm += rth*60;
    var delay = rtm - ttm;
    return delay;
}

function searchStop() {
    var input = document.getElementById("stopSearch").value;
    API.getStops(input);
}

function displayStops(stops) {
    var locations = stops["LocationList"];
    var stoplocations = locations["StopLocation"];

    if (stoplocations instanceof Array) {
        for (var i = 0; i < stoplocations.length; i++) {
            var text = stoplocations[i]["name"] + " ID: " + stoplocations[i]["id"];

            var onclick = ["onclick", "API.getDepartures(" + stoplocations[i]["id"] + ")"];
            var style = ["style", "color: blue; text-decoration: underline;"];
            var attributes = [onclick, style];
            addListElement(text, attributes);
        }
    } else if (stoplocations == null) {
        addListElement("No stops found.");
    } else {
        var text = stoplocations["name"] + " ID: " + stoplocations["id"];
        
        var onclick = ["onclick", "API.getDepartures(" + stoplocations["id"] + ")"];
        var style = ["style", "color: blue; text-decoration: underline;"];
        var attributes = [onclick, style];
        addListElement(text, attributes);
    }
}