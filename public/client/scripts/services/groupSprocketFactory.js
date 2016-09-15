angular.module('lootSystem').factory('groupSprocket', function groupSprocketFactory($http){
  return {
    'groupListRet':function(pass){
      //console.log(pass);
      return $http.post('/adminGroup',pass);
    }
  }
})
