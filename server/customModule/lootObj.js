var mongoose = require('mongoose');
var uniqueValidator = require('mongoose-unique-validator');

var lootAction(){
  'associateId':String, //list ID
  'receivingUser':String //ID of user who got lootAction
}
