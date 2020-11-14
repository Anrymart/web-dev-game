<template>
  <div>
    <noscript>
      <h2 style="color: #ff0000">Seems your browser doesn't support Javascript! Websocket relies on Javascript being
        enabled. Please enable Javascript and reload this page!</h2>
    </noscript>
    <div id="main-content" class="container">
      <div class="row">
        <div class="col-md-6">
          <form class="form-inline">
            <div class="form-group">
              <label for="connect">WebSocket connection:</label>
              <button id="connect" class="btn btn-default" type="submit">Connect</button>
              <button id="disconnect" class="btn btn-default" type="submit" disabled="disabled">Disconnect
              </button>
            </div>
          </form>
        </div>
        <div class="col-md-6">
          <label for="color">Choose color:</label>
          <input type="color" id="color" name="head" value="#e66465">
        </div>
      </div>
    </div>
    <canvas id="canvas" height="800" width="1200"></canvas>
  </div>
</template>

<script>
export default {
  name: "GameBoard",
  methods: {
    loadContent() {
      $("form").on('submit', function (e) {
        e.preventDefault();
      });
      $("#connect").click(function () {
        connect();
      });
      $("#disconnect").click(function () {
        disconnect();
      });

      let color = $("#color");
      color.val("#" + Math.floor(Math.random() * 16777215).toString(16));

      canvas = document.getElementById("canvas");
      context = canvas.getContext("2d");

      canvas.addEventListener("dblclick", function (event) {
        const rect = getMousePosition(event);
        const radius = Math.random() * 10;
        const drawing = {
          type: 'circle',
          features: {
            x: rect.x,
            y: rect.y,
            radius: radius,
            color: color.val()
          }
        };
        handleEvent(drawing);
        sendDrawing(drawing);
      });

      let mousedown, start;

      canvas.addEventListener("mousedown", function (event) {
        mousedown = true;
        start = getMousePosition(event);
      });

      canvas.addEventListener("mousemove", function (event) {
        if (!mousedown) {
          return;
        }
        let current = getMousePosition(event);
        const drawing = {
          type: 'line',
          features: {
            start: [start.x, start.y],
            end: [current.x, current.y],
            color: color.val(),
            source: "mouseup"
          }
        };
        handleEvent(drawing);
        sendDrawing(drawing);
        start = current;
      });

      canvas.addEventListener("mouseup", function (event) {
        mousedown = false;
        let end = getMousePosition(event);
        const drawing = {
          type: 'line',
          features: {
            start: [start.x, start.y],
            end: [end.x, end.y],
            color: color.val(),
            source: "mouseup"
          }
        };
        handleEvent(drawing);
        sendDrawing(drawing);
      });

      document.addEventListener("mousemove", function (event) {
        const cursorEvent = {
          type: 'cursor',
          features: {
            clientId: clientId,
            top: event.clientY,
            left: event.clientX
          }
        };
        handleEvent(cursorEvent);
        sendDrawing(cursorEvent);
      });
    },
    mounted() {
      this.loadContent();
    }
  }
}

let stompClient;
let canvas, context;
const clientId = Math.round((Math.random() * 1e10));

function setConnected(connected) {
  $("#connect").prop("disabled", connected);
  $("#disconnect").prop("disabled", !connected);
}

function connect() {
  var socket = new SockJS('/drawing-websocket');
  stompClient = Stomp.over(socket);
  stompClient.connect({}, function (frame) {
    setConnected(true);
    console.log('Connected: ' + frame);
    stompClient.subscribe('/topic/drawings', function (drawing) {
      handleEvent(JSON.parse(drawing.body));
    });
  });
  loadHistory();
}

function loadHistory() {
  $.get("/messages?types=line,circle").then(data => {
    data.forEach(event => {
      handleEvent(event);
    })
  });
}

function disconnect() {
  if (stompClient !== null) {
    stompClient.disconnect();
  }
  setConnected(false);
  console.log("Disconnected");
}

function sendDrawing(drawing) {
  if (stompClient) {
    stompClient.send("/app/draw", {}, JSON.stringify(drawing));
  }
}

function handleEvent(event) {
  const features = event.features;
  switch (event.type) {
    case "circle":
      context.beginPath();
      context.strokeStyle = features.color;
      context.arc(features.x, features.y, features.radius, 0, Math.PI * 2, true);
      context.stroke();
      context.closePath();
      break;
    case "line":
      context.beginPath();
      context.strokeStyle = features.color;
      context.moveTo(features.start[0], features.start[1]);
      context.lineTo(features.end[0], features.end[1]);
      context.stroke();
      context.closePath();
      break;
    case "cursor":
      if (features.clientId === clientId) {
        break;
      }
      let cursor = $(`#cursor-${features.clientId}`);
      if (!cursor.length) {
        let cursor = $(`<div class="cursor" id="cursor-${features.clientId}"></div>`);
        $("body").append(cursor);
      }
      cursor.css({top: features.top, left: features.left});
      break;
    default:
      console.log(`Unknown drawing type ${event.type}`);
      break;
  }
}

function getMousePosition(event) {
  const rect = canvas.getBoundingClientRect();
  return {
    x: event.clientX - rect.left,
    y: event.clientY - rect.top
  };
}
</script>

<style scoped>
body {
  background-color: #f5f5f5;
}

#main-content {
  max-width: 940px;
  padding: 2em 3em;
  margin: 0 auto 20px;
  background-color: #fff;
  border: 1px solid #e5e5e5;
  -webkit-border-radius: 5px;
  -moz-border-radius: 5px;
  border-radius: 5px;
}

.cursor {
  position: absolute;
  width: 20px;
  height: 20px;
  border-radius: 10px;
  border: 2px solid #ff0000;
  opacity: 0.5;
  left: -100px;
  top: -100px;
}
</style>