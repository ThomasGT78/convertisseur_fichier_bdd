// Select1.js 

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

// Exécute une requête SQL de type SELECT 
connexion.query('SELECT * FROM pays', function (err, rows, fields) {
    var firstLine = "";
    function firstLinef() {
        for (i = 0; i < fields.length; i++) {
            if (firstLine == "") {
                firstLine = `${fields[i].name}`
            } else {
                firstLine += `;${fields[i].name}`
            }
        } // for
        return firstLine
    } // firstLinef

    var dataTab = "";
    function funcDataTab() {
        for (var i = 0; i < rows.length; i++) {  // boucle dans ROWS
            dataTab += `\n`;
            for (var k = 0; k < fields.length; k++) { //dans chaque ligne je boucle dans Fields pour récupérer le nom de la colonne
                if (dataTab.endsWith('\n')) {
                    var colonne = fields[k].name
                    console.log(rows)
                    console.log(fields)
                    console.log('\nColonne:');
                    console.log(colonne)
                    console.log(rows[i])
                    console.log(rows[i].id_pays)
                    console.log(rows[i][colonne])
                    dataTab += `${rows[i].colonne}` // enregistre la valeur de chaque colonne d'une ligne
                } 
                else {
                    var colonne = fields[k].name
                    // console.log(colonne)
                    // console.log(rows[i])
                    dataTab += `;${rows[i].colonne}` // SAME
                }
            } // for Fields
        } // for Rows
        return dataTab
    } // funcDataTab
    funcDataTab()

    // SI OK 
    if (!err) {
        // console.log('\nROWS :');
        console.log(rows);
        console.log('\ROWS[1] :');
        // console.log(rows[1]);
        // console.log('\nFIELDS :');
        console.log(fields);
        // console.log('\nFIELDS.LENGTH: \n' + fields.length);
        
        // console.log('\nfirstLine:');
        // console.log(firstLinef())
        // console.log(firstLine)

        console.log('\ndataTab:');
        //console.log(funcDataTab())
        console.log(dataTab)
    }
    // Si KO 
    else {
        console.log('\nErreur d\'exécution de la requête !' + err);
    }
});

// Déconnexion de la BD 
connexion.end();