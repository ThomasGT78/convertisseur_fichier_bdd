// moduleConvert.js


module.exports = function (req, res, connexion, BDchoisie) {
    
    var convertToTxtCsv = require('./convertToTxtCsv.js');
    // var convertToJson = require('./public/js/convertToJson.js');

    var tableChoisie = req.body.table_name;
    var formatToConvert = req.body.formatToConvert;
    var separateur = req.body.separateur;
    //console.log('CONSOLE LIGNE 164');
    //console.log(BDchoisie);
    //console.log(tableChoisie);
    //console.log(formatToConvert);
    var sql = `SELECT * FROM  ${BDchoisie}.${tableChoisie};`
    console.log(sql);

    connexion.query(sql, function (err, rows, fields) {
        // Erreur
        if (err) {
            console.log('Erreur -1 : ' + err.code);
        }
        else { // Pas d'erreur
            var message = '';

            //////////////////////////CONVERSION TXT ET CSV
            // const fs = require("fs");
            //var nomTable = fields[0].table
            if (formatToConvert === 'txt' || formatToConvert === 'csv') {

                convertToTxtCsv(tableChoisie, formatToConvert, separateur, rows, fields, message)

            } // if TXT ou CSV

            //////////////////////////  CONVERSION JSON

            else if (formatToConvert == 'json') {
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
                message = `Table ${tableChoisie} convertis en fichier .${formatToConvert}`

            } // else if Json

            else { // format non sélectionné
                message = "veuillez sélectionner un format dans lequel convertir"

            }

        } // else pas d'erreur
        console.log("message")
        console.log(message)
        res.setHeader('Content-Type', 'text/html; charset=utf-8');
        res.render('validationConvert.ejs', { message: message });
    }); /// query Sélection de la Table à modifier

}