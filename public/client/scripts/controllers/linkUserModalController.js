angular.module('lootSystem').controller('linkUserModalController',function($scope,$uibModal){

  $scope.open = function(pas, pasTwo){
    var modalInstance = $uibModal.open({
      animation: true,
      templateUrl: '/modals/linkUserModal.html',
      controller: 'linkUserInstanceCtrl',
      size:'lg',
      resolve:{
        group:function(){return pasTwo;},
        member:function(){return pas;}
      }
    });

    modalInstance.result.then(function(res){
      //PUT INTO DATABASE IF VALID
    },function(){});

  };
})
.controller('linkUserInstanceCtrl', function($scope, $uibModalInstance, $http, auth, group, member, $state){
  $scope.ok=function(obj){
    if(obj===undefined){alert('User can not be blank');}else if(!member.noLink){
      alert('Member is all ready linked!');
      $uibModalInstance.dismiss('cancel');
    }else{
      var pas = {
        currentMemberName: member.userName,
        groupID: group._id,
        token: auth.isAuthenticated(),
        linkedName: obj
      };

      $http.post('/linkUser',pas).then((res)=>{
        $uibModalInstance.close(obj);
        $state.go('group.groupInfo',{groupObj:group},{reload:true});
      },(res)=>{
        
        alert(res.data.message)
        $uibModalInstance.close(

          //http interceptor handles errors
        );
      })

    }

  };
  $scope.cancel = function(){
    $uibModalInstance.dismiss('cancel');
  };
})
