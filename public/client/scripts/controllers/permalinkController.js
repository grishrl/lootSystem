angular.module('lootSystem').controller('permalinkController',function($http,$location,$scope,$state){
  //if($cookies.get('group')){
  //  var dat = {
  //    group:$cookies.get('group')
  //  }
  //}else{
    var str = $location.$$url;
    var loc = $location.$$url.indexOf('g=');
    var group = str.slice(loc+2,$location.$$url.length);
    var dat = {
      group:group
    }
  //  $cookies.put('group',group);
  //}


  $http.post('/permaGroup',dat).then((res)=>{
    if(res.data.data.permalink){
      $scope.groupData = res.data.data;
      $scope.groupName = res.data.data.name;
    }else {
      alert('This group permalink is disabled.')
      $state.go('signin')
    }

  },(res)=>{})
  $http.post('/permaLists',dat).then((res)=>{

    $scope.lists = res.data.data;

  },(res)=>{

  })
})

angular.module('lootSystem').controller('permalinkListController',function($stateParams,$scope,$http){

  $scope.listName = $stateParams.listID.name;
  var temp = $stateParams.listID.members;
  var arr = [];
  angular.forEach(temp, function(value, key){
    arr.push(value.user);
  })
  var dat = {
    payload:arr
  }
  $http.post('userIDQuery',dat).then((res)=>{
    var resp = res.data.data;
    for(var i = 0; i<resp.length;i++){
      for(var x = 0; x<temp.length;x++){
        if(temp[x].user==resp[i]._id){
          temp[x].user=resp[i].userName;
        }
      }
    }
    $scope.list1=temp;
  },(res)=>{
  })

  refreshListHistory();

  //---------------------------------------------------------------------------------------------------------
  //filling the history box
  function refreshListHistory(){

    var listDat = {
      type:'list',
      listID:$stateParams.listID._id
    }

    $http.post('/history', listDat).then((res)=>{
      if(res){
        
        var arr = res.data.data;
        var users = new Set();
        for(var i=0;i<arr.length;i++){
          if(arr[i].actor!=undefined&&arr[i].actor!=null){users.add(arr[i].actor)};
          if(arr[i].actedUpon!=undefined&&arr[i].actedUpon!=null)users.add(arr[i].actedUpon);
        }
        var userDat = {
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
          $scope.listHist = arr;
        },(res)=>{})
      }
    },(res)=>{}

    )
  }
})
