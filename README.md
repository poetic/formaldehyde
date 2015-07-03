# formaldehyde

Formaldehyde is a query param based router that allows you to bind a callback function to a given query param. It gives you fine grained control over the order of param resolution, in addition to easy pushState/replaceState usage. The goal is to give you total control over your Meteor app's query params and prevent unneeded page loading and rerendering.

# Installation

`meteor add poetic:formaldehyde`

# Methods

All methods exist under the `Meteor.Poetic.Formaldehyde` namespace.

## `register(paramName, callback)`

This method will register your parameter name and call the callback function anytime that value changes. This method accepts two arguments: the first is the name of the URL parameter; the second is the function that you want to fire when the parameter changes.  The callback function will be called with three arguments: the param's current value; a state object defined by the package; and a `done` function that you will call to allow the next callback in the series to execute.

The following are some basic examples:
```
Meteor.Poetic.Formaldehyde.register('test', function(val, state, done){
  console.log('test callback fired');
  done();
});

Meteor.Poetic.Formaldehyde.register('testAsync', function(val, state, done){
  console.log('testAsync callback fired');
  setTimeout(function(){
    console.log('testAsync callback finishing after 3 seconds');
    done();
  }, 3000);
});
```

The `state` object can have one of two keys: `added` or `removed` (whose value will always be `true`), which refer to query params being added or removed from the url so that you can perform any init/teardown operations; otherwise `state` is an empty object.

It is important to note that callbacks will be fired in the order that they are registered, so it is advisable to put all of your registrations into a single file to make the order of execution explicit. Callbacks are fired serially, meaning the next callback will wait for the current callback to fire `done()` before executing.

## `deregister(paramName)`

Simply call this function and pass your param to deactivate a callback if it should only be called based on verification etc.

```
// register the param foo
Meteor.Poetic.Formaldehyde.register("foo", function(val, status, done){
  console.log(val);
  done();
});
// set the param to bar.
Meteor.Poetic.Formaldehyde.set("foo", "bar");
// console will log "bar"
// deregister the foo param
Meteor.Poetic.Formaldehyde.deregister("foo");
Meteor.Poetic.Formaldehyde.set("foo", "bar");
// nothing will be logged and no callback functions will be called
```

## `isRegistered(param)`

Check if a query param is currently registered. Returns a boolean.

##  `set(param, value, replace)`

You should use this method at all times to update your url and never do so with manual javascript window.history.pushState because your callback function will not be fired. Unfortunately current javascript versions do not support a fired event hook during the pushState call.

It is normal set method that you pass the param name as the first argument the new value as the second arguement and replace is an optional third parameter. If replace is true then your set will not actually push window state, meaning the URL will update with the new param value, and the callback will fire, but the window history won't be updated. So the back button will not go back to the last time this was called.

The replace boolean is useful for situations such as google maps when your parameters may change very often due to user input but the back button should still navagate back to the previous page state and not the last dragged position.

Using this method fires an event that will register your callback.

`Meteor.Poetic.Formaldehyde.set("foo", "bar");`

## `get(param)`

Simple getter method. Even though paramValue is passed to your callback function it may still be useful for you to programatically check for the value of your param during your function so this API was made available. If you pass it a param name it will return that params value, even if it is not a registered param name.

```
// with assumed domain address: mydomain.com/?foo=bar
var x = Meteor.Poetic.Formaldehyde.get("foo");
console.log(x);  // outputs bar
```
