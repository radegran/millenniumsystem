
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

    // export type Bubble = {
    //     shape: paper.Group,
    //     color: string,
    //     vx: number,
    //     vy: number
    // }
    
    export class Bubble
    {
        private group : paper.Group;
        private _velocity : Point;
        private _color : string;

        constructor(point: Point, radius: number, fill?: string)
        {
            let paperPoint = new paper.Point(point.x, point.y);
            let s = new paper.Path.Circle(paperPoint.clone().add([4, 4]), radius);
            let shape = new paper.Path.Circle(paperPoint, radius);
            this._color = fill || getRandomColor();
            
            this.group = new paper.Group({
                children: [s, shape]
            });
            
            this.group.fillColor = this._color;
            this.group.translate(new paper.Point(-2, -2));
            s.fillColor = "black";            
        }

        set position(point : Point) {
            this.group.position.x = point.x;
            this.group.position.y = point.y;
        }

        get position() : Point {
            let pos = this.group.position;
            return new Point(pos.x, pos.y);
        }

        set velocity(point : Point) {
            this._velocity = point;
        }

        get velocity() : Point {
            return this._velocity;
        }

        get color() : string {
            return this._color;
        }

        public bringToFront() : void {
            this.group.bringToFront();
        }

        public remove() : void {
            this.group.remove();
        }

        public insertAbove(other : Bubble) : void {
            this.group.insertAbove(other.group);
        }
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
            return new Bubble(new Point(point.x, point.y), this.radius);
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

    export let fixZIndex = function(hexGrid : HexGrid)
    {
        let current : Graphics.Bubble = null;
        hexGrid.forEach((b) => {
            if (current)
            {
                b.insertAbove(current);
            }
            current = b;
        });
    }

}