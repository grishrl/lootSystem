angular.module('lootSystem').controller('addUserModalController',function($scope,$uibModal){

  $scope.open = function(pas){
    var modalInstance = $uibModal.open({
      animation: true,
      templateUrl: '/modals/addUserModal.html',
      controller: 'addUserInstanceCtrl',
      size:'lg',
      resolve:{
        group:function(){return pas;}
      }
    });

    modalInstance.result.then(function(res){

      //PUT INTO DATABASE IF VALID
    },function(res){});
  }
})


.controller('addUserInstanceCtrl', function($scope, $uibModalInstance, $http, auth, group, $state){
  $scope.ok=function(obj){
    if(obj===undefined){alert('User can not be blank')}else{
      var pass = {};
      pass.member = obj;
      pass.token=auth.isAuthenticated();
      pass.groupID = group._id;

      $http.post('/addUser',pass).then((res)=>{
        $uibModalInstance.close(obj);
        $state.go('group.groupInfo',{groupObj:group},{reload:true});
      },(res)=>{
        $uibModalInstance.close(
          //http interceptor handles erros
        );
    });
    }

  };
  $scope.cancel = function(){
    $uibModalInstance.dismiss('cancel');
  };
})
