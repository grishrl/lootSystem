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
.controller('createGroupInstanceCtrl', function($scope, $uibModalInstance){
  $scope.ok=function(obj){
    $uibModalInstance.close(obj);
  };
  $scope.cancel = function(){
    $uibModalInstance.dismiss('cancel');
  };
})
