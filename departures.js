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

function randInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function changeBg() {
    var red = Math.random()
    var green = Math.random()
    var blue = Math.random()

    color = "rgb(" + red + ", " + green + ", " + blue + ")";
    document.bgColor = color;
    addListElement(color)
}