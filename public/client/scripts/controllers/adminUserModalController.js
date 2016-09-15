angular.module('lootSystem').controller('adminUserModalController',function($scope,$uibModal){

  $scope.open = function(pas){
    var modalInstance = $uibModal.open({
      animation: true,
      templateUrl: '/modals/adminUserModal.html',
      controller: 'adminUserInstanceCtrl',
      size:'lg',
      resolve:{
        group:function(){return pas;}
      }
    });

    modalInstance.result.then(function(res){

      //PUT INTO DATABASE IF VALID
    },function(){});

  };
})
.controller('adminUserInstanceCtrl', function($scope, $uibModalInstance, $http, auth, group, $state){

  var pas = {
    groupID: group._id,
    token: auth.isAuthenticated()
  };
 $http.post('/getGroup',pas).then((res)=>{


   //var diff = res.data.data.members.filter(x => res.data.data.admins.indexOf(x)<0
   //var diff = res.data.data.members.filter(filterIDs(x));
   var creator = res.data.data.creator;
   var admins  = res.data.data.admins;
   admins.push(creator);
   //diff = diff.filter(x=> res.data.data.creator!=x);
   var arr = res.data.data.members;
   var userQuery = {
     token:auth.isAuthenticated(),
     payload:arr
   }

   $http.post('userIDQuery',userQuery).then((res)=>{
     var retDat = res.data.data;
     var diff = [];
     var showAds = [];

       for(var x = 0;x<retDat.length;x++){
         if( admins.indexOf(retDat[x]._id)>=0){
           showAds.push(retDat[x]);
         }else{
           diff.push(retDat[x]);
         }
       }

     $scope.drop = diff;
     $scope.adList = showAds;
   },(res)=>{})
 },(res)=>{})

$scope.selection;

$scope.itemSelect=function(obj){
   $scope.selection = obj;
 };


  $scope.ok=function(){
    var dat = {
      token: auth.isAuthenticated(),
      groupID:group._id,
      userID:$scope.selection._id
    };
    $http.post('/makeAdmin',dat).then((res)=>{
      $uibModalInstance.close();
    },(res)=>{
      //http interceptor handles error
      $uibModalInstance.close();
    })
  };
  $scope.cancel = function(){
    $uibModalInstance.dismiss('cancel');
  };
})
