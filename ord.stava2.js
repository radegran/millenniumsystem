var mappings = [
    ["s", "z", "c"],
    ["d", "t"],
    ["n"],
    ["m"],
    ["r"],
    ["l"],
    ["sch", "gj", "sj", "sh", "tj", "ch", "j", "g"],
    ["ck", "g", "k", "q"],
    ["f", "v", "w"],
    ["p", "b"]
];

var specialMappings = [
    ["x", "70"]
];

var vowels = {"è":1,"á":1,"a":1,"é":1,"e":1,"i":1,"o":1,"u":1,"y":1,"å":1,"ä":1,"ö":1};

window.dict = {};
var words = window.words;


var parseWordIx = function(word, i, lastParse)
{
    // try special mapping
    for (n = 0; n < specialMappings.length; n++)
    {
        mapping = specialMappings[n][0];

        if (word.substr(i, mapping.length) == mapping)
        {
            return [""+specialMappings[n][1], mapping.length];
        }
    }

    // try standard mapping
    for (n = 9; n >= 0; n--)
    {
        for (var nk = 0; nk < mappings[n].length; nk++)
        {
            mapping = mappings[n][nk];
            if (word.substr(i, mapping.length) == mapping)
            {
                return ["" + n, mapping.length];
            }
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
    var p = parseWord(word);
    if (p !== expected)
    {
        console.log("Err: " + word + " => " + p + " (" + expected + ")");
    }
}

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

    console.log("Time: " + (Date.now() - startTime)/1000 + " sec");
};

var render = function()
{
    var $input = $("<input/>").attr("placeholder", "Läser in ordlistan...");
    var $result = $("<div/>");
    $("body").append($input, $result);
    
    $input.on("input", function()
    {
        var val = $input.val();
        $result.empty();
        var words = window.dict[val] || ["Inga ord hittade..."];
        $result.html(words.join("<br>"));
    });    

    window.setTimeout(function()
    {
        gogogo();
        $($input).attr("placeholder", "Skriv in tre siffror");
    },100 );
};
$(document).ready(render);

