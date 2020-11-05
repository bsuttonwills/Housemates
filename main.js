var express = require('express');
var app = express();
const mysql = require("mysql");
const bodyParser = require("body-parser");
const port = process.env.PORT || 8000;

app.set('view engine', 'ejs');
app.use(express.static(__dirname + '/public'));
app.use(bodyParser.json())
app.use(express.urlencoded({ extended: true}));


//Landing Page
app.get('/', function(req, res){
    res.render('pages/home');
});

app.get('/group', function(req, res){
    res.render('pages/createGroup');
});

app.get('/addMember', function(req, res){
    res.render('pages/AddMember');
});

function dbConnection(){
    let connection = mysql.createConnection({
        host: 'jsftj8ez0cevjz8v.cbetxkdyhwsb.us-east-1.rds.amazonaws.com',
        user: 'rbw5jv09wvech6vd',
        password: 'i1d9pzfc8c1f7ycb',
        database: 'sjj0wx967anmk2rx'
    })

    return connection
}

function dbSetup() {
    let connection = dbConnection();

    connection.connect()

    //create groups table
    var createGroups = `CREATE TABLE IF NOT EXISTS groups
                        (id int NOT NULL,
                        leader_id int NOT NULL,
                        PRIMARY KEY(id)
                        );`
    connection.query(createGroups, function (err, rows, fields) {
        if (err) {
            throw err
        }
    })

    var createUsers = `CREATE TABLE IF NOT EXISTS users
                        (id int NOT NULL AUTO_INCREMENT,
                        group_id int,
                        username varchar(20) NOT NULL,
                        password varchar(20) NOT NULL,
                        leader bool NOT NULL DEFAULT "0",
                        PRIMARY KEY(id), 
                        FOREIGN KEY(group_id) REFERENCES groups(id)
                        );`
    connection.query(createUsers, function (err, rows, fields) {
        if (err) {
        throw err
        }
    })

    //code to create the tasks table
    var createTasks = `CREATE TABLE IF NOT EXISTS tasks
                        (id int NOT NULL AUTO_INCREMENT,
                        group_id int NOT NULL,
                        title varchar(20) NOT NULL,
                        type varchar(20) NOT NULL,
                        location varchar(100) NOT NULL,
                        time varchar(7) NOT NULL,
                        date varchar(10) NOT NULL,
                        description varchar(500) NOT NULL,
                        PRIMARY KEY(id),
                        FOREIGN KEY(group_id) REFERENCES groups(id)
                        );`
    connection.query(createTasks, function (err, rows, fields) {
        if (err) {
        throw err
        } 
    })
    

    connection.end()
}
  
dbSetup()

  

app.listen(port, () => {
    console.log(`App listening on port ${port}...`)
});
