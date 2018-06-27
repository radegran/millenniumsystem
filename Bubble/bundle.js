var Point = function (x, y) {
    return { x: x, y: y };
};
var HexPoint = function (x, y) {
    return { x: x, y: y };
};
var Graphics;
(function (Graphics) {
    Graphics.Colors = [
        "#ffff00",
        "#ff80d5",
        "#ff0000",
        "#00b33c",
        "#cc00ff",
        "#66ccff",
        "#8cff66",
    ];
    Graphics.getRandomColor = function () {
        return Graphics.Colors[Math.floor(Math.random() * Graphics.Colors.length)];
    };
    Graphics.Bubble = function (point, radius, fill) {
        var s = new paper.Path.Circle(point.clone().add([4, 4]), radius);
        var shape = new paper.Path.Circle(point.clone(), radius);
        var fillColor = fill || Graphics.getRandomColor();
        var group = new paper.Group({
            children: [s, shape]
        });
        group.fillColor = fillColor;
        group.translate(new paper.Point(-2, -2));
        s.fillColor = "black";
        return {
            shape: group,
            color: fillColor,
            vx: 0,
            vy: 0
        };
    };
    Graphics.View = function (canvas) {
        paper.install(window);
        paper.setup(canvas);
        return {};
    };
})(Graphics || (Graphics = {}));
/// <reference path="../types/buzz.d.ts"/>
var Sound;
(function (Sound) {
    Sound.shootSound = new buzz.sound("http://soundbible.com/grab.php?id=930&type=mp3");
    Sound.fallBubbleSound = new buzz.sound("http://soundbible.com/grab.php?id=85&type=mp3");
})(Sound || (Sound = {}));
/// <reference path="model.ts"/>
/// <reference path="graphics.ts"/>
/// <reference path="sound.ts"/>
// let debug = function(id, p, r, fillColor)
// {
//     if (!debug.elem) { debug.elem = {}; }
//     if (!debug.elem[id]) { debug.elem[id] = Bubble(p.x, p.y, r, fillColor); }
//     debug.elem[id].shape.position = new paper.Point(p.x, p.y);
// };
// let HexGrid = function(origo, radius)
// {
//     let pointToHex = function(point)
//     {
//         let hexY = Math.round((point.y - boardTop - radius) / (Math.sqrt(3)*radius) );
//         let isOdd = (hexY % 2 == 1);
//         let hexX = Math.round((point.x - boardLeft - radius - (isOdd ? radius : 0)) / (2*radius));
//         return {"x": hexX, "y": hexY};
//     };
//     let hexToPoint = function(hex)
//     {
//         let isOdd = (100+hex.y) % 2 == 1;
//         let x = boardLeft + radius + (2*radius*hex.x) + (isOdd ? radius : 0);
//         let y = boardTop + radius + (Math.sqrt(3)*radius*hex.y);
//         return {"x": x, "y": y};
//     };
// };
var Game = function () {
    var gameView = Graphics.View(document.getElementById('myCanvas'));
    // paper.install(window)
    // paper.setup(canvas);
    var view = paper.view;
    var canvasHeight = window.innerHeight;
    var ballSpeed = 12;
    var radius = canvasHeight / 40;
    var ballsPerRow = 10;
    var ballsPerColumn = 12;
    var boardWidth = ballsPerRow * (radius * 2);
    var boardTop = 30;
    var boardLeft = 20;
    var hexGrid = [];
    var pointToHex = function (point) {
        var hexY = Math.round((point.y - boardTop - radius) / (Math.sqrt(3) * radius));
        var isOdd = (hexY % 2 == 1);
        var hexX = Math.round((point.x - boardLeft - radius - (isOdd ? radius : 0)) / (2 * radius));
        return { "x": hexX, "y": hexY };
    };
    var hexToPoint = function (hex) {
        var isOdd = (100 + hex.y) % 2 == 1;
        var x = boardLeft + radius + (2 * radius * hex.x) + (isOdd ? radius : 0);
        var y = boardTop + radius + (Math.sqrt(3) * radius * hex.y);
        return new paper.Point(x, y);
    };
    var adjacentHex = function (hexPoint) {
        var center = hexToPoint(hexPoint);
        var list = [];
        for (var i = 0; i < 6; i++) {
            var x = center.x + 2 * radius * Math.cos(2 * 3.1415 * i / 6);
            var y = center.y + 2 * radius * Math.sin(2 * 3.1415 * i / 6);
            list.push(pointToHex(new paper.Point(x, y)));
        }
        return list;
    };
    for (var row = 0; row < ballsPerColumn; row++) {
        var r = [];
        var isOdd = row % 2 == 1;
        var ballsInThisRow = ballsPerRow - (isOdd ? 1 : 0);
        for (var col = 0; col < ballsInThisRow; col++) {
            var p = hexToPoint({ x: col, y: row });
            var bubble = Graphics.Bubble(p, radius);
            r.push(bubble);
        }
        hexGrid.push(r);
    }
    var playerBall = Graphics.Bubble(new paper.Point(boardLeft + ballsPerRow * radius, canvasHeight - 3 * radius), radius);
    var fixZIndex = function () {
        var current = null;
        for (var i = 0; i < hexGrid.length; i++) {
            for (var j = 0; j < hexGrid[i].length; j++) {
                var b = hexGrid[i][j];
                if (b && current) {
                    b.shape.insertAbove(current.shape);
                }
                current = b;
            }
        }
    };
    var shooting = false;
    view.onMouseDown = function (event) {
        if (!shooting) {
            Sound.shootSound.stop();
            Sound.shootSound.play();
            shooting = true;
            var vx = event.point.x - playerBall.shape.position.x;
            var vy = event.point.y - playerBall.shape.position.y;
            var dist = Math.sqrt(vx * vx + vy * vy) / ballSpeed;
            playerBall.vx = vx / dist;
            playerBall.vy = vy / dist;
        }
    };
    var getBubble = function (hexPoint) {
        var row = hexGrid[hexPoint.y];
        if (row) {
            return row[hexPoint.x];
        }
        return null;
    };
    var setBubble = function (bubble, hexPoint) {
        if (hexPoint.x < 0 || hexPoint.y < 0) {
            throw "no can do";
        }
        var row = hexGrid[hexPoint.y];
        while (!row) {
            hexGrid.push([]);
            row = hexGrid[hexPoint.y];
        }
        var col = row[hexPoint.x];
        while (col !== null) {
            row.push(null);
            col = row[hexPoint.x];
        }
        hexGrid[hexPoint.y][hexPoint.x] = bubble;
    };
    var fallingBubbles = [];
    // Returns list of connected bubbles in hexCoordinates
    var findConnected = function (startHex, predicate) {
        var thiskey = JSON.stringify(startHex);
        var counted = {};
        counted[thiskey] = true;
        var recurse = function (h) {
            var list = adjacentHex(h);
            for (var i = 0; i < list.length; i++) {
                var b = getBubble(list[i]);
                var key = JSON.stringify(list[i]);
                if (b && !counted[key] && predicate(b)) {
                    // connected, same color, not counted!
                    counted[key] = true;
                    recurse(list[i]);
                }
            }
        };
        recurse(startHex);
        return Object.keys(counted).map(function (key) { return JSON.parse(key); });
    };
    var tryKillBubbles = function (hexPoint) {
        var thisColorString = getBubble(hexPoint).color.toString();
        var sameColorPredicate = function (bubble) {
            return bubble.color.toString() == thisColorString;
        };
        // Kill all with same color
        var connected = findConnected(hexPoint, sameColorPredicate);
        if (connected.length > 2) {
            Sound.fallBubbleSound.stop();
            Sound.fallBubbleSound.play();
            var shootingBubble = getBubble(hexPoint);
            for (var i = 0; i < connected.length; i++) {
                var hexP = connected[i];
                var bubble = getBubble(hexP);
                bubble.shape.bringToFront();
                bubble.vx = shootingBubble.vx;
                bubble.vy = shootingBubble.vy;
                fallingBubbles.push(bubble);
                hexGrid[hexP.y][hexP.x] = null;
            }
            // Kill all dangling
            var topRow = hexGrid[0];
            var connectedDict_1 = {};
            for (var i = 0; i < topRow.length; i++) {
                if (getBubble(HexPoint(i, 0))) {
                    findConnected({ x: i, y: 0 }, function () { return true; })
                        .map(function (hexP) { connectedDict_1[JSON.stringify(hexP)] = true; });
                }
            }
            for (var i = 0; i < hexGrid.length; i++) {
                for (var j = 0; j < hexGrid[i].length; j++) {
                    var hexP = { x: j, y: i };
                    if (!connectedDict_1[JSON.stringify(hexP)]) {
                        var bubble = hexGrid[i][j];
                        if (bubble) {
                            // This is dangling!            
                            bubble.vx = shootingBubble.vx;
                            bubble.vy = shootingBubble.vy * 0;
                            fallingBubbles.push(bubble);
                            hexGrid[hexP.y][hexP.x] = null;
                        }
                    }
                }
            }
        }
    };
    view.onFrame = function (event) {
        var now = Date.now();
        for (var i = 0; i < fallingBubbles.length; i++) {
            var f = fallingBubbles[i];
            f.startFallTime = f.startFallTime || now;
            if (now - f.startFallTime > 5000) {
                f.shape.remove();
                fallingBubbles.splice(i, 1);
                i--;
                continue;
            }
            var p = f.shape.position;
            f.shape.position = new paper.Point(p.x + f.vx, p.y + f.vy);
            f.vy += 0.5;
        }
        if (shooting) {
            // update velocity
            var p = playerBall.shape.position;
            playerBall.shape.position = new paper.Point(p.x + playerBall.vx, p.y + playerBall.vy);
            p = playerBall.shape.position;
            if (p.x < (boardLeft + radius) || p.x > (boardLeft + boardWidth - radius)) {
                playerBall.vx = -playerBall.vx;
            }
            // collision test
            var point = playerBall.shape.position;
            var hexPoint = pointToHex(point);
            var hexX = hexPoint.x;
            var hexY = hexPoint.y;
            for (var i = hexY - 1; i <= hexY + 1; i++) {
                for (var j = hexX - 1; j <= hexX + 1; j++) {
                    var bubble = getBubble(HexPoint(j, i));
                    if (bubble) {
                        var bp = bubble.shape.position;
                        var dist = Math.sqrt((bp.x - point.x) * (bp.x - point.x) + (bp.y - point.y) * (bp.y - point.y));
                        if (dist < 2 * radius * 0.9) {
                            // Collision!
                            setBubble(playerBall, hexPoint);
                            var quant = hexToPoint(hexPoint);
                            var newp = new paper.Point(quant.x, quant.y);
                            playerBall.shape.position = newp;
                            playerBall = Graphics.Bubble(new paper.Point(boardLeft + ballsPerRow * radius, canvasHeight - 3 * radius), radius);
                            shooting = false;
                            fixZIndex();
                            tryKillBubbles(hexPoint);
                            return;
                        }
                    }
                }
            }
        }
    };
    var start = function () {
    };
    return {
        "start": start
    };
};
var init = function () {
    Game();
};
//# sourceMappingURL=bundle.js.map