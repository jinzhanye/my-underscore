````
void function test() {
  console.log('boo!');
  // expected output: "boo!"
}();

try {
  test();
}
catch(e) {
  console.log(e);
  // expected output: ReferenceError: test is not defined
}

//运行结果
"boo!"
ReferenceError: test is not defined
````
> void 运算符能对给定的表达式进行求值，然后返回 undefined
这个例子中，void 后面跟的是函数表达式，test定义后立即执行，所以打印"boo!"。函数表达式定义函数是不会被保存下来的(除非赋值给一个变量)，所以test()报错。

undefined 并不是保留词（reserved word），它只是全局对象的一个属性，在低版本 IE 中能被重写。

````
var undefined = 10;

// undefined -- chrome
// 10 -- IE 8
alert(undefined);
````
undefined 在 ES5 中已经是全局对象的一个只读（read-only）属性了，它不能被重写。但是在局部作用域中，还是可以被重写的。

````
(function() {
  var undefined = 10;

  // 10 -- chrome
  alert(undefined);
})();

(function() {
  undefined = 10;

  // undefined -- chrome
  alert(undefined);
})();
````

void 0 代替 undefined 能节省不少字节的大小，事实上，不少 JavaScript 压缩工具在压缩过程中。