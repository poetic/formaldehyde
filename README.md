# formaldehyde

An application state URL param manager. The module allows you to build any javascript object to have variables bound to the url params. This is to allow for easy url control of your app without having to inflict uneeded page loading.  It is basically a param based router system, that will execute callback functions that you pass it.

# Installation

`meteor add poetic:formaldehyde`

# Namespace

All methods can be called by using the

`Meteor.Poetic.ParamManager.[methodName]();`

If you find this namespace to be too verbose just shorten it in your project to whatever your Preference

```
var PM = Meteor.Poetic.ParamManager;
// then call
PM.[MethodName]();
```


# Object API

```
paramManager:
  RegisterParam: function(paramName, callback)
  DeRegisterParam: function(paramName)
  setParam: function(param, value, replace)
  getParam: function(param)
```

# Methods

#`RegisterParam(paramName, callback)`

This function will register your parameter name and call the callback function anytime that value changes. This function accepts two arguments the first is the actual name of the URL parameter and the second is the function that you want to fire when it changes.  This function will be called with one arguement which is the value of that parameter in its current state.

A simple example usage would be

`Meteor.Poetic.ParamManager.RegisterParam("foo", function(val){console.log(val);});`

If you navigate to the page as mydomain.com/?foo=bar then you will see the output bar in the console.

#`DeRegisterParam(paramName)`

Simply call this function and pass your param to deactivate a callback if it should only be called based on verification ect.

```
// register the param foo
Meteor.Poetic.ParamManager.RegisterParam("foo", function(val){console.log(val);});
// set the param to bar.
Meteor.Poetic.ParamManager.setParam("foo", "bar");
// console will log "bar"
// deregister the foo param
Meteor.Poetic.ParamManager.DeRegisterParam("foo");
Meteor.Poetic.ParamManager.setParam("foo", "bar");
// nothing will be logged and no callback functions will be called
```
#  `setParam(param, value, replace)`

You should use this method at all times to update your url and never do so with manual javascript window.history.pushState because your callback function will not be fired. Unfortunately current javascript versions do not support a fired event hook during the pushState call.

It is normal set method that you pass the param name as the first argument the new value as the second arguement and replace is an optional third parameter. If replace is true then your set will not actually push window state, meaning the URL will update with the new param value, and the callback will fire, but the window history won't be updated. So the back button will not go back to the last time this was called.

The replace boolean is useful for situations such as google maps when your parameters may change very often due to user input but the back button should still navagate back to the previous page state and not the last dragged position.

Using this method fires an event that will register your callback.

`Meteor.Poetic.ParamManager.setParam("foo", "bar");`

#  `getParam(param)`

Simple getParam helper function. Even though paramValue is passed to your callback function it may still be useful for you to programatically check for the value of your param during your function so this API was made available. If you pass it a param name it will return that params value, even if it is not a registered param name.

```
// with assumed domain address: mydomain.com/?foo=bar
var x = Meteor.Poetic.ParamManager.getParam("foo");
console.log(x);  // outputs bar
```
