const {remote} = require('electron');
const helper = require('./js/helper.js'); // Helper module contain functions for general use


let win = remote.getCurrentWindow();
let maintext = document.getElementById("MainText");

// Add a listener for the main editor to update it upon clicking parse.
helper.addEvent(document, "click", "#parse-btn", updateMain);

// Toolbar 
helper.addEvent(document, "click", "#exit-btn", function (evnt) {
    win.close();
});

helper.addEvent(document, "click", "#max-btn", function (evnt) {
    if (win.isMaximized())
        win.unmaximize();
    else
        win.maximize();    
});

helper.addEvent(document, "click", "#min-btn", function (evnt) {
    win.minimize();
});



function updateMain()
{
    var iscode = false;
    var isbold = false;

    let selected;

    var lines = maintext.innerHTML.split('<div>');
    var lineshighlighted = lines.forEach(function(line, index)
    {
        if (index > 0)
        {
            line = line.slice(0, -6);
        }
        console.log(line);
        if (line.includes("&lt;code&gt;") && iscode == false) { iscode = true; maintext.children[index - 1].innerHTML = " "; return; }
        if (line.includes("&lt;/code&gt;") && iscode == true) { iscode = false; maintext.children[index - 1].innerHTML = " "; return; }
        selected = maintext.children[index - 1]; //previous
        if (iscode == true)
        {
            hljs.highlightBlock(selected);
        }
    });
}