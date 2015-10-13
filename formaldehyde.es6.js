Formaldehyde = (function(){

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

  // register is the method to register your parameter with a callback function.
  // based on the model above for params objects your call to this should look like
  //
  // Meteor.Poetic.ParamManager.register('user', function(value){console.log(value);});
  //
  // this will successfully console.log the new value when the value of user changes.
  // your function will most likely impliment some logic based on the value passed back.

  Interface.register = function(paramName, callback){
    check(paramName, String);
    check(callback, Function);

      // TODO add a test to check if paramName or callback are null and throw and error
    Params.push({
      param: paramName,                                    // save the parameter name passed
      value: null,
      callback: callback
    });
  }

  // This allows you to deregister a param callback by paramname

  Interface.deregister = function(paramName){
    check(paramName, String);

      // iterate through the params object and find a match to the paramName passed then remove it
    Params.forEach(function(param, i, params){
      if(param.param === paramName){
        params.splice(i, 1);
      }
    });
  }

  Interface.isRegistered = function(paramName){
    check(paramName, String);

    return Params.some(function(param){ return param.param === paramName });
  }


  // this function needs to push the state of the window, build a new URL based on values passed and then trigger any
  // callback functions that are rigistered to the change in url replace is a third optional arguement to update params
  // but not push the state forward.

  Interface.set = function(param, value, replace){
    check(param, String);
    check(value, Match.Any);
    check(replace, Match.Optional(Boolean));

    buildUrl(param, value, replace);                              // pass the values to build a new url
    document.dispatchEvent(ChangedURL);                 // url has changed fire an event to trigger callbacks
  }

  // allow the user an easy interface to find or poll for the value of param. This shouldn't ever be needed if the que
  // Set and Link methods are used properly, but it does allow for restful principles and easier debugging.

  Interface.get = function(param){
    check(param, String);

    return getParameterByName(param);
  }

  // ChangedURL is the event that will be listened to for url changes. Because of this you should always use
  // the paramManager to update the parameter url or ELSE your function will NOT be called.

  var ChangedURL = new Event('urlchange');

  // when the document is ready register our callbacks function on the urlchange event.
  window.onload = function(){
    document.addEventListener('urlchange', function(event){
      executeCallbacks();
    }, false);
    // register forward backwards and directly typed urls to fire this event.
    window.onpopstate = function(){
      document.dispatchEvent(ChangedURL);
    }
    document.dispatchEvent(ChangedURL);
  };


  // executeCallbacks will iterate through every object in the params array and execute its callback.
  // It will check its current value and the value in the URL if these values are the same then its callback
  // won't be called. If the values are different then the url was Changed so then it will run its callback and then
  // update its internal value to the new value

  function executeCallbacks(){
    var callbacks = [];
    var promises;

      // test if query param value can be represented in url
    var isAQueryValue = (thing) => {
      return (
        !_.isNull(thing) && !_.isUndefined(thing) && thing !== ''
      );
    };

    Params.forEach(paramObj => {
      var urlVal = getParameterByName(paramObj.param);

      if (paramObj.value !== urlVal) {
        if (!isAQueryValue(paramObj.value) && isAQueryValue(urlVal)) {
          callbacks.push({func: paramObj.callback, val: urlVal, status: {added: true}});

        } else if (isAQueryValue(paramObj.value) && !isAQueryValue(urlVal)) {
          callbacks.push({func: paramObj.callback, val: urlVal, status: {removed: true}});

        } else if (isAQueryValue(paramObj.value) && isAQueryValue(urlVal)) {
          callbacks.push({func: paramObj.callback, val: urlVal, status: {}});
        }

        paramObj.value = urlVal;
      }
    });

    if (callbacks.length) {
      promises = callbacks.map(cb => {
        return () => {
          return new Promise((resolve, reject) => {
            return cb.func(cb.val, cb.status, resolve);
          });
        };
      });

      promises.reduce((promise, next) => {
        return promise.then(next);
      }, Promise.resolve());
    }
  }

  // build URL is the interface set to trigger any callbacks whose state may have changed from the current set call
  // This is oriented around a direct javascript call. A template (html) linking method should be added that calls based
  // on multiple param values being changed in one link.

  function buildUrl(param, value, replaceState){
    check(param, String);
    check(value, Match.Any);

    var path = location.href.split('?')[0];
    var queryString = location.href.split('?')[1];
    var queryParam = param + '=' + value;
    var queryArray = [];
    var hasValue = (!_.isNull(value) && !_.isUndefined(value));
    var replacementString, paramFound;

    if (queryString) {
      queryArray = queryString.split('&');

      queryArray.forEach(function(query, i){
        if (query.split('=')[0] === param) {
          paramFound = true;
          queryArray[i] = hasValue ? queryParam : null;
        }
      });

      if (!paramFound && hasValue) { queryArray.push(queryParam) }
    } else if (hasValue) {
      queryArray.push(queryParam)
    }

    queryArray = _.compact(queryArray);

    if (queryArray.length) {
      replacementString = '?' + queryArray.join('&');

      if (replaceState) {
        history.replaceState({}, "OptionalTitle", path + replacementString);  // store a new state in memory with the built url
      } else {
        history.pushState({}, "OptionalTitle", path + replacementString);  // store a new state in memory with the built url
      }
    } else {
      history.pushState({}, "OptionalTitle", path);  // store a new state in memory with the built url
    }
  }

  // function that returns the value of a query param by name from the current url.
  function getParameterByName(name) {
      name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
      var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
          results = regex.exec(location.search);
      return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
  }

  return Interface;
})();
