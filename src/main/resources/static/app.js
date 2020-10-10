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
    if (stompClient) {
        stompClient.send("/app/draw", {}, JSON.stringify(drawing));
    }
}

function showDrawing(drawing) {
    switch (drawing.type) {
        case "circle":
            context.beginPath();
            context.strokeStyle = drawing.color;
            context.arc(drawing.x, drawing.y, drawing.radius, 0, Math.PI * 2, true);
            context.stroke();
            context.closePath();
            break;
        case "line":
            context.beginPath();
            context.strokeStyle = drawing.color;
            context.moveTo(drawing.start[0], drawing.start[1]);
            context.lineTo(drawing.end[0], drawing.end[1]);
            context.stroke();
            context.closePath();
            break;
        default:
            console.log(`Unknown drawing type ${drawing.type}`);
            break;
    }
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

    canvas.addEventListener("dblclick", function (event) {
        const rect = getMousePosition(event);
        const radius = Math.random() * 10;
        const drawing = {
            type: 'circle',
            x: rect.x,
            y: rect.y,
            radius: radius,
            color: myColor
        };
        showDrawing(drawing);
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
            start: [start.x, start.y],
            end: [current.x, current.y],
            color: myColor,
            source: "mouseup"
        };
        showDrawing(drawing);
        sendDrawing(drawing);
        start = current;
    });

    canvas.addEventListener("mouseup", function (event) {
        mousedown = false;
        let end = getMousePosition(event);
        const drawing = {
            type: 'line',
            start: [start.x, start.y],
            end: [end.x, end.y],
            color: myColor,
            source: "mouseup"
        };
        showDrawing(drawing);
        sendDrawing(drawing);
    });

});

function getMousePosition(event) {
    const rect = canvas.getBoundingClientRect();
    return {
        x: event.clientX - rect.left,
        y: event.clientY - rect.top
    };
}
