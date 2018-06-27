type HexPoint = {
    x: number,
    y: number
}

type Point = {
    x: number;
    y: number
}
    
var Point = function(x: number, y: number) : Point {
    return {x:x, y:y};
};

let HexPoint = function(x: number, y: number) : HexPoint {
    return {x:x, y:y};
};

module Hex
{
}