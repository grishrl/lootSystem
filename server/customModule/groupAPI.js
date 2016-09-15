var bodyParser = require('body-parser');
var group = require(__dirname+'/groupObj.js');
var customMiddleWare = require(__dirname+'/customMiddleWare.js');
var user = require(__dirname+'/userObj.js');
var list = require(__dirname+'/listObj.js');
var insertHistory = require(__dirname+'/historyFunctions.js');
var jsonParse = bodyParser.json();
var mongoose = require('mongoose');

  function groupMethods (app, tokens){
    //URI for creating groups
    /* PSUEDO
    // check that user is authenticated against server,
    // create the mongoose model
    // populate the model using passed data
    // save the model into the database and return errors or success to client
    //
    // In the request payload required paramaters: group name, client token
    */
    app.post('/createGroup',jsonParse, function(req, res){
      //check the token from client against server
      customMiddleWare.checkToken(req, res, tokens, function(req, res, id){
        var dat = req.body;
        // create the mongoose model
        var nGroup = mongoose.model('group',group,'groups');
        var tempMem = [id];
        var tempNote = [{user:id,note:null}];
        // populate the model using passed data
        var newGroup = new nGroup({'creator':id,'members':tempMem,'name':dat.name,'description':dat.description,'permalink':false,'note':tempNote});
        // save the model into the database and return errors or success to client
        newGroup.save(function(err,newGroup){
          if(err){
            //erros in save to dB
            res.status(400).send({message:'Error creating group.',code:9});
          }else{
            //sucess save to dB

            //create a history object
            var histObj ={
              groupID:newGroup._id,
              action:'created group',
              actor:id
            }
            //save it to the history table
            insertHistory(histObj).then(function(response){
              res.status(200).send({message:'Group inserted OK', code:10});
            },function(response){
              res.status(400).send({message:'Error saving group History.',code:9});
            });
          }
        })
      })
      //createGroup post close
    });

    //URI for returning groups to client -- that the user has access to IE: is admin or creator
    /*  PSUEDO code
    //  check that the user is authenticated via the client tokenCheck
    //  create a group model
    //  find groups where the user is included in the group
    //  return results or errors to client
    //  In the request payload required paramaters are client token.
    //
    //  ::9/2/2016 THIS CODE IS INTEGRAL IN THE CLIENT SO CHANGING THE NAME WOULD BE A MAJOR UNDERTAKING,
    //  ::THUS CHANGING THIS URI TO RETURN GROUPS OF WHICH A USER BELONGS AT ALL, AND ADDING ADMIN AUTHENTICATION TO
    //  ::INDIVIDUAL FUNCTIONS AND NOT JUST THE SIMPLE RETURNING OF DATA
    */
    app.post('/adminGroup',jsonParse,function(req,res){
      //  check that the user is authenticated via the client tokenCheck
      customMiddleWare.checkToken(req, res, tokens, function(req, res, id){
        //  create a group model
        var groupSearch = mongoose.model('group',group,'groups');
        //  find groups where the user is an admin or creator
        //groupSearch.find({$or:[{'creator':id}, {'admins':id}]}, function(err,results){
        groupSearch.find({'members':id},function(err, results){
          if(err){
            //return errors to client
            console.log(err);
            res.status(400).send({message:'Error in group query', code:11});
          }else{
            //return results to client
            //console.log('group data sent');
            res.status(200).send({data:results,message:'Groups returned for drop down', code:12});
          }
        });
      });
      //close post adminGroup
    });

//URI for making user and adminGroup
//
// requires groupID, userID, token
//
//-------------------ADMIN LEVEL ACCESS---------------
app.post('/makeAdmin',jsonParse,function(req,res){
  customMiddleWare.checkToken(req,res,tokens,function(req,res,id){
    var payload = req.body;
    //  create a group model
    var groupSearch = mongoose.model('group',group,'groups');
    //  find groups where the user is an admin or creator
    groupSearch.findOne({'_id':payload.groupID}).exec().then(
      function(response){
        if(response){

          customMiddleWare.checkAdmin(id,response.admins,response.creator).then(
            function(adminRes){

              var arr = response.admins;
              if(arr){
                arr.push(payload.userID);
              }else{
                arr = [payload.userID];
              }
              //
              //arr.push(payload.userID)
              //
              var myobj = {};
              myobj.action = 'made user admin';
              myobj.actor = id;
              myobj.groupID = payload.groupID;
              myobj.actedUpon = payload.userID;
              response.save().then(
                function(saveRes){
                  //save it to the history table
                  insertHistory(myobj).then(function(response){
                    res.status(200).send({message:'User admin inserted OK', code:10});
                  },function(response){
                    res.status(400).send({message:'Error saving group History .',code:9});
                  });
                },function(saveRes){
                  res.status(400).send({message:'Error saving group'});
                }
              )

          },function(adminRes){

            res.status(403).send({message:'Must have admin rights to group'});
          })

        }else{
          res.status(200).send({message:'Group not found.'});
        }
      },function(response){
        res.status(400).send({message:'Error finding group'});
      }
    )
  })
})


    /* URI for removing user from a group
    // NOTE: group members can be in the members array or the noLinkMmebers array of a group document
    // check that the user is authenticated via the client tokenCheck
    //  create a group model
    //  find a group that matches the group ID
    //  if the user is a creator of the group the user cannot be deleted from the group - send response to client
    // IF the user is a linked user - remove the user from the members array
    // save the document back to the dB
    // IF the user is NOT a linked user - remove the user from the noLinkMmebers
    // save the document back to the dB
    // send errors or success to the client
    // In the request payload required paramaters: client token, groupID of group to modify, "_id" of user to remove
    */
    //--------------------ADMIN LEVEL ACCESS---------------------
    app.post('/removeUser',jsonParse,function(req, res){

      // check that the user is authenticated via the client tokenCheck
      customMiddleWare.checkToken(req,res,tokens,function(req,res,id){
        //  create a group model

        var groupSearch = mongoose.model('group',group,'groups');
        var passed = req.body;
        //console.log(passed);
        //  find a group that matches the group ID
        groupSearch.findOne({'_id':passed.groupNumber}, function(err,results){
          if(err){
            console.log(err);
            res.status(400).send({message:'Error in query', code:11});
          }else{

            customMiddleWare.checkAdmin(id,results.admins,results.creator).then(
              function(userLevel){

                //    console.log(results);
                    var arr = results.members;
                    //  if the user is a creator of the group the user cannot be deleted from the group - send response to client
                    if(passed._id==results.creator){//check if this is the creator - if so they can't be deleted.
                    res.status(400).send({message:'Creator cannot be deleted.',code:00});
                  }else{//delete non-creator member
                    // IF the user is a linked user - remove the user from the members array
                    if(arr.indexOf(passed._id)>=0){  //if user is in the members list
                      //remove the user from the members array
                      arr.splice(arr.indexOf(passed._id),1);
                      results.members=arr;
                      // save the document back to the dB
                      results.save(function(err){
                        if(err){
                          console.log(err);
                          res.status(400).send({message:'User not deleted from group.', code:12})
                        }else{

                          passed.id=id;
                    //delete user from the lists that belong to the group
                          passed.userName=passed._id;
                          delUser(passed).then(function(delRes){
                            res.status(200).send({message:'User deleted from group OK', code:14}
                          )
                          },function(delRes){

                          });

                        }
                      })
                      // IF the user is NOT a linked user - remove the user from the noLinkMmebers
                    }else{ //user not in the members list check the noLinkMembers
                      if(results.noLinkMembers.indexOf(passed.userName)>=0){
                        var arr = results.noLinkMembers;
                        //remove the user from the noLinkMmebers
                        arr = arr.splice(arr.indexOf(passed.userName),1);
                        // save the document back to the dB
                        results.save(function(err){
                          if(err){
                            console.log(err);
                            res.status(400).send({message:'User not deleted from group.', code:12})
                          }else{

                      passed.id=id;
                      //delete user from the lists that belong to the group
                            delUser(passed).then(function(delRes){
                              res.status(200).send({message:'User deleted from group OK', code:14})
                            },function(delRes){

                            });

                          }
                        })
                      }else{ //user was not in the members or noLinkMmebers - this should NOT happen - perhaps there was an error to get here?
                        res.status(404).send({message:'User ID not found in list to delete', code:7})
                      }

                    }
                    }
              },
              function(userLevel){

                res.status(403).send({message:'Must have admin rights to group'});
              }
            )


          }
          //groupFind close
        })
        //checkToken close
      })
      //removeUser api close
    })

//URI set NOTE
//
//groupID, token, user, note
//
//--------------------ADMIN LEVEL ACCESS-------------------
app.post('/setNote',jsonParse,function(req,res){
  customMiddleWare.checkToken(req,res,tokens,function(req,res,id){
    var groupSearch = mongoose.model('group',group,'groups');
    var passed = req.body;

    //  find a group that matches the group ID
    groupSearch.findOne({'_id':passed.groupNumber}, function(err,results){
      if(err){
        res.status(400).send({message:'Error finding group.'});
      }else{
        customMiddleWare.checkAdmin(id, results.admins, results.creator).then(
          function(response){
            var arr = results.notes;
            if(arr.length>0){
              var obj = {
                user:passed.user,
                note:passed.note
              };
              arr.push(obj);

            }
            else{
              arr = [{user:passed.user,note:passed.note}];

            }
            results.notes = arr;
            results.markModified('notes');
            results.save().then(function(saveRes){
              var myobj = {};
              myobj.action = 'changed member note';
              myobj.actor = id;
              myobj.groupID = results._id;
              myobj.actedUpon = passed.user;
              insertHistory(myobj).then(function(hisRes){
                res.status(200).send({message:'Save notes successful.'});
              },function(hisRes){
                res.status(400).send({message:'Error saving history.'});
              })
            },function(saveRes){
              res.status(400).send({message:'Error saving notes.'});
            }
            )
            }
          ,function(response){
            res.status(403).send({message:'Must have admin rights to group'});
          }
        )
      }
    })
  })
})

//URI for link users and registered users in group
//
//requires groupID, ID of user to link, and token
//
//
//-----------------------ADMIN LEVEL ACCESS-------------------------
app.post('/linkUser',jsonParse,function(req,res){
  customMiddleWare.checkToken(req,res,tokens,function(req,res,id){
    var passed = req.body;
    var groupSearch = mongoose.model('group',group,'groups');
    //find user matcing the name entered in client
      user.findOne({'userName':passed.linkedName},'_id',function(err,result){
        //query error
        if(err){
          console.log(err);
        }else{
          //test result to ensure it's valid
          if(result!=null){
            //user found in table
            //find a group that matches the passed group ID
              groupSearch.findOne({'_id':passed.groupID}, function(err,results){
                //handle query error
                if(err){
                  console.log(err);
                }else{
                  customMiddleWare.checkAdmin(id,results.admins,results.creator).then(
                    function(userLevel){
                      //ensure that the user is not all ready a member of the group
                      var test = false;
                       for(var i = 0; i<results.members; i++){
                         if(results.members[i]==result._id){
                           test=true;
                         }
                       }
                       //if the ID is in the members all ready, do nothing
                       if(test){
                         console.log('id all ready there do nothing');
                       }else{   //otherwise add the ID to the members array
                         results.members.push(result._id);
                         var spot = results.noLinkMembers.indexOf(passed.currentMemberName);
                         results.noLinkMembers.splice(spot,1);
                         results.save(function(err){
                           //handle execution error
                           if(err){
                             console.log(err);
                             res.status(400).send({message:'Error in user insert', code:12})
                           }else{
                             //add user
                             //
                             //USER LIKEWISE SHALL BE ADDED TO THE LISTS THAT BELONG TO THIS GROUP
                             //
                             var userPas = {
                               //there is a descrepancy in delUser and insertUser, one looks for
                               //groupNumber, on looks for groupID, this can be rectified later.
                               groupNumber:passed.groupID,
                               userName: passed.currentMemberName,
                               id:id
                             };

                             delUser(userPas).then(function(delRes){
                               var addUser = {
                                 groupID:passed.groupID,
                                 member: result._id,
                                 id: id
                               };
                               insertUser(addUser);
                               res.status(200).send({message:'User added to group OK', code:14})
                             },function(delRes){

                             });



                           }
                         });
                       }
                    },function(userLevel){
                      res.status(403).send({message:'Must have admin rights to group'});
                    }
                  )

                }
              })
          }else{
            res.status(404).send({message:'User not found'});
          }
        }
      })

  })
})

//URI for adding user to group
//
//Requires TOKEN, groupID, user(to be added)
//
//Returns success or fail
//-----------------------ADMIN LEVEL ACCESS-----------------------
app.post('/addUser',jsonParse,function(req,res){
  customMiddleWare.checkToken(req,res,tokens,function(req,res,id){  //check that user is authenticated
    //data passed in
    var passed = req.body;

    //create a group model
      var groupSearch = mongoose.model('group',group,'groups');
    {
          //find a group matching the passed group id
          groupSearch.findOne({'_id':passed.groupID}, function(err,results){
            //handle query error
            if(err){
              console.log(err);
            }else{
              customMiddleWare.checkAdmin(id,results.admins,results.creator).then(
                function(userLevel){
                var arr = results.noLinkMembers;
                var test = false;
                //make sure that user does not exist in the group as a non-registered member.
                for(var i=0;i<arr.length;i++){
                  if(arr[i]==passed.member){
                    test=true;
                  }
                }
                //if user existed if group, do nothing
                if(test){
            //      console.log('user exists in no link');
                  res.status(400).send({message:'User all ready exits in group.', code:12})
                }else{
                  //add user to group
                  arr.push(passed.member);
                  results.noLinkMembers = arr;
                  results.save(function(err){
                    //handle execution error
                    if(err){
                      console.log(err);
                      res.status(400).send({message:'Error in user insert', code:12})
                    }else{
                      var hisObj = {
                        actor:id,
                        actedUpon:passed.member,
                        groupID:passed.groupID,
                        action:'added user to group',
                      }
                      insertHistory(hisObj).then(
                        function(hisRes){
                          //no action is preferred in both cases
                        },function(hisRes){
                          //no action is preferred in both cases
                        }
                      )
                      passed.id = id;
                      insertUser(passed);
                      res.status(200).send({message:'User added to group OK', code:14})
                    }
                  });
                }
              },function(userLevel){
                res.status(403).send({message:'Must have admin rights to group'});
              })

            }

          })
        }
  })
})


//URI For returning single group data
//accepts token and groupID returns group info
app.post('/getGroup',jsonParse,function(req,res){
  customMiddleWare.checkToken(req,res,tokens,function(req,res,id){
    var groupID = req.body.groupID;
    var groupSearch = mongoose.model('group',group,'groups');
    groupSearch.findOne({'_id':groupID}).exec().then(function(response){

      res.status(200).send({data:response,message:'Group Queried OK', code:12});
    }
    ,function(response){


      res.status(400).send({message:'Group Quiery Failed',code:11})
    })
  })
})

//this URI returns group data to unathenticated users
//USED for PERMALINK group functionality
//accepts group ID and returns group info
app.post('/permaGroup',jsonParse,function(req,res){
    var groupID = req.body.group;
    var groupSearch = mongoose.model('group',group,'groups');
    groupSearch.findOne({'_id':groupID}).exec().then(
      function(response){
        if(response.permalink){
            res.status(200).send({data:response,message:'Group Queried OK', code:12});
        }else{
          res.status(401).send({message:'This group is not a permalink group.', code:null});
        }

    }
    ,function(response){


      res.status(400).send({message:'Group Quiery Failed',code:11})
    })
})

//URI for toggling permalink for groups
//
//requires token groupID and status to set permalink to T/F
//
//-------------------ADMIN LEVEL ACCESS--------------------
app.post('/togglePermalink',jsonParse,function(req,res){
  customMiddleWare.checkToken(req,res,tokens,function(req,res,id){
    var groupID = req.body.groupID;
    var groupSearch = mongoose.model('group',group,'groups');
    groupSearch.findOne({'_id':groupID}).exec().then(function(response){
      if(response){
        customMiddleWare.checkAdmin(id,response.admins,response.creator).then(function(userLevel){
          response.permalink = req.body.status;
          response.markModified('permalink');
          response.save().then(function(saveRes){
            var action = 'Removed group permalink';
            if(response.permalink){
              action='Permalinked group'
            }
            hisObj = {
              'action':action,
              actor:id,
              groupID:response._id
            }
            insertHistory(hisObj).then(
              function(hisRes){
              res.status(200).send({message:'Goup modified OK'});
            },
            //insertHistory rejected
            function(hisRes){
                res.status(400).send({message:'Error modifying group.'});
            })
          },function(saveRes){
            res.status(400).send({message:'Error modifying group.'});
          })
        },function(userLevel){
          res.status(403).send({message:'Must have admin rights to group'});
        })
      }else{
        res.status(200).send({message:'No group found.'});
      }
    },function(response){
      res.status(400).send({message:'Error finding group.'});
    })
})
})

//URI for returning permalink status of group
//returns permalink status of a given group, used for making sure a group entered
//into the permalink is actually a permalinked group
// ACCEPTS groupID, returns T/F
app.post('/getpermalinkstatus',jsonParse,function(req,res){
  var groupID = req.body;
  var groupSearch = mongoose.model('group',group,'groups');
  groupSearch.findOne({'_id':groupID}).exec().then(function(response){
    if(response){
      res.status(200).send({data:response.permalink,message:'Group info sent'});
  }else{
      res.status(200).send({data:false,message:'Group not found'});
    }

  },function(response){
    res.status(400).send({message:'Error finding group.'});
  })
})

//URI for returning groups
//
//accepts token and array of groupIDS, returns results
app.post('/getGroups',jsonParse,function(req,res){
  customMiddleWare.checkToken(req,res,tokens,function(req,res,id){
    var groupSearch = mongoose.model('group',group,'groups');
    var payload = req.body;
    groupSearch.find({'_id':{$in:payload.groups}}).exec().then(function(groupRes){
      if(groupRes){
        res.status(200).send({data:groupRes,message:'Group info sent'});
      }else{
        res.status(200).send({data:false,message:'Group not found'});
      }
    },function(groupRes){
      res.status(400).send({message:'Error finding group.'});
    })
  })
})

//groupMethods close
  }


//delete user from all lists that belong to a group
//recored that info in history
var delUser = function(recieved){
  return new Promise (
    function(resolve, reject){
      var group = recieved.groupNumber;
      var user = recieved.userName;

      var findList = mongoose.model('list',list,'lists');
      //find lists belonging to group
      findList.find({'associateId':group}).exec().then(
        function(res){  //if finding lists is successful then:

        for(var i=0;i<res.length;i++){
          var list = res[i];
          var temparr = list.members;
          for(var x=0;x<temparr.length;x++){
            if(temparr[x].user==user){
              //remove user from list
              temparr.splice(x,1);
            }else{
              //user not in list, do nothing
            }
          }
          //
          //var tempobj = {user:user,active:true};
          //temparr.push(tempobj);
          list.members = temparr;
          list.markModified('members');
          list.save().then(
            function(response){  //if saving list was successful
              var myobj = {};
              myobj.action = 'remove user from group & list';
              myobj.actor = recieved.id;
              myobj.groupID = group;
              myobj.listID = response._id;
              myobj.actedUpon = user;

            insertHistory(myobj).then(function(resp){
              //continue operation
                        }
            ,function(resp){
              console.log(resp);
            })
          },function(response){ //if saving list was unsuccessful then:
            console.log('saving the list was unsuccessful');
          })
        }
        resolve('k');
      }
      ,function(res){  //if finding lists was unsuccessful then:
        console.log('finding the list was unsuccessful');
        reject('?');
      })
    }

  )
}



//insert user into all lists that belong to a group
//recored that info in history
var insertUser = function(recieved){

  var group = recieved.groupID;
  var user = recieved.member;
  var findList = mongoose.model('list',list,'lists');
  //find lists belonging to group
  findList.find({'associateId':group}).exec().then(
    function(res){  //if finding lists is successful then:
    for(var i=0;i<res.length;i++){
      var list = res[i];
      var temparr = list.members;
      var tempobj = {user:user,active:true};
      temparr.push(tempobj);
      list.members = temparr;

      list.save().then(
        function(response){  //if saving list was successful

          var myobj = {};
          myobj.action = 'add user to group & list';
          myobj.actor = recieved.id;
          myobj.groupID = group;
          myobj.listID = response._id;
          myobj.actedUpon = user;

        insertHistory(myobj).then(function(resp){
          //continue operation - operation passes back to add user URI
        }
        ,function(resp){
          console.log(resp);
        })
      }
      ,function(response){ //if saving list was unsuccessful then:
        console.log('saving the list was unsuccessful');
      })
    }
  }
  ,function(res){  //if finding lists was unsuccessful then:
    console.log('finding the list was unsuccessful');
  })
}

module.exports = groupMethods;
