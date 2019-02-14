const express = require("express");
const app = express();
const cookieParser = require('cookie-parser');
const bodyParser = require("body-parser");
const PORT = 8080 // default port 8080


app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser())

app.set("view engine", "ejs");

let urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
 "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
}

function generateRandomString() {
  let randomString="";
  let characterSet = "abcdefghijklmnopqrstyuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  for(let i = 0; i <= 5; i++){
    randomString += characterSet.charAt(Math.floor(Math.random() * characterSet.length));
  }
  return randomString;
}

app.post("/register", (req, res) =>{
  console.log(req.body)
  let randomId = generateRandomString();
  if(!req.body.email || !req.body.password){
    res.status(400).end("missing input");
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
    password: req.body.password
  }
  res.cookie("used_id", randomId)
  console.log(users);
  res.redirect(`/urls`);
})

//post that handles login
app.post("/login", (req, res) => {

  let emailFlag = true;

  for (let eachUser in users){
    if (users[eachUser].email === req.body.email){
        console.log("email match found");
        if (users[eachUser].password === req.body.password){
          res.cookie("used_id", users[eachUser].id)
          res.redirect(`/urls`);
        } else {
          res.status(403).end("Incorrect Password")
        }
    } else {
      emailFlag = false;
    }
  }
  if(!emailFlag){
    res.status(403).end("Email does not exist")
  }
})
//post that logs user out, removes cookie
app.post("/logout", (req, res) =>{
  res.clearCookie("used_id");
  res.redirect(`/urls`)
})

//creates a random string associated with a given long URL
app.post("/urls", (req, res) => {
  let randomString = generateRandomString();
  urlDatabase[randomString] = req.body.longURL; // Log the POST request body to the console
  res.redirect(`/urls/${randomString}`);
});

//deletes link from list
app.post("/urls/:shortURL/delete", (req, res) =>{
  delete urlDatabase[req.params.shortURL];
  res.redirect(`/urls`)
})

//updates short url be associated with a new given long URL from user
app.post("/urls/:shortURL/update", (req, res) =>{
  urlDatabase[req.params.shortURL] = req.body.newLongURL;
  res.redirect(`/urls`)
})

//login page
app.get("/login", (req, res) => {
  let user = req.cookies["used_id"]
    let templateVars = {
     urls: urlDatabase,
     "user": users[user]
  }
  res.render("login", templateVars);
});

//register page
app.get("/register", (req, res) => {
    let user = req.cookies["used_id"]
    let templateVars = {
     urls: urlDatabase,
     "user" : users[user]
  }
  res.render("registration", templateVars);
});

//redirects user from short url to associated long url
app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

app.get("/", (req, res) =>{
  res.send("Hello!")
});

app.get("/urls/new", (req, res) => {
    let user = req.cookies["used_id"]
    let templateVars = {
     urls: urlDatabase,
     "user": users[user]
  }
  res.render("urls_new", templateVars);
});

//displays all given urls
app.get("/urls", (req, res) =>{
  let user = req.cookies["used_id"]
  let templateVars = {
    urls: urlDatabase,
    "user": users[user]
  }
  res.render("urls_index", templateVars)
});

app.get("/urls/:shortURL", (req, res) => {
  let user = req.cookies["used_id"]
  let templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL],
    "user": users[user]
  }
  res.render("urls_show", templateVars)
});

app.get("/urls.json", (req,res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b><body></html>\n")
});

app.listen(PORT, () =>{
  console.log(`TinyApp listening on port ${PORT}!`);
});

//