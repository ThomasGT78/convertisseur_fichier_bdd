// convertToTxtCsv.js

module.exports = function (tableChoisie, formatToConvert, separateur, rows, fields, message) {

    const fs = require('fs');

    /*************************************
     *   1ère ligne: nom des colonnes    *
     ************************************/

    var firstLine = "";

    function firstLinefunc() {
        for (i = 0; i < fields.length; i++) {
            if (firstLine == "") {
                firstLine = `${fields[i].name}`
            } else {
                firstLine += `${separateur}${fields[i].name}`
            }
        } // for
        return firstLine
    } // firstLinef
    firstLinefunc()

    /*********************************
    *   Data: lignes des colonnes    *
    *********************************/

    var dataTab = "";
    function funcDataTab() {
        for (var i = 0; i < rows.length; i++) {     // boucle dans ROWS
            dataTab += `\n`;                        // retour à la ligne à chaque nouvelle ligne
            for (var k = 0; k < fields.length; k++) {   // boucle dans chaque ligne je boucle dans Fields pour récupérer le nom de la colonne
                if (k == 0) {           // repère les nouvelles ligne et ne met pas ;
                    var colonne = fields[k].name        // stock le nom de la 1ère colonne où on veut récupérer l'info
                    dataTab += `${rows[i][colonne]}`    // enregistre la valeur de chaque 1ère colonne d'une ligne
                }
                else {                                  // sinon met le ; avant le contenu 
                    var colonne = fields[k].name    // stock le nom de colonne où on veut récup l'info
                    dataTab += `${separateur}${rows[i][colonne]}`   // enregistre la valeur du reste des colonnes d'une ligne
                }
            } // for Fields
        } // for Rows
        return dataTab
    } // funcDataTab
    funcDataTab()

    /***************************
    *   CRÉATION DU FICHIER    *
    ***************************/

    fs.writeFile(`table_${tableChoisie}.${formatToConvert}`, firstLine, function (err) {
        if (err) {
            return console.error(err);
        }
        console.log("Données écrites !");

        /// INSERTION DES DATA
        fs.appendFile(`table_${tableChoisie}.${formatToConvert}`, dataTab, function (err, fd) {
            if (err) {
                return console.error(err);
            }
            console.log("Ajout avec succès !");
        }); // appendFile
    }); // writeFile

    message = `Table ${tableChoisie} convertis en fichier <strong>« table_${tableChoisie}.${formatToConvert} »</strong>`
    return message
} // function convertToTxtCsv