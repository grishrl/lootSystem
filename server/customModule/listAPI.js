var bodyParser = require('body-parser');
var customMiddleWare = require(__dirname+'/customMiddleWare.js');
var group = require(__dirname+'/groupObj.js');
var list = require(__dirname+'/listObj.js');
var user = require(__dirname+'/userObj.js');
var history = require(__dirname+'/historyObjs.js');
var insertHistory = require(__dirname+'/historyFunctions.js');
var jsonParse = bodyParser.json();
var mongoose = require('mongoose');

function listMethods(app, tokens){

//URI for creating lists
//check that user is authenticated against server,
//create the mongoose model
//find group matching passed group ID
//create a group and add the users of the group to the list
//return errors or success to client
//
// In the request payload required paramaters: group name, client token
app.post('/createList',jsonParse,function(req,res){
  var payload = req.body;
  customMiddleWare.checkToken(req,res,tokens,function(req,res,id){

    //  create a group model
    var groupSearch = mongoose.model('group',group,'groups');
    //  find groups matching the passed ID
    groupSearch.findOne({'_id':payload.groupId},function(err, result){
      if(err){
        res.status(400).send({message:'Error in group query', code:11});
      }else{
        //create the list model
        var listModel = mongoose.model('list',list,'lists');
        //populate it with data
        // 8-11-2016 ---- updating to enable an array of objects [username, active]
        var masterArr = [];
        for(var i = 0;i<result.members.length;i++){
          var buildObj = {};
          buildObj.user = result.members[i];
          buildObj.active  =true;
          masterArr.push(buildObj);
        }
        for(var i = 0;i<result.noLinkMembers.length;i++){
          var buildObj = {};
          buildObj.user = result.noLinkMembers[i];
          buildObj.active = true;
          masterArr.push(buildObj);
        }
      var createList = new listModel({'associateId':payload.groupId, 'name':payload.name, 'members':masterArr,'creator':id});
      var passObj = {};
      passObj.action='Create List';
      passObj.actor = id;
      passObj.groupID = result._id;

      createList.save().then(function(response){
        insertHistory(passObj).then(
        //insert history resolved
        function(response){
          res.status(200).send({message:'List creation OK', code:16})
        },
        //insertHistory rejected
        function(response){
            res.status(400).send({message:'Error saving list.',code:15});
        })}//save resolved

      ,function(response){
        res.status(400).send({message:'Error saving list.',code:15});
      })
      }
      //close of group search
    });

  })
  //close of createList
})

//URI for returning multiple lists to the client
//query paramater, by ID or by groupID
//check that user is authenticated against server,
//create the mongoose model
//
//return errors or success to client
//
// In the request payload required paramaters: group name, client token
app.post('/getLists',jsonParse,function(req,res){
  customMiddleWare.checkToken(req,res,tokens,function(req,res,id){
    var payload = req.body;
    if(payload.query == 'listid'){
      var findList = mongoose.model('list',list,'lists');
      findList.find({'_id':{$in:payload.queryID}},function(err,results){
        if(err){
          res.status(400).send({message:'List query error.',code:17});
        }else{
          if(results.length>0){
            res.status(200).send({data:results,message:'List data return OK.',code:18})
          }else{
            res.status(200).send({data:results,message:'List not found.',code:18})
          }

        }
      })
    }
    else if (payload.query=='groupid') {
      var findList = mongoose.model('list',list,'lists');
      findList.find({'associateId':payload.queryID},function(err,results){
        if(err){
          res.status(400).send({message:'List query error.',code:17});
        }else{
          if(results.length>0){
            res.status(200).send({data:results,message:'List data return OK.',code:18})
          }else{
            res.status(200).send({data:results,message:'List not found.',code:18})
          }

        }
      })
    }

  })
  //close of get list
})




//URI for returning single list data using list ID
//
//TOKEN and listID
app.post('/getList',jsonParse,function(req,res){
  customMiddleWare.checkToken(req,res,tokens,function(req,res,id){
    var payload = req.body;
    var findList = mongoose.model('list',list,'lists');
    findList.findOne({'_id':payload.listID}).exec().then(
    function(response){
      if(response){
        res.status(200).send({data:response,message:'List data return OK',code:18})
      }else{
        res.status(200).send({data:null,message:'No list found',code:18})
      }
    },function(response){
      res.status(400).send({message:'List query error.',code:17});
    })

  })
})

//URI for modifying lists
//check that user is authenticated against server,
//create the mongoose model
//find list matching passed list ID
//modify the list
//return errors or success to client
//
// In the request payload required paramaters: list ID, client token, optional: loot: boolean and memberID
//----------NEEDS ADMIN LEVEL ACCESS-----------------------------
app.post('/reArrangeList',jsonParse,function(req,res){
  customMiddleWare.checkToken(req,res,tokens,function(req,res,id){
    var payload = req.body;
    var findList = mongoose.model('list',list,'lists');
    findList.findOne({'_id':payload.listID}).exec().then(
      function(response){
        if(response){
          var groupSearch = mongoose.model('group',group,'groups');
          //find the group this list belongs to
          groupSearch.findOne({'_id':response.associateId}).exec().then(
            function(groupRes){
              if(groupRes){
                customMiddleWare.checkAdmin(id,groupRes.admins,groupRes.creator).then(
                  function(userLevel){
                    
                  response.members=payload.memberOrder;
                  var objDat={};
                  if(payload.loot){
                    objDat.actor = id;
                    objDat.groupID = response.associateId;
                    objDat.action = 'loot given'
                    objDat.listID = response._id;
                    objDat.actedUpon = payload.memberID;
                    objDat.note = payload.note;
                  }else{
                    objDat.actor = id;
                    objDat.groupID = response.associateId;
                    objDat.action = 'moved user in list order'
                    objDat.listID = response._id;
                    objDat.actedUpon = payload.actedUpon
                  }
                  response.save().then(
                    function(response){

                    insertHistory(objDat).then(
                    //insert history resolved
                    function(response){
                      res.status(200).send({message:'List modified OK', code:16})
                    },
                    //insertHistory rejected
                    function(response){
                        res.status(400).send({message:'Error modifying list.',code:15});
                    })
                  },
                  function(response){
                    res.status(400).send({message:'Error modifying list', code: 19})
                  })
                },function(userLevel){

                  res.status(403).send({message:'Must have admin rights to group',code:21});
                })
              }else{
                res.status(200).send({message:'Group not found.', code:null});
              }
            },function(groupRes){
              res.status(400).send({message:'Error in group query', code:11});
            }
          )

        }else{
          res.status(400).send({message:'Error saving list', code: 17})
        }

        }
      ,
    function(response){
    res.status(400).send({message:'Error finding list', code: 17})
  });

  })
  //close of reArrangeList
})

//This URI returns lists for unathenticated users - so permalink function works
//
//
//
//Accepts groupID to pull lists
app.post('/permaLists',jsonParse,function(req,res){
  var findList = mongoose.model('list',list,'lists');
  findList.find({'associateId':req.body.group}).exec().then(function(response){
    if(response){
      res.status(200).send({data:response,message:'List returned.'});
    }else{
      res.status(200).send({message:'No lists found.'});
    }
  },function(response){
    res.status(404).send({message:'Error finding lists.'});
  })
})


/*
//URI for swapping a user active or inactive
//REQUIRES: TOKEN, List ID, user ID
*/
//----------- ADMIN LEVEL ACCESS-----------------
app.post('/activateUser',jsonParse,function(req,res){
  //check that user is logged in
  customMiddleWare.checkToken(req,res,tokens,function(req,res,id){
      var payload=req.body;
      var findList = mongoose.model('list',list,'lists');
      //find list matching the passed in ID
      findList.findOne({'_id':payload.listID}).exec().then(
        function(returnedList){
          //validate that a list was returned
          if(returnedList){
            var groupSearch = mongoose.model('group',group,'groups');
            //find the group this list belongs to
            groupSearch.findOne({'_id':returnedList.associateId}).exec().then(
              function(groupRes){
                if(groupRes){
                  //use the group data to validate whether the user is an admin or the creator
                  customMiddleWare.checkAdmin(id,groupRes.admins,groupRes.creator).then(
                    //if admin or creator - do work
                    function(userLevel){
                      var arr = returnedList.members;
                      //loop through the array of objects,
                      //toggle the user sent from client
                      for(var i =0;i<arr.length;i++){
                        if(arr[i].user==payload.user){
                          arr[i].active=!arr[i].active;
                        }
                      }
                      returnedList.members=arr;
                      returnedList.markModified('members');
                      //build history object
                      var hisObj = {
                        actor:id,
                        groupID:returnedList.associateId,
                        action:payload.onOff,
                        listID:returnedList._id,
                        actedUpon:payload.user
                      };
                      //save the list
                      returnedList.save().then(
                        function(save){
                          insertHistory(hisObj).then(
                          //insert history resolved
                          function(hisRes){
                            res.status(200).send({message:'List modified OK', code:16});
                          },
                          //insertHistory rejected
                          function(hisRes){
                              res.status(400).send({message:'Error modifying list.',code:15});
                          }
                        )
                        },function(save){
                          res.status(400).send({message:'Error saving list', code: 17});
                        }
                      )
                  },function(userLevel){
                      res.status(403).send({message:'Must have admin rights to group'});
                    })
                }else{
                  res.status(200).send({message:'Group not found.', code:null});

                }
              },function(groupRes){
                res.status(400).send({message:'Error in group query', code:11});
              }
            )

          }else{
            res.status(400).send({message:'Fatal Error', code:16});
          }
        },function(returnedList){
          res.status(400).send({message:'Error finding list', code: 17});
        }
      )
    //close of customMiddleWare
  })
//close of activate user
})

//close of listMethods
};

module.exports = listMethods;
