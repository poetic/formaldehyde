if(Meteor.isClient){
  // Check if the Meteor.Poetic object is already populated... if we use this as a normal namespace
  // Some other module may have already declared it.. if not then it needs to be instantiated as an empty
  // object
  if (typeof Meteor.Poetic === "undefined") {
    Meteor.Poetic = {};
  }
  else{
    console.log("Meteor.Poetic already exhists");
  }
  // Register the ParamManager under the Meteor.Poetic namespace
  Meteor.Poetic.ParamManager = (function(){

    // Interface is the object that will be returned.. any function or variable added to this will be available
    // in the global scope Meteor.Poetic.ParamManager.[methodName]

    var Interface = {};

    // this will be an array of all param objects. This is private and should remain so.
    // A param object will follow the structure such as
    // {
    //   param: TheParameterName,
    //   value: TheValueOfThisParam,
    //   callback: TheFunctionToCallIfThisValueChanges
    // }

    var Params = [];

    // RegisterParamFunction is the method to register your parameter with a callback function.
    // based on the model above for params objects your call to this should look like
    //
    // Meteor.Poetic.ParamManager.RegisterParamFunction('user', function(value){console.log(value);});
    //
    // this will successfully console.log the new value when the value of user changes.
    // your function will most likely impliment some logic based on the value passed back.

    Interface.RegisterParam = function(paramName, callback){
      Params[Params.length] = {
        param: paramName,
        value: getParameterByName(paramName),
        callback: function(){
          callback(getParameterByName(paramName))
        }
      }
    }

    // This allows you to deregister a param callback by paramname
    Interface.DeRegisterParam = function(paramName){
      for(var i = 0; i < Params.length; i++){
        if(Params[i].param === paramName){
          Params.splice(i, 1);
          i = Params.length;
        }
      }
    }

    function buildUrl(p, v){
      var base = window.location.href;
      var search = '?'
      for(var i = 0; i < Params.length; i++){
        if(Params[i].value !== null){
          search += Params[i].param + "=" + Params[i].value;
          if(i < Params.length-1){
            search += "&";
          }
        }
      }
      if(search === '?'){
        search += p + "=" + v;
      }
      else{
        search += "&" + p + "=" + v;
      }
      window.location = base + search;
    }

    Interface.setParam = function(param, value){
      buildUrl();
    }

    Interface.getParam = function(param){

    }
    // ChangedURL is the event that will be listened to for url changes. Because of this you should always use
    // the paramManager to update the parameter url or ELSE your function will NOT be called.

    var ChangedURL = new Event('urlchange');

    // executeCallbacks will iterate through every object in the params array and execute its callback.
    // It will check its current value and the value in the URL if these values are the same then its callback
    // won't be called. If the values are different then the url was Changed so then it will run its callback and then
    // update its internal value to the new value
    function executeCallbacks(){
      for(var i = 0; i < Params.length; i++){
        var curVal = getParameterByName(Params[i].param);
        if(Params[i].value !== curVal){
          Params[i].callback(curVal);
          Params[i].value = curVal;
        }
      }
    }

    // when the document is ready register our callbacks function on the urlchange event.
    window.onload = function(){
      document.addEventListener('urlchange', function(event){
        executeCallbacks();
      }, false);
      // register forward backwards and directly typed urls to fire this event.
      window.onpopstate = function(){
        document.dispatchEvent('urlchange');
      }
    };

    // simple function that returns the value of a query param by name from the current url.
    function getParameterByName(name) {
        name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
        var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
            results = regex.exec(location.search);
        return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
    }

    return Interface;
  })();
}

