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
});

function getMousePosition(event) {
    const rect = canvas.getBoundingClientRect();
    return {
        x: event.clientX - rect.left,
        y: event.clientY - rect.top
    };
}
