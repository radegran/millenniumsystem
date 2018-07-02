/// <reference path="model.ts"/>
/// <reference path="graphics.ts"/>
/// <reference path="sound.ts"/>

let init = function()
{
    var canvas = Graphics.setupCanvas(<HTMLCanvasElement>document.getElementById('myCanvas'));
    let gameView = new Graphics.View(canvas);

    let ballSpeed = 12;
    let radius = canvas.height/40;
    let ballsPerRow = 10;
    let ballsPerColumn = 12;
    
    let boardWidth = ballsPerRow * (radius * 2);
    let boardTop = 30;
    let boardLeft = 20;

    let newHexGrid = new HexGrid();

    let hexGrid = newHexGrid._GET();

    var hexTransformer = new HexTransformer(new Point(boardLeft, boardTop), radius);

    let pointToHex = function(point: paper.Point) : HexPoint
    {
        return hexTransformer.toHex(new Point(point.x, point.y));
    };
    
    let hexToPoint = function(hex: HexPoint) : paper.Point
    {
        var p = hexTransformer.toPoint(hex);
        return new paper.Point(p.x, p.y);
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

    // Initialize grid with bubbles
    for (let row = 0; row < ballsPerColumn; row++)
    {        
        let isOdd = row % 2 == 1;
        let ballsInThisRow = ballsPerRow - (isOdd ? 1 : 0);
    
        for (let col = 0; col < ballsInThisRow; col++)
        {       
            let hexPoint = new HexPoint(col, row);
            let bubble = Graphics.Bubble(hexToPoint(hexPoint), radius);
            newHexGrid.set(bubble, hexPoint);
        }
    }

    let playerBall = Graphics.Bubble(
        new paper.Point(boardLeft + ballsPerRow*radius,
                  canvas.height - 3*radius),
        radius
    );

    let fixZIndex = function()
    {
        let current : Graphics.Bubble = null;
        newHexGrid.forEach((b) => {
            if (current)
            {
                b.shape.insertAbove(current.shape);
            }
            current = b;
        });
    }

    let shooting = false;

    // class BubbleShooter {
    //     private remainingBubbles : number;
        
    //     constructor(remainingBubbles : number,
    //                 bubbleFactory : Graphics.BubbleFactory,
    //                 grid : HexGrid) {
    //         this.remainingBubbles = remainingBubbles;
    //     }


    // }

    canvas.onClick(function(point)
    {
        if (!shooting)
        {
            Sound.shootSound.stop()
            Sound.shootSound.play();
            shooting = true;
            let vx = point.x - playerBall.shape.position.x;
            let vy = point.y - playerBall.shape.position.y;
            let dist = Math.sqrt(vx*vx + vy*vy) / ballSpeed;
            playerBall.vx = vx / dist;
            playerBall.vy = vy / dist;
        }        
    });

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
            adjacentHex(h).forEach(adjHex => {
                    let b = newHexGrid.get(adjHex);
                    let key = JSON.stringify(adjHex);
                    if (b && !counted[key] && predicate(b))
                    {
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

    let tryKillBubbles = function(hexPoint: HexPoint) : void
    {
        let thisColorString = newHexGrid.get(hexPoint).color.toString();

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
            let shootingBubble = newHexGrid.get(hexPoint);

            for (let i = 0; i < connected.length; i++)
            {
                let hexP = connected[i];
                let bubble = newHexGrid.get(hexP);
                bubble.shape.bringToFront();
                bubble.vx = shootingBubble.vx;
                bubble.vy = shootingBubble.vy;
                fallingBubbles.push(bubble);
                newHexGrid.remove(hexP);
            }

            // Kill all dangling
            let connectedDict : {[key: string] : boolean} = {};

            newHexGrid.forEachOnRow(0, (b, hexPoint) => {
                findConnected(hexPoint, function() { return true; })
                .map(function(hexP) { connectedDict[JSON.stringify(hexP)] = true; });
            });

            newHexGrid.forEach((bubble, hexP) => {
                if (!connectedDict[JSON.stringify(hexP)])
                {
                    // This is dangling!            
                    bubble.vx = shootingBubble.vx;
                    bubble.vy = shootingBubble.vy * 0;
                    fallingBubbles.push(bubble);
                    newHexGrid.remove(hexP);
                }
            });
        }
    };
    
    canvas.onFrame(function() {

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
                    let bubble = newHexGrid.get(new HexPoint(j, i))
                    if (bubble)
                    {
                        let bp = bubble.shape.position;
                        let dist = Math.sqrt((bp.x - point.x)*(bp.x - point.x) + (bp.y - point.y)*(bp.y - point.y));
                        if (dist < 2*radius*0.9)
                        {
                            // Collision!
                            newHexGrid.set(playerBall, hexPoint);
                            let quant = hexToPoint(hexPoint);
                            let newp = new paper.Point(quant.x, quant.y);
                            playerBall.shape.position = newp;

                            playerBall = Graphics.Bubble(
                                new paper.Point(boardLeft + ballsPerRow*radius,
                                          canvas.height - 3*radius),
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
    });
};