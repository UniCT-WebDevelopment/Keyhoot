/*const mongoose = require("../database");

// create an schema
var userSchema = new mongoose.Schema({
    username: String
});

var userModel = mongoose.model('users', userSchema);

module.exports = mongoose.model("Users", userModel);*/

// importing modules
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var passportLocalMongoose = require('passport-local-mongoose');

//FONDAMENTALE se si cambia lo schema bisogna fare il drop() della collezione sul db, in modo che venga creata (indicizzata) da capo. NON BASTA CANCELLARE GLI ELEMENTI DEL DB...https://github.com/londonappbrewery/Authentication-Secrets/issues/2
var UserSchema = new Schema({
    username: { type: String, unique: true, required: true },
    email: { type: String, unique: true, required: true }
    /*password: { type: String },*/
}, { collection: 'users' });

UserSchema.plugin(passportLocalMongoose/*, { usernameField: 'username' }*/);

/*UserSchema.methods.validPassword = function (pwd) {
    // EXAMPLE CODE!
    return (this.password === pwd);
};*/

// plugin for passport-local-mongoose
//UserSchema.plugin(passportLocalMongoose);

// export userschema
module.exports = mongoose.model("User", UserSchema);