const createIf = cond =>
    (thenArg, elseArg = null) =>
        cond ? thenArg : elseArg;

const createIfs = cond => [
    createIf(cond),
    createIf(!cond),
];

const createLazyIf = cond =>
    (thenArg, elseArg = () => null) =>
        cond ? thenArg() : elseArg();

const createLazyIfs = cond => [
    createLazyIf(cond),
    createLazyIf(!cond),
];

const createConds = cond => [
    !!cond,
    !cond
];

module.exports = {
    createIf,
    createIfs,
    createLazyIf,
    createLazyIfs,
    createConds
};
