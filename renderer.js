// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.

let maintext = document.getElementById("MainText");
let parsebtn = document.getElementById("ParseButton");
let exportbtn = document.getElementById("ExportButton");

//Addind a listener for the main editor to update it upon clicking parse.

parsebtn.addEventListener("click", UpdateMain);
//exportbtn.addEventListener("click", ExportPdf);


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
        console.log(line);
        if (line.includes("&lt;code&gt;") && iscode == false) { iscode = true; maintext.children[index - 1].innerHTML = " "; return; }
        if (line.includes("&lt;/code&gt;") && iscode == true) { iscode = false; maintext.children[index - 1].innerHTML = " "; return; }
        selected = maintext.children[index - 1]; //previous
        if (iscode == true && selected.innerHTML != "")
        {
            hljs.highlightBlock(selected);
        }
    });
}