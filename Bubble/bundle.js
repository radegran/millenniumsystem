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
var HexGrid = /** @class */ (function () {
    function HexGrid() {
        this.grid = [];
    }
    HexGrid.prototype.get = function (hexPoint) {
        var row = this.grid[hexPoint.y];
        if (row) {
            return row[hexPoint.x];
        }
        return null;
    };
    ;
    HexGrid.prototype.set = function (bubble, hexPoint) {
        if (hexPoint.x < 0 || hexPoint.y < 0) {
            throw "no can do";
        }
        var row = this.grid[hexPoint.y];
        while (!row) {
            this.grid.push([]);
            row = this.grid[hexPoint.y];
        }
        var col = row[hexPoint.x];
        while (typeof col === "undefined") {
            row.push(null);
            col = row[hexPoint.x];
        }
        this.grid[hexPoint.y][hexPoint.x] = bubble;
    };
    ;
    HexGrid.prototype.forEach = function (callback) {
        for (var i = 0; i < this.grid.length; i++) {
            this.forEachOnRow(i, callback);
        }
    };
    HexGrid.prototype.forEachOnRow = function (rowIndex, callback) {
        for (var j = 0; j < this.grid[rowIndex].length; j++) {
            var b = this.grid[rowIndex][j];
            if (b) {
                callback(b, new HexPoint(j, rowIndex));
            }
        }
    };
    HexGrid.prototype.remove = function (hexPoint) {
        this.grid[hexPoint.y][hexPoint.x] = null;
    };
    return HexGrid;
}());
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
    HexTransformer.prototype.toPoint = function (hex) {
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
    // export type Bubble = {
    //     shape: paper.Group,
    //     color: string,
    //     vx: number,
    //     vy: number
    // }
    var Bubble = /** @class */ (function () {
        function Bubble(point, radius, fill) {
            var paperPoint = new paper.Point(point.x, point.y);
            var s = new paper.Path.Circle(paperPoint.clone().add([4, 4]), radius);
            var shape = new paper.Path.Circle(paperPoint, radius);
            this._color = fill || Graphics.getRandomColor();
            this.group = new paper.Group({
                children: [s, shape]
            });
            this.group.fillColor = this._color;
            this.group.translate(new paper.Point(-2, -2));
            s.fillColor = "black";
        }
        Object.defineProperty(Bubble.prototype, "position", {
            get: function () {
                var pos = this.group.position;
                return new Point(pos.x, pos.y);
            },
            set: function (point) {
                this.group.position.x = point.x;
                this.group.position.y = point.y;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Bubble.prototype, "velocity", {
            get: function () {
                return this._velocity;
            },
            set: function (point) {
                this._velocity = point;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Bubble.prototype, "color", {
            get: function () {
                return this._color;
            },
            enumerable: true,
            configurable: true
        });
        Bubble.prototype.bringToFront = function () {
            this.group.bringToFront();
        };
        Bubble.prototype.remove = function () {
            this.group.remove();
        };
        Bubble.prototype.insertAbove = function (other) {
            this.group.insertAbove(other.group);
        };
        return Bubble;
    }());
    Graphics.Bubble = Bubble;
    ;
    var View = /** @class */ (function () {
        function View(canvas) {
            this.canvas = canvas;
        }
        return View;
    }());
    Graphics.View = View;
    ;
    var BubbleFactory = /** @class */ (function () {
        function BubbleFactory(radius) {
            this.radius = radius;
        }
        BubbleFactory.prototype.create = function (point) {
            return new Bubble(new Point(point.x, point.y), this.radius);
        };
        return BubbleFactory;
    }());
    Graphics.BubbleFactory = BubbleFactory;
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
    Graphics.fixZIndex = function (hexGrid) {
        var current = null;
        hexGrid.forEach(function (b) {
            if (current) {
                b.insertAbove(current);
            }
            current = b;
        });
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
    var hexGrid = new HexGrid();
    var hexTransformer = new HexTransformer(new Point(boardLeft, boardTop), radius);
    var pointToHex = function (point) {
        return hexTransformer.toHex(new Point(point.x, point.y));
    };
    var hexToPoint = function (hex) {
        var p = hexTransformer.toPoint(hex);
        return new Point(p.x, p.y);
    };
    var adjacentHex = function (hexPoint) {
        var center = hexToPoint(hexPoint);
        var list = [];
        for (var i = 0; i < 6; i++) {
            var x = center.x + 2 * radius * Math.cos(2 * 3.1415 * i / 6);
            var y = center.y + 2 * radius * Math.sin(2 * 3.1415 * i / 6);
            list.push(pointToHex(new Point(x, y)));
        }
        return list;
    };
    // Initialize grid with bubbles
    for (var row = 0; row < ballsPerColumn; row++) {
        var isOdd = row % 2 == 1;
        var ballsInThisRow = ballsPerRow - (isOdd ? 1 : 0);
        for (var col = 0; col < ballsInThisRow; col++) {
            var hexPoint = new HexPoint(col, row);
            var bubble = new Graphics.Bubble(hexToPoint(hexPoint), radius);
            hexGrid.set(bubble, hexPoint);
        }
    }
    var playerBall = new Graphics.Bubble(new Point(boardLeft + ballsPerRow * radius, canvas.height - 3 * radius), radius);
    var shooting = false;
    // class BubbleShooter {
    //     private remainingBubbles : number;
    //     constructor(remainingBubbles : number,
    //                 bubbleFactory : Graphics.BubbleFactory,
    //                 grid : HexGrid) {
    //         this.remainingBubbles = remainingBubbles;
    //     }
    // }
    canvas.onClick(function (point) {
        if (!shooting) {
            Sound.shootSound.stop();
            Sound.shootSound.play();
            shooting = true;
            var playerPos = playerBall.position;
            var vx = point.x - playerPos.x;
            var vy = point.y - playerPos.y;
            var dist = Math.sqrt(vx * vx + vy * vy) / ballSpeed;
            playerBall.velocity = new Point(vx / dist, vy / dist);
        }
    });
    var fallingBubbles = [];
    // Returns list of connected bubbles in hexCoordinates
    var findConnected = function (startHex, predicate) {
        var thiskey = JSON.stringify(startHex);
        var counted = {};
        counted[thiskey] = true;
        var connected = [startHex];
        var recurse = function (h) {
            adjacentHex(h).forEach(function (adjHex) {
                var b = hexGrid.get(adjHex);
                var key = JSON.stringify(adjHex);
                if (b && !counted[key] && predicate(b)) {
                    // connected, same color, not counted!
                    counted[key] = true;
                    connected.push(adjHex);
                    recurse(adjHex);
                }
            });
        };
        recurse(startHex);
        return connected;
    };
    var tryKillBubbles = function (hexPoint) {
        var thisColorString = hexGrid.get(hexPoint).color;
        var sameColorPredicate = function (bubble) {
            return bubble.color == thisColorString;
        };
        // Kill all with same color
        var connected = findConnected(hexPoint, sameColorPredicate);
        if (connected.length > 2) {
            Sound.fallBubbleSound.stop();
            Sound.fallBubbleSound.play();
            var shootingBubble_1 = hexGrid.get(hexPoint);
            for (var i = 0; i < connected.length; i++) {
                var hexP = connected[i];
                var bubble = hexGrid.get(hexP);
                bubble.bringToFront();
                bubble.velocity = shootingBubble_1.velocity;
                fallingBubbles.push(bubble);
                hexGrid.remove(hexP);
            }
            // Kill all dangling
            var connectedDict_1 = {};
            hexGrid.forEachOnRow(0, function (b, hexPoint) {
                findConnected(hexPoint, function () { return true; })
                    .map(function (hexP) { connectedDict_1[JSON.stringify(hexP)] = true; });
            });
            hexGrid.forEach(function (bubble, hexP) {
                if (!connectedDict_1[JSON.stringify(hexP)]) {
                    // This is dangling!            
                    bubble.velocity = new Point(shootingBubble_1.velocity.x, 0);
                    fallingBubbles.push(bubble);
                    hexGrid.remove(hexP);
                }
            });
        }
    };
    canvas.onFrame(function () {
        for (var i = 0; i < fallingBubbles.length; i++) {
            var f = fallingBubbles[i];
            var p = f.position;
            if (p.x > 1000) {
                f.remove();
                fallingBubbles.splice(i, 1);
                i--;
                continue;
            }
            var fVelocity = f.velocity;
            f.position = new Point(p.x + fVelocity.x, p.y + f.velocity.y);
            f.velocity = new Point(fVelocity.x, fVelocity.y + 0.5);
        }
        if (shooting) {
            // update velocity
            var p = playerBall.position;
            if (p.x < (boardLeft + radius) || p.x > (boardLeft + boardWidth - radius)) {
                var v_1 = playerBall.velocity;
                playerBall.velocity = new Point(-v_1.x, v_1.y);
            }
            var v = playerBall.velocity;
            playerBall.position = new Point(p.x + v.x, p.y + v.y);
            // collision test
            var point = playerBall.position;
            var hexPoint = pointToHex(point);
            var hexX = hexPoint.x;
            var hexY = hexPoint.y;
            for (var i = hexY - 1; i <= hexY + 1; i++) {
                for (var j = hexX - 1; j <= hexX + 1; j++) {
                    var bubble = hexGrid.get(new HexPoint(j, i));
                    if (bubble) {
                        var bp = bubble.position;
                        var dist = Math.sqrt((bp.x - point.x) * (bp.x - point.x) + (bp.y - point.y) * (bp.y - point.y));
                        if (dist < 2 * radius * 0.9) {
                            // Collision!
                            hexGrid.set(playerBall, hexPoint);
                            playerBall.position = hexToPoint(hexPoint);
                            playerBall = new Graphics.Bubble(new Point(boardLeft + ballsPerRow * radius, canvas.height - 3 * radius), radius);
                            shooting = false;
                            Graphics.fixZIndex(hexGrid);
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