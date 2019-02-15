const express = require("express");
const app = express();

const bodyParser = require("body-parser");
const bcrypt = require('bcrypt');
const PORT = 8080; // default port 8080
const cookieSession = require('cookie-session')

app.use(cookieSession({
  name: 'session',
  keys: ["random string for keys"],
}))

app.use(bodyParser.urlencoded({extended: true}));

app.set("view engine", "ejs");

let urlDatabase = {
  "1godsK": {longURL: "http://www.google.com", userID: "123456", date: "Fri Feb 15 2019"},
  "b2xVn2": {longURL: "http://www.lighthouselabs.ca", userID: "aJ48lW", date: "Fri Feb 15 2019"},
  "9sm5xK": {longURL: "http://www.google.com", userID: "aJ48lW", date: "Mon Feb 11 2019"},
};
const users = {
  "aJ48lW": {
    id: "aJ48lW",
    email: "user@example.com",
    password: '$2b$10$/nJhkyBZUh4xmEjivYQsu.4VnLg4LKMMNF0YSj2ktIlP370K4tT26'
  }
};


//creates a 6 digit string containing only alphanumeric characters
function generateRandomString() {
  let randomString="";
  let characterSet = "abcdefghijklmnopqrstyuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  for(let i = 0; i <= 5; i++){
    randomString += characterSet.charAt(Math.floor(Math.random() * characterSet.length));
  }
  return randomString;
}

/*filters through each url in url database and
only takes urls that match user id to display in urls page
used in app.get/urls */
function urlsForUser(id){
  let userURLs = {};
  for (eachURL in urlDatabase){
    if(id == urlDatabase[eachURL].userID){
      userURLs[eachURL] = {longURL: urlDatabase[eachURL].longURL, date: urlDatabase[eachURL].date}
    }
  }
  console.log(userURLs)
  return userURLs;
}

function dateMaker (){
  var d = new Date();
  var date = d.toString().split(" ")
  var arrayDate = [];
  arrayDate.push(date[0]);
  arrayDate.push(date[1]);
  arrayDate.push(date[2]);
  arrayDate.push(date[3]);
  var dateSentence = arrayDate.join(" ");
  return dateSentence;
}

/*post from registration page
redirects user to urls page if form is filled correctly,
otherwise redirects to page telling user what was wrong
*/
app.post("/register", (req, res) =>{

  let randomId = generateRandomString();
  if(!req.body.email || !req.body.password){
    res.status(400).end("Missing email or password input");
  } else if (req.body.email ){
    for ( let eachUser in users){
      if (users[eachUser].email === req.body.email){
        res.status(400).end("email already exists");
      }
    }
  }
  users[randomId] = {
    id: randomId,
    email: req.body.email,
    password: bcrypt.hashSync(req.body.password, 10)
  };
  req.session.user_id = randomId;
  res.redirect(`/urls`);
});

//post that handles login
app.post("/login", (req, res) => {
  let emailFlag = true;
  for (let eachUser in users){
    if (users[eachUser].email === req.body.email){
      if (bcrypt.compareSync(req.body.password, users[eachUser].password)){
        req.session.user_id = users[eachUser].id;
          res.redirect(`/urls`);
        } else {
          res.status(403).end("Incorrect Password");
        }
    } else {
      emailFlag = false;
    }
  }
  if(!emailFlag){
    res.status(403).end("Email does not exist");
  }
});
//post that logs user out, removes cookie
app.post("/logout", (req, res) =>{
  req.session = null;
  res.redirect(`/urls`);
});

//creates a random string associated with a given long URL
app.post("/urls", (req, res) => {
  let user = req.session.user_id;
  let randomString = generateRandomString();
  urlDatabase[randomString] = {"longURL":req.body.longURL, "userID": user, "date": dateMaker()};
  res.redirect(`/urls/${randomString}`);
});

//deletes link from list
app.post("/urls/:shortURL/delete", (req, res) =>{
  let user = req.session.user_id;
  if (!user || urlDatabase[req.params.shortURL].userID !== user){
    res.send("please login to delete url");
  } else {
  delete urlDatabase[req.params.shortURL];
  res.redirect(`/urls`);
  }
});

//updates short url be associated with a new given long URL from user
app.post("/urls/:shortURL/update", (req, res) =>{
  let user = req.session.user_id;
  if (!user || urlDatabase[req.params.shortURL].userID !== user){
    res.send("please login to update url");
  } else {
  urlDatabase[req.params.shortURL] = {"longURL":req.body.newLongURL, "userID": user, "date": dateMaker()};
  res.redirect(`/urls`);
  }
});

//login page
app.get("/login", (req, res) => {
  let user = req.session.user_id;
    let templateVars = {
     urls: urlDatabase,
     "user": users[user]
  };
  res.render("login", templateVars);
});

//register page
app.get("/register", (req, res) => {
  let user = req.session.user_id;
  if(user === undefined){
    let templateVars = {
     urls: urlDatabase,
     "user" : users[user]
  };
  res.render("registration", templateVars);
  } else {
    res.redirect(`/urls`)
  }
});

//redirects user from short url to associated long url
app.get("/u/:shortURL", (req, res) => {
  const fullURL = urlDatabase[req.params.shortURL].longURL;
  res.redirect(fullURL);
});


//homepage, prompts user to login, if already logged in brings to main url list page
app.get("/", (req, res) =>{
  let user = req.session.user_id;
  if(user === undefined){
    res.redirect(`/login`);
  } else {
    res.redirect(`/urls`);
  }
});

//page that contains update form
app.get("/urls/new", (req, res) => {
  let user = req.session.user_id;
    let templateVars = {
     urls: urlDatabase,
     "user": users[user]
  }
  if(user === undefined){
    res.redirect(`/login`);
  } else {
  res.render("urls_new", templateVars);
  }
});


//displays all given urls
app.get("/urls", (req, res) =>{
  let user = req.session.user_id
  let templateVars = {
    urls: urlsForUser(user),
    "user": users[user]
  }
  if(user === undefined){
    res.send("please login to correct account to view URLs")
  } else {
  res.render("urls_index", templateVars);
  }
});

//displays your individual url, redirects if user did not create this url
app.get("/urls/:shortURL", (req, res) => {

  let user = req.session.user_id;
  let templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL].longURL,
    "user": users[user],
    date: urlDatabase[req.params.shortURL].date
  }
  if (!user || urlDatabase[req.params.shortURL].userID !== user){
    res.send("please login to view url")
  }
  else {
  res.render("urls_show", templateVars);
  }
});

//displays url database
app.get("/urls.json", (req,res) => {
  res.json(urlDatabase);
});

//example page from beginning of project instructions
app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b><body></html>\n")
});

app.listen(PORT, () =>{
  console.log(`TinyApp listening on port ${PORT}!`);
});

//