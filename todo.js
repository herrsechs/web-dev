var $ = function(sel) {
  return document.querySelector(sel);
};

var $All = function(sel) {
  return document.querySelectorAll(sel);
};

var quantity = 0; // Active item count 
var guid = 0;     // Global unique id for each item
var data;

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
			if(this.value == ''){
				$('#hint').style.display = 'none';
				$('#hint').innerHTML = '';
				return;
			} 
			if(data.history){
				var found = false;
				for(var i = 0; i < data.history.length; i++){
					if(data.history[i] == this.value)
						break;
					if(data.history[i].search(this.value) != -1){
						$('#hint').style.display = 'block';
						$('#hint').innerHTML = data.history[i];
						found = true;
						break;
					}
				}
				if(!found){
					$('#hint').style.display = 'none';
					$('#hint').innerHTML = '';
				}
			}

			if(event.keyCode != 13) return;
			data.items.push({msg: this.value, completed: false});
			data.history.push(this.value);
			$('#hint').style.display = 'none';
			update();
		}, false);

		$('#hint').addEventListener('touchstart', function(){
			data.items.push({msg: this.innerHTML, completed: false});
			this.style.display = 'none';
			update();
		}, false);

		update();
	});
};


function updateCount(){
	if(quantity == 0){
		$('#count').innerHTML = '';
		$('#filters').style.display = 'none';
	}
	else{
		$('#count').innerHTML = [
            quantity + ' items left'].join('');
        $('#filters').innerHTML = [
        	'<button class="FilterAct">Active</button>' +
        	'<button class="FilterCpl">Completed</button>' +
        	'<button class="NoFilter">All</button>'].join('');
        $('#filters').style.display = 'block';

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

	
	node.innerHTML = item;
	// '<div class="complete-bar"></div>'].join('');

	iList.insertBefore(node, iList.childNodes[0]);

	if(cpl){
		markComplete('#'+node.id, idx);
	}

	// Attach function to event
	var hammer = new Hammer($('#' + itemId));

	hammer.add(new Hammer.Pan({ direction: Hammer.DIRECTION_ALL, threshold: 50}));
	hammer.on('panleft', function(ev){
		clickComplete('#' + node.id, idx);
	});
	hammer.on('panright', function(ev){
		delTodo(idx);
	});

    hammer.on('press', function(ev){
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
            update();
        }

        edit.addEventListener('blur', function(){
            finish();
        }, false);

        edit.addEventListener('keyup', function(ev){
            if(ev.keyCode == 27){ // Esc
                finish();
            } else if(ev.keyCode == 13) { // Enter
            	data.items[idx].msg = this.value;
            	data.history.push(this.value);
                finish();
            }
        }, false);

        iList.insertBefore(edit, node);
        edit.focus();
    });
	
}

function delTodo(index){
	data.items.splice(index, 1);
	update();
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
	update();
}

function cancelComplete(itemId, index){
	var node = $(itemId);
	if(!node)
		return;

	node.classList.remove('completed');
	node.style.textDecoration = 'none';

	data.items[index].completed = false;

}

function markComplete(itemId, index){
	var node = $(itemId);
	if(!node)
		return;

	node.classList.add('completed');
	node.style.textDecoration = 'line-through';

	data.items[index].completed = true;
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
