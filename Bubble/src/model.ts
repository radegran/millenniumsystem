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

class HexTransformer {
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

    public ToPoint(hex: HexPoint) : Point
    {
        let isOdd = (100+hex.y) % 2 == 1;
        let x = this.origo.x + this.hexRadius + (2*this.hexRadius*hex.x) + (isOdd ? this.hexRadius : 0);
        let y = this.origo.y + this.hexRadius + (Math.sqrt(3)*this.hexRadius*hex.y);
        return new Point(x, y);
    };
}

