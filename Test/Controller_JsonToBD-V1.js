// Chargement du module « fs »
const fs = require('fs');
// Charge la bibliothèque mysql et crée une « variable »
const mysql = require('mysql');

var connectHost = 'localhost';
var connectUser = 'root';
var connectPassword = '';
var BDchoisie = 'cours';
var nomTable = 'pays_bis';
var nomFichier = 'table_pays.json';
//var separateur = '';

var messageErreur = '';

        /*****************
        *   CONNEXION    *
        *****************/

// Crée un objet de type Connection 
const connexion = mysql.createConnection({
    host: connectHost,
    port: '3306',
    user: connectUser,
    password: connectPassword,
    database: BDchoisie
});

// Connexion à la BD 
connexion.connect();
console.log("connexion OK");

        /**************************
        *   Lecture du fichier    *
        **************************/

// aller chercher le fichier JSON à convertir
if (fs.existsSync(nomFichier)) {                    // tester l'existence d'un fichier
    const data = JSON.parse(fs.readFileSync(nomFichier));   // lire le fichier, renvoi un objet, on le transforme en 'string'
    console.log("data, ligne 46 :\n");
    console.log(data);
    // console.log("typeOf data, ligne 42 :\n" + typeof data);     // renvoi un Objet


        /****************************
        *    FICHIER JSON     *
        ****************************/

    if (nomFichier.endsWith('json')) {      // code conversion Json

        for (let i = 0; i < data.length; i++) {   // boucle dans le tableau d'Objets
            // console.log("data[i] for, ligne 54 :");
            // console.log(data[i]);

            var item = data[i]

           
            /************************
            *   REQUÊTE TO MYSQL    *
            ************************/

            // insert les données des lignes 1 par 1 à chaque boucle
            var sql = `INSERT INTO ${BDchoisie}.${nomTable} SET ?`;

            connexion.query(sql, item, function (err, rows, fields) {
                if (!err) { // Pas d'erreur

                } // if Pas d'erreur

                else {  // Erreur !!!
                    console.log('\nErreur d\'exécution de la requête !' + err);
                }
            }); // query

        } // for boucle dans le tableau de lignes
        
    } // if JSON

    else {  // si ce n'est pas un fichier JSON
        messageErreur = `le type de fichier n'est pas pris en charge`
        console.log(messageErreur)
    }

} else { // Si le fichier n'existe pas
    messageErreur = `le fichier n'existe pas`
    console.log(messageErreur)
}
//lire un fichier,
//obtenir des informations sur un fichier,


// Déconnexion de la BD 
connexion.end();