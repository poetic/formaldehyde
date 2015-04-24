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
      // TODO add a test to check if paramName or callback are null and throw and error
      Params[Params.length] = {
        param: paramName,                                    // save the parameter name passed 
        value: getParameterByName(paramName),                // find that parameter's current value in the URL
        callback: function(){                                // create a function to call the passed function with
          callback(getParameterByName(paramName, o))         // accept an object reference as a second parameter so  
        }                                                    // the user can maintain scope without using function.bind()
      }
    }

    // This allows you to deregister a param callback by paramname
    Interface.DeRegisterParam = function(paramName){
      // iterate through the params object and find a match to the paramName passed then remove it
      for(var i = 0; i < Params.length; i++){  
        if(Params[i].param === paramName){
          Params.splice(i, 1);
          i = Params.length;
        }
      }
    }
    // build URL is the interface set to trigger any callbacks whose state may have changed from the current set call
    // This is orientated around a direct javascript call. A template (html) linking method should be added that calls based
    // on multiple param values being changed in one link.
    function buildUrl(p, v){
      var base = window.location.href;                            // get the URL currently in state
      var search = '?'                                            // save to default empty but with a param initializer
      for(var i = 0; i < Params.length; i++){                     // iterate through all params O(n) we should probably speed up
        if(Params[i].value !== null){                             // if the value isn't blank
          search += Params[i].param + "=" + Params[i].value;      // add the param name and value to the url
          if(i < Params.length-1){                                // if this isn't the last parameter in the array
            search += "&";                                        // add another ampersand
          }
        }
      }
      if(search === '?'){                                         // if search is still blank (worst case scenerio)
        search += p + "=" + v;                                    // append the passed param and value to the url
      }
      else{
        search += "&" + p + "=" + v;                              // otherwise make it add to the already existing param
      }                                                           // chain                 
      window.history.pushState({}, "NoOneUsesThis", base + search);  // store a new state in memory with the built url
    }

    // this function needs to push the state of the window, build a new URL based on values passed and then trigger any
    // callback functions that are rigistered to the change in url
    Interface.setParam = function(param, value){
      buildUrl(param, value);                              // pass the values to build a new url
      document.dispatchEvent('urlchange');                 // url has changed fire an event to trigger callbacks
    }
    
    // allow the user an easy interface to find or poll for the value of param. This shouldn't ever be needed if the que
    // Set and Link methods are used properly, but it does allow for restful principles and easier debugging.
    Interface.getParam = function(param){
      return getParameterByName(param);
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

