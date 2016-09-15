function groupPrettify(history,groups){

  var dat ={
        token:auth.isAuthenticated(),
        groups:Array.from(groups)
      }
      var deferred = $q.defer();
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
        deffered.resolve(history);

      },(res)=>{
        deffered.reject('Error getting group info.')
      })
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
}
