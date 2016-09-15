angular.module('lootSystem').controller('permalinkModalController',function($scope,$uibModal){

  $scope.open = function(pas){
    var modalInstance = $uibModal.open({
      animation: true,
      templateUrl: '/modals/permalinkModal.html',
      controller: 'permalinkInstanceCtrl',
      size:'lg',
      resolve:{
        group:function(){return pas;}
      }
    });

    modalInstance.result.then(function(res){
      //PUT INTO DATABASE IF VALID
    },function(){console.log('idk lol');});

  };
})
.controller('permalinkInstanceCtrl', function($scope, $uibModalInstance, $http, auth, group, $state, $httpParamSerializer, $location){
  $scope.permalink=group.permalink;

  var x="";
  x+=$location.$$protocol;
  x+='://';
  x+=$location.$$host;
  x+=':'
  x+=$location.$$port;
  x+='/#/permalink/';
  $scope.status = group.permalink;
  var url = 'http://localhost:3000/#/permalink/';
  var params ={
    g: group._id,
  }

  var qs = $httpParamSerializer(params);
  var permalink = x+qs
  $scope.$watch('status',function(newValue, oldValue, scope){
    if(newValue){
        scope.permaLink=permalink;
    }else{
      scope.permaLink=""
    }
  })

  $scope.ok=function(obj){
    var dat = {
      token:auth.isAuthenticated(),
      groupID:group._id,
      status:obj
    }
    $http.post('/togglePermalink',dat).then((res)=>{
        $uibModalInstance.close(obj);
    },(res)=>{
      alert(res.message);
    })
  };
  $scope.cancel = function(){
    $uibModalInstance.dismiss('cancel');
  };
})

function makeid(x)
{
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for( var i=0; i < x; i++ )
        text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
}
