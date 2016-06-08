var name = -2;

function makeFunc(){
	var name = -1;
	var displayName = function(){
		var i = 'abcd';
		name = i;
		i = i.substr(0,2);
		console.log(name);
		console.log(i);
	}
	console.log(name);
	return displayName;
}

console.log(name);

var myFunc = makeFunc();
myFunc();

function makeAdder(x){
	return function(y){
		return x+y;
	}
}

var add5 = makeAdder(5);
console.log('Add5(5):' + add5(5));