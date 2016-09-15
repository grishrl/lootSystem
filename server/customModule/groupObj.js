var mongoose = require('mongoose');

  var groupSchema = mongoose.Schema({
    'creator':String,
    'members':Array,
    'noLinkMembers':Array,
    'admins':Array,
    'name':String,
    'timestamp':{type: Date, default: Date.now()},
    'description':String,
    'permalink':Boolean,
    'notes':Array //{user, note}
  });

module.exports = groupSchema;
