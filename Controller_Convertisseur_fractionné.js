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


var convertToTxtCsv = require('./public/js/moduleConvert.js');


var connexion;
var connectHost;
var connectPort; // port du server mySQL
var connectUser;
var connectPassword;

var BDchoisie;


/*****************************************************************************************************
********                                /   -   homeConnect.ejs                               ********
*****************************************************************************************************/

// http://localhost:8081/
app.get('/', function (req, res) {
    var title = "homeConnect";

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.render('homeConnect.ejs', { title: title });
});


/*****************************************************************************************************
********                                /menu   -   menu.ejs                                  ********
********                                                                                      ********
********                    Direction vers le menu après la requête de conexion               ********
*****************************************************************************************************/

app.get('/menu', function (req, res) {
    var title = "menu";

    // récupération des données du formulaire GET
    connectHost = req.query.host
    connectPort = req.query.port
    connectUser = req.query.user
    connectPassword = req.query.password

    connexion = mysql.createConnection({
        host: connectHost,
        port: connectPort,
        user: connectUser,
        password: connectPassword,
        database: ''
    });

    // Connexion a la BD
    connexion.connect();

    var messageConnexion = `vous êtes connecté sous user ${connectUser} et avec l'hôte ${connectHost}`
    
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.render('menu.ejs', { messageConnexion: messageConnexion, title: title });
});


/*****************************************************************************************************
********                                /menu2   -   menu.ejs                                 ********
********                                                                                      ********
********    Redirection vers le menu en gardant les identifiant donc sans faire de requête    ********
*****************************************************************************************************/

app.get('/menu2', function (req, res) {
    var title = "menu2";

    // On ne se reconnect pas ici, on revient juste sur la page d'accueil sans modifier la connexion

    var messageConnexion = `vous êtes connecté sous user ${connectUser} et avec l'hôte ${connectHost}`
    
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.render('menu.ejs', { messageConnexion: messageConnexion, title: title });

}); // get /menu2





/*----------------------------------------------------------------------------------------------------
----------------                            EXPORTATION                               ----------------
----------------------------------------------------------------------------------------------------*/

/*****************************************************************************************************
********                        /bddExport   -   bddExport.ejs                                ********
********                                                                                      ********
********                    Affichage de la liste des BD disponibles                          ********
*****************************************************************************************************/

app.get('/bddExport', function (req, res) {
    var title = "bddExport";

    optionsBD = '';         // <option> à insérer
    connexion.query(`SELECT DISTINCT TABLE_SCHEMA FROM  information_schema.tables WHERE TABLE_TYPE = 'BASE TABLE';`, function (err, rows, fields) {
        // Erreur
        if (err) {  
            console.log('Erreur -1 : ' + err.code);
        }
        // Pas d'erreur
        else { 
            for (i = 0; i < rows.length; i++) { // Boucle pour afficher la liste des BD dans des <option>
                //console.log(rows[i])
                //console.log(rows[i].TABLE_SCHEMA)
                optionsBD += `<option value='${rows[i].TABLE_SCHEMA}'>${rows[i].TABLE_SCHEMA}</option>`
            }
        } // else

        res.setHeader('Content-Type', 'text/html; charset=utf-8');
        res.render('bddExport.ejs', { optionsBD: optionsBD, title: title });
    }); /// query

}); // get /bdExport


/*****************************************************************************************************
********                        /tableExport   -   tableExport.ejs                            ********
********                                                                                      ********
********    Affichage des tables d'où exporter les données + modif de la BD possible          ********
*****************************************************************************************************/

app.post('/tableExport', function (req, res) {
    var title = "tableExport";

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
                var rowBD = rows[i].TABLE_SCHEMA;
                if (BDchoisie == rowBD) {
                    optionsBD += `<option value='${rows[i].TABLE_SCHEMA}' selected>${rows[i].TABLE_SCHEMA}</option>`;
                } else {
                    optionsBD += `<option value='${rows[i].TABLE_SCHEMA}'>${rows[i].TABLE_SCHEMA}</option>`;
                }
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
                    // si c'est une "table", couleur = rouge / si c'est une "view", couleur = noir
                    if (rows[i].TABLE_TYPE == 'BASE TABLE') {
                        optionsTables += `<option value='${nomTable}' style= "color: red;">${nomTable} (Table)</option>`
                    } else if (rows[i].TABLE_TYPE == 'VIEW') {
                        optionsTables += `<option value='${nomTable}'>${nomTable} (View)</option>`
                    }

                    connexion.query(`SELECT * FROM  ? WHERE TABLE_SCHEMA = ?;`, nomTable, function (err, rows) {

                    }) // query for
                } // for
                res.setHeader('Content-Type', 'text/html; charset=utf-8');
                res.render('tableExport.ejs', { optionsBD: optionsBD, BDchoisie: BDchoisie, optionsTables: optionsTables, title: title });
            } // else
        }); /// query 2 (Tables)
    }); /// query 1 (BD)    

}); // post /tableExport


/*****************************************************************************************************
********                        /validationExport   -   menu.ejs                              ********
********                                                                                      ********
********                    Convertion de la table en fichier txt, csv, ou json               ********
*****************************************************************************************************/

app.post('/validationExport', function (req, res) {
    var title = "validationExport";

    convertToTxtCsv(req, res, connexion, BDchoisie);

    var messageConnexion = `Vous êtes connecté avec le user <span class="blue">« ${connectUser} »</span>  et sur le port <span class="blue">« ${connectPort} »</span> de l'hôte <span class="blue">« ${connectHost} »</span>`;

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.render('menu.ejs', { messageValidation: message, title: title, messageConnexion: messageConnexion });
}); //post /validationExport





/*----------------------------------------------------------------------------------------------------
----------------                            IMPORTATION                               ----------------
----------------------------------------------------------------------------------------------------*/

/*****************************************************************************************************
********                        /bddImport   -   bddImport.ejs                                ********
********                                                                                      ********
********                    Affichage de la liste des BD disponibles                          ********
*****************************************************************************************************/

app.get('/bddImport', function (req, res) {
    var title = "bddImport";

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
        res.render('bddImport.ejs', { optionsBD: optionsBD, title: title });

    }); /// query
}); // get /bddImport


/*****************************************************************************************************
********                        /tableImport   -   tableImport.ejs                            ********
********                                                                                      ********
********        Affichage des tables où importer les données + modif de la BD possible        ********
*****************************************************************************************************/

app.post('/tableImport', function (req, res) {
    var title = "tableImport";

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
                var rowBD = rows[i].TABLE_SCHEMA;
                if (BDchoisie == rowBD) {
                    optionsBD += `<option value='${rows[i].TABLE_SCHEMA}' selected>${rows[i].TABLE_SCHEMA}</option>`;
                } else {
                    optionsBD += `<option value='${rows[i].TABLE_SCHEMA}'>${rows[i].TABLE_SCHEMA}</option>`;
                }
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
                res.render('tableImport.ejs', { optionsBD: optionsBD, BDchoisie: BDchoisie, optionsTables: optionsTables, title: title });
            } // else
        }); /// query 2 (Tables)
    }); /// query 1 (BD)

}); // post /tableImport


/*****************************************************************************************************
********                        /validationImport   -   menu.ejs                              ********
********                                                                                      ********
********                Importation des données d'un fichier vers une table de BD             ********
*****************************************************************************************************/

app.post('/validationImport', function (req, res) {
    var title = "validationImport";

    var message;

    var nomColonne = "";        // donne les nom de colonne dans le sql
    var numberValues = "";      // ajoute les ?,?,? dans les values SQL
    var tabData;                // donne les values à ajouter au ?,?,?

    var nomTable = req.body.table_name;
    var nomFichier = req.body.nomFichier;
    var separateurImport = req.body.separateurImport;
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
                    tabData = tabRow[i].trim().split(separateurImport)   // sépare sur le point-virgule
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
                    var tabData = tabRow[i].trim().split(separateurImport)   // sépare sur le point-virgule
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
                            message = `<span class="red">Erreur d\'exécution de la requête ! Les données n'ont pas pu être inséré dans la Base de Données, Veuillez recommencer. \n Erreur:\n${err}</span>`
                            return message
                        } // if Pas d'erreur
                        else {  // Pas d'erreur
                            message = `<span class="green">Les données ont été inséré dans la Base de Données: <strong>${BDchoisie}</strong>, dans la table: <strong>${nomTable}</strong></span>`
                            // console.log("message ligne 350:")
                            // console.log(message)
                            return message
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
        }

    } else { // le fichier n'existe pas ou le nom est incorrect
        message = `le fichier « ${nomFichier} » n'existe pas, ou le nom est incorrect`
    } // fs.existsSync(nomFichier)

    var messageConnexion = `Vous êtes connecté avec le user <span class="blue">« ${connectUser} »</span>  et sur le port <span class="blue">« ${connectPort} »</span> de l'hôte <span class="blue">« ${connectHost} »</span> `;

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.render('menu.ejs', { messageValidation: message, title: title, messageConnexion: messageConnexion });
}); //post /validationImport

//----------------------------------------------------------------------------------------------------
// ... Tout le code de gestion des routes (app.get) se trouve au-dessus


/*****************************************************************************************************
********                        Page d'erreur si problème de connexion                        ********
*****************************************************************************************************/
app.use(function (req, res, next) {
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.status(404).send('Page introuvable !');
});

/*****************************************************************************************************
********                            Connexionau port du serveur                               ********
*****************************************************************************************************/
app.listen(8081);
console.log("Le serveur tourne sur http://localhost:8081");

// connexion.end();