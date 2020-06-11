class _Promise {
    resolve(result) {
        if (this.state === 'fulfilled') {
            return;
        }
        this.state = 'fulfilled';
        setTimeout(() => {
            this.callbacks.forEach(handle => {
                if (typeof handle[0] === 'function') { // 判断必须放到定时器里面，否则会提前判断，拿到是null的值
                    const x = handle[0].call(undefined, result); // 异步，需要then之后才执行，否则success没有赋值
                    handle[2].resolveWith(x);
                }
            })
        }, 0)
    }
    reject(reason) {
        if (this.state === 'rejected') {
            return;
        }
        this.state = 'rejected';
        setTimeout(() => {
            this.callbacks.forEach(handle => {
                if (typeof handle[1] === 'function') {
                    const x = handle[1].call(undefined, reason);
                    handle[2].resolveWith(x)
                }
            })
        }, 0)
    }
    callbacks = []
    state = 'pending' // 'pending'|'fulfilled'|'rejected'三种状态，初始为'pending'
    constructor(fn) {
        if (typeof fn !== 'function') {
            throw new Error('必须接受一个函数')
        }
        fn(this.resolve.bind(this), this.reject.bind(this));
    }
    then(success?, fail?) {
        const handle = []
        if (typeof success === 'function') {
            handle[0] = success
        }
        if (typeof fail === 'function') {
            handle[1] = fail
        }
        handle[2] = new _Promise(() => { })
        this.callbacks.push(handle)
        return handle[2]
    }
    resolveWith(x) {
        if (this === x) { // 2.3.1
            this.reject(new TypeError('不能是同一个引用对象'))
        }
        if (x instanceof _Promise) { // 2.3.2
            x.then((result) => { // 2.3.3.3
                this.resolve(result) // 2.3.3.3.1 
            }, (reason) => {
                this.reject(reason)  // 2.3.3.3.2 
            })
        }
        if (x instanceof Object) { // 2.3.3
            let then
            try {
                then = x.then // 2.3.3.1 让x作为x.then
            } catch (e) {
                this.reject(e) // 2.3.3.2
            }
            if (typeof then === 'function') { // 2.3.3.3, 如果为函数则调用then
                try {
                    x.then( // 
                        (y) => {
                            this.resolveWith(y) // 2.3.3.3.1
                        }, (r) => {
                            this.resolveWith(r) // 2.3.3.3.2
                        })
                } catch (e) { // 2.3.3.3.4 
                    this.reject(e)
                }
            } else { // 2.3.3.4 如果不是函数，resolve
                this.resolve(x)
            }
        } else { // 2.3.4 如果不是对象，直接resolve
            // 不考虑无限递归的情况
            this.resolve(x)
        }
    }
}

export default _Promise;