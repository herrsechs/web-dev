var $ = function(sel) {
  return document.querySelector(sel);
};

var $All = function(sel) {
  return document.querySelectorAll(sel);
};

var quantity = 0; // Active item count 
var guid = 0;     // Global unique id for each item
var data;
//var filter_label = 'All'; // Global var about which elem to filter
//var storage = window.localStorage;
//var todos = JSON.parse(storage.getItem('todoStorage'));
//var storage = lstorage.getItem('todoStorage');
// Read storage
/*
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
*/

function update(){
	model.flush();
	data = model.data;
	if(!data.items)
		return;

	quantity = 0;
	$('#item_list').innerHTML = '';
	data.items.forEach(function(itemData, index){
		var id = 'item' + guid++;
		if(!itemData.completed) quantity++;
		addItemToList(id, itemData.msg, itemData.completed, index);
	});

	updateCount();
}

window.onload = function(){
	model.init(function(){
		data = model.data;

		var inputBox = $('#input_box');
		inputBox.addEventListener('change', function(){
			model.flush();
		});
		inputBox.addEventListener('keyup', function(event){
			if(event.keyCode != 13) return;
			if(this.value == '') return;

			data.items.push({msg: this.value, completed: false});
			update();
		}, false);

		$('.toggle-all').addEventListener('click', function(){
			if(this.checked){
				markAllComplete();
			}else{
				cancelAllComplete();
			}
		}, false);

		update();
	});
};


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

function addItemToList(itemId, item, completed, idx){ // idx is the index of item in data.items
	var iList = $('#item_list');
	var cpl = completed || false;

	// Refresh page
	var node = document.createElement('div');
	if(itemId[0] == '#')
		node.id = itemId.substring(1, itemId.length);
	else
		node.id = itemId;
	node.classList.add('item');

	node.innerHTML = [
	item,
	'<button class="del_btn" id="del_btn'+ itemId.charAt(itemId.length-1) +'">X</button>'].join('');


	iList.insertBefore(node, iList.childNodes[0]);

	if(cpl){
		markComplete('#'+node.id, idx);
	}

	$('#del_btn'+itemId.charAt(itemId.length-1) ).addEventListener('click', function(){
		delTodo(idx);
	},false);

    $('#' + node.id).addEventListener('click', function(){
		clickComplete('#'+this.id, idx);
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


/*
function addTodo(){
	var input = $('#input_box');
	var item = input.value;

	if(item == '')
		return;

	// Storage
	var item_obj = {'id': '#item'+guid,'msg':item, 'completed':false};
	todos['#item'+quantity] = JSON.stringify(item_obj);
    storage.setItem('todoStorage', JSON.stringify(todos));

	addItemToList(item_obj.id,item);

	quantity++;
	guid++;
	updateCount();
}
*/

function delTodo(index){
	data.items.splice(index, 1);
	update();
	/*
	var node = $(itemId);
	var iList = $('#item_list');
	iList.removeChild(node);
    delete todos[itemId];
	storage.setItem('todoStorage', JSON.stringify(todos));

	if(node.classList.contains('completed'))
		return;
	quantity--;
	updateCount();
	*/
}

function clickComplete(itemId, index){
	var node = $(itemId);
	if(!node)
		return;
	if(node.classList.contains('completed')){
		cancelComplete(itemId, index);
	}
	else{
		markComplete(itemId, index);
	}
}

function cancelComplete(itemId, index){
	var node = $(itemId);
	if(!node)
		return;

	node.classList.remove('completed');
	node.style.textDecoration = 'none';

	data.items[index].completed = false;
	/*
    var item = JSON.parse(todos[itemId]);
	item.completed = false;
    todos[itemId] = JSON.stringify(item);
	storage.setItem('todoStorage', JSON.stringify(todos));

	quantity++;
	updateCount();
	*/


}

function markComplete(itemId, index){
	var node = $(itemId);
	if(!node)
		return;

	node.classList.add('completed');
	node.style.textDecoration = 'line-through';

	data.items[index].completed = true;
	/*
    var item = JSON.parse(todos[itemId]);
	item.completed = true;
    todos[itemId] = JSON.stringify(item);
	storage.setItem('todoStorage', JSON.stringify(todos));

	quantity--;
	updateCount();
	*/
}

function markAllComplete(){
	var iList = $('#item_list');
	var childs = iList.childNodes;
	for(var i = 0; i < childs.length; i++){
		var node = childs[i];
		if(!node.classList.contains('completed'))
			markComplete('#'+node.id, i);
	}
}

function cancelAllComplete(){
	var iList = $('#item_list');
	var childs = iList.childNodes;
	for(var i = 0; i < childs.length; i++){
		var node = childs[i];
		if(node.classList.contains('completed'))
			cancelComplete('#'+node.id, i);
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

/*
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
*/