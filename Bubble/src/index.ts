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

    let hexGrid = new HexGrid();
    var hexTransformer = new HexTransformer(new Point(boardLeft, boardTop), radius);

    let pointToHex = function(point: Point) : HexPoint
    {
        return hexTransformer.toHex(new Point(point.x, point.y));
    };
    
    let hexToPoint = function(hex: HexPoint) : Point
    {
        var p = hexTransformer.toPoint(hex);
        return new Point(p.x, p.y);
    };
    
    let adjacentHex = function(hexPoint: HexPoint) : Array<HexPoint>
    {
        let center = hexToPoint(hexPoint);
        let list = [];
        for (let i = 0; i < 6; i++)
        {
            let x = center.x + 2*radius*Math.cos(2*3.1415*i/6);
            let y = center.y + 2*radius*Math.sin(2*3.1415*i/6);

            list.push(pointToHex(new Point(x, y)));
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
            let bubble = new Graphics.Bubble(hexToPoint(hexPoint), radius);
            hexGrid.set(bubble, hexPoint);
        }
    }

    let playerBall = new Graphics.Bubble(
        new Point(boardLeft + ballsPerRow*radius,
                  canvas.height - 3*radius),
        radius
    );

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
            let playerPos = playerBall.position;
            let vx = point.x - playerPos.x;
            let vy = point.y - playerPos.y;
            let dist = Math.sqrt(vx*vx + vy*vy) / ballSpeed;
            playerBall.velocity = new Point(vx / dist, vy / dist);
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
                    let b = hexGrid.get(adjHex);
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
        let thisColorString = hexGrid.get(hexPoint).color;

        let sameColorPredicate = function(bubble: Graphics.Bubble)
        {
            return bubble.color == thisColorString;
        };

        // Kill all with same color
        let connected = findConnected(hexPoint, sameColorPredicate);
        if (connected.length > 2)
        {
            Sound.fallBubbleSound.stop()
            Sound.fallBubbleSound.play();
            let shootingBubble = hexGrid.get(hexPoint);

            for (let i = 0; i < connected.length; i++)
            {
                let hexP = connected[i];
                let bubble = hexGrid.get(hexP);
                bubble.bringToFront();
                bubble.velocity = shootingBubble.velocity;
                fallingBubbles.push(bubble);
                hexGrid.remove(hexP);
            }

            // Kill all dangling
            let connectedDict : {[key: string] : boolean} = {};

            hexGrid.forEachOnRow(0, (b, hexPoint) => {
                findConnected(hexPoint, function() { return true; })
                .map(function(hexP) { connectedDict[JSON.stringify(hexP)] = true; });
            });

            hexGrid.forEach((bubble, hexP) => {
                if (!connectedDict[JSON.stringify(hexP)])
                {
                    // This is dangling!            
                    bubble.velocity = new Point(shootingBubble.velocity.x, 0);
                    fallingBubbles.push(bubble);
                    hexGrid.remove(hexP);
                }
            });
        }
    };
    
    canvas.onFrame(function() {

        for (let i = 0; i < fallingBubbles.length; i++)
        {
            let f = fallingBubbles[i];
            let p = f.position;
            
            if (p.x > 1000)
            {
                f.remove();
                fallingBubbles.splice(i, 1);
                i--;
                continue;
            }

            let fVelocity = f.velocity;
            f.position = new Point(p.x + fVelocity.x, p.y + f.velocity.y);
            f.velocity = new Point(fVelocity.x, fVelocity.y + 0.5);
        }

        if (shooting)
        {
            // update velocity
            let p = playerBall.position;
            if (p.x < (boardLeft + radius) || p.x > (boardLeft + boardWidth - radius))
            {
                let v = playerBall.velocity;
                playerBall.velocity = new Point(-v.x, v.y);
            }

            let v = playerBall.velocity;
            playerBall.position = new Point(p.x + v.x, p.y + v.y);
            

            // collision test
            let point = playerBall.position;
            let hexPoint = pointToHex(point);
            let hexX = hexPoint.x;
            let hexY = hexPoint.y;

            for (let i = hexY - 1; i <= hexY + 1; i++)
            {
                for (let j = hexX - 1; j <= hexX + 1; j++)
                {
                    let bubble = hexGrid.get(new HexPoint(j, i))
                    if (bubble)
                    {
                        let bp = bubble.position;
                        let dist = Math.sqrt((bp.x - point.x)*(bp.x - point.x) + (bp.y - point.y)*(bp.y - point.y));
                        if (dist < 2*radius*0.9)
                        {
                            // Collision!
                            hexGrid.set(playerBall, hexPoint);
                            playerBall.position = hexToPoint(hexPoint);

                            playerBall = new Graphics.Bubble(
                                new Point(boardLeft + ballsPerRow*radius,
                                          canvas.height - 3*radius),
                                radius
                            );
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