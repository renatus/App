var phonecatApp = angular.module('startApp', ['exoFilters']);

phonecatApp.controller('StartCtrl', function ($scope, indexedDBexo) {
    
    
    
    
    
    
    
    $scope.i18nEntries = [
        {"nid":1, "title":{"en":"TitleEn", "ru":"titleRu"}}, {"nid":2, "title":{"en":"English", "ru":"Russian"}}
    ];
    
    
    
    
    
    



	$scope.manyEntries = [];
	var allEntries = [];

	for (var i = 0; i < 1000; i++) {
		var newEntry = {"nid":i, "text":"Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum."}

		allEntries.push(newEntry);
		//$scope.manyEntries.push(newEntry);
	}
	$scope.manyEntries = allEntries;



	$scope.filter50 = function(manyEntry){

        if(manyEntry.nid < $scope.manyNID && manyEntry.nid > ($scope.manyNID - 50)){
            return true; // this will be listed in the results
        }

        return false; // otherwise it won't be within the results
    };






	$scope.activities = [
		{"nid":"6650","language":"English","title":"End an agreements with Stream ISP","status":"Completed","statusRAW":"completed","priority":"Low","priorityRAW":"1000","strategicImportance":"Low","strategicImportanceRAW":"1000","difficultyPlanned":"Hard","difficultyPlannedRAW":"3000","difficulty":"Hard","difficultyRAW":"3000","group":"Flat 524, Biryulyovo, flat 464, MTS, Internet","groupRAW":"742, 760, 1501, 472","dateTimePlannedStart":"2014-03-01 11:00:50","dateTimePlannedEnd":"2014-03-19 18:00:24","dateTimePlannedTZ":"Europe/Moscow Europe/Moscow","dateTimePlannedOffset":"14400 14400","dateTimeStart":"2014-03-07 04:01:53","dateTimeEnd":"2014-03-07 04:01:56","dateTimeTZ":"Europe/Moscow Europe/Moscow","dateTimeOffset":"14400 14400","lastUpdated":"1394150475","bodySummary":""},
		{"nid":"6090","language":"Russian","title":"\u041e\u043f\u043b\u0430\u0442\u0430 \u0438\u043d\u0442\u0435\u0440\u043d\u0435\u0442\u0430, \u041c\u0422\u0421, +7(916)5477868","status":"Completed","statusRAW":"completed","priority":"Major","priorityRAW":"3000","strategicImportance":"Low","strategicImportanceRAW":"1000","difficultyPlanned":"Normal","difficultyPlannedRAW":"2000","difficulty":"Normal","difficultyRAW":"2000","group":"Internet, Payments, Phone, MTS","groupRAW":"472, 743, 1191, 1501","dateTimePlannedStart":"2014-03-31 00:00:43","dateTimePlannedEnd":"2014-04-03 23:54:19","dateTimePlannedTZ":"Europe/Moscow Europe/Moscow","dateTimePlannedOffset":"14400 14400","dateTimeStart":"2014-03-07 04:02:30","dateTimeEnd":"2014-03-07 04:02:33","dateTimeTZ":"Europe/Moscow Europe/Moscow","dateTimeOffset":"14400 14400","lastUpdated":"1394150513","bodySummary":""},
		{"nid":"3188","language":"English","title":"Renew domain exocortex.pp.ua","status":"Active","statusRAW":"active","priority":"Critical","priorityRAW":"4000","strategicImportance":"Low","strategicImportanceRAW":"1000","difficultyPlanned":"Normal","difficultyPlannedRAW":"2000","difficulty":"Normal","difficultyRAW":"2000","group":"Domains, Internet","groupRAW":"1431, 472","dateTimePlannedStart":"2014-04-02 03:46:07","dateTimePlannedEnd":"2014-04-04 23:48:58","dateTimePlannedTZ":"Europe/Moscow Europe/Moscow","dateTimePlannedOffset":"14400 14400","dateTimeStart":"2014-03-07 03:44:04","dateTimeEnd":"2014-03-07 03:44:04","dateTimeTZ":"Europe/Moscow Europe/Moscow","dateTimeOffset":"14400 14400","lastUpdated":"1394149604","bodySummary":""},
		{"nid":"6533","language":"English","title":"Digitize VHS film from primary school","status":"Completed","statusRAW":"completed","priority":"Low","priorityRAW":"1000","strategicImportance":"Normal","strategicImportanceRAW":"2000","difficultyPlanned":"Extra","difficultyPlannedRAW":"4000","difficulty":"Extra","difficultyRAW":"4000","group":"1828, Education, Video, Digitizing","groupRAW":"496, 489, 2357, 6534","dateTimePlannedStart":"2014-04-30 00:00:51","dateTimePlannedEnd":"2014-04-30 23:11:30","dateTimePlannedTZ":"Europe/Moscow Europe/Moscow","dateTimePlannedOffset":"14400 14400","dateTimeStart":"2014-03-07 03:46:06","dateTimeEnd":"2014-03-07 03:46:22","dateTimeTZ":"Europe/Moscow Europe/Moscow","dateTimeOffset":"14400 14400","lastUpdated":"1394149582","bodySummary":""},
		{"nid":"4327","language":"English","title":"Renew domain selenokhod.com","status":"Completed","statusRAW":"completed","priority":"Critical","priorityRAW":"4000","strategicImportance":"Normal","strategicImportanceRAW":"2000","difficultyPlanned":"Normal","difficultyPlannedRAW":"2000","difficulty":"Normal","difficultyRAW":"2000","group":"Domains, Internet, Payments, Selenokhod","groupRAW":"1431, 472, 743, 479","dateTimePlannedStart":"2014-06-30 00:00:45","dateTimePlannedEnd":"2014-07-30 23:06:26","dateTimePlannedTZ":"Europe/Moscow Europe/Moscow","dateTimePlannedOffset":"14400 14400","dateTimeStart":"2014-03-07 04:02:49","dateTimeEnd":"2014-03-07 04:02:52","dateTimeTZ":"Europe/Moscow Europe/Moscow","dateTimeOffset":"14400 14400","lastUpdated":"1394150531","bodySummary":""}
	];
    
    
    
    $scope.filterFn = function(activity){
        
        if(activity.status == "Completed"){
            return true; // this will be listed in the results
        }
        
        return false; // otherwise it won't be within the results
    };
	
	
	
	$scope.init = function(){
		indexedDBexo.open().then(function(){
			//indexedDBexo.addEntry('TestTitle1').then(function(){
			//	console.log('Activity added!');
			//});
            
            indexedDBexo.getAllTodoItems().then(function(data){
				$scope.activities2 = data;
                console.log(data);
			});
			
		});
	}
	
	$scope.init();
    
    $scope.addEntry = function(){
		//console.log($scope.activity2.title);
        
        var newEntry = {
			"title": $scope.activity2.title,
            "language": "English",
			"timeStamp": new Date().getTime()
		};
        $scope.activities2.push(newEntry);
        
        indexedDBexo.addEntry($scope.activity2.title).then(function(){
            console.log('Activity added!');
        });
    }
    
    

});



phonecatApp.service('indexedDBexo', function($window, $q){
	
	//IndexedDB database name
	var dbName = "ExocortexDB";
	//Database version (should be increased, when structure updates). Should be of integer type.
	var dbVersion = 5;
	var exoDB = {};
	var indexedDB = window.indexedDB;
	
	exoDB.indexedDB = {};
	exoDB.indexedDB.db = null;
	
	//Handle DB-related errors
	exoDB.indexedDB.onerror = function(e) {
		console.log(e);
	};
	
	
	
	//Function to open DB and upgrade it's data structure, if needed
	this.open = function() {
		var deferred = $q.defer();
		
		//Request to open database. Will return IDBOpenDBRequest object.
		var request = indexedDB.open(dbName, dbVersion);
		
		request.onsuccess = function(e) {
			console.log ("DB " + dbName + " was opened and ready for work");
			exoDB.indexedDB.db = e.target.result;
			deferred.resolve();
		}
		
		request.onupgradeneeded = function(e) {
			exoDB.indexedDB.db = e.target.result;
			var db = exoDB.indexedDB.db;
			console.log ("Going to upgrade DB from version " + e.oldVersion + " to version " + e.newVersion);
			
			//If there is Object store with the same name at DB from previous revision,
			//we'll face error while trying to upgrade DB
			//We should delete existing Object store (and all it's data, of course)
			try {
				if (db.objectStoreNames && db.objectStoreNames.contains("activities")) {
					db.deleteObjectStore("activities");
				}
			}
			catch (err) {
				console.log("Error in objectStoreNames: " + err);
			}
			
			//Create object store
			//Object Store is a storage for objects, instead of tables at SQL databases
			//We do not define objects structure here other than "fields" for keyPath, and for indexes
			//While adding objects, you can omit fields, including indexing ones, but keyPath field should be filled
			//We can make one of it's "fields" (with unique values) an in-line key with keyPath
			var store = db.createObjectStore("activities", {keyPath: "timeStamp"});
			// Create an index to search customers by text field. We may have duplicates so we can't use a unique index.
			store.createIndex("activities", "activities", {unique: false});
			
			//Or we can make unique integer out-of-line keys (1,2,3 ...) with keyGenerator, enabled by {autoIncrement: true}
			//var store = db.createObjectStore("store2", {autoIncrement: true});
			//console.log("Onupgradeneeded: "+ JSON.stringify(store));
		}
		
		request.onfailure = function(e) {
			console.error("Failed to open DB: " + e);
			deferred.reject();
		}
		
		request.onerror = function(e) {
			console.error("Error while opening DB: " + e);
			deferred.reject();
		}
		
		return deferred.promise;
	};
	
	
	
	//Add entry to DB
	this.addEntry = function(titleText){
		var deferred = $q.defer();
		
		//Database table name
		var dbTableName = "activities";
		var db = exoDB.indexedDB.db;
		//Create transaction, define Object stores it will cover
		var transact = exoDB.indexedDB.db.transaction(dbTableName, "readwrite");
		var store = transact.objectStore(dbTableName);
		
		var data = {
			"title": titleText,
            "language": "English",
			"timeStamp": new Date().getTime()
		};
		
		//Request to store data at DB
		var request = store.put(data);
		
		request.onsuccess = function(e) {
			console.log('Data added to DB');
			deferred.resolve();
		};
		
		request.onerror = function(e) {
			console.error("Error Adding an item: ", e);
			deferred.reject();
		};
		
		return deferred.promise;
	};
    
    
    
    this.getAllTodoItems = function() {
        var deferred = $q.defer();
        
        var activities = [];
        
        //Database table name
        var dbTableName = "activities";
        var db = exoDB.indexedDB.db;
        //Create transaction
        var transact = db.transaction(dbTableName, "readonly");
        var store = transact.objectStore(dbTableName);
        
        // Get everything in the store
        //keyRange is a continuous interval over keys, for example greater than X and smaller than Y
        var keyRange = IDBKeyRange.lowerBound(0);
        //Cursor is a mechanism for iterating over multiple records within a key range
        var cursorRequest = store.openCursor(keyRange);
        
        cursorRequest.onsuccess = function(e) {
            var result = e.target.result;
            if (result === null || result === undefined) {
                deferred.resolve(activities);
            } else {
                if(result){
                    activities.push(result.value);
                    result.continue();
                }
            }
        };
        
        cursorRequest.onerror = function(e){
            console.log(e.value);
            deferred.reject("Something went wrong!!!");
        };
        
        return deferred.promise;
    };
	
	
	
});







angular.module('exoFilters', []).filter('reverse', function() {
	return function(input, uppercase) {
		input = input || '';
		var out = "";
		for (var i = 0; i < input.length; i++) {
			out = input.charAt(i) + out;
		}
		
		// conditional based on optional argument
		if (uppercase) {
			out = out.toUpperCase();
		}
		
		return out;
	};
});