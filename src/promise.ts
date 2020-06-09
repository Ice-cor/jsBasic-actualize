class _Promise {
    callbacks=[]
    state = 'pending' // 'pending'|'fulfilled'|'rejected'三种状态，初始为'pending'
    constructor(fn) {
        if (typeof fn !== 'function') {
            throw new Error('必须接受一个函数')
        }
        const resolve = (result) => {
            if(this.state === 'fulfilled'){
                return;
            }
            this.state = 'fulfilled';
            setTimeout(() => {
                this.callbacks.forEach(handle => {
                    if (typeof handle[0] === 'function') { // 判断必须放到定时器里面，否则会提前判断，拿到是null的值
                        handle[0].call(undefined, result); // 异步，需要then之后才执行，否则success没有赋值
                    }
                })
            }, 0)
        }
        const reject = (reason) => {
            if(this.state === 'rejected'){
                return;
            }
            this.state = 'rejected';
            setTimeout(() => {
                this.callbacks.forEach(handle => {
                    if (typeof handle[1] === 'function') {
                        handle[1].call(undefined, reason);
                    }
                })
            }, 0)

        }
        fn(resolve, reject);
    }
    then(success?, fail?) {
        const handle = []
        if (typeof success === 'function') {
            handle[0] = success
        }
        if (typeof fail === 'function') {
            handle[1] = fail
        }
        this.callbacks.push(handle)
    }
}


export default _Promise;