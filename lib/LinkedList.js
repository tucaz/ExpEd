var LinkedList = function () {
	if (!(this instanceof arguments.callee)) {
		throw new Error("Constructor called as a function");
	}

	var Node = function (v) {
		if (!(this instanceof arguments.callee)) {
			throw new Error("Constructor called as a function");
		}

		var _value = v,
		_next = null,
		_previous = null;

		return {
			setValue: function(v) {
				_value = v;
			},
			getValue: function() {
				return _value;
			},
			getNext: function() {
				return _next;
			},
			setNext: function(n) {
				_next = n;
			},
			getPrevious: function() {
				return _previous;
			},
			setPrevious: function(p) {
				_previous = p;
			},
			asReadOnly: function() {
				return {
					getValue: function() {
						return _value;
					},
					getNext: function() {
						return _next != null ?
						_next.asReadOnly() :
						null;
					},
					getPrevious: function() {
						return _previous != null ?
						_previous.asReadOnly() :
						null;
					},
				}
			}
		}
	}
	var _size = 0,
	_head = null,
	_tail = null;

	return {
		getSize: function() {
			return _size;
		},
		getHead: function() {
			return _head != null ?
			_head.asReadOnly() :
			null;
		},
		getTail: function() {
			return _tail != null ?
			_tail.asReadOnly() :
			null;
		},
		add: function(value) {
			var node = new Node(value);

			if (_head == null) {
				_head = node;
			}

			if (_tail != null) {
				_tail.setNext(node);
				node.setPrevious(_tail);
			}

			_tail = node;
			_size = _size + 1;
		},
		insertAfter: function(findValue, value) {
			var newNode = new Node(value);
			var node = new Node(findValue);

			for(var currentNode = _head; currentNode; currentNode = currentNode.getNext()) {
				if(currentNode.getValue() === node.getValue()) {
					if(_tail != null && _tail === currentNode) {
						_tail.setNext(newNode);
						newNode.setPrevious(_tail);
						_tail = newNode;
						_size = _size + 1;
					} else {
						var nextNode = currentNode.getNext();
						nextNode.setPrevious(newNode)

						currentNode.setNext(newNode);

						newNode.setNext(nextNode);
						newNode.setPrevious(currentNode);
						_size = _size + 1;
					}

					break;
				}
			}
		},
		insertBefore: function(findValue, value) {
			var newNode = new Node(value);
			var node = new Node(findValue);

			for(var currentNode = _head; currentNode; currentNode = currentNode.getNext()) {
				if(currentNode.getValue() === node.getValue()) {
					if(_head != null && _head === currentNode) {
						_head.setPrevious(newNode);
						newNode.setNext(_head);
						_head = newNode;
						_size = _size + 1;
					} else {
						var previousNode = currentNode.getPrevious();
						previousNode.setNext(newNode)

						currentNode.setPrevious(newNode);

						newNode.setNext(currentNode);
						newNode.setPrevious(previousNode);
						_size = _size + 1;
					}

					break;
				}
			}
		},
		find: function(value) {
			for(var currentNode = _head; currentNode; currentNode = currentNode.getNext()) {
				if(currentNode.getValue() === value) {
					return currentNode.asReadOnly();
				}
			}
		},
		remove: function(findValue) {
			var node = new Node(findValue);

			for(var currentNode = _head; currentNode; currentNode = currentNode.getNext()) {
				if(currentNode.getValue() === node.getValue()) {
					if(_head != null && _head === currentNode && _tail != null && _tail === currentNode) {
						currentNode.setPrevious(null);
						currentNode.setNext(null);
						_head = null;
						_tail = null;
						_size = _size - 1;
					} else if(_head != null && _head === currentNode) {
						var nextNode = currentNode.getNext();
						nextNode.setPrevious(null);
						_head = nextNode;
						_size = _size - 1;
					} else if(_tail != null && _tail === currentNode) {
						var previousNode = currentNode.getPrevious();
						previousNode.setNext(null);
						_tail = previousNode;
						_size = _size - 1;
					} else {
						var nextNode = currentNode.getNext();
						var previousNode = currentNode.getPrevious();

						nextNode.setPrevious(previousNode);
						previousNode.setNext(nextNode);
						_size = _size - 1;
					}

					break;
				}
			}
		},
		replace: function(findValue, value) {
			var node = new Node(findValue);

			for(var n = _head; n; n = n.getNext()) {
				if(n.getValue() === node.getValue()) {
					n.setValue(value);
					break;
				}
			}
		}
	}
}