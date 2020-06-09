class _Promise {
    success=null
    fail=null
    constructor(fn){
        if(typeof fn !== 'function'){
            throw new Error('必须接受一个函数')
        }
        const resolve = () => {
            this.success()
        }
        const reject = () => {
            this.fail()
        }
        fn(resolve, reject);
    }
    then(success?, fail?){
        this.success = success;
        this.fail = fail;
    }
}


export default _Promise;