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
     *  Wrapper for bind so we can support browsers without native support.
     */
    bind: function(that, func) {
      if(typeof(func) !== 'function') {
        //  Only functions can be bound, but for readability of calling code, we
        //  don't want to worry about calling bind on non-functions.
        return func;
      }
      if(func.bind) {
        //  Use built-in implementation of bind
        return func.bind(that);
      }

      return function() {
        return func.apply(that, arguments);
      }
    }
  };

  var mojoClass = function (/* [baseClass,] constructor, attributes */) {
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
        constructor = function() { }; // default empty constructor

        // constructor method in attributes object set constructor
        if (attributes.hasOwnProperty("initial")) {
            constructor = attributes.initial;
        }
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
      this._superClass = baseClass;
      if(baseClass) {
        for(key in baseClass._attributes) {
          if(!baseClass._attributes.hasOwnProperty(key)) {
            break;
          }
          this._super[key] = mc.bind(this, baseClass._attributes[key]);
        }
        this._super._constructor = baseClass._constructor;
      }

      //  Run the constructor
      if(!mc.makingPrototype) {
        this._constructor = constructor;
        this._constructor.apply(this, arguments);
      }

      return this;
    };

    mojoClassFactory._constructor = constructor;
    mojoClassFactory._attributes = attributes;
    mojoClassFactory._hasMojo = true;

    //  If we're just making an instance for the .prototype property, don't
    //  actually run the whole constructor.
    //  This clever idea from http://ejohn.org/blog/simple-javascript-inheritance/
    if(mc.makingPrototype) {
      return false;
    }
    mc.makingPrototype = true;
    mojoClassFactory.prototype = baseClass ? new baseClass() : Object;
    mc.makingPrototype = false;

    return mojoClassFactory;
  };

  /**
   *  This allows you to define abstract base classes that cannot be
   *  instantiated directly.
   *  e.g.  var someClass = mojoClass.abstract(constructor, attributes);
   */
  mojoClass.abstract = function() {
    function wrapConstructor(constructor) {
      return function() {
        if(!this._super._constructor) {
          throw "Cannot instantiate this class directly; subclass it first";
        }
        constructor.apply(this, arguments);
      }
    }

    var i;
    for(i = 0; i < arguments.length; i++) {
      if(typeof arguments[i] === 'function') {
        arguments[i] = wrapConstructor(arguments[i]);
        break;
      }
    }

    return mojoClass.apply(this, arguments);
  };

  return mojoClass;
}());
