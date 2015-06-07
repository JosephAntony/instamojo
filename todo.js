(function(name, module, context){

	if(window.define)
		define([], module);
	else
		module(context.utils);

})("todo", function(utils){

	var overlay = document.getElementsByClassName("overlay")[0], modal = document.getElementById("modal"), leftMenu =  document.getElementById("showLeftMenu"), rightMenu = document.getElementById("showRightMenu"), 
	leftMenuButtons  = document.getElementById("leftMenuButtons"), body =  document.getElementsByTagName("body")[0], listContent =  document.getElementsByClassName("listContent")[0], listBtn =  document.getElementById("saveList")
	,addListWidget = document.getElementById("addList") , listTemplate='<h4 style="margin:0; padding-left:2px">{{list title}}</h4><div class="list"><input type="text" placeholder="add a card.."/><button type="button" class="cardBtn">save</button><a href="" class="closeIcon"></a></div><a href="#" class="card-composer">Add a card</a>'
	, clearValue = "", editCloseBtn =  document.getElementsByClassName("editCloseIcon")[0], editModal = document.getElementById("editModal"), currentCard, cardEditSaveBtn = document.getElementById("cardEditSaveBtn")
	, cardEditResetBtn= document.getElementById("cardEditResetBtn"), cardEditClearBtn = document.getElementById("cardEditClearBtn"), activityObj = {"logIn":"", "logout":"", "list":"", "task":"", "drag":"", "updateTask":"", "drop":""}, rightViewModal ={}, userObj = {}, listCount = 0, usr, currentUser={}
	rightMenuOverlay = document.getElementsByClassName("rightMenu")[0];



	var eventsObj = {
		"loginBtn": function(){

			var deferred = utils.deferred();
			deferred.promise().done(function(){
				activityObj["logIn"] = document.getElementById("usrname").value + " logged in";
				utils.removeClassName(overlay, "show-overlay");
			});

			utils.removeClassName(modal, "show-modal", function(){
				setTimeout(function(){

					var username, password;
					usr=JSON.parse(window.localStorage.getItem("usr"));
					//usr = usr?usr:{};
					usr = usr?usr:[];
					username = document.getElementById("usrname").value;
					password =  document.getElementById("password").value;
					if(window.localStorage){

						
						Array.prototype.forEach.call(usr, function(usrObj){
							if(usrObj["username"] == username  && usrObj["password"] == password){
								userObj =  usrObj;
								return false;
							}

						});

						if(Object.keys(userObj).length == 0){
							userObj["username"]  = username;
							userObj["password"]  = password;
							usr.push(userObj);
							window.localStorage.setItem("usr", JSON.stringify(usr));
							document.getElementById("username").innerHTML =  username;
						}else{
							document.getElementById("username").innerHTML = userObj["username"];
							//read the userobject and create the UI

							_loadUserData();
						}

						 currentUser  = userObj;

						if(window.localStorage)
									window.localStorage.setItem("currentUser", JSON.stringify(currentUser));
						
					};
					
					deferred.resolve();	
				}, 300);
				
			});
			/*utils.removeClassName(modal, "show-modal");
			utils.removeClassName(overlay, "show-overlay");*/
		}
		,"showLeftMenu": function(event){
			var leftMenu =  document.getElementsByClassName("leftMenu")[0];
			if(leftMenu.className.indexOf("show-leftMenu")>-1)
				utils.removeClassName(leftMenu, "show-leftMenu");
			else{
				 utils.addClassName(leftMenu, "show-leftMenu");
			}
			   
			event.stopPropagation();
			event.preventDefault();
		}
		,"showRightMenu": function(event){
			var rightMenu  = document.getElementsByClassName("rightMenu")[0];
			if(rightMenu.className.indexOf("show-rightMenu")>-1)
				utils.removeClassName(rightMenu, "show-rightMenu");
			else
				utils.addClassName(rightMenu, "show-rightMenu");
			event.stopPropagation();
			event.preventDefault();
		}
		,"leftMenuButtons": function(event){
			var leftMenu =  document.getElementsByClassName("leftMenu")[0], target =  event.target;
			if("close" == target.textContent){
				utils.removeClassName(leftMenu, "show-leftMenu");
			}else if("logout" == target.textContent){
				if(window.localStorage)
					delete window.localStorage["currentUser"];
				window.location.reload();		
			}else if("deleteAll"  == target.textContent){
				if(window.localStorage){
					var data =  JSON.parse( window.localStorage.getItem("currentUser") );
					delete data.activityList;
					delete data.card;
					window.localStorage.setItem("currentUser", JSON.stringify(data) );

					Array.prototype.forEach.call(usr, function(userObj, index){
						if( (userObj.username == currentUser.username) && (userObj.password == currentUser.password)){
							usr[index] = data;
							window.localStorage.setItem("usr", JSON.stringify(usr));
						}

							
					});

					window.location.reload();
				}

			}
		}
		,"listContent": function(event){
			var target = event.target, parentEle, classNames;

			if(target.className.indexOf("listTxt")>-1){
				parentEle =  target.parentElement;
				classNames = parentEle.className;
				classNames = classNames.replace("is-idle", "");
				parentEle.className =  classNames;
			}else if(target.className.indexOf("card-composer")>-1){
				parentEle =  target.parentElement;
				classNames = parentEle.className;
				classNames = classNames.replace("is-idle", "");
				parentEle.className =  classNames;
				
			}else if (target.className.indexOf("cardBtn")>-1){
				var card = document.createElement("div"), parentNode =  target.parentNode.parentNode, editIcon =  document.createElement("a"), cardId = parentNode.firstChild.innerHTML + "_C_", childNodes =  parentNode.childNodes;
				childNodes =  Array.prototype.slice.call(childNodes);
				childNodes =  Array.prototype.filter.call(childNodes, function(childNode){
					if(childNode.className.indexOf("card")>-1)
							return childNode;
					});  
				cardId += childNodes.length;
				editIcon.setAttribute("class", "editIcon");
				editIcon.setAttribute("href", "#");
				editIcon.setAttribute("style", "float:right;, position: relative; margin: 8 15 0 0;");
				editIcon.innerHTML = "Document Icon";
				var spanEle = document.createElement("span");
				spanEle.setAttribute("style", "display:inline; word-wrap: break-word; white-space: normal;");
				spanEle.innerHTML  =  target.parentNode.firstChild.value;
				card.appendChild(spanEle);
				card.appendChild(editIcon);
				card.setAttribute("class", "card");
				card.setAttribute("id", cardId);
				card.setAttribute("draggable", true);
				target.parentNode.firstChild.value = clearValue;
				parentNode.insertBefore(card, target.parentNode);
				utils.addClassName(parentNode, "is-idle");

				activityObj["task"]  = cardId +  " task Created in " + parentNode.firstChild.innerHTML;
				userObj["card"] = userObj["card"]?userObj["card"]:{};
				userObj["card"][cardId]  = spanEle.innerHTML;
				userObj["activityList"][parentNode.getAttribute("id")] =  userObj["activityList"][parentNode.getAttribute("id")]?userObj["activityList"][parentNode.getAttribute("id")]:{};
				userObj["activityList"][parentNode.getAttribute("id")][cardId] = "";
				_saveUserObj();
				
			}else if(target.className.indexOf("closeIcon")>-1){
				var parentNode =  target.parentNode.parentNode;
				utils.addClassName(parentNode, "is-idle");
			}else if(target.className.indexOf("editIcon")>-1){
				utils.addClassName(overlay, "show-overlay");
				currentCard = event.srcElement.parentElement.getAttribute("id");
				editModal.getElementsByTagName("textarea")[0].value = event.srcElement.parentElement.firstChild.innerHTML.trim();
				utils.addClassName(editModal, "show-modal");
			}

			event.stopPropagation();
			event.preventDefault();
		}
		,addList: function(event){
			var listTitle, div = document.createElement("div");
			listTitle =  event.target.parentNode.children[0].value;
			event.target.closest("div").children[0].value = "";
			div.className = "addAlist is-idle";
			div.setAttribute("id", listCount);
			div.addEventListener("drag", eventsObj["drag"]);
			div.addEventListener("drop", eventsObj["drop"]);
			div.addEventListener("dragover", eventsObj["allowDrop"])
			div.innerHTML = listTemplate.replace("{{list title}}", listTitle);;
			listContent.insertBefore(div, addListWidget);
			utils.addClassName(addListWidget, "is-idle");
			//listContent.appendChild(div, listContent.firstChild);
			activityObj["list"] = listTitle + " Task List Created";
			userObj["activityList"] = userObj["activityList"]?userObj["activityList"]:{};
			userObj["activityList"][listCount] = {};
			userObj["activityList"][listCount].title = listTitle;
			_saveUserObj();
			listCount++;
			event.stopPropagation();
			event.preventDefault();
		}
		,"domloaded": function(){


				

						if(window.localStorage){
							usr = JSON.parse( window.localStorage.getItem("usr") );
							currentUser = JSON.parse( window.localStorage.getItem("currentUser") );
						}
							

						if(currentUser && Object.keys(currentUser).length){
							userObj =  currentUser; 
							document.getElementById("username").innerHTML = userObj["username"];
						    _loadUserData();
						}else{
							utils.addClassName(overlay, "show-overlay");

			 				setTimeout(function(){
			 					utils.addClassName(modal, "show-modal");
			 		
			 				}, 300);
						}

						

		       

 				
		}
		,"drag":function (event){
			draggedId =  event.target.id;
			activityObj["drag"]  = draggedId + " Card Dragged ";
			event.dataTransfer.setData("text/plain", event.target.id);
		}
		,"drop": function (event){
			event.preventDefault();
			var data =  event.dataTransfer.getData("text/plain");
			activityObj["drop"]  = "Card droped into " + event.currentTarget.firstChild.innerHTML.trim();
			event.currentTarget.insertBefore(document.getElementById(draggedId), event.currentTarget.getElementsByClassName("card-composer")[0]);
			//event.target.appendChild(document.getElementById(draggedId));
		}
		,"allowDrop": function(event){
			event.preventDefault();
		}
		,"closeEdit": function(event){

			var deferred = utils.deferred();
			deferred.promise().done(function(){
				utils.removeClassName(overlay, "show-overlay");
			});

			utils.removeClassName(document.getElementById("editModal"), "show-modal", function(){
				setTimeout(function(){
					deferred.resolve();
				}, 500);
			});


			utils.removeClassName(document.getElementById("editModal"), "show-modal");
			utils.removeClassName(overlay, "show-overlay");
			event.stopPropagation();
			event.preventDefault();
		}
		,"cardEditSave": function(event){
			var deferred = utils.deferred();
			deferred.promise().done(function(){
				utils.removeClassName(overlay, "show-overlay");
			});

			utils.removeClassName(document.getElementById("editModal"), "show-modal", function(){
				setTimeout(function(){
					document.getElementById(currentCard).firstChild.innerHTML = event.srcElement.parentNode.parentNode.getElementsByTagName("textarea")[0].value; 
					deferred.resolve();
				}, 500);
			});

			event.stopPropagation();
			event.preventDefault();
		}
		,"cardEditReset": function(event){
			event.srcElement.parentNode.parentNode.getElementsByTagName("textarea")[0].value =  document.getElementById(currentCard).firstChild.innerHTML ;
			event.preventDefault();
			event.stopPropagation();
		}
	}

	function _saveUserObj(){
		currentUser =  userObj;
		//usr =  usr?usr:JSON.parse(window.localStorage.getItem("usr"));
		if(window.localStorage){
			Array.prototype.forEach.call(usr, function(userObj, index){
				if( (userObj.password == currentUser.password) && (userObj.username == currentUser.password) ){
					usr[index] = currentUser;
					window.localStorage.setItem("usr", JSON.stringify(usr?usr:userObj));
				}
			});
			
			window.localStorage.setItem("currentUser", JSON.stringify(currentUser));
		}
				
		 
		 	
	};

	function _loadUserData(){
		var list =  userObj["activityList"], cardObjects, taskList;
		for(var k in list){
			taskList = _createList(list[k].title ,k);
			listContent.insertBefore(taskList, addListWidget);
			cardObjects = list[k];
			for(var j in cardObjects){
				if(j !="title"){
					var card = _createCard(j,  userObj["card"][j]) ;
					taskList.insertBefore(card, taskList.getElementsByClassName("list")[0]);
				    console.log( _createCard(j,  userObj["card"][j])  );
				}
				
			}
                
		};	
	};

	function _createList(listName, listId){
		var listTitle, div = document.createElement("div");
		listTitle =  listName;
		div.className = "addAlist is-idle";
		div.setAttribute("id", listId);
		div.addEventListener("drag", eventsObj["drag"]);
		div.addEventListener("drop", eventsObj["drop"]);
		div.addEventListener("dragover", eventsObj["allowDrop"])
		div.innerHTML = listTemplate.replace("{{list title}}", listTitle);;
		listCount = listId;
		return div;
	};

	function _createCard(cardIdentifier, cardValue){
		console.log("cardId is", cardIdentifier, cardValue);

		var card = document.createElement("div"), editIcon =  document.createElement("a"), cardId =cardIdentifier;

		
		editIcon.setAttribute("class", "editIcon");
		editIcon.setAttribute("href", "#");
		editIcon.setAttribute("style", "float:right;, position: relative; margin: 8 15 0 0;");
		editIcon.innerHTML = "Document Icon";
		var spanEle = document.createElement("span");
		spanEle.setAttribute("style", "display:inline; word-wrap: break-word; white-space: normal;");
		spanEle.innerHTML  =  cardValue;
		card.appendChild(spanEle);
		card.appendChild(editIcon);
		card.setAttribute("class", "card");
		card.setAttribute("id", cardId);
		card.setAttribute("draggable", true);

		return card;


	};





	var loginBtn = document.getElementById("loginBtn")	

	document.addEventListener("DOMContentLoaded", eventsObj.domloaded);

	loginBtn.addEventListener("click", eventsObj.loginBtn);

	leftMenu.addEventListener("click", eventsObj.showLeftMenu);

	rightMenu.addEventListener("click", eventsObj.showRightMenu);

	rightMenuOverlay.addEventListener("click", eventsObj.showRightMenu);

	leftMenuButtons.addEventListener("click", eventsObj.leftMenuButtons, true);

	listContent.addEventListener("click", eventsObj.listContent);

	listBtn.addEventListener("click", eventsObj.addList);

	editCloseBtn.addEventListener("click", eventsObj.closeEdit);

	cardEditSaveBtn.addEventListener("click", eventsObj.cardEditSave);

	cardEditResetBtn.addEventListener("click", eventsObj.cardEditReset);


	if(Object.observe){
		Object.observe(activityObj, function(changes){
			var rightMenu =  document.getElementsByClassName("activityContainer")[0], div =  document.createElement("div");
			div.innerHTML = changes[0].object[changes[0].name];
			rightMenu.appendChild(div);
		})
	}



}, insta || {});