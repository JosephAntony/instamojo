(function(name, module, context){
	
	if(window.define)
		define([], module);
	else
		context.utils = module();

})("utils", function(){

	var utils = {};

	function addClassName(ele, cls, callback){
		var classNames = ele.className;
		classNames += " " + cls;
		ele.className =  classNames;
		if (callback)
				callback();
	};

	function removeClass(ele, cls, callback){
		var classNames = ele.className;
		classNames =  classNames.replace(cls, "");
		ele.className = classNames;
		if(callback)
			callback();
	};

	function Deferred(){
		this.promiseObj =  null;
	};

	Deferred.prototype = {
		"resolve":function(){
			this.execute( this.promiseObj.doneArr, arguments );
		}
	   ,"reject":function(){
	   		this.execute(this.promiseObj.failArr, arguments);
	   }
	   ,"execute":function(arr, args){
	   	args = Array.prototype.slice.call(args);
	   	var that = this;
	   		Array.prototype.forEach.call(arr, function(callback){
	   			callback.apply(that, args);
	   		})
	   }
	   ,"promise":function(){

	   		this.promiseObj = this.promiseObj?this.promiseObj:(new Promise());
	   		return this.promiseObj;
	   }	
	};

	function Promise(){
		this.doneArr = [];
		this.failArr = [];
	};

	Promise.prototype = {
		"done": function(callback){
			this.doneArr.push(callback);
		}
	   ,"fail": function(callback){
	   		this.failArr.push(callback);
	   }	
	};


	utils={
		"addClassName": function(ele, cls, callback){
			addClassName(ele, cls, callback);
		}
	   ,"removeClassName": function(ele, cls, callback){
	   		removeClass(ele, cls, callback);
	   }
	   ,"deferred": function(){
	   		return new Deferred();
	   		
	   		
	   }
	}


	return utils;


}, insta||{});