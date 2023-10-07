let gridSize = 3;
let cellSize;
let offsetX, offsetY;
let sliders = []; // To store the slider positions
let relationships = [];

function setup() {
  //fix class
   // const  wsHandler = new WebSocketHandler('ws://localhost:8081');
  
      // Connect to WebSocket server
  const ws = new WebSocket('ws://localhost:3000');
      ws.onmessage = function(event) {
        const data = JSON.parse(event.data);
        handleOscData(data.message);
    };
  
  
  createCanvas(windowWidth, windowHeight);
  cellSize = min(width, height) / gridSize;
  offsetX = (width - (cellSize * gridSize)) / 2;
  offsetY = (height - (cellSize * gridSize)) / 2;

  for (let i = 0; i < gridSize; i++) {
    for (let j = 0; j < gridSize; j++) {
      let x = offsetX + i * cellSize;
      let y = offsetY + j * cellSize;
      sliders.push(new Slider(x, y));
    }
  }
  
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
    while (relatedSlider === currentSlider) { // Ensure we don't relate a slider with itself
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
    line(this.x + cellSize / 2, this.y, this.x + cellSize / 2, this.y + cellSize);

    // Draw the letter 'T'
    fill(255, 0, 0); // Red color for the letter 'T'
    textSize(cellSize * 0.2); // Set text size
    textStyle(BOLD);
    textAlign(CENTER, CENTER);
    text('T', this.x + cellSize / 2, this.textY);
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

  adjust(dy) {
    this.textY = constrain(this.textY + dy, this.y, this.y + cellSize);
  }

 press(pX, pY) {
  if (pX > this.x && pX < this.x + cellSize && pY > this.y && pY < this.y + cellSize) {
    this.dragging = true;
    console.log("Moving T with ID:", this.id);
  }
}

  release() {
    this.dragging = false;
    console.log("T y-value:", this.textY - this.y);
  }
}


function handleOscData(message) {
    console.log("Received OSC:", message);
    // React to the OSC message as needed within the sketch
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
