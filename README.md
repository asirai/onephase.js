onephase.js
========

#### JavaScript 2x2x2 Solver/Scrambler ####

### Usage ###

Call `ONEPHASE.onephase.initialize()` before use.
```javascript
const op = ONEPHASE.onephase;
op.initialize();
```
`ONEPHASE.onephase.solve(scramble)` returns solution for scramble.
```javascript
op.solve("F2 U2 F U' R2 F' U R' U'"); // solution: R F R2 U R' F' U2 F2 R'
```
`ONEPHASE.onephase.getScramble(seed)` returns a scramble. You can get the same scramble by the same seed. if no seed is entered, returns a random scramble.
```javascript
op.getScramble(121); // R2 F' U' R2 F' U2 F' R U2 F' 
```