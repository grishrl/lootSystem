var bodyParser = require('body-parser');
var user = require(__dirname+'/userObj.js');
var customMiddleWare = require(__dirname+'/customMiddleWare.js');
var jsonParse = bodyParser.json();
var CryptoJS = require('crypto-js');
var crypto = require('crypto');
var mongoose = require('mongoose');


function userMethods (app, tokens){
      // do some validation and return authentication Key
  app.post('/userLogin', jsonParse, function(req, res){
    var passedCred = req.body;
    if(passedCred.name&&passedCred.password){//check if the user id and password is blank
      var account = user;
      account.findOne({'userName':passedCred.name},'_id password salt',function(err,account){ //find an account with the passed userName
        if(err){  //error check the query
          console.log(err);
          res.status(400).send({message:'Authentication Error.', code:2});
        }else{ //query worked on base level --- check that the account is not null - then check the password
          if(account!=null){//make sure there was a response - from query -
            //grab SALT from account
            var salt = account.salt;
            //add salt to password

            var password = passedCred.password+salt;
            //hash salted password
            var password = CryptoJS.SHA1(password);
            password = password.toString();
            //convert hash to password

            if(account.password==password){//validate password
              //create token
              var tok = crypto.randomBytes(20).toString('hex');
              var temp = {'token':tok,'id':account._id}
              //add the token to the server
              tokens.push(temp);
              var authenticationPacket = {Autheticated:true, userName:passedCred.name, token:tok,}
              res.status(200).send({message:'Autheticated OK', authenticationPacket, code:6});
            }else{//password incorrect
              res.status(400).send({message:'Username/Password Invalid.', code:5});
            }
          }else{  //the passed user name was not found / query returned nothing
            res.status(400).send({message:'Username/Password Invalid.', code:7});
          }
          //closing the findOne IF
        }
        //closing the findOne
      })
    }else{//user id and password passed null
      res.status(400).send({message:'Username or password can not be blank',code:3});
    }
    //close the userLogin post
  });


  //Crete user account
  app.post('/createUser', jsonParse, function(req, res){
    var newUser = req.body;

    if(newUser.name && newUser.password){ //user name and password have content

      //generate SALT
      var salt = crypto.randomBytes(16).toString('hex');
      //add salt to password
      var password = newUser.password+salt;
      //hash salted password
      var password = CryptoJS.SHA1(password);
      //convert hash to password
      var password = password.toString();
      var nUser = new user({'userName':newUser.name,'salt':salt,'password':password});
      nUser.save(function (err, nUserName){
        if(err){//handle error from the username insert
          if(err.errors.userName.message.includes('Error, expected `userName` to be unique.')){//return useful message to client for blank user ID
            res.status(400).send({message:'User ID has to be unique.',code:1});
          }else{ //return generic error
            res.status(400).send({message:'User ID not created.',code:2});
          }
        }else{//send valid response
          //create token
          var tok = crypto.randomBytes(20).toString('hex');
          var temp = {'token':tok,'id':nUser._id}
          //add the token to the server
          tokens.push(temp);
          var authenticationPacket = {Autheticated:true, userName:newUser.name, token:tok}
          res.status(200).send({message:'User ID created!',authenticationPacket,code:4});
        }
      })
    }else{//passed data was blank
      res.status(400).send({message:'Blank username/password not allowed.',code:3});
    }
  })

  /*  URI for returning userNames associated with _ids stored in groupMembers
  //  check that the user is authenticated via the client tokenCheck
  //  find usersNames included inside the members array
  //  return errors or results to the client
  //  In the request payload client token and members array
  */
  app.post('/userIDQuery',jsonParse,function(req,res){
    //  check that the user is authenticated via the client tokenCheck
    //  find usersNames included inside the members array
      var passed = req.body;
      var arr = [];
      for(var i = 0; i<passed.payload.length;i++){
        if(passed.payload[i] && passed.payload[i].includes(" ")){
          //do nothing
        }else if(mongoose.Types.ObjectId.isValid(passed.payload[i]))
        {
          arr.push(passed.payload[i])
        }
      }
      //  console.log('sending to new middleware');

      customMiddleWare.returnUsers(arr).then(
        function(resp){
    //      console.log(resp);
          res.status(200).send({data:resp,message:'IDs returned via data.', code:13})
      },
      function(resp){
        console.log(resp);
          res.status(400).send({message:'Error in query', code:11})
      })

      /*user.find({'_id':{$in:passed.payload}},'userName',function(err,result){
        if(err){
          //return errors to client
          console.log(err);
            res.status(400).send({message:'Error in query', code:11})
        }else{
          //return results to client
          console.log(result);
          res.status(200).send({data:result,message:'IDs returned via data.', code:13})
        }
      })*/

  });

//close of userMethods()^^
}

module.exports = userMethods;
