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

let Game = function()
{
    

    let gameView = Graphics.View(<HTMLCanvasElement>document.getElementById('myCanvas'));
    // paper.install(window)
    // paper.setup(canvas);
    let view = paper.view;

    let canvasHeight = window.innerHeight;

    let ballSpeed = 12;
    let radius = canvasHeight/40;
    let ballsPerRow = 10;
    let ballsPerColumn = 12;
    
    let boardWidth = ballsPerRow * (radius * 2);
    let boardTop = 30;
    let boardLeft = 20;

    let hexGrid : Array<Array<Graphics.Bubble>> = [];

    let pointToHex = function(point: paper.Point) : HexPoint
    {
        let hexY = Math.round((point.y - boardTop - radius) / (Math.sqrt(3)*radius) );
        let isOdd = (hexY % 2 == 1);
        let hexX = Math.round((point.x - boardLeft - radius - (isOdd ? radius : 0)) / (2*radius));
        return new HexPoint(hexX, hexY);
    };
    
    let hexToPoint = function(hex: HexPoint) : paper.Point
    {
        let isOdd = (100+hex.y) % 2 == 1;
        let x = boardLeft + radius + (2*radius*hex.x) + (isOdd ? radius : 0);
        let y = boardTop + radius + (Math.sqrt(3)*radius*hex.y);
        return new paper.Point(x, y);
    };
    let adjacentHex = function(hexPoint: HexPoint) : Array<HexPoint>
    {
        let center = hexToPoint(hexPoint);
        let list = [];
        for (let i = 0; i < 6; i++)
        {
            let x = center.x + 2*radius*Math.cos(2*3.1415*i/6);
            let y = center.y + 2*radius*Math.sin(2*3.1415*i/6);

            list.push(pointToHex(new paper.Point(x, y)));
        }
        return list;
    };

    for (let row = 0; row < ballsPerColumn; row++)
    {        
        let r = [];
        let isOdd = row % 2 == 1;
        let ballsInThisRow = ballsPerRow - (isOdd ? 1 : 0);
    
        for (let col = 0; col < ballsInThisRow; col++)
        {       
            let p = hexToPoint(new HexPoint(col, row));
            let bubble = Graphics.Bubble(p, radius);
            r.push(bubble);
        }

        hexGrid.push(r);
    }

    let playerBall = Graphics.Bubble(
        new paper.Point(boardLeft + ballsPerRow*radius,
                  canvasHeight - 3*radius),
        radius
    );

    let fixZIndex = function()
    {
        let current = null;
        for (let i = 0; i < hexGrid.length; i++)
        {
            for (let j = 0; j < hexGrid[i].length; j++)
            {
                let b = hexGrid[i][j];
                if (b && current)
                {
                    b.shape.insertAbove(current.shape);
                }
                current = b;
            }
        }
    }

    let shooting = false;

    view.onMouseDown = function(event)
    {
        if (!shooting)
        {
            Sound.shootSound.stop()
            Sound.shootSound.play();
            shooting = true;
            let vx = event.point.x - playerBall.shape.position.x;
            let vy = event.point.y - playerBall.shape.position.y;
            let dist = Math.sqrt(vx*vx + vy*vy) / ballSpeed;
            playerBall.vx = vx / dist;
            playerBall.vy = vy / dist;
        }        
    }

    let getBubble = function(hexPoint: HexPoint) : Graphics.Bubble
    {
        let row = hexGrid[hexPoint.y];
        if (row)
        {
            return row[hexPoint.x];
        }
        return null;
    };

    let setBubble = function(bubble: Graphics.Bubble, hexPoint: HexPoint) : void
    {
        if (hexPoint.x < 0 || hexPoint.y < 0)
        {
            throw "no can do";
        }

        let row = hexGrid[hexPoint.y];
        while (!row)
        {
            hexGrid.push([]);
            row = hexGrid[hexPoint.y];
        }
            
        let col = row[hexPoint.x];
        while (col !== null)
        {
            row.push(null);
            col = row[hexPoint.x];
        }

        hexGrid[hexPoint.y][hexPoint.x] = bubble;
    };

    let fallingBubbles : Array<Graphics.Bubble> = [];

    // Returns list of connected bubbles in hexCoordinates
    let findConnected = function(startHex: HexPoint, predicate: (bubble: Graphics.Bubble) => boolean) : Array<HexPoint>
    {
        let thiskey = JSON.stringify(startHex);
        let counted : {[key: string]: boolean} = {};
        counted[thiskey] = true;
        let connected : Array<HexPoint> = [startHex];
        
        let recurse = function(h: HexPoint) : void
        {
            let list = adjacentHex(h);
            for (let i = 0; i < list.length; i++)
            {
                let b = getBubble(list[i]);
                let key = JSON.stringify(list[i]);
                if (b && !counted[key] && predicate(b))
                {
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

    let tryKillBubbles = function(hexPoint: HexPoint) : void
    {
        let thisColorString = getBubble(hexPoint).color.toString();

        let sameColorPredicate = function(bubble: Graphics.Bubble)
        {
            return bubble.color.toString() == thisColorString;
        };

        // Kill all with same color
        let connected = findConnected(hexPoint, sameColorPredicate);
        if (connected.length > 2)
        {
            Sound.fallBubbleSound.stop()
            Sound.fallBubbleSound.play();
            let shootingBubble = getBubble(hexPoint);

            for (let i = 0; i < connected.length; i++)
            {
                let hexP = connected[i];
                let bubble = getBubble(hexP);
                bubble.shape.bringToFront();
                bubble.vx = shootingBubble.vx;
                bubble.vy = shootingBubble.vy;
                fallingBubbles.push(bubble);
                hexGrid[hexP.y][hexP.x] = null;
            }

            // Kill all dangling
            let topRow = hexGrid[0];
            let connectedDict : {[key: string] : boolean} = {};
            for (let i = 0; i < topRow.length; i++)
            {
                if (getBubble(new HexPoint(i, 0)))
                {
                    findConnected(new HexPoint(i, 0), function() { return true; })
                        .map(function(hexP) { connectedDict[JSON.stringify(hexP)] = true; });
                }
            }

            for (let i = 0; i < hexGrid.length; i++)
            {
                for (let j = 0; j < hexGrid[i].length; j++)
                {
                    let hexP = new HexPoint(j,i);
                    if (!connectedDict[JSON.stringify(hexP)])
                    {
                        let bubble = hexGrid[i][j];
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

        for (let i = 0; i < fallingBubbles.length; i++)
        {
            let f = fallingBubbles[i];
            let p = f.shape.position;
            
            if (p.x > 1000)
            {
                f.shape.remove();
                fallingBubbles.splice(i, 1);
                i--;
                continue;
            }

            f.shape.position = new paper.Point(p.x + f.vx, p.y + f.vy);
            f.vy += 0.5;
        }

        if (shooting)
        {
            // update velocity
            let p = playerBall.shape.position;
            playerBall.shape.position = new paper.Point(p.x + playerBall.vx, p.y + playerBall.vy);
            
            p = playerBall.shape.position;

            if (p.x < (boardLeft + radius) || p.x > (boardLeft + boardWidth - radius))
            {
                playerBall.vx = -playerBall.vx;
            }

            // collision test
            let point = playerBall.shape.position;
            let hexPoint = pointToHex(point);
            let hexX = hexPoint.x;
            let hexY = hexPoint.y;

            for (let i = hexY - 1; i <= hexY + 1; i++)
            {
                for (let j = hexX - 1; j <= hexX + 1; j++)
                {
                    let bubble = getBubble(new HexPoint(j, i))
                    if (bubble)
                    {
                        let bp = bubble.shape.position;
                        let dist = Math.sqrt((bp.x - point.x)*(bp.x - point.x) + (bp.y - point.y)*(bp.y - point.y));
                        if (dist < 2*radius*0.9)
                        {
                            // Collision!
                            setBubble(playerBall, hexPoint);
                            let quant = hexToPoint(hexPoint);
                            let newp = new paper.Point(quant.x, quant.y);
                            playerBall.shape.position = newp;

                            playerBall = Graphics.Bubble(
                                new paper.Point(boardLeft + ballsPerRow*radius,
                                          canvasHeight - 3*radius),
                                radius
                            );
                            shooting = false;

                            fixZIndex();

                            tryKillBubbles(hexPoint);
                            return;
                        }
                    }
                }        
            }
        }
    }

    let start = function()
    {

    };

    return {
        "start": start
    };
};

let init = function()
{
    Game();
}
