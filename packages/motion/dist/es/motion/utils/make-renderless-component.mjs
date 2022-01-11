var makeRenderlessComponent = function (hook) { return function (props) {
    hook(props);
    return null;
}; };

export { makeRenderlessComponent };
