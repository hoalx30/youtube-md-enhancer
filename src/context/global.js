const globalContext = {};

const get = (key) => globalContext[key];

const set = (value) => Object.assign(globalContext, value);

export { get, set };
