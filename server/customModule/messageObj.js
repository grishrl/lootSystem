var mongoose = require('mongoose');

var messageSchema = mongoose.Schema({
  'sender':String,
  'recipient':String,
  'message':String
},{timestamps:true});

var message = mongoose.model('message', messageSchema, 'messages');
