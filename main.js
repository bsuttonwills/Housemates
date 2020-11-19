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

app.get('/addMember', function(req, res){
    res.render('pages/addMember');
});

//Sign UP Pages
app.get('/signup', function(req, res){
    let message = ""
    res.render('pages/signup', {"message":message});
});

app.post('/signUpUser', async function(req, res) {
    let rows = await signUpUser(req.body)
    console.log(rows)

    let message = "User was not created";
    if (rows.affectedRows > 0) {
        message= "User was successfully created!";
    }
    res.render('pages/signup', {"message":message});

})

//END of Sign Up Pages



//Create Group Page Stuff
app.get('/group', function(req, res){
    let message = ""
    res.render('pages/createGroup', {"message":message});
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

//SIGN UP NEW USER FUNCTION
function signUpUser(body){
   
    let conn = dbConnection();

    router.post('/register',(req,res)=>{
        const {name,email, password, password2} = req.body;
        let errors = [];
        console.log(' Name ' + name+ ' email :' + email+ ' pass:' + password);
        if(!name || !email || !password || !password2) {
            errors.push({msg : "Please fill in all fields"})
        }

    if(password !== password2) {
        errors.push({msg : "passwords dont match"});
    }

    //check if password is more than 6 characters
    if(password.length < 6 ) {
        errors.push({msg : 'password atleast 6 characters'})
    }
    if(errors.length > 0 ) {
        res.render('register', {
            errors : errors,
            name : name,
            email : email,
            password : password,
            password2 : password2})
    } else {
        //validation passed
        User.findOne({email : email}).exec((err,user)=>{
            console.log(user);
            if(user) {
                errors.push({msg: 'email already registered'});
                res.render('register',{errors,name,email,password,password2})
            } else {
                const newUser = new User({
                    name : name,
                    email : email,
                    password : password
                });

                //hash password
                bcrypt.genSalt(10,(err,salt)=>
                    bcrypt.hash(newUser.password,salt,
                        (err,hash)=> {
                            if(err) throw err;
                            //save pass to hash
                            newUser.password = hash;
                            //save user
                            newUser.save()
                                .then((value)=>{
                                    console.log(value)
                                    res.redirect('/users/login');
                                })
                                .catch(value=> console.log(value));

                        }));
            }
        })
         
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
                            (group_id, title, type, location, time, date, description)
                            VALUES (?,?,?,?,?,?,?)`;
            
            let params = [0, body.title, body.type, body.location, body.hour, body.date, body.desc];
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


    // var droptasks = `DROP TABLE IF EXISTS tasks;`
    // connection.query(droptasks, function (err, rows, fields) {
    //     if (err) {
    //     throw err
    //     } 
    // })
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
                        PRIMARY KEY(id));`
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
