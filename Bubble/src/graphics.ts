
namespace Graphics {

    export let Colors = [
        "#ffff00", // yellow
        "#ff80d5", // pink
        "#ff0000", // red
        "#00b33c", // dark green
        "#cc00ff", // purple
        "#66ccff", // light blue
        "#8cff66", // light green
    ];

    export let getRandomColor = function()
    {
        return Colors[Math.floor(Math.random()*Colors.length)];
    };

    export type Bubble = {
        shape: paper.Group,
        color: string,
        vx: number,
        vy: number
    }
    
    export let Bubble = function(point: paper.Point, radius: number, fill?: string) : Bubble
    {
        let s = new paper.Path.Circle(point.clone().add([4, 4]), radius);
        let shape = new paper.Path.Circle(point.clone(), radius);
        let fillColor = fill || getRandomColor();
    
        let group = new paper.Group({
            children: [s, shape]
        });

        group.fillColor = fillColor
        group.translate(new paper.Point(-2, -2));
        s.fillColor = "black";
        
        return {
            shape: group,
            color: fillColor,
            vx: 0,
            vy: 0
        };
    };

    export class View 
    {
        private canvas: Canvas;

        constructor(canvas: Canvas)
        {
            this.canvas = canvas;
        }
    };

    type Canvas = {
        onFrame: (callback: () => void) => void,
        onClick: (callback: (point: Point) => void) => void,
        width: number;
        height: number;
    }

    export class BubbleFactory {
        private radius : number;

        constructor(radius : number) {
            this.radius = radius;
        }

        public create(point : Point) : Bubble {
            return Bubble(new paper.Point(point.x, point.y), this.radius);
        }
    }

    export let setupCanvas = function(canvas: HTMLCanvasElement) : Canvas
    {
        paper.install(window);
        paper.setup(canvas);

        return {
            onFrame: function(callback) { 
                paper.view.onFrame = function() { callback(); } 
            },
            onClick: function(callback) { 
                paper.view.onMouseDown = function(event) { 
                    callback(new Point(event.point.x, event.point.y))
                }
            },
            width: window.innerWidth,
            height: window.innerHeight
        };
    };


}