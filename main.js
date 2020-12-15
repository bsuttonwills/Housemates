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

//task pages
app.get('/addTask', function(req, res){
    res.render('pages/addTask');
});

app.post('/taskInsert', async function(req, res){
    let rows = await insertTask(req.body)
    console.log(rows)

    let message = "Error Submitting Task.";
    if (rows.affectedRows > 0) {
        console.log("Task Submitted");
    }
    res.render('pages/addTask');

})
//end of task pages

//LOGIN pages
app.get('/login', function(req, res){
    let message = ""
    res.render('pages/login', {"message": message});
});

app.post('/loginAction',async function(req, res){
    let isUser = await checkUsers(req.body);
    let message = "";
    var list = require('./testTask.json')

    //if no users returned, signup. else change message
    if (isUser.length == 0 || isUser == undefined){
        message = "Account does not exist.";
        res.render('pages/login', {"message": message})

    } else if (isUser[0].password === req.body.password){
        groupList = await groupTasks(isUser[0].group_name)
        res.render('pages/taskPage.ejs', {tasks: groupList, userInfo:isUser})

    } else {
        message = "Username or Password is incorrect."
        res.render('pages/login', {"message": message})
    }



});

//END of login pages

//Joining a group Pages

app.get('/joinGroup', function(req, res){
    let message = ""
    res.render('pages/joinGroup', {"message":message});
});

app.post('/addToGroup', async function(req, res) {
    let message = ""

    let rows = await joinGroup(req.body)
    console.log(rows)

    message = "You have failed to join a group."
    if (rows.affectedRows > 0) {
        message = "You have successfully joined a group!";
    }
    res.render('pages/joinGroup', {"message":message});

})

//End of joining a group pages

//Sign UP Pages
app.get('/signup', function(req, res){
    let message = ""
    res.render('pages/signup', {"message":message});
});

app.post('/signUpUser', async function(req, res) {
    let isUser = await checkUsers(req.body);
    let message = "";
    // let rows;
    var list = require('./testTask.json')

    //if no users returned, signup. else alert
    if (isUser.length == 0 || isUser == undefined){
        let rows = await signUpUser(req.body);

        //if user succesfully inserted
        if (rows.affectedRows > 0) {
            message= "User was successfully created!";
            res.render('pages/taskPage.ejs', {tasks: list.Tasks})
            return;
        }
    } else {
        message = "User was not created. Account already exists.";
        // console.log("isUser empty: ", false)
    }
    // console.log("isUser: ", isUser)

    // console.log(rows)


    res.render('pages/signup', {"message":message});


})

//END of Sign Up Pages



//Create Group Page Stuff
app.get('/group', function(req, res){
    let message = ""
    res.render('pages/createGroup', {"message":message});
});

app.post('/createAGroup', async function(req, res) {
    let message = "Group WAS NOT created!";
    //Checks if group already exists
    let flag = await ifExist('groups', 'group_Name', req.body.gName)
    //Runs this scope is the group does not exist
    if(flag) {
        let rows = await createGroup(req.body)
        let join = await joinGroup(req.body)
        //creating a group should also make the user join it
        console.log(rows)

        if (rows.affectedRows > 0 && join.affectedRows > 0) {
            message = "You have created and joined group " + req.body.gName;
        }
    }
    //Appends message if the group exists
    else
        message = message + " " + req.body.gName + " already exists!"
    res.render('pages/createGroup', {"message":message});
})

//JOIN GROUP FUNCTION
function joinGroup(body){

    let conn = dbConnection();

    return new Promise(function(resolve, reject){
        conn.connect(function(err) {
            if (err) throw err;
            console.log("Connected!");

            let sql = `UPDATE users
                        set group_name =?
                        WHERE username =? `;

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
//END OF JOIN GROUP FUNCTION

//This serves as a test site, NO LINKS DIRECT HERE!
app.get('/grouptasks', function(req, res){
    //TODO: This is a test file, replace this once the database is connected
    /*
    The file may not reflect the final structure so the variables might
    needed to be renamed in order to work.
    */
    var list = require('./testTask.json')
    res.render('pages/taskPage.ejs', {tasks: list.Tasks})
})

//END of Create group Pages

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

// GET USERS FUNCTION
function checkUsers(body){
    let conn = dbConnection();

    return new Promise(function(resolve, reject){
        conn.connect(function(err) {
            if (err) throw err;
            console.log("Get Users Connected");

            let sql = `SELECT * FROM users WHERE username = ?;`;
            let params = [body.username]
            conn.query(sql, params, function (err, rows) {
                if (err) throw err;

                conn.end();
                resolve(rows);
            });

        })
    })
}

//Get Group Tasks
function groupTasks(gName){
    let conn = dbConnection();

    return new Promise(function(resolve, reject){
        conn.connect(function(err) {
            if (err) throw err;
            console.log("Get group tasks Connected");

            let sql = `SELECT * FROM tasks WHERE group_name = ?;`;
            let params = [gName]
            conn.query(sql, params, function (err, rows) {
                if (err) throw err;

                conn.end();
                resolve(rows);
            });

        })
    })
}


//SIGN UP NEW USER FUNCTION
function signUpUser(body){
   
    let conn = dbConnection();
     
     return new Promise(function(resolve, reject){
         conn.connect(function(err) {
            if (err) throw err;
            console.log("Connected signup!");
         
            let sql = `INSERT INTO users
                         (username, password)
                          VALUES (?,?)`;
         
            let params = [body.username, body.password];
            conn.query(sql, params, function (err, rows, fields) {
               if (err) throw err;
               //res.send(rows);
               conn.end();
               resolve(rows);
            });
         
         });//connect
     });//promise 
 }
//END OF SIGN UP NEW USER FUNCTION


//INSERT NEW TASK FUNCTION
function insertTask(body){
    let connection = dbConnection();

    return new Promise(function(resolve, reject){
        connection.connect(function(err) {
            if (err) throw err;
            console.log("Insert Task Connected!");

            let sql = `INSERT INTO tasks
                            (title, type, location, time, date, description)
                            VALUES (?,?,?,?,?,?)`;

            let hour = body.hour;
            let fullTime = hour.concat(":", body.minute, body.day_night);

            let params = [body.title, body.type, body.location, fullTime, body.date, body.desc];
            connection.query(sql, params, function (err, rows, fields) {
                if (err) throw err;
                //res.send(rows);
                connection.end();
                resolve(rows);
            });

        });//connect
    });//promise
}


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
                        username varchar(20) NOT NULL,
                        password varchar(20) NOT NULL,
                        group_name varchar(50) NOT NULL,
                        leader bool NOT NULL DEFAULT "0",
                        PRIMARY KEY(id)
                        );`
    connection.query(createUsers, function (err, rows, fields) {
        if (err) {
            throw err
        }
    })


    // var droptasks = `DROP TABLE IF EXISTS tasks;`
    // connection.query(droptasks, function (err, rows, fields) {
    //     if (err) {
    //     throw err
    //     }
    // })
    //code to create the tasks table
    var createTasks = `CREATE TABLE IF NOT EXISTS tasks
                        (id int NOT NULL AUTO_INCREMENT,
                        title varchar(20) NOT NULL,
                        type varchar(20) NOT NULL,
                        location varchar(100) NOT NULL,
                        time varchar(7) NOT NULL,
                        date varchar(10) NOT NULL,
                        description varchar(500) NOT NULL,
                        PRIMARY KEY(id));`
    connection.query(createTasks, function (err, rows, fields) {
        if (err) {
            throw err
        }
    })


    connection.end()
}

//Checks if a certain element exists in the table specified
async function ifExist(table, identifier, name){
    let connection = dbConnection();
    let sql = 'select * from ' + table + ' WHERE ' + identifier + ' = \'' + name + '\';'
    let promise = new Promise((resolve, reject) => {
        connection.connect(function(err) {
            if (err) throw err

            connection.query(sql, function (err, result){
                if (err) throw err

                connection.end()
                resolve(result.length)
            })
        })
    })

    let num = await promise
    return num === 0
}

dbSetup()



app.listen(port, () => {
    console.log(`App listening on port ${port}...`)
});