let gridSize = 3;
let cellSize;
let offsetX, offsetY;
let sliders = []; // To store the slider positions
let sliderValues = Array(9).fill(0); // Assuming a value of 0 for each slider initially.

let relationships = [];
let wsStatus = "Connecting...";

function setup() {
  //fix class
  // const  wsHandler = new WebSocketHandler('ws://localhost:8081');

  // Connect to WebSocket server
  const socket = new WebSocket("ws://localhost:3000");
  socket.onopen = function (event) {
    console.log("WebSocket connection opened:", event);
    wsStatus = "Connected";
  };

  socket.onmessage = function (event) {
    let msg = JSON.parse(event.data);
    handleOscData(msg);
  };

  socket.onerror = function (error) {
    console.log("WebSocket Error:", error);
    wsStatus = "Error";
  };

  socket.onclose = function (event) {
    if (event.wasClean) {
      console.log(
        `WebSocket closed cleanly, code=${event.code}, reason=${event.reason}`
      );
      wsStatus = "Closed";
    } else {
      console.log("WebSocket connection died");
      wsStatus = "Disconnected";
    }
  };

   createCanvas(windowWidth, windowHeight);
  cellSize = min(width, height) / gridSize;
  offsetX = (width - cellSize * gridSize) / 2;
  offsetY = (height - cellSize * gridSize) / 2;

  let sliderID = 1; // Start from 1
  for (let i = 0; i < gridSize; i++) {
    for (let j = 0; j < gridSize; j++) {
      let x = offsetX + i * cellSize;
      let y = offsetY + j * cellSize;
      sliders.push(new Slider(x, y, sliderID));
      sliderID++; // Increment the id for next slider
    }
  }

  // Set up relationships
  for (let i = 0; i < sliders.length; i++) {
    let currentSlider = sliders[i];
    let relatedSlider = random(sliders); // Picking a random slider as related
    while (relatedSlider === currentSlider) {
      // Ensure we don't relate a slider with itself
      relatedSlider = random(sliders);
    }
    relationships.push([currentSlider, relatedSlider]);
  }
}

function draw() {
  background(220);
  fill(204, 255, 204); // Pastel lime green

  for (let slider of sliders) {
    slider.display();
    slider.drag();
  }
}

class Slider {
  constructor(x, y, id) {
    this.x = x;
    this.y = y;
    this.id = id; // Store the id
    this.textY = y + cellSize / 2; // Initial position of the T
    this.dragging = false;
  }

  display() {
    // Set the fill color for the square
    fill(204, 255, 204); // Pastel lime green

    stroke(255); // White border
    push();
    strokeWeight(10);
    rect(this.x, this.y, cellSize, cellSize);
    pop();

    // Draw the line dividing the square down the middle
    line(
      this.x + cellSize / 2,
      this.y,
      this.x + cellSize / 2,
      this.y + cellSize
    );

    // Draw the letter 'T'
    fill(255, 0, 0); // Red color for the letter 'T'
    textSize(cellSize * 0.2); // Set text size
    textStyle(BOLD);
    textAlign(CENTER, CENTER);
    text("T9", this.x + cellSize / 2, this.textY);
  }

  drag() {
    if (this.dragging) {
      let dy = mouseY - this.textY;
      this.textY = constrain(mouseY, this.y, this.y + cellSize);

      // Adjust other sliders based on relationships
      for (let rel of relationships) {
        if (rel[0] === this) {
          let relatedSlider = rel[1];
          relatedSlider.adjust(dy * 0.5); // Adjusts related slider by half the movement of the primary slider
        }
      }
    }
  }
  
 moveSliderOsc(value) {
        this.textY = constrain(this.textY + value, this.y, this.y + cellSize);
    }
  
  //method to 
   setValue(value) {
    this.textY = map(value, 0, 1, this.y + cellSize, this.y); // Assumes value is between 0 and 1
  }

  adjust(dy) {
    this.textY = constrain(this.textY + dy, this.y, this.y + cellSize);
  }

  press(pX, pY) {
    if (
      pX > this.x &&
      pX < this.x + cellSize &&
      pY > this.y &&
      pY < this.y + cellSize
    ) {
      this.dragging = true;
      console.log("Moving T with ID:", this.id);
    }
  }

  release() {
    this.dragging = false;
    console.log("T y-value:", this.textY - this.y);
  }
}
function handleOscData(data) {
    const { clientNumber, oscData } = data.data;
    
    // Adjust the slider corresponding to the client
    let primarySlider = sliders[clientNumber - 1];
    primarySlider.adjust(oscData);

    // Find and adjust the related slider
    for (let rel of relationships) {
        if (rel[0] === primarySlider) {
            let relatedSlider = rel[1];
            relatedSlider.moveSliderOsc(oscData * 0.5); // Adjust related slider by half or any desired factor
            break;
        }
    }

    console.log(`Client ${clientNumber} is controlling slider ${clientNumber} with value ${oscData}`);
}



function mousePressed() {
  for (let slider of sliders) {
    slider.press(mouseX, mouseY);
  }
}

function mouseReleased() {
  for (let slider of sliders) {
    slider.release();
  }
}
