angular.module('lootSystem').controller('groupInfoController', function($scope,$stateParams,$state,$http,auth,$q){
  // on running the controller, clear the members
  $scope.members=null;
  //group ID passed through state params to controller

  if($stateParams.groupObj){
    //pass group info to scope for displaying data

    //build a dat object to pass http
    var pasDat = {
      token:auth.isAuthenticated(),
      groupID : $stateParams.groupObj._id
    }


    $http.post('/getGroup',pasDat).then(function(res){
      var retDat = res.data.data
      $scope.group = retDat;

      //build a dat object to pass to http
      var members = retDat.members
      var dat = {
        token:auth.isAuthenticated(),
        payload:members
      };



      $http.post('/userIDQuery',dat).then(

        (res)=>{

          var arr = [];
          if(retDat.noLinkMembers){
            for(var i = 0; i<retDat.noLinkMembers.length;i++){
              var temp = {};
              //temp._id = i;
              temp.userName = retDat.noLinkMembers[i];
              temp.noLink = true;
            arr.push(temp);
          }
        }

          arr=arr.concat(res.data.data);

          for(var i = 0;i<arr.length;i++){
            for(var x = 0;x<retDat.notes.length;x++){
              if(arr[i]._id&&arr[i]._id==retDat.notes[x].user){
                arr[i].note=retDat.notes[x].note
              }else if(arr[i].userName==retDat.notes[x].user){
                arr[i].note=retDat.notes[x].note;
              }
            }

          }
          $scope.members = arr;

        },(res)=>{
          console.log('find user error');
        });

    },function(res){
      console.log('group not returned');
    })

  }else{
    $state.go('group',{reload:true});
  };

//-----------------------------------------------------------------------------------------------------------------------------------------------------------
//remove user function

    $scope.remove = function(member, group){

      //building  obj to pass to http
      // add the passed in memeber to be removed
      var obj = member
      //add the group id number
      obj.groupNumber = group._id;
      if(member.userName==auth.returnUserName()){
        alert('Don\'t Delet yourself');
      }else{
        //add the local token
        obj.token = auth.isAuthenticated();

        $http.post('/removeUser',obj).then((res)=>{

          $state.go('group.groupInfo',{groupObj:group},{reload:true});
        },(res)=>{
          //log error to console
          console.log(res);

        })
      }


    }

$scope.userNote = function(data,member,group){

  var d = $q.defer();
  var note = member.note;
  var user;
  if(member._id){
    user=member._id;
  }else{
    user=member.userName;
  }
  var dat = {
    token: auth.isAuthenticated(),
    note: data,
    user : user,
    groupNumber:group._id
  }

    $http.post('/setNote',dat).success((res)=>{
      if(res.status=200){
        d.resolve();
      }else{
        d.resolve('nan')
      }

    }).error((res)=>{
      d.reject();
    });
    return d.promise;


  /*var note = member.note;
  var user;
  if(member._id){
    user=member._id;
  }else{
    user=member.userName;
  }
  var dat = {
    token: auth.isAuthenticated(),
    note: note,
    user : user,
    groupNumber:group._id
  }
  $http.post('/setNote',dat).then((res)=>{
    //do nothing?
  },(res)=>{
    member.note=""
    //alert(res.message);
  })*/
}
//---------------------------------------------------------------------------------------------------------------------------------------------------------------
//group history
var dat = {
  token:auth.isAuthenticated(),
  type:'group',
  groupID: $stateParams.groupObj
}
$http.post('/history',dat).then(function(res){
  if(res){
    var arr = res.data.data;
    var users = new Set();
    for(var i=0;i<arr.length;i++){
      if(arr[i].actor!=undefined&&arr[i].actor!=null){users.add(arr[i].actor)};
      if(arr[i].actedUpon!=undefined&&arr[i].actedUpon!=null)users.add(arr[i].actedUpon);
    }
    var userDat = {
      token:auth.isAuthenticated(),
      payload:Array.from(users)
    };

    $http.post('/userIDQuery',userDat).then((res)=>{
      var returnedUsers = res.data.data;
      for(var x = 0; x<returnedUsers.length; x++){
        for(var i=0;i<arr.length;i++){
          if(arr[i].actor==returnedUsers[x]._id){
            arr[i].actor=returnedUsers[x].userName;
          }
          if(arr[i].actedUpon==returnedUsers[x]._id){
            arr[i].actedUpon=returnedUsers[x].userName;
          }
        }
      }
      $scope.groupHist = arr;
    },(res)=>{})
  }
},function(res){})

})
