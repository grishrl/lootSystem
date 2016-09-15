var mongoose = require('mongoose');
var uniqueValidator = require('mongoose-unique-validator');

var userObj = mongoose.Schema({
  'timestamp':{type: Date, default: Date.now()},
  'salt':{type:String},
  'password':{type:String, required:true},
  "userName":{type:String, required:true, unique:true}
});

userObj.plugin(uniqueValidator);

var user = mongoose.model('user', userObj, 'users');

module.exports = user;
