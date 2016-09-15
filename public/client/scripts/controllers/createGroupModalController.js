angular.module('lootSystem').controller('createGroupModalController',function($scope,$uibModal){

  $scope.open = function(){
    var modalInstance = $uibModal.open({
      animation: true,
      templateUrl: '/modals/createGroupModal.html',
      controller: 'createGroupInstanceCtrl',
      size:'lg'
    });

    modalInstance.result.then(function(res){

      //PUT INTO DATABASE IF VALID
    },function(){});

  };
})
.controller('createGroupInstanceCtrl', function($scope, $uibModalInstance, $http, auth,$rootScope){

  $scope.ok=function(obj){
    obj.token = auth.isAuthenticated();

    $http.post('/createGroup',obj).then((res)=>{

      $rootScope.$emit('group-created',{});
      $uibModalInstance.close(obj);

    },(res)=>{
      $uibModalInstance.close(
        //http interceptor handles errors
        
      )
    });
  };
  $scope.cancel = function(){
    $uibModalInstance.dismiss('cancel');
  };
})
