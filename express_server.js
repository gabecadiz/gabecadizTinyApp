const express = require("express");
const app = express();
const PORT = 8080 // default port 8080

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));


app.set("view engine", "ejs");

let urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

function generateRandomString() {
  let randomString="";
  let characterSet = "abcdefghijklmnopqrstyuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  for(let i = 0; i <= 5; i++){
    randomString += characterSet.charAt(Math.floor(Math.random() * characterSet.length));
  }
  return randomString;
}

app.get("/", (req, res) =>{
  res.send("Hello!")
});

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

app.post("/urls", (req, res) => {
  let randomString = generateRandomString();
  urlDatabase[randomString] = req.body.longURL; // Log the POST request body to the console
  res.redirect(`/urls/${randomString}`);
});

app.post("/urls/:shortURL/delete", (req, res) =>{
  delete urlDatabase[req.params.shortURL];
  res.redirect(`/urls`)
})

app.post("/urls/:shortURL/update", (req, res) =>{
  urlDatabase[req.params.shortURL] = req.body.longURL;
  res.redirect(`/urls`)
})

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

app.get("/urls", (req, res) =>{
  let templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars)
});

app.get("/urls/:shortURL", (req, res) => {
  let templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL]}
  res.render("urls_show", templateVars)
});

app.get("/urls.json", (req,res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b><body></html>\n")
});

app.listen(PORT, () =>{
  console.log(`Example app listening on port ${PORT}!`);
});

//