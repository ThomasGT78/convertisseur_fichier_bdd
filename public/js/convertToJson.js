// convertToJson.js

function convertToJson () {
    //import { convertToJson } from 'file';
    //console.log(convertToJson());
    //const convertToJson = require('/js/convertToJson.js');
    //let val = convertToJson.json();


    var tabRows = '';
    var tabJson;
    ////////////////////////////////Ajouter if typeof rows[i][colonne] = string ou number mettre "" ou non
    for (var i = 0; i < rows.length; i++) {
        if (i > 0) {
            tabRows += ',\n'
        } // if
        for (var k = 0; k < fields.length; k++) {
            var colonne = fields[k].name
            if (k == 0) {
                //{ champs: valeur,
                tabRows += `{ "${colonne}": "${rows[i][colonne]}", `
            } else if (k == fields.length - 1) {
                // champs: valeur },
                tabRows += ` "${colonne}": "${rows[i][colonne]}" }`
            } else {
                // champs: valeur,
                tabRows += ` "${colonne}": "${rows[i][colonne]}", `
            } // else boucle fields
        } // for fields

    } // for rows
    var tabJson = `[\n${tabRows}\n]`;

    /***************************
    *   CRÉATION DU FICHIER    *
    ***************************/

    fs.writeFile(`table_${tableChoisie}.${formatToConvert}`, tabJson, function (err) {
        if (err) {
            return console.error(err);
        }
        console.log("Données écrites !");
    }); // writeFile
    message = `Table « ${tableChoisie} » convertis en fichier <strong>« table_${tableChoisie}.${formatToConvert} »</strong>`;


} // function convertToJson
