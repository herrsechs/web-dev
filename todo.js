var $ = function(sel) {
  return document.querySelector(sel);
};

var $All = function(sel) {
  return document.querySelectorAll(sel);
};

var quantity = 0;
var filter_label = 'All'; // Global var about which elem to filter
var storage = window.localStorage;
//var storage = lstorage.getItem('todoStorage');
// Read storage
if(storage){
	quantity = storage.length;
	for(var key in storage){
		var val = storage.getItem(key);
		var item_obj = JSON.parse(val);
		addItemToList(item_obj.id, item_obj.msg, item_obj.completed);
	}
	updateCount();
}else{
	storage = {
		getItem: function(itemId){
			return storage[itemId];
		},
		setItem: function(itemId, val){
			storage[itemId] = val;
		},
		removeItem: function(itemId){
			this.remove(itemId);
		}
	};

	lstorage.setItem('todoStorage', storage);
}


function updateCount(){
	if(quantity == 0)
		$('#count').innerHTML = '';
	else{
		$('#count').innerHTML = [
            quantity + ' items left' +
        '<button class="FilterAct">Active</button>' +
        '<button class="FilterCpl">Completed</button>' +
        '<button class="NoFilter">All</button>'].join('');

        $('.FilterAct').addEventListener('click', function(){
			filter_label = 'Active';
			filter();
		}, false);

		$('.FilterCpl').addEventListener('click', function(){
			filter_label = 'Completed';
			filter();
		}, false);

		$('.NoFilter').addEventListener('click', function(){
			filter_label = 'All';
			filter();
		}, false);
    }
}

function addItemToList(itemId, item, completed){
	var iList = $('#item_list');
	var cpl = completed || false;

	// Refresh page
	var node = document.createElement('div');
	node.id = itemId.substring(1, itemId.length);
	node.classList.add('item');
	node.innerHTML = [
	item ,
	'<button class="del_btn" id="del_btn'+ itemId.charAt(itemId.length-1) +'">X</button>'].join('');

	iList.insertBefore(node, iList.childNodes[0]);

	if(cpl){
		markComplete('#'+node.id);
	}

	$('#del_btn'+itemId.charAt(itemId.length-1) ).addEventListener('click', function(){
		var id = this.parentNode.id;
		delTodo('#' + id);
	},false);

    $('#' + node.id).addEventListener('click', function(){
		markComplete('#'+this.id);
    },false);
}

function addTodo(){
	var input = $('#input_box');
	var item = input.value;

	if(item == '')
		return;

	// Storage
	var item_obj = {'id': '#item'+quantity,'msg':item, 'completed':false};
	storage.setItem('#item'+quantity, JSON.stringify(item_obj));

	addItemToList(item_obj.id,item);

	quantity++;
	updateCount();
}

function delTodo(itemId){
	var node = $(itemId);
	var iList = $('#item_list');
	iList.removeChild(node);
	storage.removeItem(itemId);
	if(node.classList.contains('completed'))
		return;
	quantity--;
	updateCount();
}

function markComplete(itemId){
	var node = $(itemId);
	if(!node)
		return;

	if(node.classList.contains('completed')){
		node.classList.remove('completed');
		node.style.textDecoration = 'none';

		var item_obj = JSON.parse(storage.getItem(itemId));
		item_obj.completed = false;
		storage.setItem(itemId, JSON.stringify(item_obj));

		quantity++
	}
	else{
		node.classList.add('completed');
		node.style.textDecoration = 'line-through';

		var item_obj = JSON.parse(storage.getItem(itemId));
		item_obj.completed = true;
		storage.setItem(itemId, JSON.stringify(item_obj));

		quantity--;
	}
	updateCount();
}

function filter(){
	var items = $All('#item_list .item');
	for(var i = 0; i < items.length; i++){
		var item = items[i];
		var display = 'none';
		if(filter_label == 'All'
		|| filter_label == 'Active' && !item.classList.contains('completed')
		|| filter_label == 'Completed' && item.classList.contains('completed')){
			display = '';
		}
		item.style.display = display;
	}
}

$('#input_box').addEventListener('keyup', function(event){
	if(event.keyCode != 13) return;
	addTodo();
}, false);

