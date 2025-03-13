const express = require("express");
const session = require("express-session");
const axios = require("axios");
const app = express();
const multer = require("multer");
const path = require("path");

app.set("views", path.join(__dirname, "/views"));
app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, "/public")));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(
  session({ secret: "mysession", resave: false, saveUninitialized: true })
);

const url = "http://node76879-env-112.proen.app.ruk-com.cloud:11855";
// const url = "http://localhost:3000";

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./public/images");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + file.originalname);
  },
});
const upload = multer({ storage: storage });

app.get("/", async (req, res) => {
    res.render("index.ejs", {
      });
});

app.get("/createuser", async (req, res) => {
    res.render("createUser.ejs")
});

app.post("/createuser", async (req,res) => {
  try{
    const {username,email,password} = req.body;
    const response = await axios.post(url + "/createuser",{username:username,email:email,password:password});
    if (response.status == 200) {
      res.redirect("/");
    }
  }
  catch(err) {
    res.status(500).send(err);
  }
});

app.post("/login", async (req,res) => {
  try{
    const {username,password} = req.body;
    const response = await axios.post(url + "/login",{username:username,password:password});
    if (response.status == 200) {
      req.session.login = response.data;
      if (response.data.login == true) {
        res.redirect("/home");
      }
      else {
        res.redirect("/"); 
      } 
    }
  }
  catch(err) {
    res.status(500).send(err);
  }
});

app.get("/logout",(req,res) => {
  req.session.login = {};
  res.redirect("/");
});

app.get("/home", async (req,res) => {
  try{
    const response2 = await axios.get(url + "/getallgame");
    res.render("home.ejs",{gamedata:response2.data,datalogin:req.session.login});
  }
  catch(err) {
    res.status(500).send(err);
  }
});

app.get("/insertgame",(req,res) => {
  res.render("insertgame.ejs");
});

app.post("/insertgame", async (req,res) => {
  try{
    const {gamename,urlimage,publisher} = req.body;
    const response = await axios.post(url + "/insertgame",{gamename:gamename,urlimage:urlimage,publisher:publisher});
    if (response.status == 200) {
      res.redirect("/home");
    }
  }
  catch(err) {
    res.status(500).send(err);
  }
});

app.get("/editgame",async (req,res) => {
  try{
    const response = await axios.get(url + "/getallgame");
    res.render("managegame.ejs",{gamedata:response.data});
  }
  catch(err) {
    res.status(500).send(err);
  }
});

app.get("/editgame/:id", async (req,res) => {
  try{
    const response = await axios.get(url + "/getgame/" + req.params.id);
    if (response.status == 200) {
      res.render("editgame.ejs",{gamedata:response.data});
    }
  }
  catch(err) {

  }
});

app.post("/editgame/:id", async (req,res) => {
  try{
    const {gamename,urlimage,publisher} = req.body;
    const response = await axios.put(url + "/editgame/" + req.params.id ,{gamename:gamename,urlimage:urlimage,publisher:publisher});
    if (response.status == 200) {
      res.redirect("/editgame");
    }
  }
  catch(err) {
    res.status(500).send(err);
  }
});

app.get("/deletegame/:id", async (req,res) => {
  try{
    const response = await axios.delete(url + "/deletegame/" + req.params.id);
    if (response.status == 200) {
      res.redirect("/editgame");
    }
  }
  catch(err) {
    res.status(500).send(err);
  }
});

app.get("/managepayment", async (req,res) => {
  const response = await axios.get(url + "/getallpromotion");
  const response2 = await axios.get(url + "/getallpayment");
  const response3 = await axios.get(url + "/getpaymentpromotion");

  res.render("managepayment.ejs",{promotiondata:response.data,paymentdata:response2.data,paymentpromotiondata:response3.data});
});

app.post("/createpromotion", async (req,res) => {
  try{
    const {promo_name,discount,promo_start,promo_end} = req.body;
    const response = await axios.post(url + "/createpromotion",{promo_name:promo_name,discount:discount,promo_start:promo_start,promo_end:promo_end});
    if (response.status == 200) {
     res.redirect("/managepayment"); 
    }
  }
  catch(err) {
    res.status(500).send(err);
  }
});

app.post("/createpayment", async (req,res) => {
  try{
    const {payment_metod,promotion_id} = req.body;
    const response = await axios.post(url + "/createpayment",{payment_metod:payment_metod,promotion_id:promotion_id});
    if (response.status == 200) {
      res.redirect("/managepayment");
    }
  }
  catch(err) {
    res.status(500).send(err);
  }
});

app.post("/changepromotion/:id", async (req,res) => {
  try{
    const {promotion_id} = req.body;
    const response = await axios.post(url + "/changepromotion/" + req.params.id,{promotion_id:promotion_id});
    if (response.status == 200) {
      res.redirect("/managepayment");
    }
  }
  catch(err) {
    res.status(500).send(err);
  }
});

app.get("/deletepayment/:id", async (req,res) => {
  try{
    const response = await axios.delete(url + "/deletepayment/" + req.params.id);
    if (response.status == 200) {
      res.redirect("/managepayment");
    }
  }
  catch(err) {
    res.status(500).send(err);
  }
});

app.get("/game/:id", async (req,res) => {
  try{
    const response = await axios.get(url + "/getgame/" + req.params.id);
    const response2 = await axios.get(url + "/getpaymentpromotion");
 
    res.render("game.ejs",{datalogin:req.session.login,gamedata:response.data,paymentpromotion:response2.data});
  }
  catch(err) {
    res.status(500).send(err);
  }
});

app.get("/cart", async (req,res) => {
  try{
    const response = await axios.get(url + "/getcart/" + req.session.login.userid);
    if (response.status == 200) {
      res.render("cart.ejs",{datalogin:req.session.login,cartdata:response.data}); 
    } 
  } 
  catch(err) {
    res.status(500).send(err);
  }
});

app.post("/insertcart/:gameid", async (req,res) => {
  try{
    const {payment,package} = req.body;
    const response = await axios.post(url + "/insertcart/" + req.params.gameid,{user:req.session.login,payment:payment,package:package});
    if (response.status == 200) {
      res.redirect("/cart");
    }
  }
  catch(err) {
    res.status(500).send(err);
  }
});

app.get("/deletecart/:id",async (req,res) => {
  try{
    const response = await axios.delete(url + "/deletecart/" + req.params.id);
    if (response.status == 200) {
      res.redirect("/cart");
    }
  }
  catch(err) {
    res.status(500).send(err);
  }
});

app.get("/pay", async (req,res) => {
  try{
    const response = await axios.delete(url + "/pay/" + req.session.login.userid);
    if (response.status == 200) {
      setTimeout(() => {
        res.redirect("/cart");
      },1000);
    }
  }
  catch(err) {
    res.status(500).send(err);
  }
});

// const PORT = process.env.PORT || 11855;
// app.listen(PORT, () => {
//     console.log(`Server is running on port http://node76880-env-112.proen.app.ruk-com.cloud:${PORT}/`);
// });

app.listen(5500, () => {
    console.log(`Server is running on  http://node76879-env-112.proen.app.ruk-com.cloud:11856`);
  });