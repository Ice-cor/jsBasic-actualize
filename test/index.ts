import * as chai from 'chai';
import * as sinon from 'sinon';
import * as sinonChai from 'sinon-chai';
import Promise from '../src/promise';

const assert = chai.assert;

describe('Promise', () => {
    it('是一个类', () => {
        assert.isFunction(Promise);
        assert.isObject(Promise.prototype);
    })
    it('new Promise() 必须接受一个函数', () => {
        assert.throw(() => { // 预测会报错
            // @ts-ignore
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
            setTimeout(() => {
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
            setTimeout(() => {
                assert.isTrue(fail.called)
                done()
            })
        })
        promise.then(null, fail);
    })
    it('promise.then(success, fail)，success与fail必须为函数', () => {
        const promise = new Promise((resolve, reject) => {
            resolve()
        })
        promise.then(null, 2);
    })
    it(`2.2.2 
        then里所传的success函数必须在状态变为fulfilled后才执行；
        resolve(arg)中arg的值作为success(arg)中的第一个参数；
        此函数在promise完成(fulfilled)之前绝对不能被调用；
        此函数绝对不能被调用超过一次；
        `,
        (done) => {
            const success = sinon.fake();
            const promise = new Promise((resolve, reject) => {
                assert.isTrue(success.notCalled) // 还未执行
                resolve(1)
                resolve(2)
                setTimeout(() => {
                    assert.isTrue(promise.state === 'fulfilled') // 状态已经改变
                    assert.isTrue(success.called) // promise完成后执行
                    assert(success.calledWith(1)) // 第一个参数为resolve所传的值
                    assert(success.calledOnce) // 只执行了一次
                    done()
                }, 0)
            })
            promise.then(success);
        })
    it(`2.2.3 同上，状态是rejected`,
        (done) => {
            const fail = sinon.fake();
            const promise = new Promise((resolve, reject) => {
                assert.isTrue(fail.notCalled) // 还未执行
                reject(1)
                reject(2)
                setTimeout(() => {
                    assert.isTrue(promise.state === 'rejected') // 状态已经改变
                    assert.isTrue(fail.called) // promise完成后执行
                    assert(fail.calledWith(1)) // 第一个参数为reject所传的值
                    assert(fail.calledOnce) // 只执行了一次
                    done()
                }, 0)
            })
            promise.then(null, fail);
        })
    it('2.2.4 在代码执行完之前，回调的success函数不得执行',
        (done) => {
            const success = sinon.fake();
            const promise = new Promise((resolve, reject) => {
                resolve();
            })
            promise.then(success);
            assert.isTrue(success.notCalled);
            assert(1 === 1);
            setTimeout(() => {
                assert.isTrue(success.called);
                done();
            }, 0)
        })
    it('2.2.4 在代码执行完之前，回调的fail函数不得执行',
        (done) => {
            const fail = sinon.fake();
            const promise = new Promise((resolve, reject) => {
                reject();
            })
            promise.then(null, fail);
            assert.isTrue(fail.notCalled);
            assert(1 === 1);
            setTimeout(() => {
                assert.isTrue(fail.called);
                done();
            }, 0)
        })
    it('2.2.5 当success、fail必须被当作函数调用，且不绑定this的指向',
        (done) => {
            const promise = new Promise((resolve, reject) => {
                resolve();
            })
            promise.then(function () {
                'use strict'
                assert(this === undefined)
                done()
            });
        })
    it('2.2.6 then可以在同一个promise里多次被调用',
        (done) => {
            const promise = new Promise((resolve, reject) => {
                resolve();
            })
            const callbacks = [sinon.fake(), sinon.fake(), sinon.fake()]
            promise.then(callbacks[0])
            promise.then(callbacks[1])
            promise.then(callbacks[2])
            setTimeout(() => {
                assert(callbacks[0].called)
                assert(callbacks[1].called)
                assert(callbacks[2].called)
                done()
            }, 0)
        })
    it('2.2.7 then必须返回一个promise',
        (done) => {
            const promise1 = new Promise((resolve, reject) => {
                resolve();
            })
            const promise2 = promise1.then();
            setTimeout(() => {
                assert(promise2 instanceof Promise)
                done()
            }, 0)
        })
    it('2.2.7.1 如果onFulfilled或onRejected返回一个值x，运行 [[Resolve]](promise2, x)',
        (done) => {
            const promise1 = new Promise((resolve, reject) => {
                resolve();
            })
            const promise2 = promise1.then(() => '成功');
            promise2.then((result) => {
                assert(result === '成功');
                done();
            })
        })
    it('2.2.7.1.2 x是一个Promise的实例，promise2传进去的函数会被resolve',
        (done) => {
            const fn = sinon.fake()
            const promise1 = new Promise((resolve, reject) => {
                resolve();
            })
            const promise2 = promise1.then(() => new Promise((resolve) => { resolve() })); // 返回一个promise实例
            promise2.then(fn)
            setTimeout(() => {
                assert(fn.called)
                done()
            }, 10)
        })
})