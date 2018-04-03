document.body.onload = changeBg();

function addListElement(text) { 
  // create a new div element 
  var newRow = document.createElement("li"); 
  // and give it some content 
  var newContent = document.createTextNode(text); 
  // add the text node to the newly created div
  newRow.appendChild(newContent);

  // add the newly created element and its content into the DOM 
  var listContainer = document.getElementById("list"); 
  listContainer.appendChild(newRow);
}

function changeBg() {
    var red = Math.random()
    var green = Math.random()
    var blue = Math.random()

    color = "rgb(" + red + ", " + green + ", " + blue + ")";
    document.bgColor = color;
    addListElement(color)
    console.log("Changed bg")
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
    .then(jsonResponse => stuff(jsonResponse));
}

function stuff(input) {
    console.log(input);
    var departures = input["DepartureBoard"]["Departure"];
    console.log(departures);

    var i = 0;
    for (var i = 0; i < departures.length; i++) {
        text = departures[i]["name"] + " " + departures[i]["direction"] + " " + departures[i]["time"]
        addListElement(text)
    }
}