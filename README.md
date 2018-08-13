## 函数路线

## call and apply

        // 不这样做的原因是 call 比 apply 快很多
        // .apply 在运行前要对作为参数的数组进行一系列检验和深拷贝，.call 则没有这些步骤
        // 例如参数数组为非对象会报错，
        // 又例如如何参数数组为undefined或null则在内部调用call方法，使得所有参数都为undefined。所以要注意当用null时，参数是undefined，不是null
        
        // 具体可以参考：
                // https://segmentfault.com/q/1010000007894513
                // http://www.ecma-international.org/ecma-262/5.1/#sec-15.3.4.3
                // http://www.ecma-international.org/ecma-262/5.1/#sec-15.3.4.4
                
                
### 偏函数
_.partial