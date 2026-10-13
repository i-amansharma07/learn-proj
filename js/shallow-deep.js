/*
JS primitves (passes values) **Immutable**
1. Number
2. Boolean
3. String
4. ndefined
5. Bigint
6. Symbol

JS structural (passes reference) **Mutable**
1. Object -> made wiht new (Object, Array, Map, Set, Date..)
2. Function
*/

let name = "Aman";
name[0] = "S"; //immutable
console.log(name);

//Shallow VS Deep

// **** shallow **** : spread Operator

const xArray = [1, 2, 3];
const yArray = xArray;

console.log(xArray === yArray); //true

const zArray = [...xArray];

console.log(xArray === zArray); //false(as zArray is clone of x and have different memory address)

const tArray = Object.assign([], zArray);

console.log(zArray === tArray); //false (copy)

//copying with nested object
tArray.push([4, 5, 6]);

console.log(tArray); //[ 1, 2, 3, [ 4, 5, 6 ] ]

const pArray = [...tArray];

console.log(tArray === pArray);
console.log(tArray, pArray);

pArray[3].push(3); // this will mutate the original array as well

console.log(tArray, pArray);

// **** Deep Clone ****

//wont work with complex data structures like functions, Set, Map, Date, etc
const deepCloneSimple = (data) => JSON.parse(JSON.stringify(data));

const baseArr = [1, 2, 3, [4, 5, 6]];
const copyArr = deepCloneSimple(baseArr);

copyArr[3].push(7); //no effect on base array

console.log(baseArr, copyArr);

function deepClone(obj) {
  if (obj === null || typeof obj !== "object") return obj;

  const newObj = Array.isArray(obj) ? [] : {};

  for (let key in obj) {
    const value = obj[key];
    newObj[key] = deepClone(value);
  }

  return newObj;
}

const deepCopy = deepClone(baseArr);
deepCopy[3].push(7); //no effect on base array

console.log(baseArr, deepCopy);
