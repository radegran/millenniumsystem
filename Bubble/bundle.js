var Point = /** @class */ (function () {
    function Point(x, y) {
        this._x = x;
        this._y = y;
    }
    Object.defineProperty(Point.prototype, "x", {
        get: function () { return this._x; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Point.prototype, "y", {
        get: function () { return this._y; },
        enumerable: true,
        configurable: true
    });
    return Point;
}());
;
var HexPoint = /** @class */ (function () {
    function HexPoint(x, y) {
        this._x = x;
        this._y = y;
    }
    Object.defineProperty(HexPoint.prototype, "x", {
        get: function () { return this._x; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(HexPoint.prototype, "y", {
        get: function () { return this._y; },
        enumerable: true,
        configurable: true
    });
    return HexPoint;
}());
;
var HexTransformer = /** @class */ (function () {
    function HexTransformer(origo, hexRadius) {
        this.origo = origo;
        this.hexRadius = hexRadius;
    }
    HexTransformer.prototype.toHex = function (point) {
        var hexY = Math.round((point.y - this.origo.y - this.hexRadius) / (Math.sqrt(3) * this.hexRadius));
        var isOdd = (hexY % 2 == 1);
        var hexX = Math.round((point.x - this.origo.x - this.hexRadius - (isOdd ? this.hexRadius : 0)) / (2 * this.hexRadius));
        return new HexPoint(hexX, hexY);
    };
    HexTransformer.prototype.ToPoint = function (hex) {
        var isOdd = (100 + hex.y) % 2 == 1;
        var x = this.origo.x + this.hexRadius + (2 * this.hexRadius * hex.x) + (isOdd ? this.hexRadius : 0);
        var y = this.origo.y + this.hexRadius + (Math.sqrt(3) * this.hexRadius * hex.y);
        return new Point(x, y);
    };
    ;
    return HexTransformer;
}());
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
    var View = /** @class */ (function () {
        function View(canvas) {
            this.canvas = canvas;
        }
        return View;
    }());
    Graphics.View = View;
    ;
    Graphics.setupCanvas = function (canvas) {
        paper.install(window);
        paper.setup(canvas);
        return {
            onFrame: function (callback) {
                paper.view.onFrame = function () { callback(); };
            },
            onClick: function (callback) {
                paper.view.onMouseDown = function (event) {
                    callback(new Point(event.point.x, event.point.y));
                };
            },
            width: window.innerWidth,
            height: window.innerHeight
        };
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
var init = function () {
    var canvas = Graphics.setupCanvas(document.getElementById('myCanvas'));
    var gameView = new Graphics.View(canvas);
    var ballSpeed = 12;
    var radius = canvas.height / 40;
    var ballsPerRow = 10;
    var ballsPerColumn = 12;
    var boardWidth = ballsPerRow * (radius * 2);
    var boardTop = 30;
    var boardLeft = 20;
    var hexGrid = [];
    var hexTransformer = new HexTransformer(new Point(boardLeft, boardTop), radius);
    var pointToHex = function (point) {
        return hexTransformer.toHex(new Point(point.x, point.y));
    };
    var hexToPoint = function (hex) {
        var p = hexTransformer.ToPoint(hex);
        return new paper.Point(p.x, p.y);
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
            var p = hexToPoint(new HexPoint(col, row));
            var bubble = Graphics.Bubble(p, radius);
            r.push(bubble);
        }
        hexGrid.push(r);
    }
    var playerBall = Graphics.Bubble(new paper.Point(boardLeft + ballsPerRow * radius, canvas.height - 3 * radius), radius);
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
    canvas.onClick(function (point) {
        if (!shooting) {
            Sound.shootSound.stop();
            Sound.shootSound.play();
            shooting = true;
            var vx = point.x - playerBall.shape.position.x;
            var vy = point.y - playerBall.shape.position.y;
            var dist = Math.sqrt(vx * vx + vy * vy) / ballSpeed;
            playerBall.vx = vx / dist;
            playerBall.vy = vy / dist;
        }
    });
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
        while (typeof col === "undefined") {
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
        var connected = [startHex];
        var recurse = function (h) {
            var list = adjacentHex(h);
            for (var i = 0; i < list.length; i++) {
                var b = getBubble(list[i]);
                var key = JSON.stringify(list[i]);
                if (b && !counted[key] && predicate(b)) {
                    // connected, same color, not counted!
                    counted[key] = true;
                    connected.push(list[i]);
                    recurse(list[i]);
                }
            }
        };
        recurse(startHex);
        return connected;
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
                if (getBubble(new HexPoint(i, 0))) {
                    findConnected(new HexPoint(i, 0), function () { return true; })
                        .map(function (hexP) { connectedDict_1[JSON.stringify(hexP)] = true; });
                }
            }
            for (var i = 0; i < hexGrid.length; i++) {
                for (var j = 0; j < hexGrid[i].length; j++) {
                    var hexP = new HexPoint(j, i);
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
    canvas.onFrame(function () {
        for (var i = 0; i < fallingBubbles.length; i++) {
            var f = fallingBubbles[i];
            var p = f.shape.position;
            if (p.x > 1000) {
                f.shape.remove();
                fallingBubbles.splice(i, 1);
                i--;
                continue;
            }
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
                    var bubble = getBubble(new HexPoint(j, i));
                    if (bubble) {
                        var bp = bubble.shape.position;
                        var dist = Math.sqrt((bp.x - point.x) * (bp.x - point.x) + (bp.y - point.y) * (bp.y - point.y));
                        if (dist < 2 * radius * 0.9) {
                            // Collision!
                            setBubble(playerBall, hexPoint);
                            var quant = hexToPoint(hexPoint);
                            var newp = new paper.Point(quant.x, quant.y);
                            playerBall.shape.position = newp;
                            playerBall = Graphics.Bubble(new paper.Point(boardLeft + ballsPerRow * radius, canvas.height - 3 * radius), radius);
                            shooting = false;
                            fixZIndex();
                            tryKillBubbles(hexPoint);
                            return;
                        }
                    }
                }
            }
        }
    });
};
//# sourceMappingURL=bundle.js.map