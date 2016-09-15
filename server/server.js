//VENDOR REQUIRES
var express=require('express');
var server = express();
var MongoClient = require('mongodb').MongoClient;
var assert=require('assert');
var favicon = require('serve-favicon');
var mongoose = require('mongoose');

//CUSTOM REQUIERS
var custOjb = require(__dirname+'/customModule/custObj.js');
var listObj = require(__dirname+'/customModule/listObj.js');
var user = require(__dirname+'/customModule/userObj.js');
var userMethods = require(__dirname+'/customModule/userAPI.js');
var groupMethods = require(__dirname+'/customModule/groupAPI.js');
var listMethods = require(__dirname+'/customModule/listAPI.js');
var historyMethods = require(__dirname+'/customModule/historyAPI.js');
var messageMethods = require(__dirname+'/customModule/messageCenterAPI.js');

var url = 'mongodb://localhost:27017/lootSystem';
MongoClient.connect(url, function(err, db){
  assert.equal(null, err);
  console.log('connected to server');
  db.close();
});

mongoose.connect('mongodb://localhost/lootSystem');

var tokens = [];

userMethods(server, tokens);
groupMethods(server, tokens);
listMethods(server, tokens);
historyMethods(server, tokens);
messageMethods(server, tokens);

//SERVING PAGES
server.use('/',express.static(__dirname+'/../public/client'));

//favicon
server.use(favicon(__dirname+'/favicon/favicon.ico'));

//LAUNCH SERVER
server.listen(3000,function(){console.log('listening on 3000');});
