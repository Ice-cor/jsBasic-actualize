class _Promise {
    callbacks = []
    state = 'pending' // 'pending'|'fulfilled'|'rejected'三种状态，初始为'pending'
    private resolveOrReject(data, state, i) {
        if (this.state !== 'pending') return;
        this.state = state;
        nextTick(() => { // 微任务 node环境
            this.callbacks.forEach(handle => {
                if (typeof handle[i] === 'function') { // 判断必须放到定时器里面，否则会提前判断，拿到是null的值
                    let x
                    try {
                        x = handle[i].call(undefined, data);
                    } catch (e) {
                        return handle[2].reject(e) // 2.2.7.2 如果抛出异常
                    }
                    handle[2].resolveWith(x);
                }
            })
        })
    }
    resolve(result) {
        this.resolveOrReject(result, 'fulfilled', 0);
    }
    reject(reason) {
        this.resolveOrReject(reason, 'rejected', 1);
    }
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
            this.resolveWithSelf()
        }
        if (x instanceof _Promise) { // 2.3.2
            this.resolveWithPromise(x)
        }
        if (x instanceof Object) { // 2.3.3
            this.resolveWithObject(x)
        } else { // 2.3.4 如果不是对象，直接resolve
            // 不考虑无限递归的情况
            this.resolve(x)
        }
    }
    private resolveWithSelf() {
        this.reject(new TypeError('不能是同一个引用对象'));
    }
    private resolveWithPromise(x) {
        x.then(
            result => {
                this.resolve(result);
            },
            reason => {
                this.reject(reason);
            }
        );
    }
    private getThen(x) {
        let then;
        try {
            then = x.then;
        } catch (e) {
            return this.reject(e);
        }
        return then;
    }
    private resolveWithThenable(x) {
        try {
            x.then(
                y => {
                    this.resolveWith(y);
                },
                r => {
                    this.reject(r);
                }
            );
        } catch (e) {
            this.reject(e);
        }
    }
    private resolveWithObject(x) {
        let then = this.getThen(x);
        if (then instanceof Function) {
            this.resolveWithThenable(x);
        } else {
            this.resolve(x);
        }
    }
}
function nextTick(fn) {
    if (process !== undefined && typeof process.nextTick === "function") {
        return process.nextTick(fn);
    } else {
        var counter = 1;
        var observer = new MutationObserver(fn);
        var textNode = document.createTextNode(String(counter));

        observer.observe(textNode, {
            characterData: true
        });

        counter = counter + 1;
        textNode.data = String(counter);
    }
}

export default _Promise;

