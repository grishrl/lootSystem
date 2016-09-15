var user = require(__dirname+'/userObj.js');
var group = require(__dirname+'/groupObj.js');
var mongoose = require('mongoose');

var tokenCheck = function(req, res, tokens, next){
    var validate = false; //initialize variable for validate
    var tmpID;
    for(var i=0;i<tokens.length;i++){ //loop token array

      if(tokens[i].token==req.body.token){//if the token is there set validate
        validate=true;
        tmpID = tokens[i].id;
      }
    }
    if(validate){ //check the validation
      next(req, res, tmpID);  //next function
    }else{
      //console.log('oh, hello there');
      res.status('401').send({message:'Not currently authenticated.',code:8});  //return error
    }

  };

  var returnAccessLevel = function(id,admins, creator){
    if(id==creator){
        return 'admin'
      }else if (admins.length>0)
      {
        if(admins.indexOf(id)>=0){
          return 'admin'
        }
      }else{
      return 'user'
    }
  }

  var checkAdmin = function(id,admins,creator){
    return new Promise (
      function(resolve,reject){

        if(id==creator){

            resolve('admin')
          }else if (admins.length>0)
          {

            if(admins.indexOf(id)>=0){

              resolve('admin')
            }else{

          reject('user')
        }
      }else{
        reject('user')
      }
    }
    )
  }

  var returnUserIds = function(passedUsers){
    return new Promise (
      function(resolve,reject){
        user.find({'_id':{$in:passedUsers}},'userName').exec().then(
          function(response){
          resolve(response);
        },function(response){
          reject(response);
        })
      }
    )
  }
module.exports.checkToken = tokenCheck;
module.exports.returnUsers = returnUserIds;
module.exports.checkAdmin = checkAdmin;
