var Bubble = function(x, y, radius)
{
    var shape = new Path.Circle(new Point(x, y), radius);
    shape.fillColor = Math.random() > 0.5 ? "gold" : "salmon";
    return {
        shape: shape
    }
};

var Game = function(canvas)
{
    paper.install(window)
    paper.setup(canvas);

    var canvasHeight = window.innerHeight;

    var ballSpeed = 5;
    var radius = canvasHeight/40;
    var ballsPerRow = 10;
    var ballsPerColumn = 12;
    
    var boardWidth = ballsPerRow * (radius * 2);
    var boardTop = 20;
    var boardLeft = 30;

    var hexGrid = [];

    var pointToHex = function(point)
    {
        var hexY = Math.round((point.y - boardLeft - radius) / (Math.sqrt(3)*radius) );
        var isOdd = (hexY % 2 == 1);
        var hexX = Math.round((point.x - boardTop - radius - (isOdd ? radius : 0)) / (2*radius));
        return {"x": hexX, "y": hexY};
    };

    var hexToPoint = function(hex)
    {
        var isOdd = hex.y % 2 == 1;
        var x = boardLeft + radius + (2*radius*hex.x) + (isOdd ? radius : 0);
        var y = boardTop + radius + (Math.sqrt(3)*radius*hex.y);
        return {"x": x, "y": y};
    };

    window.hextopoint = hexToPoint;
    window.pointtohex = pointToHex;

    for (var row = 0; row < ballsPerColumn; row++)
    {        
        var r = [];
        var isOdd = row % 2 == 1;
        var ballsInThisRow = ballsPerRow - (isOdd ? 1 : 0);
    
        for (var col = 0; col < ballsInThisRow; col++)
        {       
            var p = hexToPoint({x:col, y:row});
            r.push(Bubble(p.x, p.y, radius));
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
        var row = hexGrid[hexX];
        if (row)
        {
            return row[hexY];
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
            
        var col = hexGrid[hexX];
        while (!col)
        {
            hexGrid.push(null);
            col = hexGrid[hexX];
        }

        hexGrid[hexY][hexX] = bubble;
    };
    
    view.onFrame = function(event) {

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

console.log(hexX + ", " + hexY)

            for (var i = hexY - 1; i < hexY + 1; i++)
            {
                for (var j = hexX - 1; j < hexX + 1; j++)
                {
                    var bubble = getBubble(i, j)
                    if (bubble)
                    {
                        bubble.shape.fillColor = "red";

                        var bp = bubble.shape.position;
                        var dist = Math.sqrt((bp.x - point.x)*(bp.x - point.x) + (bp.y - point.y)*(bp.y - point.y));
                        if (dist < 2*radius*0.9)
                        {
                            setBubble(playerBall, hexX, hexY);
                            var quant = hexToPoint(hexPoint);
                            var newp = new Point(quant.x, quant.y);
                            playerBall.shape.position = newp;

                            if (Math.sqrt((newp.x - point.x)*(newp.x - point.x) + (newp.y - point.y)*(newp.y - point.y)) > 1.5*radius)
                            {
                                //var klas = 42;
                            }

                            playerBall = Bubble(
                                boardLeft + ballsPerRow*radius,
                                canvasHeight - 3*radius,
                                radius
                            );
                            shooting = false;
                            return;
                        }

                        bubble.shape.fillColor = "green";
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
