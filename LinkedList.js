var Node = function (v) {
	if (!(this instanceof arguments.callee)) {
		throw new Error("Constructor called as a function");
	}
  
	this.value = v;
	this.next = null;
	this.previous = null;
}

Node.prototype.setValue = function(v) {
	this.value = v;
}

Node.prototype.getValue = function() {
	return this.value;
}

Node.prototype.setNext = function(n) {
	this.next = n;
}

Node.prototype.getNext = function() {
	return this.next;
}

Node.prototype.setPrevious = function(p) {
	this.previous = p;
}

Node.prototype.getPrevious = function() {
	return this.previous;
}

var LinkedList = function () {
	if (!(this instanceof arguments.callee)) {
		throw new Error("Constructor called as a function");
	}
	
	this.head = null;
	this.tail = null;
}

LinkedList.prototype.add = function(value)
{
	var node = new Node(value);
	
	if (this.head == null) { 
		this.head = node; 
	}
	
	if (this.tail != null) { 
		this.tail.setNext(node);
		node.setPrevious(this.tail);
	}
	
	this.tail = node;
}

LinkedList.prototype.insertAfter = function(findValue, value)
{
	var newNode = new Node(value);
	var node = new Node(findValue);
	
	for(var currentNode = this.head; currentNode; currentNode = currentNode.getNext())
	{
		if(currentNode.getValue() === node.getValue())
		{			
			if(this.tail != null && this.tail === currentNode)
			{
				this.tail.setNext(newNode);
				newNode.setPrevious(this.tail);
				this.tail = newNode;
			}
			else
			{
				var nextNode = currentNode.getNext();
				nextNode.setPrevious(newNode)				
				
				currentNode.setNext(newNode);
				
				newNode.setNext(nextNode);
				newNode.setPrevious(currentNode);
			}
			
			break;
		}
	}
}

LinkedList.prototype.insertBefore = function(findValue, value)
{
	var newNode = new Node(value);
	var node = new Node(findValue);
	
	for(var currentNode = this.head; currentNode; currentNode = currentNode.getNext())
	{
		if(currentNode.getValue() === node.getValue())
		{			
			if(this.head != null && this.head === currentNode)
			{
				this.head.setPrevious(newNode);
				newNode.setNext(this.head);
				this.head = newNode;
			}
			else
			{
				var previousNode = currentNode.getPrevious();
				previousNode.setNext(newNode)				
				
				currentNode.setPrevious(newNode);
				
				newNode.setNext(currentNode);
				newNode.setPrevious(previousNode);
			}
			
			break;
		}
	}
}

LinkedList.prototype.remove = function(findValue)
{
	var node = new Node(findValue);
	
	for(var currentNode = this.head; currentNode; currentNode = currentNode.getNext())
	{
		if(currentNode.getValue() === node.getValue())
		{			
			if(this.head != null && this.head === currentNode && this.tail != null && this.tail === currentNode) {
				currentNode.setPrevious(null);
				currentNode.setNext(null);
				this.head = null;
				this.tail = null
			}
			else if(this.head != null && this.head === currentNode) {
				var nextNode = currentNode.getNext();
				nextNode.setPrevious(null);
				this.head = nextNode;
			}
			else if(this.tail != null && this.tail === currentNode) {
				var previousNode = currentNode.getPrevious();
				previousNode.setNext(null);
				this.tail = previousNode;
			}
			else {
				var nextNode = currentNode.getNext();
				var previousNode = currentNode.getPrevious();
				
				nextNode.setPrevious(previousNode);
				previousNode.setNext(nextNode);
			}
			
			break;
		}
	}
}

LinkedList.prototype.replace = function(findValue, value)
{	
	var node = new Node(findValue);
	
	for(var n = ll.head; n; n = n.getNext())
	{
		if(n.getValue() === node.getValue())
		{
			n.setValue(value);			
			break;
		}
	}
}

// var ll = new LinkedList();
// ll.add(1);
// ll.add(2);
// ll.add(3);
// ll.add(4);
// ll.add(5);

// for(var n = ll.head; n; n = n.getNext())
	// console.log('Value: '+ n.getValue() + ' | Previous: ' + (n.getPrevious() == null ? '' : n.getPrevious().getValue()));

// // ll.remove(3);	
// // ll.insertBefore(3, 2.5);
// // ll.insertAfter(3, 4);
// // ll.replace(3, 4);

// for(var n = ll.head; n; n = n.getNext())
	// console.log('Value: '+ n.getValue() + ' | Previous: ' + (n.getPrevious() == null ? '' : n.getPrevious().getValue()));