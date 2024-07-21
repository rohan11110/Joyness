const User = require("../models/user");

module.exports.renderSignupForm =  (req, res) => {
    res.render("users/signup.ejs");
};

module.exports.signup = async(req, res) => {
    
    try{
        let {username , email, password} = req.body;
        const newUser = new User({email, username});
        const registerUser  = await User.register(newUser , password);
        req.login(registerUser,(err)=>{
            if(err){
                next(err);
            }
            req.flash("success" , "Welcome to WanderLust");
            res.redirect("/listings");
        });
        
    }catch(err) {
        req.flash("error" , err.message);
        res.redirect("/signup");
    }

}

module.exports.renderLoginForm  = (req, res) => {
    res.render("users/login.ejs");
}

module.exports.login  = async(req, res)=>{
    req.flash("Welcome to WanderLust You logged in!");
    let redirectUrl = res.locals.redirectUrl || "/listings";
    res.redirect(redirectUrl);
}

module.exports.logout = (req, res)=>{  
    req.logout((err)=>{
        if(err){
           return next(err);
        }

        req.flash('success',"you are log Out Now!");
        res.redirect('/listings');
    });
}