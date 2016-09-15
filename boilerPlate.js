customMiddleWare.checkAdmin(id,results.admins,results.creator).then(
  function(userLevel){

  },
  function(userLevel){
    res.status(403).send({message:'Must have admin rights to group'});
  }
)
