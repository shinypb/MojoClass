mojo.js
==
A small implementation of classes and inheritance for JavaScript.
--

Why?
--
I was working on a project and realized that the whole thing would be infinitely easier with classes and inheritance at my disposal. It seemed like a good time to learn some of the intricacies of implementing such things.

Who?
--
My name is Mark, and I think you're neat. I'm [@shinypb](http://twitter.com/shinypb) on Twitter.

Example
--
<pre>
  // Class declarations
  var Person = mojoClass(function(name) {
    // This is a constructor
    this.name = name;
  }, {
    greet: function(someoneElse) {
      if(someoneElse) {
        return 'Hello, ' + someoneElse + '. My name is ' + this.name + '!';
      } else {
        return 'Hello. My name is ' + this.name + '!';
      }
    }
  });

  var AngryPerson = mojoClass(Person, {
    greet: function(someoneElse) {
      return this._super.greet(someoneElse).toUpperCase();
    }
  });

  var OtherPerson = mojoClass({
    initial: function(first_name, last_name) {
      this.first_name = first_name;
      this.last_name = last_name;
    }, 
    fullname: function() {
      return this.first_name + " " + this.last_name; 
    },
    greet: function(someoneElse) {
      return "Hello, " + someoneElse + " I'm "+ this.fullname() +"!";
  });
  
  // Class usage
  var mark = new Person('Mark');
  console.log('Person:', mark.greet());
  console.log('Person:', mark.greet('Nathalie'));

  var angryMark = new AngryPerson('Mark');
  console.log('AngryPerson:', angryMark.greet());
  console.log('AngryPerson:', angryMark.greet('Nathalie'));
  console.log('AngryPerson instanceof Person?', angryMark instanceof Person);

  var yasar = new OtherPerson("Yasar", "icli");
  console.log(yasar.greet("Mark"));

</pre>

More details
--
To create a new class, call the mojoClass function. You can pass in a variety of things:

* The parent class to inherit from (optional)
* A constructor (optional)
* An object containing all of the methods and properties of the instance

Subclasses can access the methods of their parent class by calling this.super.methodName();

Thanks
--
Thanks for Mozilla for providing [an implementation of bind](https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Function/bind) for browsers that don't support it, and John Resig for his [Simple JavaScript Inheritance](http://ejohn.org/blog/simple-javascript-inheritance/) post, which reminded me of the instanceof operator.

Randomly...
--
I didn't set out to write a particularly small implementation when I started, but out of curiosity, I poked around a bit to see how mojo compared. If you're looking for something positively tiny, John Resig's Simple JavaScript Inheritance is only 25 lines of code. Eep!
