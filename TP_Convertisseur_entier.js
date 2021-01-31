const express = require('express');
const mysql = require('mysql');
const bodyParser = require('body-parser');
//const $ = require('jquery');
const fs = require('fs');   // Chargement du module « fs »

const app = express();

// for parsing application/json
app.use(bodyParser.json());
// for parsing application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }));
// Le dossier des ressources statiques
app.use(express.static(__dirname + '/public'));


var connexion;
var connectHost;
var connectUser;
var connectPassword;

var BDchoisie;


/* 
// Crée une variable globale de type connexion
const connexion = mysql.createConnection({
    host: 'localhost',
    port: '3306',
    user: 'root',
    password: '',
    database: ''
}); 

// Connexion a la BD
connexion.connect();
*/
/*************************************
**********   Vers la page connexion.ejs   ***********
 *************************************/

// http://localhost:8081/
app.get('/', function (req, res) {
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.render('connexion.ejs');
});

/*************************************
**********   Vers la page Home.ejs   ***********
 *************************************/

app.get('/home', function (req, res) {
    connectHost = req.query.host
    connectUser = req.query.user
    connectPassword = req.query.password
    console.log(connectHost)
    console.log(connectUser)
    console.log('password: ' + connectPassword)

    connexion = mysql.createConnection({
        host: connectHost,
        port: '3306',
        user: connectUser,
        password: connectPassword,
        database: ''
    });

    // Connexion a la BD
    connexion.connect();

    var messageConnexion = `vous êtes connecté sous user ${connectUser} et avec l'hôte ${connectHost}`
    console.log('ligne 59 \n' + messageConnexion)
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.render('Home.ejs', { messageConnexion: messageConnexion });
});

/******************************
**********   Vers la page home2.ejs   ***********
 ******************************/
app.get('/home2', function (req, res) {

    // On ne se reconnect pas ici, on revient juste sur la page d'accueil sans modifier la connexion

    var messageConnexion = `vous êtes connecté sous user ${connectUser} et avec l'hôte ${connectHost}`
    console.log('ligne 59 \n' + messageConnexion)
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.render('Home.ejs', { messageConnexion: messageConnexion });
});
/*************************************
**********   Affichage Home et liste des BD  ***********
 ************************************/

app.get('/choixBDconvert', function (req, res) {
    console.log('CONSOLE LIGNE 41: Vers la page Choix de la BD');
    optionsBD = '';         // <option> à insérer
    connexion.query(`SELECT DISTINCT TABLE_SCHEMA FROM  information_schema.tables WHERE TABLE_TYPE = 'BASE TABLE';`, function (err, rows, fields) {
        // Erreur
        if (err) {
            console.log('Erreur -1 : ' + err.code);
        }
        else { // Pas d'erreur
            for (i = 0; i < rows.length; i++) { // Boucle pour afficher la liste des BD dans des <option>
                //console.log(rows[i])
                //console.log(rows[i].TABLE_SCHEMA)
                optionsBD += `<option value='${rows[i].TABLE_SCHEMA}'>${rows[i].TABLE_SCHEMA}</option>`
            }
            //console.log(rows.TABLE_SCHEMA)
            //console.log(rows)
            //console.log(fields)
        } // else

        res.setHeader('Content-Type', 'text/html; charset=utf-8');
        res.render('choixBDconvert.ejs', { optionsBD: optionsBD });
    }); /// query


}); // get

//-------------------------------------------------------------------------------------------

/*************************************************
**********   Affichage choixTableConvert et les listes   **********
 *************************************************/

app.post('/choixTableConvert', function (req, res) {
    console.log('CONSOLE LIGNE 71: Vers la page Choix de la Table');
    optionsTables = '';
    BDchoisie = req.body.bd_name;
    optionsBD = '';         // <option> à insérer


    /*******************
     *   Liste des BD  *
     ******************/

    connexion.query(`SELECT DISTINCT TABLE_SCHEMA FROM  information_schema.tables WHERE TABLE_TYPE = 'BASE TABLE';`, function (err, rows, fields) {
        // Erreur
        if (err) {
            console.log('Erreur -1 : ' + err.code);
        }
        else { // Pas d'erreur
            for (i = 0; i < rows.length; i++) { // Boucle pour afficher la liste des BD dans des <option>
                optionsBD += `<option value='${rows[i].TABLE_SCHEMA}'>${rows[i].TABLE_SCHEMA}</option>`
            } // for
        } // else

        /***********************
         *   Liste des Tables  *
         **********************/

        connexion.query(`SELECT TABLE_NAME, TABLE_TYPE FROM  information_schema.tables WHERE TABLE_SCHEMA = ?;`, BDchoisie, function (err, rows) {
            // Erreur
            if (err) {
                console.log('Erreur -1 : ' + err.code);
            }
            else { // Pas d'erreur
                // Nom de la table à convertir
                var nomTable;

                for (i = 0; i < rows.length; i++) {
                    nomTable = rows[i].TABLE_NAME;
                    if (rows[i].TABLE_TYPE == 'BASE TABLE') {
                        optionsTables += `<option value='${nomTable}' style= "color: red;">${nomTable} (Table)</option>`
                    } else if (rows[i].TABLE_TYPE == 'VIEW') {
                        optionsTables += `<option value='${nomTable}'>${nomTable} (View)</option>`
                    }

                    connexion.query(`SELECT * FROM  ? WHERE TABLE_SCHEMA = ?;`, nomTable, function (err, rows) {

                    }) // query for
                } // for
                res.setHeader('Content-Type', 'text/html; charset=utf-8');
                res.render('choixTableConvert.ejs', { optionsBD: optionsBD, BDchoisie: BDchoisie, optionsTables: optionsTables });
            } // else
        }); /// query 2 (Tables)
    }); /// query 1 (BD)    

}); //post

/************************************************
**********   CONVERSION DE LA TABLE + PAGE VALIDATION   **********
 ************************************************/

app.post('/validationConvert', function (req, res) {

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
            const fs = require("fs");
            //var nomTable = fields[0].table
            if (formatToConvert === 'txt' || formatToConvert === 'csv') {

                /************************************
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
                message = `Table ${tableChoisie} convertis en fichier table_${tableChoisie}.${formatToConvert}`
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
                message = `Table ${tableChoisie} convertis en fichier table_${tableChoisie}.${formatToConvert}`

            } // else if Json

            else { // format non sélectionné
                message = "veuillez sélectionner un format dans lequel convertir"

            }

        } // else pas d'erreur

        res.setHeader('Content-Type', 'text/html; charset=utf-8');
        res.render('validationConvert.ejs', { message: message });
    }); /// query Sélection de la Table à modifier

}); //post conversion

//-------------------------------------------------------------------------------------------
///////////////////////////////     insertFichierIntoBD     /////////////////////////////////

app.get('/choixBDinsert', function (req, res) {
    console.log('CONSOLE LIGNE 337: Vers la page Choix de la BD');
    optionsBD = '';         // <option> à insérer
    connexion.query(`SELECT DISTINCT TABLE_SCHEMA FROM  information_schema.tables WHERE TABLE_TYPE = 'BASE TABLE';`, function (err, rows, fields) {
        // Erreur
        if (err) {
            console.log('Erreur -1 : ' + err.code);
        }
        else { // Pas d'erreur
            for (i = 0; i < rows.length; i++) { // Boucle pour afficher la liste des BD dans des <option>
                //console.log(rows[i])
                //console.log(rows[i].TABLE_SCHEMA)
                optionsBD += `<option value='${rows[i].TABLE_SCHEMA}'>${rows[i].TABLE_SCHEMA}</option>`
            }
            //console.log(rows.TABLE_SCHEMA)
            //console.log(rows)
            //console.log(fields)
        } // else

        res.setHeader('Content-Type', 'text/html; charset=utf-8');
        res.render('choixBDinsert.ejs', { optionsBD: optionsBD });

    }); /// query
}); // get

//-------------------------------------------------------------------------------------------

/*************************************************
**********   Affichage choixTableConvert et les listes   **********
 *************************************************/

app.post('/choixTableInsert', function (req, res) {
    console.log('CONSOLE LIGNE 71: Vers la page Choix de la Table');
    optionsTables = '';
    BDchoisie = req.body.bd_name;
    optionsBD = '';         // <option> à insérer

    /*******************
     *   Liste des BD  *
     ******************/

    connexion.query(`SELECT DISTINCT TABLE_SCHEMA FROM  information_schema.tables WHERE TABLE_TYPE = 'BASE TABLE';`, function (err, rows, fields) {
        // Erreur
        if (err) {
            console.log('Erreur -1 : ' + err.code);
        }
        else { // Pas d'erreur
            for (i = 0; i < rows.length; i++) { // Boucle pour afficher la liste des BD dans des <option>
                optionsBD += `<option value='${rows[i].TABLE_SCHEMA}'>${rows[i].TABLE_SCHEMA}</option>`
            } // for
        } // else

        /***********************
         *   Liste des Tables  *
         **********************/

        connexion.query(`SELECT TABLE_NAME, TABLE_TYPE FROM  information_schema.tables WHERE TABLE_SCHEMA = ?;`, BDchoisie, function (err, rows) {
            // Erreur
            if (err) {
                console.log('Erreur -1 : ' + err.code);
            }
            else { // Pas d'erreur
                // Nom de la table à convertir
                var nomTable;

                for (i = 0; i < rows.length; i++) {
                    nomTable = rows[i].TABLE_NAME;
                    if (rows[i].TABLE_TYPE == 'BASE TABLE') {
                        optionsTables += `<option value='${nomTable}' style= "color: red;">${nomTable} (Table)</option>`
                    } else if (rows[i].TABLE_TYPE == 'VIEW') {
                        optionsTables += `<option value='${nomTable}'>${nomTable} (View)</option>`
                    }

                    connexion.query(`SELECT * FROM  ? WHERE TABLE_SCHEMA = ?;`, nomTable, function (err, rows) {

                    }) // query for
                } // for
                res.setHeader('Content-Type', 'text/html; charset=utf-8');
                res.render('choixTableInsert.ejs', { optionsBD: optionsBD, BDchoisie: BDchoisie, optionsTables: optionsTables });
            } // else
        }); /// query 2 (Tables)
    }); /// query 1 (BD)

}); //post

//-------------------------------------------------------------------------------------------

app.post('/validationInsert', function (req, res) {
    // var nomTable = 'villes_bis';
    // var nomFichier = 'table_villes.csv';
    // var separateur = ',';

    var message;

    var nomColonne = "";        // donne les nom de colonne dans le sql
    var numberValues = "";      // ajoute les ?,?,? dans les values SQL
    var tabData;                // donne les values à ajouter au ?,?,?

    var nomTable = req.body.table_name;
    var nomFichier = req.body.nomFichier;
    var separateur = req.body.separateur;
    console.log("nomFichier:")
    console.log(nomFichier)

    if (fs.existsSync(nomFichier)) {                    // tester l'existence d'un fichier
       
        /****************************
        *    FICHIER TXT ou CSV     *
        ****************************/

        if (nomFichier.endsWith('txt') || nomFichier.endsWith('csv')) {      // code conversion TXT et CSV
            const data = fs.readFileSync(nomFichier).toString();   // lire le fichier, renvoi un objet, on le transforme en 'string'
        // console.log("data, ligne 39 :\n" + data);
        // console.log("typeOf data, ligne 40 :\n" + typeof data);     // renvoi un Objet

            var tabRow = data.split('\n')           // sépare sur les retour à la ligne
            // console.log(`tabRow, ligne 44:\n`)      // crée un tableau de string avec chque lignes
            // console.log(tabRow)

            for (let i = 0; i < tabRow.length; i++) {   // boucle dans le tableau de lignes

                if (i == 0) {  // choisi les nom de colonne où ajouter les valeurs
                    tabData = tabRow[i].trim().split(separateur)   // sépare sur le point-virgule
                    // console.log(`tabData, ligne 455:`)
                    // console.log(tabData)
                    for (let k = 0; k < tabData.length; k++) {  // Boucle dans chaque ligne
                        if (k == 0) {
                            numberValues += "?"               // ajoute les ?,?,? dans les values SQL
                        } else {
                            numberValues += ", ?"
                        } // if, else ?,?,?

                        if (k == 0) {
                            nomColonne += tabData[k].trim();       // ajoute les nom des colonnes au sql
                        } else {
                            nomColonne += `, ${tabData[k].trim()}`;
                        }
                    } // for colonne
                } // if nom de colonne

                else {  // enregistre les datas des lignes à insérer
                    var tabData = tabRow[i].trim().split(separateur)   // sépare sur le point-virgule
                    // console.log(`tabData, ligne 74:`)
                    // console.log(tabData)
                } // else data des rows

                // console.log(`nomColonne, ligne 78:`)
                // console.log(nomColonne)

                // console.log(`numberValues, ligne 82:`)
                // console.log(numberValues + '\n')

                /************************
                *   REQUÊTE TO MYSQL    *
                ************************/

                if (i > 0) {       // ne renvoi pas le nom des colonnes mais justes les datas
                    // insert les données des lignes 1 par 1 à chaque boucle
                    sql = `INSERT INTO ${BDchoisie}.${nomTable} (${nomColonne}) VALUES (${numberValues})`;
                    connexion.query(sql, tabData, function (err, rows, fields) {
                        if (err) { // Erreur !!!
                            console.log('\nErreur d\'exécution de la requête !' + err);
                        } // if Pas d'erreur
                        else {  // Pas d'erreur
                            message = `Les données ont été inséré dans la Base de Données: ${BDchoisie}, dans la table: ${nomTable}`
                            // console.log("message")
                            // console.log(message)
                        }
                    }); // query
                } // if ( i > 0 )

                // console.log("message ligne 503")
                // console.log(message)
            } // for boucle dans le tableau de lignes

            // console.log("message ligne 507")
            // console.log(message)
        } // if TXT ou CSV

        /********************
        *   FICHIER JSON    *
        ********************/

        else if (nomFichier.endsWith('json')) {        // code conversion JSON
            
            const data = JSON.parse(fs.readFileSync(nomFichier));   // lire le fichier, renvoi un objet, on le transforme en 'string'

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

        } // else if JSON

        else { // ni TXT, ni CSV, ni JSON
            message = `le type de fichier n'est pas pris en charge`
            console.log(message)
        }
    } else { // le fichier n'existe pas ou le nom est incorrect
        message = `le fichier « ${nomFichier} » n'existe pas, ou le nom est incorrect`
        console.log(message)
    } // fs.existsSync(nomFichier)

    console.log("message ligne 524")
    console.log(message)
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.render('validationInsert.ejs', { message: message });
}); //post validationInsert
//-------------------------------------------------------------------------------------------

// ... Tout le code de gestion des routes (app.get) se trouve au-dessus
app.use(function (req, res, next) {
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.status(404).send('Page introuvable !');
});

app.listen(8081);
console.log("Le serveur tourne sur http://localhost:8081");

// connexion.end();