/*
numbering
         +--------+
         | 02  03 |
         |        |            
         | 01  00 |
+--------+--------+--------+--------+
| 02  01 | 01  00 | 00  03 | 03  02 |
|        |        |        |        |
| 07  06 | 06  04 | 04  05 | 05  07 |
+--------+--------+--------+--------+
         | 06  04 |
         |        |
         | 07  05 |
         +--------+
*/

let ONEPHASE = {};

ONEPHASE.onephase = (() => {

const U = 0;
const F = 1;
const R = 2;

let moveName;
let moveObject;

let cPTable;
let twistTable;

let cPPrun;
let twistPrun;

let initialized = false;

const getCP = (obj) => {
  let flag = 127;
  let ret = 0;
  let tmp;
  for (let i = 0; i < 7; i++) {
    tmp = 127 >> 7 - obj.cp[i];
    ret += fact(6 - i) * bitCount(flag & tmp);
    flag ^= 1 << obj.cp[i];
  }
  return ret;
}

const getTwist = (obj) => {
  ret = 0;
  for (let i = 0; i < 6; i++) {
    ret *= 3;
    ret += obj.co[i]
  }
  return ret;
}

const setCP = (obj, idx) => {
  let arr = [0, 1, 2, 3, 4, 5, 6];
  let tmp;
  for (let i = 0; i < 7; i++) {
    tmp = 1 << idx / fact(6 - i) | 0;
    obj.cp[i] = arr.splice(bitCount(tmp - 1), 1)[0];
    idx = idx % fact(6 - i);
  }
}

const setTwist = (obj, idx) => {
  let tw = 0
  for (let i = 0; i < 6; i++) {
    obj.co[i] = idx / (3 ** (5 - i)) | 0;
    tw += obj.co[i];
    idx = idx % (3 ** (5 - i));
  }
  obj.co[6] = (15 - tw) % 3;
}

const initTable = () => {
  initCPTable();
  initTwistTable();
}

const initCPTable = () => {
  cPTable = create2DArray(5040, 9);
  let obj_0 = {};
  let obj_1 = {};
  $init(obj_0);
  $init(obj_1);
  for (let i = 0; i < 5040; i++) {
    setCP(obj_0, i);
    for (let j = 0; j < 9; j++) {
      $multiply(obj_0, moveObject[j], obj_1);
      cPTable[i][j] = getCP(obj_1);
    }
  }
}

const initTwistTable = () => {
  twistTable = create2DArray(729, 9);
  let obj_0 = {};
  let obj_1 = {};
  $init(obj_0);
  $init(obj_1);
  for (let i = 0; i < 729; i++) {
    setTwist(obj_0, i);
    for (let j = 0; j < 9; j++) {
      $multiply(obj_0, moveObject[j], obj_1)
      twistTable[i][j] = getTwist(obj_1);
    }
  }
}

const initPrun = () => {
  initCPPrun();
  initTwistPrun();
}

const initCPPrun = () => {
  cPPrun = Array(5040);
  cPPrun.fill(15);

  let children, done, depth;

  cPPrun[0] = 0;
  done = 1;
  depth = 0;

  while (done < 5040) {
    for (let i = 0; i < 5040; i++) {
      if (cPPrun[i] !== depth ) continue;

      children = cPTable[i];
      for (let j = 0; j < 9; j++) {
        if (cPPrun[children[j]] === 15) {
          cPPrun[children[j]] = depth + 1;
          done++;
        }
      }
    }
    depth++;
  }
}

const initTwistPrun = () => {
  twistPrun = Array(729);
  twistPrun.fill(15);

  let children, done, depth;

  twistPrun[0] = 0;
  done = 1;
  depth = 0;

  while (done < 729) {
    for (let i = 0; i < 729; i++) {
      if (twistPrun[i] !== depth ) continue;

      children = twistTable[i];
      for (let j = 0; j < 9; j++) {
        if (twistPrun[children[j]] === 15) {
          twistPrun[children[j]] = depth + 1;
          done++;
        }
      }
    }
    depth++;
  }
}

const initMove = () => {
  moveName = ["U", "U2", "U'", "F", "F2", "F'", "R", "R2", "R'"];

  moveObject = Array(9);
  moveObject[U * 3] = {
    'cp': [3, 0, 1, 2, 4, 5, 6],
    'co': [0, 0, 0, 0, 0, 0, 0]
  };
  moveObject[F * 3] = {
    'cp': [1, 6, 2, 3, 0, 5, 4],
    'co': [1, 2, 0, 0, 2, 0, 1]
  };
  moveObject[R * 3] = {
    'cp': [4, 1, 2, 0, 5, 3, 6],
    'co': [2, 0, 0, 1, 1, 2, 0]
  };
  for (let i = 0; i < 3; i++) {
    moveObject[i * 3 + 1] = {}; $multiply(moveObject[i * 3], moveObject[i * 3], moveObject[i * 3 + 1]);
    moveObject[i * 3 + 2] = {}; $multiply(moveObject[i * 3 + 1], moveObject[i * 3], moveObject[i * 3 + 2]);
  }
}

const $init = (obj) => {
  obj.cp = [0, 1, 2, 3, 4, 5, 6];
  obj.co = [0, 0, 0, 0, 0, 0, 0];
}

const $apply = (obj, mv) => {
  const newCp = obj.cp.map((cur, idx) => obj.cp[mv.cp[idx]]);
  const newCo = obj.co.map((cur, idx) => (obj.co[mv.cp[idx]] + mv.co[idx]) % 3);
  obj.cp = newCp;
  obj.co = newCo;
}

const $multiply = (obj, mv, ret) => {
  const newCp = obj.cp.map((cur, idx) => obj.cp[mv.cp[idx]]);
  const newCo = obj.co.map((cur, idx) => (obj.co[mv.cp[idx]] + mv.co[idx]) % 3);
  ret.cp = newCp;
  ret.co = newCo;
}

const bitCount = (bits) =>{
  bits = (bits & 0x55555555) + (bits >> 1 & 0x55555555);
  bits = (bits & 0x33333333) + (bits >> 2 & 0x33333333);
  bits = (bits & 0x0f0f0f0f) + (bits >> 4 & 0x0f0f0f0f);
  bits = (bits & 0x00ff00ff) + (bits >> 8 & 0x00ff00ff);
  return (bits & 0x0000ffff) + (bits >>16 & 0x0000ffff);
}

const fact = (n) => {
  let fact = 1;
  for (let i = 1; i <= n; i++) {
    fact *= i;
  }
  return fact;
}

const create2DArray = (l1, l2) => {
  let ret = Array(l1);
  for (let i = 0; i < l1; i++){
    ret[i] = Array(l2);
    ret[i].fill(0);
  }
  return ret;
}

class Random {
  constructor(seed) {
    this.x = 123456789;
    this.y = 362436069;
    this.z = 521288629;
    this.w = seed ? seed : Math.floor(Math.random() * 88675123);
  }
  
  _random() {
    let t;
 
    t = this.x ^ (this.x << 11);
    this.x = this.y; this.y = this.z; this.z = this.w;
    return this.w = (this.w ^ (this.w >>> 19)) ^ (t ^ (t >>> 8)); 
  }
  
  randomInt(n) {
    const r = Math.abs(this._random());
    return (r % n);
  }
}

class Queue {
  constructor() {
    this.heap = [];
  }

  empty() {
    if (this.heap.length === 0) return true;
    return false;
  }

  size() {
    return this.heap.length;
  }

  top() {
    return this.heap[0];
  }

  push(item) {
    this.heap.push(item);
  }
  
  pop() {
    return this.heap.shift();
  }
}

class Stack {
  constructor() {
    this.heap = [];
  }

  empty() {
    if (this.heap.length === 0) return true;
    return false;
  }

  size() {
    return this.heap.length;
  }

  top() {
    return this.heap[0];
  }
 
  push(item) {
    this.heap.unshift(item);
  }
  
  pop() {
    return this.heap.shift();
  }
}

const search = (root) => {
  let solution = null;
  for (let d = 0; d <= 13; d++) {
    solution = _search(root, d);
    if (solution !== null) {
      return solution;
    }
  }
  return null;
}

const _search = (root, depth) => {
  let stack = new Stack(); // obj = [cperm, twist, mv]
  stack.push([
    getCP(root),
    getTwist(root),
    []
  ]);
  let cur;
  while(stack.size() > 0) {
    cur = stack.pop();

    if(cur[0] === 0 && cur[1] === 0) {
      return cur[2];
    }

    if (cur[2].length + cPPrun[cur[0]] > depth 
      || cur[2].length + twistPrun[cur[1]] > depth) {
      continue;
    }

    for (let i = 0; i < 9; i++) {
      let face = i / 3 | 0;
      let curFace = cur[2].length === 0 ? -1 : cur[2][cur[2].length - 1] / 3 | 0;
      if (face != curFace) {
        let mv = cur[2].slice();
        mv.push(i)
        stack.push([
          cPTable[cur[0]][i],
          twistTable[cur[1]][i],
          mv
        ]);
      }
    }
  }

  return null;
}

const getRandomState = (seed) => {
  let cp, co;
  let random = new Random(seed);
  let obj = {};
  cp = random.randomInt(5040);
  co = random.randomInt(729);

  $init(obj);
  setCP(obj, cp);
  setTwist(obj, co);
  
  return obj;
}

const initialize = () => {
  if (initialized) return;
  
  initMove();
  initTable();
  initPrun();
}

const solve = (scramble) => {
  console.log('scramble: ' + scramble);
  let arr = scramble.split(' ');
  let obj = {}
  $init(obj);
  let _solution;
  let solution = '';

  for (let i = 0; i < arr.length; i++) {
    if (moveName.indexOf(arr[i]) >= 0) $apply(obj, moveObject[moveName.indexOf(arr[i])]);
  }

  _solution = search(obj);
  _solution.forEach((val) => {
    solution += moveName[val] + ' '
  })
  console.log('solution: ' + solution);
  return solution;
}

const getScramble = (seed) => {
  let scramble, scr, solution, ret;

  scramble = '';
  scr = getRandomState(seed);
  solution = search(scr);
  solution.reverse();
  ret = '';
  solution.forEach((val) => {
    ret += moveName[val] + ' '
  })
  console.log(ret)
  return ret;
}

return {
  initialize: initialize,
  solve: solve,
  getScramble: getScramble,
}

})();