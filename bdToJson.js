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
//console.log ('connexion OK ligne 19');
        /************************
        *   REQUÊTE TO MYSQL    *
        ************************/

// Exécute une requête SQL de type SELECT 
connexion.query('SELECT * FROM produits', function (err, rows, fields) {
    //console.log('Query OK ligne 26');
    // SI OK 
    if (!err) {
        const fs = require("fs");

        // Nom de la table à convertir
        var nomTable = fields[0].table
        //console.log ('ligne 33: nomTable: ' + nomTable)
        //console.log(rows)
        //console.log(fields)
        //boucle dans les lignes  
            //pour chaque ligne je boucle dans les fields pour récup le nom de la colonne
        var tabRows = '';
        var tabJson;
////////////////////////////////Ajouter if typeof rows[i][colonne] = string ou number mettre "" ou non
        for (var i = 0; i < rows.length; i++){
            if( i > 0 ) {
                tabRows += ',\n'
            } // if
                for (var k = 0; k < fields.length; k++) {
                    var colonne = fields[k].name
                    if (k == 0) {
                        //{ champs: valeur,
                        tabRows += `{ "${colonne}": "${rows[i][colonne]}", `
                        //console.log('ligne 45 \n' + tabRows)
                    } else if (k == fields.length-1){
                        // champs: valeur },
                        tabRows += ` "${colonne}": "${rows[i][colonne]}" }`
                        //console.log('ligne 50 \n' + tabRows)
                    } else {
                        // champs: valeur,
                        tabRows += ` "${colonne}": "${rows[i][colonne]}", `
                        //console.log('ligne 54 \n' + tabRows)
                    } // else boucle fields
                } // for fields
            
        } // for rows
        var tabJson = `[\n${tabRows}\n]`;
        console.log('tabJson ligne 60' + tabJson)

        /***************************
        *   CRÉATION DU FICHIER    *
        ***************************/

        fs.writeFile(`table_${nomTable}.json`, tabJson, function (err) {
            if (err) {
                return console.error(err);
            }
            console.log("Données écrites !");
        }); // writeFile
    } // if pas d'erreur

    else { // ERREUR
        console.log('\nErreur d\'exécution de la requête !' + err);
    }
}); // query


// Déconnexion de la BD 
connexion.end();