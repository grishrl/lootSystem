angular.module('lootSystem').controller('createListModalController',function($scope,$uibModal){

  $scope.open = function(passVal){
    var modalInstance = $uibModal.open({
      animation: true,
      templateUrl: '/modals/createListModal.html',
      controller: 'createListInstanceCtrl',
      size:'lg',
      resolve:{
        groupID:function(){return passVal;}
      }
    });

    modalInstance.result.then(function(res){
      //PUT INTO DATABASE IF VALID
    },function(){});

  };
})
.controller('createListInstanceCtrl', function($scope, $uibModalInstance, $http, auth, groupID,$rootScope){
  $scope.ok=function(obj){
    obj.groupId = groupID._id;
    obj.token = auth.isAuthenticated();
    $http.post('/createList',obj).then((res)=>{
      $rootScope.$emit('list-created',{
        _id:groupID._id,
        name:groupID.name
      });
      $uibModalInstance.close(obj);
    }
    ,(res)=>{

        $uibModalInstance.close(
          //http interceptor handles erros
        );

    })

  };
  $scope.cancel = function(){
    $uibModalInstance.dismiss('cancel');
  };
})
