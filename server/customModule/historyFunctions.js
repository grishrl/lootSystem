var history = require(__dirname+'/historyObjs.js');

var insertHistory = function(objDat){
  return new Promise(
    function(resolve, reject){
      var newHist = new history({'action':objDat.action, 'actor':objDat.actor, 'actedUpon':objDat.actedUpon, 'groupID':objDat.groupID, 'listID':objDat.listID,'note':objDat.note});
      newHist.save().then(function(response){
        resolve(response);
      },
      function(response){
        reject(response);
        })
    }
  )
}
module.exports = insertHistory;
