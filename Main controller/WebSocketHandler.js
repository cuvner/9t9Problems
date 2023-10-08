class WebSocketHandler {
  constructor(url) {
    this.socket = new WebSocket(url);
    
    this.socket.onopen = this.onOpen.bind(this);
    this.socket.onmessage = this.onMessage.bind(this);
    this.socket.onerror = this.onError.bind(this);
    this.socket.onclose = this.onClose.bind(this);
  }

  onOpen(event) {
    console.log('WebSocket connection opened:', event);
  }

  onMessage(event) {
    let msg = JSON.parse(event.data);
    handleOscMessage(msg);
  }

  onError(error) {
    console.log('WebSocket Error:', error);
  }

  onClose(event) {
    if (event.wasClean) {
      console.log(`WebSocket closed cleanly, code=${event.code}, reason=${event.reason}`);
    } else {
      console.log('WebSocket connection died');
    }
  }

  // Any additional methods related to WebSocket can be added here
   handleOscData(message) {
    console.log("Received OSC:", message);
    // React to the OSC message as needed within the sketch
}
}