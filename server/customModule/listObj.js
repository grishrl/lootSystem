var mongoose = require('mongoose');
var uniqueValidator = require('mongoose-unique-validator');

var custListObj = mongoose.Schema({
  'associateId':String, //group ID
  'name': String,
  'members':Array,  //Object {user, active}
  'creator':String, //user ID of list creator
  'admins':Array,
    'note':String,
  'timestamp':{type: Date, default: Date.now()}
});

custListObj.plugin(uniqueValidator);
custListObj.method.reportID =function(){
  return this._id;
}

module.exports = custListObj;
