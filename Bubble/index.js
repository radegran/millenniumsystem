var colors = []

var Bubble = function(x, y, r, fillColor)
{
    var shape = new Path.Circle(new Point(x, y), r);
    shape.fillColor = fillColor || (Math.random() > 0.5 ? "maroon" : "salmon");
    
    return {
        shape: shape
    }
};

var debug = function(id, p, r, fillColor)
{
    if (!debug.elem) { debug.elem = {}; }
    if (!debug.elem[id]) { debug.elem[id] = Bubble(p.x, p.y, r, fillColor); }
    debug.elem[id].shape.position = new Point(p.x, p.y);
};

var Game = function(canvas)
{
    paper.install(window)
    paper.setup(canvas);

    var canvasHeight = window.innerHeight;

    var ballSpeed = 12;
    var radius = canvasHeight/40;
    var ballsPerRow = 10;
    var ballsPerColumn = 12;
    
    var boardWidth = ballsPerRow * (radius * 2);
    var boardTop = 30;
    var boardLeft = 20;

    var hexGrid = [];

    var pointToHex = function(point)
    {
        var hexY = Math.round((point.y - boardTop - radius) / (Math.sqrt(3)*radius) );
        var isOdd = (hexY % 2 == 1);
        var hexX = Math.round((point.x - boardLeft - radius - (isOdd ? radius : 0)) / (2*radius));
        return {"x": hexX, "y": hexY};
    };

    var hexToPoint = function(hex)
    {
        var isOdd = (100+hex.y) % 2 == 1;
        var x = boardLeft + radius + (2*radius*hex.x) + (isOdd ? radius : 0);
        var y = boardTop + radius + (Math.sqrt(3)*radius*hex.y);
        return {"x": x, "y": y};
    };

    var adjacentHex = function(hexX, hexY)
    {
        var center = hexToPoint({x:hexX, y:hexY});
        var list = [];
        for (var i = 0; i < 6; i++)
        {
            var x = center.x + 2*radius*Math.cos(2*3.1415*i/6);
            var y = center.y + 2*radius*Math.sin(2*3.1415*i/6);

            list.push(pointToHex({x:x, y:y}));
        }
        return list;
    };

    for (var row = 0; row < ballsPerColumn; row++)
    {        
        var r = [];
        var isOdd = row % 2 == 1;
        var ballsInThisRow = ballsPerRow - (isOdd ? 1 : 0);
    
        for (var col = 0; col < ballsInThisRow; col++)
        {       
            var p = hexToPoint({x:col, y:row});
            var bubble = Bubble(p.x, p.y, radius);
            r.push(bubble);
        }

        hexGrid.push(r);
    }

    var playerBall = Bubble(
        boardLeft + ballsPerRow*radius,
        canvasHeight - 3*radius,
        radius
    );

    var shooting = false;

    view.onMouseDown = function(event)
    {
        if (!shooting)
        {
            shooting = true;
            var vx = event.point.x - playerBall.shape.position.x;
            var vy = event.point.y - playerBall.shape.position.y;
            var dist = Math.sqrt(vx*vx + vy*vy) / ballSpeed;
            playerBall.vx = vx / dist;
            playerBall.vy = vy / dist;
        }        
    }

    var getBubble = function(hexX, hexY)
    {
        var row = hexGrid[hexY];
        if (row)
        {
            return row[hexX];
        }
        return null;
    };

    var setBubble = function(bubble, hexX, hexY)
    {
        if (hexX < 0 || hexY < 0)
        {
            throw "no can do";
        }

        var row = hexGrid[hexY];
        while (!row)
        {
            hexGrid.push([]);
            row = hexGrid[hexY];
        }
            
        var col = row[hexX];
        while (col !== null)
        {
            row.push(null);
            col = row[hexX];
        }

        hexGrid[hexY][hexX] = bubble;
    };

    var fallingBubbles = [];

    // Returns list of connected bubbles in hexCoordinates
    var findConnected = function(startHex, predicate)
    {
        var thiskey = JSON.stringify(startHex);
        var counted = {};
        counted[thiskey] = true;
        var startcolor = getBubble(startHex.x, startHex.y).shape.fillColor;

        var recurse = function(hx, hy)
        {
            var list = adjacentHex(hx, hy);
            for (var i = 0; i < list.length; i++)
            {
                var b = getBubble(list[i].x, list[i].y);
                var key = JSON.stringify(list[i]);
                if (b && !counted[key] && predicate(b))
                {
                    // connected, same color, not counted!
                    counted[key] = true;
                    recurse(list[i].x, list[i].y)
                }
                
            }
        };

        recurse(startHex.x, startHex.y);

        return Object.keys(counted).map(function(key) { return JSON.parse(key); });
    };

    var tryKillBubbles = function(hexX, hexY)
    {
        var hexP = {x:hexX, y:hexY}
        var thisColorString = getBubble(hexX, hexY).shape.fillColor.toString();

        var sameColorPredicate = function(bubble)
        {
            return bubble.shape.fillColor.toString() == thisColorString;
        };

        // Kill all with same color
        var connected = findConnected(hexP, sameColorPredicate);
        if (connected.length > 2)
        {
            var shootingBubble = getBubble(hexX, hexY);

            for (var i = 0; i < connected.length; i++)
            {
                var hexP = connected[i];
                var bubble = getBubble(hexP.x, hexP.y);
                bubble.shape.bringToFront();
                bubble.vx = shootingBubble.vx;
                bubble.vy = shootingBubble.vy;
                fallingBubbles.push(bubble);
                hexGrid[hexP.y][hexP.x] = null;
            }

            // Kill all dangling
            var topRow = hexGrid[0];
            var connectedDict = {};
            for (var i = 0; i < topRow.length; i++)
            {
                //var topBubble = getBubble(i, 0);
                if (getBubble(i, 0))
                {
                    findConnected({x:i,y:0}, function() { return true; })
                        .map(function(hexP) { connectedDict[JSON.stringify(hexP)] = true; });
                }
            }

            for (var i = 0; i < hexGrid.length; i++)
            {
                for (var j = 0; j < hexGrid[i].length; j++)
                {
                    var hexP = {x:j,y:i};
                    if (!connectedDict[JSON.stringify(hexP)])
                    {
                        var bubble = hexGrid[i][j];
                        if (bubble)
                        {
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
    
    view.onFrame = function(event) {

        var now = Date.now();

        for (var i = 0; i < fallingBubbles.length; i++)
        {
            var f = fallingBubbles[i];
            f.startFallTime = f.startFallTime || now;
            if (now - f.startFallTime > 5000)
            {
                f.shape.remove();
                fallingBubbles.splice(i, 1);
                i--;
                continue;
            }

            var p = f.shape.position;
            f.shape.position = new Point(p.x + f.vx, p.y + f.vy);
            f.vy += 0.5;
        }

        if (shooting)
        {
            // update velocity
            var p = playerBall.shape.position;
            playerBall.shape.position = new Point(p.x + playerBall.vx, p.y + playerBall.vy);
            
            p = playerBall.shape.position;

            if (p.x < (boardLeft + radius) || p.x > (boardLeft + boardWidth - radius))
            {
                playerBall.vx = -playerBall.vx;
            }

            // collision test
            var point = playerBall.shape.position;
            var hexPoint = pointToHex(point);
            var hexX = hexPoint.x;
            var hexY = hexPoint.y;

            for (var i = hexY - 1; i <= hexY + 1; i++)
            {
                for (var j = hexX - 1; j <= hexX + 1; j++)
                {
                    //debug("hex" + (j-hexX) + "," + (i - hexY), hexToPoint({x:hexX,y:hexY}), radius*0.8, "red");
                        
                    var bubble = getBubble(j, i)
                    if (bubble)
                    {
                        var bp = bubble.shape.position;
                        var dist = Math.sqrt((bp.x - point.x)*(bp.x - point.x) + (bp.y - point.y)*(bp.y - point.y));
                        if (dist < 2*radius*0.9)
                        {
                            // Collision!
                            setBubble(playerBall, hexX, hexY);
                            var quant = hexToPoint(hexPoint);
                            var newp = new Point(quant.x, quant.y);
                            playerBall.shape.position = newp;

                            playerBall = Bubble(
                                boardLeft + ballsPerRow*radius,
                                canvasHeight - 3*radius,
                                radius
                            );
                            playerBall.shape.sendToBack();
                            shooting = false;

                            tryKillBubbles(hexX, hexY);
                            return;
                        }
                    }
                }        
            }
        }
    }

    var start = function()
    {

    };

    return {
        "start": start
    };
};
