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

    var insidetag = false;
    var tagstartindex;

    var tagname = [];

    var blocks = [];
    var tagid = 0;

    var tagsstart = [];
    var tagsend = [];

    function tag(tagname, index, isused = false)
    {
        this.tagname = tagname;
        this.index = index;
        this.isused = isused;
    }

    function tags(tagname, startindex, endindex)
    {
        this.tagname = tagname;
        this.startindex = startindex;
        this.endindex = endindex;
    }

    let first = true;
    for (i in textarray)
    {
        i = parseInt(i);

        if (first)
        {
            tagsstart[tagid] = new tag([], 0);
            tagname = [];
            first = false;
        }

        if (textarray.slice(i, i + 4).join("") == "&lt;" && textarray.slice(i, i + 5).join("") != "&lt;/" && insidetag == false) //[ '&', 'l', 't', ';', 'c', 'o', 'd', 'e', '&', 'g', 't', ';' ]
        {
            tagsstart[tagid].index = i + 4;
            tagstartindex = i + 4;
            insidetag = true;
            continue;
        }
        else if(textarray.slice(i, i + 4).join("") == "&gt;" && insidetag == true)
        {
            insidetag = false;
            tagid++;
            first = true;
            continue;
        }
        else if (insidetag && i >= tagstartindex)
        {
            tagname.push(textarray[i]);
        }

        tagsstart[tagid].tagname = tagname.join("");
    }
    tagsstart.pop();//Popping the extra value wich is always created.

    tagid = 0;
    insidetag = false;
    first = true;
    for (i in textarray)
    {
        i = parseInt(i);

        if (first)
        {
            tagsend[tagid] = new tag([], 0);
            tagname = [];
            first = false;
        }

        if (textarray.slice(i, i + 5).join("") == "&lt;/" && insidetag == false) //[ '&', 'l', 't', ';', 'c', 'o', 'd', 'e', '&', 'g', 't', ';' ]
        {
            tagsend[tagid].index = i;
            tagstartindex = i + 5;
            insidetag = true;
            continue;
        }
        else if(textarray.slice(i, i + 4).join("") == "&gt;" && insidetag == true)
        {
            insidetag = false;
            tagid++;
            first = true;
            continue;
        }
        else if (insidetag && i >= tagstartindex)
        {
            tagname.push(textarray[i]);
        }
        tagsend[tagid].tagname = tagname.join("");
    }
    tagsend.pop();//Popping the extra value wich is always created.

    mainloop:
    for (id in tagsstart)
    {
    nestedloop:
        for(endid in tagsend)
        {
            if (tagsstart[id].tagname === tagsend[endid].tagname)
            {
                if(!tagsend[endid].isused)
                {
                    blocks.push(new tags(tagsstart[id].tagname, tagsstart[id].index, tagsend[endid].index));
                    tagsend[endid].isused = true;
                    continue mainloop;
                }
            }
        }
    }
    console.log(tagsstart);
    console.log(tagsend);
    console.log(blocks);

     for (id in blocks)
     {
         if (blocks[id].tagname == "code")
         {
             var difference = id*(([...'<pre><code>'].length + [...'</code></pre>'].length) - (("&lt;".length + blocks[id].tagname.length + "&gt;".length + "&lt:/".length) + (blocks[id].tagname.length + "&gt;".length)));//Difference in index created by previous added divs to the text

             textarray = helper.insertArray(textarray, [...'<pre><code>'], (blocks[id].startindex + blocks[id].tagname.length + 4) + difference); //After < + the name of the tag + >
             textarray = helper.insertArray(textarray, [...'</code></pre>'], (blocks[id].endindex + [...'<pre><code>'].length) + difference); //Considering the new addition to the array. so we should shift the index.
            
             //Removing the tags
             textarray.splice((blocks[id].startindex - 4) + difference,"&lt;".length + blocks[id].tagname.length + "&gt;".length);
             textarray.splice((blocks[id].endindex + [...'<pre><code>'].length + [...'</code></pre>'].length - ("&lt;".length + blocks[id].tagname.length + "&gt;".length) + difference), "&lt:/".length + blocks[id].tagname.length + "&gt;".length);
            
             maintext.innerHTML = textarray.join("");

            /*I know, I know, this part of the code is really really horrible and hard to understand.
             I will fix  it, I promise.*/
         }
         else if(blocks[id].tagname == "bold")
         {
            // var difference = id*(([...'<b>'].length + [...'</b>'].length) - (("&lt;".length + blocks[id].tagname.length + "&gt;".length + "&lt:/".length) + (blocks[id].tagname.length + "&gt;".length)));//Difference in index created by previous added divs to the text

            // textarray = helper.insertArray(textarray, [...'<b>'], (blocks[id].startindex + blocks[id].tagname.length + 4) + difference); //After < + the name of the tag + >
            // textarray = helper.insertArray(textarray, [...'</b>'], (blocks[id].endindex + [...'<b>'].length) + difference); //Considering the new addition to the array. so we should shift the index.
           
            // //Removing the tags
            // textarray.splice((blocks[id].startindex - 4) + difference,"&lt;".length + blocks[id].tagname.length + "&gt;".length);
            // textarray.splice((blocks[id].endindex + [...'<b>'].length + [...'</b>'].length - ("&lt;".length + blocks[id].tagname.length + "&gt;".length) + difference), "&lt:/".length + blocks[id].tagname.length + "&gt;".length);
           
            // maintext.innerHTML = textarray.join("");
         }

     }

    hljs.initHighlighting.called = false;
    hljs.initHighlighting();

    //Submitting all the addded divs to the highlighter
    // let codediv = document.getElementsByClassName("code-text");
    // for (div in codediv)
    // {
    //     hljs.highlightBlock(codediv[div]);
    // }
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

//TODO : ADD REPLACE TAG FUNCTION