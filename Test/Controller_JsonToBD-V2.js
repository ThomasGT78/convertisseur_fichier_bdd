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

var nomColonne = "";        // donne les nom de colonne dans le sql
var numberValues = "";      // ajoute les ?,?,? dans les values SQL
var itemData = "";                // donne les values à ajouter au ?,?,?
var item;
var keyName;

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
    // console.log("typeOf data, ligne 47 :\n" + typeof data);     // renvoi un Objet


        /****************************
        *    FICHIER JSON     *
        ****************************/

    if (nomFichier.endsWith('json')) {      // code conversion Json
        // console.log("data.length, ligne 54 :" );
        // console.log(data.length);

        for (let i = 0; i < data.length; i++) {   // boucle dans le tableau d'Objets
            // console.log("data[i] for, ligne 60 :");
            // console.log(data[i]);
            var tabItemData = []
            
            if (i == 0) {           // pour que ça ne le fasse qu'une seule fois au 1er objet
                tabColonne = Object.keys(data[i])   // récupère les Keys et les met dans un tableau
                // console.log("nomColonne, ligne 65 :")
                // console.log(tabColonne)
                
            } // if i = 0
            
            for (let k = 0; k < tabColonne.length; k++) {  // boucle dans le tableau de colonnes
                if (k == 0) {
                    numberValues = "?"               // ajoute les ?,?,? dans les values SQL
                    itemData = data[i][tabColonne[k]];
                    nomColonne = tabColonne[k]
                    tabItemData.push(data[i][tabColonne[k]])
                } else {
                    numberValues += ",?"
                    itemData += `, ${data[i][tabColonne[k]]}`;
                    nomColonne += `, ${[tabColonne[k]]}`
                    tabItemData.push(data[i][tabColonne[k]])
                } // if, else ?,?,?
            }
            

            // console.log("itemData, ligne 80 :");
            // console.log(itemData);
            // console.log(tabItemData);

            // console.log(`nomColonne, ligne 83:`)
            // console.log(nomColonne)
            
            // console.log(`numberValues, ligne 86:`)
            // console.log(numberValues + '\n')
            
            /************************
            *   REQUÊTE TO MYSQL    *
            ************************/

            // insert les données des lignes 1 par 1 à chaque boucle
            var sql = `INSERT INTO ${BDchoisie}.${nomTable} (${nomColonne}) VALUES (${numberValues})`;

            connexion.query(sql, tabItemData, function (err, rows, fields) {
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