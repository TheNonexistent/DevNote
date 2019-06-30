const {remote} = require('electron');
const {ipcRenderer} = require('electron');
const helper = require('./js/helper.js'); // Helper module contain functions for general use
const jsPDF = require('jspdf');
const {dialog} = require("electron").remote;
const fs = require('fs');

let win = remote.getCurrentWindow();

let maintext = document.getElementById("main-text");
let filepath = document.getElementsByClassName("address")[0];
// Button Listeners.
helper.addEvent(document, "click", "#parse-btn", UpdateMain);
helper.addEvent(document, "click", "#export-btn", ExportMain);
helper.addEvent(document, "click", "#save-btn", SaveMain);
helper.addEvent(document, "click", "#open-btn", LoadMain);

// Toolbar 
helper.addEvent(document, "click", "#exit-btn", function (evnt) {
    win.close();
});

helper.addEvent(document, "click", "#max-btn", function (evnt) {
    if (win.isMaximized()) { win.unmaximize(); }
    else { win.maximize(); }    
});

helper.addEvent(document, "click", "#min-btn", function (evnt) {
    win.minimize();
});

//exportbtn.addEventListener("click", ExportPdf);

var ondisk = false;// This variable determines if there is an actual file on disk for the current buffer, this is used to set a default path for open and save dialogs


function UpdateMain()
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
        if (line.includes("&lt;code&gt;") && iscode == false) 
        { 
            iscode = true; 
            maintext.children[index - 1].innerHTML = " "; 
            return; 
        }

        if (line.includes("&lt;/code&gt;") && iscode == true) 
        { 
            iscode = false; 
            maintext.children[index - 1].innerHTML = " "; 
            return; 
        }
        selected = maintext.children[index - 1]; //previous

        if (iscode === true && selected.innerHTML != "")
        {
            hljs.highlightBlock(selected);
        }
    });
}

function ExportMain()
{
    var pdfdoc = new jsPDF();     
    var handler = {
        '#ignore-pdf': function (element, renderer) {
        return true;
        }
    };
    pdfdoc.fromHTML(maintext,15,15,{
        'width': 180,'elementHandlers': handler
        });
        pdfdoc.save();
}

function SaveMain()
{
    var options = {
        title : "Save",
        buttonLabel : "Save"
    };
    if (ondisk)
    {
        options.defaultPath = filepath.innerHTML;
    }
    var filename = dialog.showSaveDialog(options);
    if (filename === undefined) { alert("You Must Specify A Filename"); }
    else
    {
        fs.writeFile(filename, maintext.innerHTML, (error) => {
            if (error) { alert("Could Not Save The File"); }
            else { alert("File Saved"); filepath.innerHTML = filename; }
        });
    }
    ondisk = true;
}

function LoadMain()
{
    var options = {
        title : "Open",
        buttonLabel : "Open"
    };
    if (ondisk)
    {
        options.defaultPath = filepath.innerHTML;
    }
    var filename = dialog.showOpenDialog(options);
    if (filename === undefined) { alert("You Must Specify A Filename"); }
    else
    {
       fs.readFile(filename[0], (error, buffer) => {
                    if (error) { alert("Could Not Open The File"); }
                    else 
                    { 
                        maintext.innerHTML = buffer.toString();
                        filepath.innerHTML = filename;
                    }
                });
    }
    ondisk = true;
}