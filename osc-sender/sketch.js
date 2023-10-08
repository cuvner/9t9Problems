let socket; // WebSocket connection
let activeSlider = null; // This will be the slider that sends OSC data.
let slider;

function setup() {
  // Connect to WebSocket server
  socket = new WebSocket("ws://localhost:3000");
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
  cellSize = min(width, height);
  offsetX = (width - cellSize) / 2;
  offsetY = (height - cellSize) / 2;
  let x = offsetX;
  let y = offsetY;
  slider = new Slider(x, y);
}

function draw() {
  slider.display();
  slider.drag();
}

class Slider {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.textY = y + cellSize / 2; // Initial position of the T
    this.dragging = false;
    this.active = false; // This property determines if the slider is the one sending OSC data
    this.lastTextY = this.textY; // Initialize lastTextY with the current position
    this.active = false; // This property determines if the slider is the one sending OSC data
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
    if (this.active) {
      stroke(255, 0, 0); // Drawing a red border to indicate this is the active slider
      noFill();
      rect(this.x - 5, this.y - 5, cellSize + 10, cellSize + 10); // Draw an outer rectangle
    }
  }

  drag() {
    if (this.dragging) {
      let dy = mouseY - this.textY;
      this.textY = constrain(mouseY, this.y, this.y + cellSize);
      this.sendOscData();
    }
  }

  press(pX, pY) {
    if (
      pX > this.x &&
      pX < this.x + cellSize &&
      pY > this.y &&
      pY < this.y + cellSize
    ) {
      this.dragging = true;
      //console.log("Moving T with ID:", this.id);
    }
  }

  release() {
    this.dragging = false;
    //console.log("T y-value:", this.textY - this.y);
  }

  // Call this method when the slider is moved
  sendOscData() {
    let relativeY = (this.textY - this.y) / cellSize;
          let data = JSON.stringify({sliderValue: relativeY});
        console.log(`data being sent ${data}`);
        socket.send(data);
    // Check if the slider has moved
    if (this.textY !== this.lastTextY) {
      if (socket.readyState !== WebSocket.CLOSED) {
        // Send the slider's relative Y position as a fraction of its possible range
        let relativeY = (this.textY - this.y) / cellSize;
        let data = JSON.stringify({sliderValue: relativeY});
        console.log(`data being sent ${data}`);
        socket.send(data);
      }
      
      this.lastTextY = this.textY; // Update the lastTextY to the current position
    }
  }

  // New method to activate or deactivate this slider for sending OSC data
}

function mousePressed() {
  slider.press(mouseX, mouseY);
}

// Update the mouseReleased function
function mouseReleased() {
  slider.release();

  // If the mouse was released on this slider, toggle its active state
}
