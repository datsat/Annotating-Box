function SemanticBox(id){
	function Resource(label, description, url){
		this.label = label;
		this.description = description;
		this.url = url;
		this.getDescription = function(){
			if (description == null || description == "")
				return "No description found";
			else if (description.length > 200){
				return description.substring(0, 200) + "...";
			} else {
				return description;
			}
		}
	}
	
	/**
	* Generate Wikipedia link from DBpedia link and vise versa
	**/
	function getLink(link, dbpedia){
		if (dbpedia)
			return link.replace("https://en.wikipedia.org/wiki", "http://dbpedia.org/resource");
		else
			return link.replace("http://dbpedia.org/resource", "https://en.wikipedia.org/wiki");
	}
	
	this.getHTML = function(){
		var res = document.getElementById(id).innerHTML;
		res = res.replace(/<div>/g, '<br>').replace(/<\/div>/g, '').replace(/<p>/g, '<br>').replace(/<\/p>/g, '').replace(/&nbsp;/g, ' ');
		return res;
	}
	
	var autocomplete = false;
	var tooltip = true;
	/**
	1:Ctrl+Space, 2: Tab, 3: Right mouse click
	**/
	var activationMethod = 1;
	this.setEnabledAutocomplete = function(value){
		autocomplete = value;
	}
	this.setEnabledTooltip = function(value){
		tooltip = value;
	}
	this.setActivationMethod = function(value){
		activationMethod = value;
	}
	
	function PanelResource(handlerCallback){
		var limit = 10;
		this.text = "";
		
		var panel = document.createElement("DIV");
		var focusItem;
		var items;
		var resources;
		panel.setAttribute('class', 'ResourceList');
		panel.style.display = "none";
		document.body.appendChild(panel);
		mannual = document.createElement("DIV");
		mannual.setAttribute('class', 'item');
		mannual.innerHTML = "Annotate manually ";
		panel.appendChild(mannual);
		box = document.createElement("input");
		box.placeholder = "Enter URL here";
		box.type = "text";
		mannual.appendChild(box);
		button = document.createElement("input");
		button.type = "button";
		button.value = "Add";
		mannual.appendChild(button);
		button.addEventListener("click", function(event){
			if (box.value.trim()!=""){
				handlerCallback(new Resource(this.text, "", box.value.trim()));
				box.value = "";
				panel.style.display = "none";
			}
		});
		box.addEventListener("click", function(event){
			event.stopPropagation();
			event.preventDefault();
		});
		
		this.setPosition = function(left, top){
			panel.style.left = left + "px";
			panel.style.top = top + "px";
		}
		
		this.query = function(txt){
			this.text = txt;
			var url = "https://en.wikipedia.org/w/api.php?action=opensearch&format=json&namespace=0&callback=abcd&limit=" + limit + "&search=" + escape(txt);
			$.ajax({
				type: 'GET',
				url: url,
				dataType: 'jsonp',
				success: function(data) {
					process(data);
				},
				error: function(e) {
					console.log(e.message);
				}
			});
		}
		
		this.up = function(){
			if (focusItem>0){
				items[focusItem].setAttribute('class', 'item');
				focusItem--;
				items[focusItem].setAttribute('class', 'item item-selected');
			}
		}
		
		this.down = function(){
			if (focusItem<items.length-1){
				items[focusItem].setAttribute('class', 'item');
				focusItem++;
				items[focusItem].setAttribute('class', 'item item-selected');
			}
		}
		
		this.enter = function(){
			handlerCallback(resources[focusItem]);
			panel.style.display = "none";
		}
		
		this.esc = function(){
			panel.style.display = "none";
		}
		
		function addEventHandler(i, resource){
			items[i].addEventListener("click", function(){
				handlerCallback(resource);
				panel.style.display = "none";
			});
			
			items[i].addEventListener("mouseover", function(){
				items[focusItem].setAttribute('class', 'item');
				focusItem = i;
				items[focusItem].setAttribute('class', 'item item-selected');
			});
		}
		
		function process(data){
			panel.style.display = "block";
			// Clear the list
			while (panel.lastChild != mannual) {
				panel.removeChild(panel.lastChild);
			}
			items = [];
			resources = [];
			
			for (var i=0; i<data[1].length; ++i){
				var resource = new Resource(data[1][i], data[2][i], data[3][i]);
				var item = document.createElement("DIV");
				if (i==0){
					item.setAttribute('class', 'item item-selected');
					focusItem = 0;
				} else
					item.setAttribute('class', 'item');
				item.innerHTML = "<div style='max-width:400px;'>" + resource.label + "<span style='font-size: 0.8em; color: #777;'> (" + resource.url + ")</span></div><div style='padding-left:5px; font-size: 0.8em; max-width:400px;'>" + resource.getDescription() + "</div>";
				panel.appendChild(item);
				items.push(item);
				resources.push(resource);
				
				addEventHandler(i, resource);
			}
		}
	}
	
	var node = document.getElementById(id);
	var requesting = false;
	var caretInfo;
	var SPACE = 32, ESC = 27, ENTER = 13, DOWN = 40, UP = 38, CTRL = 17, TAB = 9;
	var panelResource = new PanelResource(function(resource){
		var txt;
		if (autocomplete){
			txt = resource.label;
		} else {
			txt = panelResource.text;
		}
		insert(caretInfo.pathToCaretContainer, caretInfo.startCaret, caretInfo.endCaret, "<a href='" + getLink(resource.url, true) + "'>" + txt + "</a>");
		requesting = false;
	});
	var infoPanel = document.createElement("DIV");
	infoPanel.setAttribute('class', 'InfoPanel');
	infoPanel.style.display = "none";
	document.body.appendChild(infoPanel);
	document.addEventListener("click", function(event){
		if (event.target != infoPanel){
			infoPanel.style.display = "none";
			panelResource.esc();
			requesting = false;
		}
	});
	var activeLink;
	
	
	
	node.addEventListener("mouseover", function(event){
		if(tooltip && event.target.tagName == "A"){
			activeLink = event.target;
			var title = activeLink.href.substring(activeLink.href.lastIndexOf("/") + 1);
			$.ajax({
				type: 'GET',
				url: "https://en.wikipedia.org/w/api.php?format=json&action=query&prop=extracts&exintro=&explaintext=&titles=" + title,
				dataType: 'jsonp',
				success: function(data) {
					var description = "";
					for (var key in data.query.pages){
						if (key!="-1")
							description = data.query.pages[key].extract;
						if (description.length>400){
							description = description.substring(0, 400) + "...";
						}
					}
					var rec = activeLink.getBoundingClientRect();
					infoPanel.style.display = "block";
					infoPanel.style.left = rec.left; + "px";
					infoPanel.style.top = rec.bottom + "px";
					var dbpedia = getLink(activeLink.href, false);
					infoPanel.innerHTML = "<b>Description</b>: " + description + "<br>" + "<b>References</b>:<br><a target='_blank' href='" + activeLink.href + "'>" + activeLink.href + "</a>" + "<br><a target='_blank' href='" + dbpedia + "'>" + dbpedia + "</a><br><br>";
					
					var rmbutton = document.createElement("input");
					rmbutton.type = "button";
					rmbutton.value = "Remove annotation";
					infoPanel.appendChild(rmbutton);
					rmbutton.addEventListener("click", function(event){
						activeLink.parentNode.replaceChild(document.createTextNode(activeLink.text), activeLink);
					});
				},
				error: function(e) {
					console.log(e.message);
				}
			});
		} else {
			infoPanel.style.display = "none";
		}
	});
	
	node.addEventListener("click", function(event){
		infoPanel.style.display = "none";
	});
	
	node.addEventListener("keyup", function(event){
		infoPanel.style.display = "none";
		if (requesting && event.keyCode != SPACE && event.keyCode != ESC && event.keyCode != ENTER && event.keyCode != DOWN && event.keyCode != UP && event.keyCode != CTRL && event.keyCode != TAB){
			var obj = getText(caretInfo.startCaret);
			caretInfo.text = obj.text;
			caretInfo.endCaret = obj.endCaret;
			panelResource.query(caretInfo.text);
		}
	});
	
	node.addEventListener('contextmenu', function(event) {
		event.preventDefault();
		if (activationMethod == 3)
			handle(event);
		return false;
	}, false);
	
	node.addEventListener("keydown", function(event){
		var activated = (activationMethod == 1 && event.ctrlKey && event.keyCode == SPACE)||
						(activationMethod == 2 && event.keyCode == TAB);
		console.log("d");
		if (requesting){
			if (event.keyCode == UP){
				event.stopPropagation();
				event.preventDefault();
				panelResource.up();
			} else if (event.keyCode == DOWN){
				event.stopPropagation();
				event.preventDefault();
				panelResource.down();
			} else if (event.keyCode == ENTER){
				event.stopPropagation();
				event.preventDefault();
				panelResource.enter();
			} else if (event.keyCode == ESC){
				event.stopPropagation();
				event.preventDefault();
				panelResource.esc();
				requesting = false;
			}
		} else if (activated){
			handle(event);
		}
	});
	
	
	function handle(event){
		event.stopPropagation();
		event.preventDefault();
		caretInfo = getCaretInfos();
		if (caretInfo.text != null && caretInfo.text != ""){
			panelResource.setPosition(caretInfo.left, caretInfo.top);
			panelResource.query(caretInfo.text);
			requesting = true;
		} else {
			panelResource.esc();
			requesting = false;
			console.log("Please place the cursor right after the text, and do not select the tagged text!");
		}
	}
	
	function getPath(range){
		var container = range.startContainer;
		var arr=[];
		while(container!==node){
			var nodeIndex=0;
			var tmp = container;
			while(tmp=tmp.previousSibling)
				nodeIndex++;
			arr.push(nodeIndex);
			container=container.parentNode
		}
		return arr;
	}
	
	function getText(caret){
		var result = {};
		if (window.getSelection) {
			var sel = window.getSelection();
			var range = sel.getRangeAt(0).cloneRange();
			range.setStart(range.startContainer, caret);
			result.text = range.toString();
			result.endCaret = range.endOffset;
		} else if (document.selection && document.selection.type != "Control") {
			result.text = document.selection.createRange().text;
		}
		return result;
	}
	
	function insert(pathToCaretContainer, start, end, html) {
		node.focus();
		if (window.getSelection) {
			var sel = window.getSelection();
			var range = document.createRange();

			var container = node;
			var arr = pathToCaretContainer;
			var index = arr.length;
			while (index--)
				container = container.childNodes[arr[index]];
			range.setStart(container, start);
			range.setEnd(container, end);

			range.deleteContents();

			var el = document.createElement("div");
			el.innerHTML = html;

			var frag = document.createDocumentFragment(), ele, lastNode;
			while ((ele = el.firstChild)) {
				lastNode = frag.appendChild(ele);
			}
			var firstNode = frag.firstChild;
			range.insertNode(frag);

			if (lastNode) {
				range = range.cloneRange();
				range.setStartAfter(lastNode);
				range.collapse(true);
				
				sel.removeAllRanges();
				sel.addRange(range);
			}
		} else if (document.selection && document.selection.type != "Control") {

		}
	}
	
	function getCaretInfos(){
		var result = {};
		var pos = {
			left : 0,
			top : 0
		};
		
		var savedStart, savedEnd;
	
		if (window.getSelection) {
			var sel = window.getSelection();
			var range = sel.getRangeAt(0).cloneRange();
			
			
			// FF: normalize the caret selection
			var treeWalker = document.createTreeWalker(
				node,
				NodeFilter.SHOW_TEXT,
				function(node) {
					var nodeRange = document.createRange();
					nodeRange.selectNodeContents(node);
					return nodeRange.compareBoundaryPoints(Range.END_TO_END, range) < 1 ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
				},
				false
			);
			while (treeWalker.nextNode()) {
			}
			if (range.toString() === ''){ // if there is no text selection
				if (range.startContainer == node && range.endContainer == node){ // Caret at the end of a line in FF
					range.setStart(treeWalker.currentNode, treeWalker.currentNode.length);
					range.setEnd(treeWalker.currentNode, treeWalker.currentNode.length);
				}
			} else {
				if (range.endContainer == node){ // Select the last word in a line in FF
					range.setEnd(treeWalker.currentNode, treeWalker.currentNode.length);
				}
				if (range.endContainer != treeWalker.currentNode && range.endOffset == 0){ // FF: when we select a text right before another element (e.g., link), the end container is in the element
					range.setEnd(treeWalker.currentNode, treeWalker.currentNode.length);
				}
			}
			
			
			
			if (range.toString() === ''){ // if there is no selection
				// Backup range
				savedStart = range.startOffset;
				savedEnd = range.endOffset;
				if (range.startContainer == node){ // First char of line or right after an annotated resource
					return '{}';
				}
				
				range.setStart(range.startContainer, 0);
				range.setEnd(range.startContainer, savedStart);
				var txt = range.toString();
				var index = txt.lastIndexOf(" ");
				if (index != -1){
					index++;
				} else if (index == -1 && savedStart>0){
					index = 0;
				}
				
				if (index != -1){
					result.pathToCaretContainer = getPath(range);
					result.text = txt.substring(index);
					result.startCaret = index;
					result.endCaret = savedEnd;
					range.setStart(range.startContainer, index);
				}
			} else {
				// Check if the selection is valid or not (Valid means the selection does not contains text of a link)
				var first = range.startContainer;
				var last = range.endContainer;
				var valid=true;
				if (first == last && first.parentNode.tagName == "A") { // select text in a link
					valid = false;
				} else {
					if (first.parentNode.tagName == "A"){ // selection starts from a link
						first = first.parentNode;
					}
					
					if (last.parentNode.tagName == "A"){ // selection ends in a link
						last = last.parentNode;
					}
					
					while (first!=null && first!=node){
						if(first.tagName == 'A' || first.tagName == 'DIV'){ // seclection contains a link
							valid = false;
							break;
						}
						if (first==last)
							break;
						first = first.nextSibling;
					}
				}
				if (!valid){
					return '{}';
				}
				
				
				if (range.startContainer.textContent.trim().length == 0){ // FF: select a text right after a link, which is annotated text
					range.setStart(range.endContainer, 0);
				}
				
				if (range.startContainer.nodeType != 3){ // IE: select a node right after a link (startContainer is the editable div/paragraph (if it is in the next line))
					range.setStart(range.endContainer, 0);
				}
					
				savedStart = range.startOffset;
				savedEnd = range.endOffset;
				
				result.startCaret = savedStart;
				result.endCaret = savedEnd;
				result.pathToCaretContainer = getPath(range);
				result.text = range.toString();
			}
			
			var rect = range.getBoundingClientRect();
			if (range.endOffset == 0 || range.toString() === '') {
				// first char of line
				if (range.startContainer == node) {
					// empty div
					if (range.endOffset == 0) {
						pos.top = '0';
						pos.left = '0';
					} else {
						// firefox need this
						var range2 = range.cloneRange();
						range2.setStart(range2.startContainer, 0);
						var rect2 = range2.getBoundingClientRect();
						pos.left = rect2.left;
						pos.top = rect2.top + rect2.height;
					}
				} else {
					pos.top = range.startContainer.offsetTop;
					pos.left = range.startContainer.offsetLeft;
				}
			} else {
				pos.left = rect.left;
				pos.top = rect.top + rect.height;
			}
		} else if (document.selection) { // IE version <=9
			var range = document.selection.createRange();
			pos.left = range.offsetLeft;
			pos.top = range.offsetTop + range.boundingHeight;
		}
		
		if (!pos.left)
			pos.left = 0;
		if (!pos.top)
			pos.top = 0;
		
		result.left = parseInt(pos.left);
		result.top = parseInt(pos.top);
		return result;
	}
}
