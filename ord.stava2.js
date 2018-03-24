var mappings = [
    ["sch", "6"],
    ["stj", "6"],
    ["kj", "6"],
    ["gj", "6"],
    ["sj", "6"],
    ["sh", "6"],
    ["tj", "6"],
    ["ch", "6"],
    ["ck", "7"],
    ["kö", "6"],
    ["lj", "6"],
    ["cc", "70"],
    ["co", "7"],
    ["x", "70"],
    ["j", "6"],
    ["s", "0"],
    ["z", "0"],
    ["c", "0"],
    ["d", "1"],
    ["t", "1"],
    ["n", "2"],
    ["m", "3"],
    ["r", "4"],
    ["l", "5"],
    ["g", "7"],
    ["k", "7"],
    ["q", "7"],
    ["f", "8"],
    ["v", "8"],
    ["w", "8"],
    ["p", "9"],
    ["b", "9"]
];

var vowels = {"è":1,"á":1,"a":1,"é":1,"e":1,"i":1,"o":1,"u":1,"y":1,"å":1,"ä":1,"ö":1};

window.dict = {};
var words = window.words;


var parseWordIx = function(word, i, lastParse)
{
    // try special mapping
    for (n = 0; n < mappings.length; n++)
    {
        mapping = mappings[n][0];

        if (word.substr(i, mapping.length) == mapping)
        {
            return [mappings[n][1], mapping.length];
        }
    }

    return ["", 1];
};

parseWord = function(word)
{
    var result = "";
    var i, n, k, mapping, lastParse;

    for (i = 0; i < word.length; i++)
    {
        if (vowels[word[i]])
        {
            lastParse = "";
            continue;
        }

        var parsedObj = parseWordIx(word, i, lastParse);
        var parsed = parsedObj[0];
        var parsedNumChars = parsedObj[1];
        i += (parsedNumChars-1);

        if (parsed === "" && word[i] !== "h")
        {
            console.log("Unexpected empty parse for: " + word + ", " + i + ", " + lastParse);
        }

        if (parsed == lastParse)
        {
            continue;
        }

        result += parsed;
        lastParse = parsed;
    }

    return result;
};

var test = function(word, expected)
{
    var p = parseWord(word).substr(0,3);
    if (p !== expected)
    {
        console.log("Err: " + word + " => " + p + " (" + expected + ")");
    }
};

var runTests = function()
{
    test("kjolar", "654");
    test("köttsaft", "610");
    test("access", "700");
};

var gogogo = function()
{

    var startTime = Date.now();
    for (var i = 0; i < window.words.length; i++)
    {
        var parsed = parseWord(window.words[i]);

        if (parsed.length < 2)
        {
            // too short
            continue;
        }

        if (parsed.length == 2)
        {
            // 21 becomes 211 which may be acceptable
            parsed = parsed + parsed[1];
        }

        if (parsed.length > 3)
        {
            // let's not care about the last numbers.
            parsed = parsed.substr(0, 3);
        }

        var list = dict[parsed];
        if (!list)
        {
            list = [];
            dict[parsed] = list;
        } 

        list.push(window.words[i]);
    }

    runTests();
    console.log("Time: " + (Date.now() - startTime)/1000 + " sec");
};

var render = function()
{
    var $input = $("<input/>")
        .attr("placeholder", "Läser in ordlistan...")
        .attr("type", "number")
        .css({
            "font-family": "arial",
            "font-size": "1.1em",
            "margin-bottom": "0.5em"});
    
    var $result = $("<div/>");

    $("body").css("font-family", "arial").append(
        $input, 
        $result);
    
    $input.on("input", function()
    {
        var val = $input.val();
        $result.empty();

        var words;
        if (val.length == 0)
        {
            words = [];
        } else if (val.length != 3)
        {
            words = ["Skriv tre siffror"];
            $result.css("color", "gray");
        }
        else 
        {
            words = window.dict[val] || ["Inga ord hittade..."];
            $result.css("color", "black");
        }
        $result.html(words.join("<br>"));
    });    

    window.setTimeout(function()
    {
        gogogo();
        $($input).attr("placeholder", "Skriv tre siffror");
    },100 );
};
$(document).ready(render);

