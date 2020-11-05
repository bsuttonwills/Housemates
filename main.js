var express = require('express');
var app = express();

const port = process.env.PORT || 8000;

app.set('view engine', 'ejs');
app.use(express.static(__dirname + '/public'));


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



//starting server
app.listen(port, () => {
    console.log(`Example app listening on port ${port}!`)
  });
 