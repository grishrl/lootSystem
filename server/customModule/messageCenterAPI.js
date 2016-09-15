var bodyParser = require('body-parser');
var message = require(__dirname+'/messageObj.js');
var user = require(__dirname+'/userObj.js');
var customMiddleWare = require(__dirname+'/customMiddleWare.js');
var list = require(__dirname+'/listObj.js');
var group = require(__dirname+'/groupObj.js');
var jsonParse = bodyParser.json();
var mongoose = require('mongoose');

function messageMethods (app, tokens){

//URI for getting user messages
//
//takes USERID and sends all messages
//
//
app.post('/getMessages', jsonParse, function(req, res){
  customMiddleWare.checkToken(req,res,tokens,function(req,res,id){
    var findMsg = message;
    findMsg.find({'recipient':id}).exec().then(
      function(findRes){
        if(findRes){
          res.status(200).send({data:findRes, message:'Messages Retrieved OK'});
        }else{
          res.status(200).send({message:"No Messages"});
        }
      },function(findRes){
        res.status(400).send({message:"Error: message query."})
      }
    )
  })
})

//URI for sending message
//
//requeires user token, user ID of recipient and a message
//
//
app.post('/sendMessages', jsonParse, function(req, res){
  //validate the user
  customMiddleWare.checkToken(req,res,tokens,function(req,res,id){
    var payload = req.body;
    var findUser = user;
    var recipient = payload.recipient.toLowerCase();
    //find a user mathcing the passed ID
    findUser.find({'userName':recipient}).exec().then(
      function(userRes){
        //if a matching user is found
        if(userRes){
          //get the users object ID
          var recipID = userRes._id;
          //create a message adding the sender id, recipient id, and message
          var msg = new message({'sender':id, 'recipient':recipID, 'message':payload.message});
          msg.save().then(
            function(saveRes){
              //send OK
              res.status(200).send({message:'Message saved OK.'})
            },function(saveRes){
              //send error
              res.status(400).send({message:'Message save error.'});
            }
          )

        }else{
          res.status(200).send({message:'User not found.'});
        }
      },function(userRes){
        res.status(400).send({message:'User query error'});
      }
    )
    //chekctoken close
  })
  //URI CLOSE
})

//URI for deleting messages
//
//requeries token and msg ID
//
//
app.post('/deleteMessage', jsonParse, function(req, res){
  //validate user
  customMiddleWare.checkToken(req,res,tokens,function(req,res,id){
    var msg = message;
    var msgID = req.body.messageID;
    //find message matching passed ID
    msg.findOne({'_id':msgID}).exec().then(
      function(findRes){
        if(findRes){
          //remove the message
          msg.remove().then(
            function(remRes){
              //send OK
              res.status(200).send({message:'Message removed OK'});
                          }
                          ,function(remRes){
                            //send error
              res.status(400).send({message:'Message removal error'});
            }
          )
        }else{
          res.status(200).send({message:'Message ID not found.'})
        }
      },function(findRes){
        res.status(400).send({message:'Message query error.'})
      }
    )
    //close of check token
  })
  //close of URI
})


//URI for processing a request to join group
//
//Will take a request containing groupID, the current no link member name, and the new ID to link to
//will remove the no link member and add the linked ID to the membmers array
//will upate lists that belong to the group
app.post('/processMessage', jsonParse, function(req,res){
  //check that the user is OK
  customMiddleWare.checkToken(req,res,tokens,function(req,res,id){
    //passed group ID
    var groupID = req.body.groupID;
    var groupSearch = mongoose.model('group',group,'groups');
    //find the group
    groupSearch.findOne({'_id':groupID}).exec().then(function(response){
      if(response){
        //the user's ID to be added to members (AKA their account ID)
        var userIDtoLink = req.body.linkID;
        //the users current ID in the group
        var currentNoLinkName = req.body.noLinkID;
        //get the no link member array
        var noLinkMembers = response.noLinkMembers;
        //loop through the no link member array
        for(var i = 0; i<noLinkMembers.length;i++){
          //when you find the current member ID
          if(noLinkMembers[i]==currentNoLinkName){
            //remove the member from the nolinkmembers
            noLinkMembers.slice(i,1);
            //create a pass object to remove the user from lists
            var passObj = {
              group:response._id,
              user:currentNoLinkName
            }
            delUser(passObj);
          }
        }
        //add the member to the linked members array of the group
        var member = response.members;
        member.push(userIDtoLink);
        var passObj = {
          group:response._id,
          user:userIDtoLink
        }
        //add the linked member to the lists of the group
        insertUser(passObj);
        //save the group
        response.save().then(function(saveRes){
          //everything happened OK
          res.status(200).send({message:'User linked successfuly!'});
        },function(saveRes){
          //send an error to the client
          res.status(400).send({message:'Group save error!'})
        })
      }else{
        res.status(200).send({message:'Group not found'});
      }
    }
    ,function(response){
      res.status(400).send({message:'Group Quiery Failed',code:11})
    })
    //close of the check token
  })
  //close of the URI
})

};

module.exports = messageMethods;
