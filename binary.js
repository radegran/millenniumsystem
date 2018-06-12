var flash = function(color, time, className)
{
    if (className)
    {
        $(className).css("opacity", 0.3).animate({"opacity": 1}, {duration:400});
        return;
    }
    var $body = $("body");
    var $fader = $("<div/>").css(
        {
            "position": "absolute",
            "height": "100%",
            "width": "100%",
            "opacity": 0.5
        }
    ).prependTo($body);

    var c = function() { $fader.remove(); };
    $fader.css("background-color", color)
        .animate({"opacity": 0}, {duration:time || 'fast', complete:c});
};

var init = function()
{
    $(document).off();
    $("div").remove();

    var $body = $(document.body).css({
        "font-size": "1.5em",
        "margin": 0,
        "padding": 0,
        "height": "100%"
    });
    var $digit = $("<div/>").addClass("digit")
        .text("Tap to start!")
        .css("padding", "0.5em")
        .css("font-size", "4em")
        .css("text-align", "center").appendTo($body);
    var $digitCount = $("<div/>")
        .css("font-size", "1em")
        .css("text-align", "center")
        .css("color", "gray").appendTo($body);
    var buttonCss = {
        "background-color": "lightgreen",
        "position": "absolute",
        "font-size": "4em",
        "padding": "0.5em"
    };
    var $zeroButton = $("<div/>").css(buttonCss)
        .css("left", 0).text("0");
    var $oneButton = $("<div/>").css(buttonCss)
        .css("right", 0).text("1");
    
    var $done = $("<div/>").text("Done").css({
        "position": "absolute",
        "bottom": 0,
        "padding": "1em",
        "background-color": "lightgreen"
    }).hide().appendTo($body);
    
    var $f5 = $("<div/>").text("F5").css({
        "position": "absolute",
        "bottom": 0,
        "right": 0,
        "padding": "0.5em",
        "background-color": "#f0f0f0"
    }).appendTo($body);
    
    $f5.on("click", function() { window.setTimeout(init, 0); });
    var digits = [];
    for (var i = 0; i < 10000; i++)
    {
        digits.push(Math.random() > 0.5 ? 1 : 0);
    }

    var learnIx = -1;
    var startTime = -1;
    var recallIx = 0;
    var errors = 0;
    var prevIsError = false;

    var doneText = "";

    var recall = function(digit)
    {
        if (digits[recallIx] === digit)
        {
            prevIsError = false;
            recallIx++;
            $done.text(doneText + " (" + recallIx + ")").css("background-color", "lightgreen");
            flash("lightgreen");
        }
        else
        {
            if (!prevIsError)
            {
                errors++;
                $done.text(doneText + " (WRONG)").css("background-color", "salmon");
                prevIsError = true;
            }            
            flash("salmon", "slow");
        }

        if ((recallIx-1) === learnIx)
        {
            $done.text(doneText + " (" + (1 + learnIx - errors) + "/" + (1 + learnIx) + ")").css("background-color", "gold");
            $oneButton.off();
            $zeroButton.off();
            flash("gold", 1000);
        }
    }

    $zeroButton.on("click", function() { recall(0); });
    $oneButton.on("click", function() { recall(1); });

    var ondone = function(e)
    {
        e.stopPropagation();
        doneText = "Done in " + Math.round((Date.now() - startTime)/1000) + "s";
        $done.text(doneText);
        $done.off();
        $(document).off();
        $digit.remove();
        $digitCount.remove();
        $body.append($zeroButton, $oneButton);
        flash("gold", 1000);
    };

    var onclick = function(e)
    {
        $done.show();
        flash("#dddddd", 'fast', ".digit");

        if (learnIx < 0)
        {
            startTime = Date.now();
        }
        
        learnIx++;
        $digit.text(digits[learnIx] + "");
        $digitCount.text("Digit " + (learnIx+1));
        if (learnIx == digits.length)
        {
            ondone(e);
        }
    };

    $(document).on("click", onclick);
    $done.on("click", ondone);
};

var init1 = function()
{
    init();
    FastClick.attach(document.body);
}

$(document).ready(init1);