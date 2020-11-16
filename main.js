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

app.get('/login', function(req, res){
    res.render('pages/login');
});

app.get('/signup', function(req, res){
    res.render('pages/signup');
});

app.get('/addTask', function(req, res){
    res.render('pages/addTask');
});

app.get('/group', function(req, res){
    let message = ""
    res.render('pages/createGroup', {"message":message});
});

app.get('/addMember', function(req, res){
    res.render('pages/addMember');
});

app.post('/createAGroup', async function(req, res) {
    let rows = await createGroup(req.body)
    console.log(rows)

    let message = "Group WAS NOT added to the database!";
    if (rows.affectedRows > 0) {
        message= "Group successfully created!";
    }
    res.render('pages/createGroup', {"message":message});
})


// CREATE GROUP FUNCTION

function createGroup(body){
   
    let conn = dbConnection();
     
     return new Promise(function(resolve, reject){
         conn.connect(function(err) {
            if (err) throw err;
            console.log("Connected!");
         
            let sql = `INSERT INTO groups
                         (group_name, leader_name)
                          VALUES (?,?)`;
         
            let params = [body.gName, body.uName];
            conn.query(sql, params, function (err, rows, fields) {
               if (err) throw err;
               //res.send(rows);
               conn.end();
               resolve(rows);
            });
         
         });//connect
     });//promise 
 }

// END OF CREATE GROUP FUNCTION




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
                        (id int NOT NULL AUTO_INCREMENT,
                        group_Name varchar(50) NOT NULL,
                        leader_name varchar(20) NOT NULL,
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
