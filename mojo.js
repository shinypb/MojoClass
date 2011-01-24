var mojoClass = (function() {
  var mc = {
    /**
     *  Returns a comma-separated list of the types of each item in an array.
     *  If an item is a mojoClass, it will return 'mojo' instead of 'function'.
     */
    types: function(array) {
      var types = [], type;
      var i;
      for(i = 0; i < array.length; i++) {
        type = array[i]._hasMojo ? 'mojo' : typeof(array[i]);
        types.push(type);
      }
      return types.join(',');
    },
    /**
     *  bind is a recent addition to ECMA-262, 5th edition; this implementation
     *  for browsers that don't support it was found at
     *  https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Function/bind
     */
    bind: function(that, obj) {
      if(typeof(obj) !== 'function') {
        //  Only functions can be bound, but for readability of calling code, we
        //  don't want to worry about calling bind on non-functions.
        return that;
      }
      if(obj.bind) {
        //  Use built-in implementation of bind
        return obj.bind(that);
      }

      var slice = [].slice,
          args = slice.call(arguments, 1),
          self = this,
          nop = function () {},
          bound = function () {
            return self.apply( this instanceof nop ? this : ( obj || {} ),
                                args.concat( slice.call(arguments) ) );
          };

      nop.prototype = self.prototype;
      bound.prototype = new nop();

      return bound;
    }
  };

  return function (/* [baseClass,] constructor, attributes */) {
    var baseClass = null, constructor, attributes;
    switch(mc.types(arguments)) {
      case 'function,object':
        attributes = arguments[1];
        constructor = arguments[0];
        break;
      case 'mojo,function,object':
        attributes = arguments[2];
        baseClass = arguments[0];
        constructor = arguments[1];
        break;
      case 'mojo,object':
        attributes = arguments[1];
        baseClass = arguments[0];
        constructor = baseClass._constructor;
        break;
      case 'object':
        attributes = arguments[0];
        constructor = function() { };
        break;
      default:
        throw 'Invalid mojo class declaration: [' + mc.types(arguments) + ']';
    }

    var extend = function(baseObject, additions) {
      var key;
      for(key in additions) {
        if(additions.hasOwnProperty(key)) {
          baseObject[key] = additions[key];
        }
      }
    }

    var mojoClassFactory = function() {
      var key;

      //  Build the list of attributes this class will have. It includes everything in
      //  the base class, plus the attributes in the class declaration.
      var classAttributes = {};
      if(baseClass) {
        extend(classAttributes, baseClass._attributes);
      }
      extend(classAttributes, attributes);

      //  Copy those attributes to this new object, binding functions as we go
      for(key in classAttributes) {
        if(!classAttributes.hasOwnProperty(key)) {
          break;
        }
        this[key] = mc.bind(this, classAttributes[key]);
      }

      //  Our _super property gives us access to the properties and methods of
      //  the parent class; copy them over, binding the functions to this
      this._super = {};
      if(baseClass) {
        for(key in baseClass._attributes) {
          if(!baseClass._attributes.hasOwnProperty(key)) {
            break;
          }
          this._super[key] = mc.bind(this, baseClass._attributes[key]);
        }
      }

      //  Run the constructor
      this._constructor = constructor;
      this._constructor.apply(this, arguments);

      return this;
    };

    mojoClassFactory._constructor = constructor;
    mojoClassFactory._attributes = attributes;
    mojoClassFactory._hasMojo = true;

    return mojoClassFactory;
  };
}());