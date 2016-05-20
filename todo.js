var $ = function(sel) {
  return document.querySelector(sel);
};

var $All = function(sel) {
  return document.querySelectorAll(sel);
};

var quantity = 0;
var filter_label = 'All'; // Global var about which elem to filter
var storage = window.localStorage;
var todos = JSON.parse(storage.getItem('todoStorage'));
//var storage = lstorage.getItem('todoStorage');
// Read storage
if(todos){
	quantity = Object.keys(todos).length;
	for(var key in todos){
		var val = todos[key];
		var item_obj = JSON.parse(val);
		addItemToList(item_obj.id, item_obj.msg, item_obj.completed);
	}
	updateCount();
}else{
    todos = {};
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
	item,
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
		clickComplete('#'+this.id);
    },false);

    $('#' + node.id).addEventListener('dblclick', function(){
        node.classList.add('editing');

        var edit = document.createElement('input');
        edit.setAttribute('type', 'input');
        edit.setAttribute('class', 'edit');
        edit.setAttribute('value', node.firstChild.data);
        var finished = false;

        function finish(){
            if(finished) return;
            finished = true;
            iList.removeChild(edit);
            node.classList.remove('editing');
        }

        edit.addEventListener('blur', function(){
            finish();
        }, false);

        edit.addEventListener('keyup', function(ev){
            if(ev.keyCode == 27){ // Esc
                finish();
            } else if(ev.keyCode == 13) { // Enter
                node.firstChild.data = this.value;
                var it = JSON.parse(todos['#'+node.id]);
        		it.msg = this.value;
                todos[itemId] = JSON.stringify(it);
        		storage.setItem('todoStorage', JSON.stringify(todos));
                finish();
            }
        }, false);

        iList.insertBefore(edit, node);
        edit.focus();
    },false);
}

function addTodo(){
	var input = $('#input_box');
	var item = input.value;

	if(item == '')
		return;

	// Storage
	var item_obj = {'id': '#item'+quantity,'msg':item, 'completed':false};
	todos['#item'+quantity] = JSON.stringify(item_obj);
    storage.setItem('todoStorage', JSON.stringify(todos));

	addItemToList(item_obj.id,item);

	quantity++;
	updateCount();
}

function delTodo(itemId){
	var node = $(itemId);
	var iList = $('#item_list');
	iList.removeChild(node);
    delete todos[itemId];
	storage.setItem('todoStorage', JSON.stringify(todos));

	if(node.classList.contains('completed'))
		return;
	quantity--;
	updateCount();
}

function clickComplete(itemId){
	var node = $(itemId);
	if(!node)
		return;
	if(node.classList.contains('completed')){
		cancelComplete(itemId);
	}
	else{
		markComplete(itemId);
	}
}

function cancelComplete(itemId){
	var node = $(itemId);
	if(!node)
		return;

	node.classList.remove('completed');
	node.style.textDecoration = 'none';

    var item = JSON.parse(todos[itemId]);
	item.completed = false;
    todos[itemId] = JSON.stringify(item);
	storage.setItem('todoStorage', JSON.stringify(todos));

	quantity++;
	updateCount();
}

function markComplete(itemId){
	var node = $(itemId);
	if(!node)
		return;

	node.classList.add('completed');
	node.style.textDecoration = 'line-through';

    var item = JSON.parse(todos[itemId]);
	item.completed = true;
    todos[itemId] = JSON.stringify(item);
	storage.setItem('todoStorage', JSON.stringify(todos));

	quantity--;
	updateCount();
}

function markAllComplete(){
	var iList = $('#item_list');
	var childs = iList.childNodes;
	for(var i = 0; i < childs.length; i++){
		var node = childs[i];
		if(!node.classList.contains('completed'))
			markComplete('#'+node.id);
	}
}

function cancelAllComplete(){
	var iList = $('#item_list');
	var childs = iList.childNodes;
	for(var i = 0; i < childs.length; i++){
		var node = childs[i];
		if(node.classList.contains('completed'))
			cancelComplete('#'+node.id);
	}
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

$('.toggle-all').addEventListener('click', function(){
	if(this.checked){
		markAllComplete();
	}else{
		cancelAllComplete();
	}
}, false);
