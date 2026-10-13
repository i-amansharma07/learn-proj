// closure is the ability of a function to remeber it's parent's scope even after the parent function has closed.

let globalVar = 100;

function parent() {
  let local = 1;

  function child() {
    console.log((globalVar += 10));
    console.log((local += 10));
  }

  return child;
}

const ref = parent();
ref(); //parent has done executing but child still holds the parent's memory
ref();

console.log("\n");

// we can also hide the private variables from the outside world only child function can access it, like count can't be accessed by outside world
const parentFunction = (() => {
  let count = 0;

  console.log(`Function has been init with value as ${count}`);

  return () => {
    count += 10;
    console.log(`Current Count = ${count}`);
  };
})();

parentFunction();
parentFunction();

console.log("\n");

//real world example an arcade game machine which will have initial credits
const machine = ((num) => {
  let credits = num;
  console.log(`Machine has started with credits = ${credits}`);

  return () => {
    if (credits <= 0) {
      console.log(`** Not enough credits please recharge **`);
      return;
    }

    credits -= 1;

    console.log(`Game has started current balance ${credits}`);
  };
})(5);

machine();
machine();
machine();
machine();
machine();
machine();
