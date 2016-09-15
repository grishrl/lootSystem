var mongoose = require('mongoose');

var historySchema = mongoose.Schema({
  'action':String, //action desctip
  'actor':String, //person who did the action
  'actedUpon':String, //person upon who the action happened
  'groupID':String, //the group the action occured
  'listID':String, //the list the action occured in
  'note':String, 
},{timestamps:true});

var history = mongoose.model('history', historySchema, 'history');

module.exports = history;
