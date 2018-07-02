class Point {
    private _x: number;
    private _y: number;

    constructor(x: number, y: number) {
        this._x = x;
        this._y = y;
    }

    get x() : number { return this._x; }
    get y() : number { return this._y; }
};

class HexPoint {
    private _x: number;
    private _y: number;

    constructor(x: number, y: number) {
        this._x = x;
        this._y = y;
    }

    get x() : number { return this._x; }
    get y() : number { return this._y; }
};

type BubbleCallback = (bubble : Graphics.Bubble, hexPoint : HexPoint) => void;

class HexGrid {
    private grid : Array<Array<Graphics.Bubble>>;
    
    constructor() {
        this.grid = [];
    }

    public get(hexPoint: HexPoint) : Graphics.Bubble
    {
        let row = this.grid[hexPoint.y];
        if (row)
        {
            return row[hexPoint.x];
        }
        return null;
    };

    public set(bubble: Graphics.Bubble, hexPoint: HexPoint) : void
    {
        if (hexPoint.x < 0 || hexPoint.y < 0)
        {
            throw "no can do";
        }

        let row = this.grid[hexPoint.y];
        while (!row)
        {
            this.grid.push([]);
            row = this.grid[hexPoint.y];
        }
            
        let col = row[hexPoint.x];
        while (typeof col === "undefined")
        {
            row.push(null);
            col = row[hexPoint.x];
        }

        this.grid[hexPoint.y][hexPoint.x] = bubble;
    };

    public forEach(callback : BubbleCallback) : void {
        for (let i = 0; i < this.grid.length; i++) {
            this.forEachOnRow(i, callback);
        }
    }

    public forEachOnRow(rowIndex : number, callback : BubbleCallback) : void {
        for (let j = 0; j < this.grid[rowIndex].length; j++) {
            let b = this.grid[rowIndex][j];
            if (b) {
                callback(b, new HexPoint(j, rowIndex));
            }
        }
    }

    public remove(hexPoint : HexPoint) : void {
        this.grid[hexPoint.y][hexPoint.x] = null;
    }
}

class HexConvert {
    private origo: Point;
    private hexRadius: number;

    constructor(origo: Point, hexRadius: number) {
        this.origo = origo;
        this.hexRadius = hexRadius;
    }

    public toHex(point: Point) : HexPoint {
        let hexY = Math.round((point.y - this.origo.y - this.hexRadius) / (Math.sqrt(3)*this.hexRadius) );
        let isOdd = (hexY % 2 == 1);
        let hexX = Math.round((point.x - this.origo.x - this.hexRadius - (isOdd ? this.hexRadius : 0)) / (2*this.hexRadius));
        return new HexPoint(hexX, hexY);
    }

    public toPoint(hex: HexPoint) : Point
    {
        let isOdd = (100+hex.y) % 2 == 1;
        let x = this.origo.x + this.hexRadius + (2*this.hexRadius*hex.x) + (isOdd ? this.hexRadius : 0);
        let y = this.origo.y + this.hexRadius + (Math.sqrt(3)*this.hexRadius*hex.y);
        return new Point(x, y);
    };
}

