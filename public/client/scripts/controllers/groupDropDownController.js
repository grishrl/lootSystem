
//this controller populates the group selection drop down box,
//for the group drop down directive and the group drop down button on the group page

angular.module('lootSystem').controller('groupDropdownController', function($scope,$http,auth,$rootScope,groupSprocket){
  //make sure the pass object is cleared when the controller re-runs
  var passObj = {};

  //put the user's token in the object
  passObj.token = auth.isAuthenticated();

  //
  $http.post('/adminGroup',passObj).then((res)=>{
    $scope.groups = res.data.data;

  },(res)=>{
    //log error to console
    console.log('error in group retrieval');
    console.log(res);
  })

//commented out 8/31/2016 this factory call only served to call the HTTP service - may be reimplemented if the factory is made more robust.
  /*
  groupSprocket.groupListRet(passObj).then((res)=>{
    $scope.groups = res.data.data;

  },(res)=>{
    //log error to console
    console.log('error in group retrieval');
    console.log(res);
  });*/

//-----------------------------
//watch for the event of group created to be emitted
//once it is you need to refresh the group data for the drop down list.
  $rootScope.$on('group-created',function(event, obj){
    var passObj = {token:auth.isAuthenticated()};
    groupSprocket.groupListRet(passObj).then((res)=>{
      $scope.groups = res.data.data;

    },(res)=>{
      //log error to console
      console.log('error in group retrieval');
      console.log(res);
    });
  });


//sets the text of the button - this applies to the directive where onClick , changes the text of the button
  $scope.buttonText = 'Current Groups ';

})
