if(process.env.NODE_ENV !== 'production'){
    require('dotenv').config();
}


const express = require("express");
const app = express();
const mongoose  = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const ExpressError = require("./utils/ExpressError.js");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");




const listingRouter = require("./routes/listing.js");
const reviewRouter = require("./routes/review.js");
const userRouter = require("./routes/user.js");


app.set("view engine","ejs");
app.set("views",path.join(__dirname,"views"));

app.use(express.urlencoded({extended:true}));
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname,"/public")));

app.engine("ejs",ejsMate);

const dbUrl = process.env.ATLASDB_URL;

const store = MongoStore.create({
    
    mongoUrl : dbUrl,
    crypto : {
        secret : process.env.SECRET,
    },
    touchAfter : 24 * 3600,
});

store.on("error",()=>{
  console.log("ERROR in MONGO SESSION Store: "+ error);
});

const sessionOptions = {
   store,
   secret : process.env.SECRET,
   resave : false,
   saveUninitialized : true,
   cookie :{
     expires : Date.now() + 7 * 24 * 60 * 60 * 1000,
     maxAge : 1000 * 60 * 60 * 24 * 3 ,
     httpOnly : true,
   },
};

// app.get("/", (req,res)=>{
//     res.send("working");
// });



app.use(session(sessionOptions));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());




app.use((req, res, next) => {
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    res.locals.currUser = req.user;
    next();
});

// app.get('/demouser' , async (req, res) => {
//     let fakeUser = new User({
//         email : "student@gmail.com",
//         username : "delta-student",
//     });

//    let registerUser = await User.register(fakeUser,"helloworld");
//    res.send(registerUser);
// });

main().then(()=>{
    console.log("connected to db")
}).catch(err=>{
    console.log(err);
});
async function main(){
    await mongoose.connect(dbUrl);
}


app.listen(8080,()=>{
    console.log("listening on port 8080");
});







app.use("/listings" ,listingRouter);
app.use("/listings/:id/reviews",reviewRouter);
app.use("/",userRouter);

//Post Review route


// app.get("/testListing", async(req,res)=>{
//     let sampleListing = new Listing({
//         title: "My new villa",
//         image : "http://asdasfsgfargqgtweregtrw",
//         description: "by the beach",
//         price : 1200,
//         location: " Goa",
//         country : "India",
//     });
  
//     await sampleListing.save();
//     console.log("sample was save");
//     res.send("successful testting");

// });

app.all("*",(req,res,next)=>{
 next(new ExpressError(404, "page not found"));
});

app.use((err,req,res,next)=>{
   let {statusCode=500, message="Something Went wrong"} = err;
   res.render("error.ejs",{message});
   //res.status(statusCode).send(message);
});