angular.module('lootSystem').directive('groupdropdownLists',function(){

  return {
    restrict:'E',
    replace:'true',
    templateUrl: '/templates/groupdropdown-lists.html',
    controller: 'groupDropdownController'
  }
})
