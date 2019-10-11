const { createConds, createIfs, createLazyIfs } = require('./utils')

const removeEmpty = arr =>
    arr.filter(e => e != null);

process.env.NODE_ENV = process.env.NODE_ENV || 'development';

const [isDev, isNotDev] = createConds(process.env.NODE_ENV === 'development');
const [ifDev, ifNotDev] = createIfs(process.env.NODE_ENV === 'development');
const [lazyIfDev, lazyIfNotDev] = createLazyIfs(process.env.NODE_ENV === 'development');

const [isProd, isNotProd] = createConds(process.env.NODE_ENV === 'production');
const [ifProd, ifNotProd] = createIfs(process.env.NODE_ENV === 'production');
const [lazyIfProd, lazyIfNotProd] = createLazyIfs(process.env.NODE_ENV === 'production');

const [isHot, isNotHot] = createConds(isDev && !!process.env.HOT);
const [ifHot, ifNotHot] = createIfs(isDev && !!process.env.HOT);
const [lazyIfHot, lazyIfNotHot] = createLazyIfs(isDev && !!process.env.HOT);

module.exports = {
    removeEmpty,

    isDev,
    isNotDev,
    isProd,
    isNotProd,

    ifDev,
    ifNotDev,
    ifProd,
    ifNotProd,
    lazyIfDev,
    lazyIfNotDev,
    lazyIfProd,
    lazyIfNotProd,

    isHot,
    isNotHot,

    ifHot,
    ifNotHot,
    lazyIfHot,
    lazyIfNotHot
};
