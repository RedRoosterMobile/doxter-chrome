function connect(args) {

  $.ajax({
    url: args.baseUrl+"/"+args.path,
    headers: {"Authorization": "Basic "+btoa(args.username+":"+args.password) }, 
    success: function(data) { args.success(data) },
    error: function(data) { args.error(data) } 
  });

}
