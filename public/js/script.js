var formatToConvert = document.getElementById("formatToConvert");
var separateurExport = document.getElementById("separateurExport");

var formatToImport = document.getElementById("formatToImport");
var separateurImport = document.getElementById("separateurImport");

function initExport () {

    formatToConvert.onclick = function () {
        if (formatToConvert.value == "txt" || formatToConvert.value == "csv") {
            separateurExport.disabled = false;
        } else {
            separateurExport.disabled = true;
        }
    } // disable function export
}


// console.log(formatToImport);

function initImport(){
    formatToImport.onclick = function () {
        if (formatToImport.value == "txt" || formatToImport.value == "csv") {
            separateurImport.disabled = false;
            // console.log("abled")
        } else {
            separateurImport.disabled = true;
            // console.log("disabled")
        }
    } // disable function import
}

var title = document.getElementsByTagName("title");
var titleText = title[0].innerText

function init (titleText) {
    console.log(titleText);
    if (titleText == "choixTableConvert.ejs"){
        initExport();
    } else if (titleText == "choixTableInsert.ejs") {
        initImport();
    }
}
document.onload = init(titleText);

