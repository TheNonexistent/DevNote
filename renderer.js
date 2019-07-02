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
helper.addEvent(document, "click", "#new-btn", NewMain);

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
    var text = maintext.innerHTML;
    var textarray = [...text];

    var insidetag = false 
    var insideendtag = false;
    var tagstartindex;
    var tagendindex;

    var tags = [];
    var tagid = 0;

    function tag(tagname, tagendname, startindex, endindex)
    {
        this.tagname = tagname;
        this.tagendname = tagendname;
        this.startindex = startindex;
        this.endindex = endindex;
    }

    let first = true;
    for (i in textarray)
    {
        i = parseInt(i);

        if (first)
        {
            tags[tagid] = new tag([], [], 0, 0);
            first = false;
        }

        if (textarray.slice(i, i + 4).join("") == "&lt;" && textarray.slice(i, i + 5).join("") != "&lt;/" && insidetag == false) //[ '&', 'l', 't', ';', 'c', 'o', 'd', 'e', '&', 'g', 't', ';' ]
        {
            tags[tagid].startindex = i + 4;
            tagstartindex = i + 4;
            insidetag = true;
            continue;
        }
        else if(textarray.slice(i, i + 4).join("") == "&gt;" && insidetag == true)
        {
            insidetag = false;
            continue;
        }
        else if (insidetag && i >= tagstartindex)
        {
            tags[tagid].tagname.push(textarray[i]);
        }

        if (textarray.slice(i, i + 5).join("") == "&lt;/" && insideendtag == false) //[ '&', 'l', 't', ';', 'c', 'o', 'd', 'e', '&', 'g', 't', ';' ]
        {
            tags[tagid].endindex = i;
            tagstartindex = i + 5;
            insideendtag = true;
            continue;
        }
        else if(textarray.slice(i, i + 4).join("") == "&gt;" && insideendtag == true)
        {
            insideendtag = false;
            tags[tagid] =  tags[tagid];
            tagid++;
            first = true;
            continue;
        }
        else if (insideendtag && i >= tagstartindex)
        {
            tags[tagid].tagendname.push(textarray[i]);
        }
    // instance.tagname = instance.tagname.join("");
    // instance.tagendname = instance.tagendname.join("");
    }
    
    tags.pop();//Popping the extra value wich is always created.
    console.log(tags);
    console.log(typeof Array(tags[0].tagname), Array(tags[0].tagname));
    for (id in tags)
    {
        console.log(tags[id].tagname == tags[id].tagendname);
        if (true)
        {
            var difference = id*(([...'<div class="code-text">'].length + [...'</div>'].length) - (("&lt;".length + tags[id].tagname.length + "&gt;".length + "&lt:/".length) + (tags[id].tagname.length + "&gt;".length)));//Difference in index created by previous added divs to the text

            textarray = helper.insertArray(textarray, [...'<div class="code-text">'], (tags[id].startindex + tags[id].tagname.length + 4) + difference); //After < + the name of the tag + >
            textarray = helper.insertArray(textarray, [...'</div>'], (tags[id].endindex + [...'<div class="code-text">'].length) + difference); //Considering the new addition to the array. so we should shift the index.
            
            //Removing the tags
            textarray.splice((tags[id].startindex - 4) + difference,"&lt;".length + tags[id].tagname.length + "&gt;".length);
            textarray.splice((tags[id].endindex + [...'<div class="code-text">'].length + [...'</div>'].length - ("&lt;".length + tags[id].tagname.length + "&gt;".length) + difference), "&lt:/".length + tags[id].tagname.length + "&gt;".length);
            
            maintext.innerHTML = textarray.join("");
            console.log(textarray.join(""));

            /*I know, I know, this part of the code is really really horrible and hard to understand.
            I will fix  it, I promise.*/
        }
    }

    //Submitting all the addded divs to the highlighter
    let codediv = document.getElementsByClassName("code-text");
    for (div in codediv)
    {
        hljs.highlightBlock(codediv[div]);
    }
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
    else
    {
        options.defaultPath = "NewFile.dn";
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

function NewMain()
{
    options = {
        type : "warning",
        buttons : ["Yes", "Cancel"],
        defaultId : 1,
        title : "Warning",
        message : "All Progress Will Be Lost. Are You Sure You Want To Continue?",
        cancelId : 1,

    };
    var response = dialog.showMessageBox(options);
    if(response === 0)
    {
        maintext.innerHTML = "<div><br></div>";
        filepath.innerHTML = "NewFile";
    }
}