var app = angular.module('indexDBSample', []);

app.factory('indexedDBDataSvc', function($window, $q){
  var indexedDB = $window.indexedDB;
  var db=null;
  var lastIndex=0;
  
  var open = function(){
    var deferred = $q.defer();
    var version = 1;
    var request = indexedDB.open("todoData", version);
  
    request.onupgradeneeded = function(e) {
      db = e.target.result;
  
      e.target.transaction.onerror = indexedDB.onerror;
  
      if(db.objectStoreNames.contains("todo")) {
        db.deleteObjectStore("todo");
      }
  
      var store = db.createObjectStore("todo",
        {keyPath: "id"});
    };
  
    request.onsuccess = function(e) {
      db = e.target.result;
      deferred.resolve();
    };
  
    request.onerror = function(){
      deferred.reject();
    };
    
    return deferred.promise;
  };
  
  var getTodos = function(){
    var deferred = $q.defer();
    
    if(db === null){
      deferred.reject("IndexDB is not opened yet!");
    }
    else{
      var trans = db.transaction(["todo"], "readwrite");
      var store = trans.objectStore("todo");
      var todos = [];
    
      // Get everything in the store;
      var keyRange = IDBKeyRange.lowerBound(0);
      var cursorRequest = store.openCursor(keyRange);
    
      cursorRequest.onsuccess = function(e) {
        var result = e.target.result;
        if(result === null || result === undefined)
        {
          deferred.resolve(todos);
        }
        else{
          todos.push(result.value);
          if(result.value.id > lastIndex){
            lastIndex=result.value.id;
          }
          result.continue();
        }
      };
    
      cursorRequest.onerror = function(e){
        console.log(e.value);
        deferred.reject("Something went wrong!!!");
      };
    }
    
    return deferred.promise;
  };
  
  var deleteTodo = function(id){
    var deferred = $q.defer();
    
    if(db === null){
      deferred.reject("IndexDB is not opened yet!");
    }
    else{
      var trans = db.transaction(["todo"], "readwrite");
      var store = trans.objectStore("todo");
    
      var request = store.delete(id);
    
      request.onsuccess = function(e) {
        deferred.resolve();
      };
    
      request.onerror = function(e) {
        console.log(e.value);
        deferred.reject("Todo item couldn't be deleted");
      };
    }
    
    return deferred.promise;
  };
  
  var addTodo = function(todoText){
    var deferred = $q.defer();
    
    if(db === null){
      deferred.reject("IndexDB is not opened yet!");
    }
    else{
      var trans = db.transaction(["todo"], "readwrite");
      var store = trans.objectStore("todo");
      lastIndex++;
      var request = store.put({
        "id": lastIndex,
        "text": todoText
      });
    
      request.onsuccess = function(e) {
        deferred.resolve();
      };
    
      request.onerror = function(e) {
        console.log(e.value);
        deferred.reject("Todo item couldn't be added!");
      };
    }
    return deferred.promise;
  };
  
  return {
    open: open,
    getTodos: getTodos,
    addTodo: addTodo,
    deleteTodo: deleteTodo
  };
  
});

app.controller('TodoController', function($window, indexedDBDataSvc){
  var vm = this;
  vm.todos=[];
  
  vm.refreshList = function(){
    indexedDBDataSvc.getTodos().then(function(data){
      vm.todos=data;
    }, function(err){
      $window.alert(err);
    });
  };
  
  vm.addTodo = function(){
    indexedDBDataSvc.addTodo(vm.todoText).then(function(){
      vm.refreshList();
      vm.todoText="";
    }, function(err){
      $window.alert(err);
    });
  };
  
  vm.deleteTodo = function(id){
    indexedDBDataSvc.deleteTodo(id).then(function(){
      vm.refreshList();
    }, function(err){
      $window.alert(err);
    });
  };
  
  function init(){
    indexedDBDataSvc.open().then(function(){
      vm.refreshList();
    });
  }
  
  init();
});



//GPS test code
function maximumAge0(){
    navigator.geolocation.getCurrentPosition(onSuccess, onError, {enableHighAccuracy:true, timeout: 60000, maximumAge: 0});
}

function maximumAgeNo(){
    navigator.geolocation.getCurrentPosition(onSuccess, onError);
}

function onSuccess(position) {
    alert('GPS works fine!' +
          'Latitude: '          + position.coords.latitude          + '\n' +
          'Longitude: '         + position.coords.longitude         + '\n' +
          'Altitude: '          + position.coords.altitude          + '\n' +
          'Accuracy: '          + position.coords.accuracy          + '\n' +
          'Altitude Accuracy: ' + position.coords.altitudeAccuracy  + '\n' +
          'Heading: '           + position.coords.heading           + '\n' +
          'Speed: '             + position.coords.speed             + '\n' +
          'Timestamp: '         + position.timestamp                + '\n' +
          'Time from position: '+ (new Date(position.timestamp))    + '\n' +
          'Current time: '      + new Date()                        + '\n');
};

// onError Callback receives a PositionError object
function onError(error) {
    alert('code: '    + error.code    + '\n' +
          'message: ' + error.message + '\n');
};