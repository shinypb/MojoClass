var mojoClass = (function() {
  var bind = function(that, obj) {
    if(obj.bind) {
      //  Use built-in implementation of bind
      return obj.bind(that);
    }

    /**
     *  bind is a recent addition to ECMA-262, 5th edition; this implementation for browsers
     *  that don't support it was found at
     *  https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Function/bind
     */
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
  };

  var argumentTypes = function(args) {
    var types = [], type;
    var i;
    for(i in args) {
      type = args[i]._hasMojo ? 'mojo' : typeof(args[i]);
      types.push(type);
    }
    return types.join(',');
  };

  return function (/* [baseClass,] constructor, attributes */) {
    var baseClass, constructor, attributes;
    console.log(argumentTypes(arguments));

    switch(argumentTypes(arguments)) {
      case 'function,object':
        attributes = arguments[1];
        baseClass = null;
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
        constructor = baseClass.constructor;
        break;
      case 'object':
        attributes = arguments[0];
        baseClass = null;
        constructor = function() { };
      default:
        throw 'Invalid mojo class declaration: ' + argumentTypes(arguments);
    }

    var mojoClassFactory = function() {
      var key;
      var classAttributes = {};
      if(baseClass) {
        for(key in baseClass.attributes) {
          if(!baseClass.attributes.hasOwnProperty(key)) {
            break;
          }
          classAttributes[key] = baseClass.attributes[key];
        }
      }
      for(key in attributes) {
        if(!attributes.hasOwnProperty(key)) {
          break;
        }
        classAttributes[key] = attributes[key];
      }

      for(key in classAttributes) {
        if(!classAttributes.hasOwnProperty(key)) {
          break;
        }
        if(typeof(classAttributes[key]) === 'function') {
          this[key] = bind(this, classAttributes[key]);
        } else {
          this[key] = classAttributes[key];
        }
      }

      //  Hook up magic
      this._constructor = constructor;
      this._super = {};
      if(baseClass) {
        for(key in baseClass.attributes) {
          if(!baseClass.attributes.hasOwnProperty(key)) {
            break;
          }
          console.log('Super has', key, baseClass.attributes[key]);
          if(typeof(baseClass.attributes[key]) === 'function') {
            this._super[key] = bind(this, baseClass.attributes[key]);
          } else {
            this._super[key] = baseClass.attributes[key];
          }
        }
      }

      //  Run the constructor
      constructor.apply(this, arguments);

      return this;
    };

    mojoClassFactory._constructor = constructor;
    mojoClassFactory.attributes = attributes;
    mojoClassFactory._hasMojo = true;
    return mojoClassFactory;
  };
}())