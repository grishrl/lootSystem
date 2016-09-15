angular.module('lootSystem').controller('homeHistoryController', function(auth, $http, $scope,$q){

//build dat object to query hsitory
var dat = {
  type: 'user',
  token: auth.isAuthenticated(),
  user : auth.returnUserName()
}

//user name on home page
$scope.userName = dat.user;

//query history
$http.post('/history',dat).then((res)=>{
  //history is response from the query
  var history =res.data.data
  for(i =0;i<history.length;i++){
    history[i].groupClean = true;
    history[i].listClean = true;
    history[i].actorClean = true;
    history[i].actedUponClean = true;
  }
    //get a unique set of groupIDs
    var groups = new Set();
    var lists = new Set();
    var users = new Set();
    for(var i =0; i<res.data.data.length;i++){
      groups.add(res.data.data[i].groupID);
      lists.add(res.data.data[i].listID);
      users.add(res.data.data[i].actedUpon);
      users.add(res.data.data[i].actor);
    }

      groupPrettify(history,groups).then(
        listPrettify(history,lists).then(
          userPrettify(history,users).then(
          function(res){
            var history = res;
            var lootArray = history.slice();
          var allHistory = [];
          for(var i=lootArray.length;i>=0;i--){
            if(lootArray[i] && !lootArray[i].action.includes('loot')){
             allHistory.push(lootArray[i]);
             lootArray.splice(i,1);
          }
          }
          for(var i=lootArray.length;i>=0;i--){
          if(lootArray[i]){
            if(lootArray[i].actedUpon!=$scope.userName){
              allHistory.push(lootArray[i]);
              lootArray.splice(i,1);
            }
          }
        }



        $scope.history=lootArray;
        $scope.otherHistory = allHistory;
        }
        )
      )
    )
    /*
    //loop through the groupIDs
      var dat ={
        token:auth.isAuthenticated(),
        groups:Array.from(groups)
      }

      $http.post('/getGroups',dat).then((res)=>{

        var groups = res.data.data;
        for(var i=0;i<history.length;i++){
          for(var x =0;x<groups.length;x++){
            if(history[i].groupID==groups[x]._id){
              history[i].groupID = groups[x].name;
              history[i].groupClean=false;
            }
          }
        }

      },(res)=>{
        //nothing
      })
      dat = null;
      dat = {
        token:auth.isAuthenticated(),
        query:'listid',
        queryID:Array.from(lists)
      }
      $http.post('/getLists',dat).then((res)=>{
        var lists = res.data.data;
        for(var i=0;i<history.length;i++){
          for(var x =0;x<lists.length;x++){
            if(history[i].listID==lists[x]._id){
              history[i].listID = lists[x].name;
              history[i].listClean=false;
            }
          }
        }
      },(res)=>{
        //nothing
      })

      dat = null;
      dat = {
        token: auth.isAuthenticated(),
        payload:Array.from(users)
      };
      $http.post('/userIDQuery',dat).then((res)=>{
        var users = res.data.data;
        for(var i=0;i<history.length;i++){
          for(var x =0;x<users.length;x++){
            if(history[i].actor==users[x]._id){
              history[i].actor = users[x].userName;
              history[i].actorClean=false;
            }
          }
        }
        for(var i=0;i<history.length;i++){
          for(var x =0;x<users.length;x++){
            if(history[i].actedUpon==users[x]._id){
              history[i].actedUpon = users[x].userName;
              history[i].actedUponClean=false;
            }
          }
        }

        var lootArray = history.slice();
        var allHistory = [];
        for(var i=lootArray.length;i>=0;i--){
          if(lootArray[i] && !lootArray[i].action.includes('loot')){
           allHistory.push(lootArray[i]);
           lootArray.splice(i,1);
        }
        }
        for(var i=lootArray.length;i>=0;i--){
        if(lootArray[i]){
          if(lootArray[i].actedUpon!=$scope.userName){
            allHistory.push(lootArray[i]);
            lootArray.splice(i,1);
          }
        }
      }

      $scope.history=lootArray;
      $scope.otherHistory = allHistory;

      },(res)=>{
        console.log(res);
      })*/


  },(res)=>{})


//---------------------------- promise methods
  function groupPrettify(history,groups){

     var deferred = $q.defer();
     var dat ={
           token:auth.isAuthenticated(),
           groups:Array.from(groups)
         }

         $http.post('/getGroups',dat).then((res)=>{

           var groups = res.data.data;
           for(var i=0;i<history.length;i++){
             for(var x =0;x<groups.length;x++){
               if(history[i].groupID==groups[x]._id){
                 history[i].groupID = groups[x].name;
                 history[i].groupClean=false;
               }
             }
           }
           deferred.resolve(history);

         },(res)=>{
           deferred.reject('Error getting group info.')
         })
         return deferred.promise;
   }

  function listPrettify(history,lists){
    var deffered = $q.defer();
    dat = {
        token:auth.isAuthenticated(),
        query:'listid',
        queryID:Array.from(lists)
      }
      $http.post('/getLists',dat).then((res)=>{
        var lists = res.data.data;
        for(var i=0;i<history.length;i++){
          for(var x =0;x<lists.length;x++){
            if(history[i].listID==lists[x]._id){
              history[i].listID = lists[x].name;
              history[i].listClean=false;
            }
          }
        }
        deffered.resolve(history);
      },(res)=>{
        deffered.reject('Error getting list info.');
        //nothing
      })
      return deffered.promise;
  }

  function userPrettify(history,users){
    var deffered = $q.defer();
    dat = null;
  dat = {
    token: auth.isAuthenticated(),
    payload:Array.from(users)
  };

  $http.post('/userIDQuery',dat).then((res)=>{
    var users = res.data.data;
    for(var i=0;i<history.length;i++){
      for(var x =0;x<users.length;x++){
        if(history[i].actor==users[x]._id){
          history[i].actor = users[x].userName;
          history[i].actorClean=false;
        }
      }
    }
    for(var i=0;i<history.length;i++){
      for(var x =0;x<users.length;x++){
        if(history[i].actedUpon==users[x]._id){
          history[i].actedUpon = users[x].userName;
          history[i].actedUponClean=false;
        }
      }
    }

    deffered.resolve(history);

  },(res)=>{
    deffered.reject('Error getting list info')
  })
  return deffered.promise;
  }


})
