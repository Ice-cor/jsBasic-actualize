import * as chai from 'chai';
import * as sinon from 'sinon';
import * as sinonChai from 'sinon-chai';
import Promise from '../src/promise'

const assert = chai.assert;

describe('Promise', () => {
    it('是一个类', () => {
        assert.isFunction(Promise);
        assert.isObject(Promise.prototype);
    })
    it('new Promise() 必须接受一个函数', () => {
        assert.throw(() => { // 预测会报错
            // @ts-ignoreß
            new Promise();
        })
    })
    it('new Promise(fn)的返回值是一个对象，且有then方法', () => {
        const promise = new Promise(() => { })
        assert.isFunction(promise.then)
    })
    it('new Promise(fn), fn立即执行', () => {
        const fn = sinon.fake(); // 创建一个假函数
        new Promise(fn);
        assert.isTrue(fn.called);
    })
    it('new Promise(fn), fn执行时可以接受两个函数resolve、reject', () => {
        new Promise((resolve, reject) => {
            assert.isFunction(resolve);
            assert.isFunction(reject);
        })
    })
    it('new Promise(success)中的 success 会被 resolve 调用的时候执行', done => {
        const success = sinon.fake();
        const promise = new Promise((resolve, reject) => {
            assert.isFalse(success.called);
            resolve();
            setTimeout(()=>{
                assert.isTrue(success.called)
                done()
            })
        })
        promise.then(success);
    })
    it('new Promise(null, fail)中的 fail 会被 reject 调用的时候执行', done => {
        const fail = sinon.fake();
        const promise = new Promise((resolve, reject) => {
            assert.isFalse(fail.called);
            reject();
            setTimeout(()=>{
                assert.isTrue(fail.called)
                done()
            })
        })
        promise.then(null, fail);
    })

})