/*
“JavaScript uses prototype-based inheritance. Every JavaScript object has an internal [[Prototype]] link that points to another object,
and that object can itself have another prototype. This forms a prototype chain.

When I access a property or method on an object, JavaScript first looks for it directly on that object.
If it doesn't find it, it follows the object's prototype link and searches there. It keeps doing this until it finds the property or reaches null.

With constructor functions, the prototype property of the constructor is the object that instances inherit from.
For example, if I create const dog = new Animal(), then dog gets an internal [[Prototype]] link to Animal.prototype.
So methods defined on Animal.prototype are shared by all Animal instances instead of being recreated for every object.”


“prototype and __proto__ are related but they are not the same thing. prototype is a property primarily found on constructor functions,
and it specifies the object that instances created using new will inherit from.
__proto__ is an accessor that exposes an object's internal [[Prototype]].”
*/

const vehicle = {
  wheels: 4,
  ready: function () {
    return "Ready to go";
  },
};

const Bike = {
  wheels: 2,
  wheelie: function () {
    return "On one wheel!!";
  },
};

Object.setPrototypeOf(Bike, vehicle);

console.log(Bike.ready());
