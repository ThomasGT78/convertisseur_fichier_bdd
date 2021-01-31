        /*****************
        *   CONNEXION    *
        *****************/

// Charge la bibliothèque mysql et crée une « variable »
const mysql = require('mysql');

// Crée un objet de type Connection 
const connexion = mysql.createConnection({
    host: 'localhost',
    port: '3306',
    user: 'root',
    password: '',
    database: 'cours'
});

// Connexion à la BD 
connexion.connect();

        /************************
        *   REQUÊTE TO MYSQL    *
        ************************/

// Exécute une requête SQL de type SELECT 
connexion.query('SELECT * FROM produits', function (err, rows, fields) {
    // SI OK 
    if (!err) {
        const fs = require("fs");
        console.log(fields)
        // Nom de la table à convertir
        var nomTable = fields[0].table
        //console.log (nomTable)
        /************************************
        *   1ère ligne: nom des colonnes    *
        ************************************/
        var firstLine = "";
        function firstLinefunc (){
            for (i = 0; i < fields.length; i++) {
                if(firstLine == ""){
                    firstLine = `${fields[i].name}`
                } else {
                    firstLine += `;${fields[i].name}`
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
                    if (dataTab.endsWith('\n')) {           // repère les nouvelles ligne et ne met pas ;
                        var colonne = fields[k].name        // stock le nom de la 1ère colonne où on veut récupérer l'info
                        dataTab += `${rows[i][colonne]}`    // enregistre la valeur de chaque 1ère colonne d'une ligne
                    } 
                    else {                                  // sinon met le ; avant le contenu 
                        var colonne = fields[k].name    // stock le nom de colonne où on veut récup l'info
                        dataTab += `;${rows[i][colonne]}`   // enregistre la valeur du reste des colonnes d'une ligne
                    }
                } // for Fields
            } // for Rows
            return dataTab
        } // funcDataTab
        funcDataTab()

        /***************************
        *   CRÉATION DU FICHIER    *
        ***************************/
        
        fs.writeFile(`table_${nomTable}.txt`, firstLine, function (err) {
            if (err) {
                return console.error(err);
            }
            console.log("Données écrites !");
            /// INSERTION DES DATA

            fs.appendFile(`table_${nomTable}.txt`, dataTab, function (err, fd) {
                if (err) {
                    return console.error(err);
                }
                console.log("Ajout avec succès !");
            }); // appendFile

        }); // writeFile
    } // if pas d'erreur
    
    else { // ERREUR
        console.log('\nErreur d\'exécution de la requête !' + err);
    }
}); // query


// Déconnexion de la BD 
connexion.end();