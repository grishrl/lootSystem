var mongoose = require('mongoose');
var uniqueValidator = require('mongoose-unique-validator');
function custObj (){


};
  var custObj = mongoose.Schema({
    'associateId':String,
    'signature': String,
    'timestamp':{type: Date, default: Date.now()},
    'type':String,
    "typeValue":String
  });
  custObj.methods.reportID = function(){
    return this._id;
  }
  //var obj = mongoose.model('obj', custObj);

  //module.exports.obj = obj;
  module.exports.custObj = custObj;
