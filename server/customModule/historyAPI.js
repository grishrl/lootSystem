var bodyParser = require('body-parser');
var customMiddleWare = require(__dirname+'/customMiddleWare.js');
var group = require(__dirname+'/groupObj.js');
var list = require(__dirname+'/listObj.js');
var user = require(__dirname+'/userObj.js');
var history = require(__dirname+'/historyObjs.js');
var jsonParse = bodyParser.json();
var mongoose = require('mongoose');

function historyMethods (app,tokens){

  app.post('/history',jsonParse,function(req,res){



      var type = req.body.type;
      switch(type){
        case 'user'://get all the actions on a user
        {
          customMiddleWare.checkToken(req,res,tokens,function(req,res,id){
          var userID = id;

          var findHistory = history;
          findHistory.find({$or: [{'actor':userID},{'actedUpon':userID}]},function(err,results){
            if(err){
              console.log(err);
              res.status(400).send({message:'Error finding user history.'});
            }else{
              if(results.length>0){//if there are results
              //  console.log('user history sent');

                res.status(200).send({data:results,message:'No user history.'});
              }else{//if there are no results
              //  console.log('no user history');
                res.status(200).send({message:'No user history.'});
              }
            }
          })
          })
        }
          break;
          //user case close
        case 'group': //get all the actions on a group
        {
          var groupID = req.body.groupID;
          var findHistory = history;
          findHistory.find({'groupID':groupID},function(err,results){
            if(err){
              console.log(err);
              res.status(400).send({message:'Error finding group history.'});
            }else{
              if(results.length>0){//if there are results
          //      console.log('group history sent');
                res.status(200).send({data:results,message:'No group history.'});
              }else{//if there are no results
            //    console.log('no group history');
                res.status(200).send({message:'No group history.'});
              }
            }
          })
        }
        //group case close
          break;
        case 'list':
        case 'loot': //get all the actions on a list
        {
          var listID = req.body.listID;
          var findHistory = history;
          findHistory.find({'listID':listID},function(err,results){
            if(err){
              console.log(err);
              res.status(400).send({message:'Error finding list history.'});
            }else{
              if(results.length>0){//if there are results
          //      console.log('list history sent');
                res.status(200).send({data:results,message:'No list history.'});
              }else{//if there are no results
          //      console.log('no list history');
                res.status(200).send({message:'No list history.'});
              }
            }
          })
        }
        //list case close
          break;
        }
      //check token close
    //})
  })
  //close of historyMethod
}
module.exports = historyMethods;
