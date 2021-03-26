// Chargement du module « fs »
const fs = require('fs');
// Charge la bibliothèque mysql et crée une « variable »
const mysql = require('mysql');

var connectHost = 'localhost';
var connectUser = 'root';
var connectPassword = '';
var BDchoisie = 'cours';
var nomTable = 'villes_bis';
var nomFichier = 'table_villes.csv';
var separateur = ',';

var messageErreur = '';

var nomColonne = "";        // donne les nom de colonne dans le sql
var numberValues = "";      // ajoute les ?,?,? dans les values SQL
var tabData;                // donne les values à ajouter au ?,?,?


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

//aller chercher le fichier txt à convertir

if (fs.existsSync(nomFichier)) {                    // tester l'existence d'un fichier
    const data = fs.readFileSync(nomFichier).toString();   // lire le fichier, renvoi un objet, on le transforme en 'string'
    console.log("data, ligne 39 :\n" + data);
    console.log("typeOf data, ligne 40 :\n" + typeof data);     // renvoi un Objet

        /****************************
        *    FICHIER TXT ou CSV     *
        ****************************/

    if (nomFichier.endsWith('txt') || nomFichier.endsWith('csv')) {      // code conversion TXT et CSV
        var tabRow = data.split('\n')           // sépare sur les retour à la ligne
        console.log(`tabRow, ligne 44:\n`)      // crée un tableau de string avec chque lignes
        console.log(tabRow)

        for (let i = 0; i < tabRow.length; i++) {   // boucle dans le tableau de lignes

            if (i == 0) {  // choisi les nom de colonne où ajouter les valeurs
                tabData = tabRow[i].trim().split(separateur)   // sépare sur le point-virgule
                console.log(`tabData, ligne 53:`)
                console.log(tabData)
                for (let k = 0; k < tabData.length; k++) {  // Boucle dans chaque ligne
                    if (k == 0) {
                        numberValues += "?"               // ajoute les ?,?,? dans les values SQL
                    } else {
                        numberValues += ", ?"
                    } // if, else ?,?,?

                    if(k==0){
                        nomColonne += tabData[k].trim();       // ajoute les nom des colonnes au sql
                    } else {
                        nomColonne += `, ${tabData[k].trim()}`;
                    }
                } // for colonne
            } // if nom de colonne

            else {  // enregistre les datas des lignes à insérer
                var tabData = tabRow[i].trim().split(separateur)   // sépare sur le point-virgule
                console.log(`tabData, ligne 74:`)
                console.log(tabData)
            } // else data des rows

            console.log(`nomColonne, ligne 78:`)
            console.log(nomColonne)
            
            console.log(`numberValues, ligne 82:`)
            console.log(numberValues + '\n')
            
            /************************
            *   REQUÊTE TO MYSQL    *
            ************************/

            if ( i > 0 ){       // ne renvoi pas le nom des colonnes mais justes les datas
                // insert les données des lignes 1 par 1 à chaque boucle
                sql = `INSERT INTO ${BDchoisie}.${nomTable} (${nomColonne}) VALUES (${numberValues})`;
                connexion.query(sql, tabData, function (err, rows, fields) {
                    if (!err) { // Pas d'erreur

                    } // if Pas d'erreur

                    else {  // Erreur !!!
                        console.log('\nErreur d\'exécution de la requête !' + err);
                    }
                }); // query
            } // if ( i > 0 )

        } // for boucle dans le tableau de lignes
    } // if TXT ou CSV

            /********************
            *   FICHIER JSON    *
            ********************/

    else if (nomFichier.endsWith('json')) {        // code conversion JSON
        

    } // else if JSON

    else {
        messageErreur = `le type de fichier n'est pas pris en charge`
    }
} else {
    messageErreur = `le fichier n'existe pas`
    console.log(messageErreur)
}


// Déconnexion de la BD 
connexion.end();