let stompClient;
let canvas, context;

const myColor = "#" + Math.floor(Math.random() * 16777215).toString(16);

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
            showDrawing(JSON.parse(drawing.body));
        });
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
    stompClient.send("/app/draw", {}, JSON.stringify(drawing));
}

function showDrawing(drawing) {
    context.beginPath();
    context.strokeStyle = drawing.color;
    context.arc(drawing.x, drawing.y, drawing.radius, 0, Math.PI * 2, true);
    context.stroke();
    context.closePath();
}

$(function () {
    $("form").on('submit', function (e) {
        e.preventDefault();
    });
    $("#connect").click(function () {
        connect();
    });
    $("#disconnect").click(function () {
        disconnect();
    });

    canvas = document.getElementById("canvas");
    context = canvas.getContext("2d");
    canvas.addEventListener("click", function (event) {
        const rect = getMousePosition(canvas, event);
        const radius = Math.random() * 10;
        const drawing = {
            x: rect.x,
            y: rect.y,
            radius: radius,
            color: myColor
        };
        showDrawing(drawing);
        sendDrawing(drawing);
    })
});

function getMousePosition(canvas, event) {
    const rect = canvas.getBoundingClientRect();
    return {
        x: event.clientX - rect.left,
        y: event.clientY - rect.top
    };
}
