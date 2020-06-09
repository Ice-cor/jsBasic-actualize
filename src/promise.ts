class _Promise {
    success=null
    fail=null
    constructor(fn){
        if(typeof fn !== 'function'){
            throw new Error('必须接受一个函数')
        }
        const resolve = () => {
            setTimeout(()=>{
                this.success(); // 异步，需要then之后才执行，否则success没有赋值
            }, 0)
            
        }
        const reject = () => {
            setTimeout(()=>{
                this.fail();
            }, 0)
        }
        fn(resolve, reject);
    }
    then(success?, fail?){
        this.success = success;
        this.fail = fail;
    }
}


export default _Promise;