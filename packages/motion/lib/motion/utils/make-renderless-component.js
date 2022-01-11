export var makeRenderlessComponent = function (hook) { return function (props) {
    hook(props);
    return null;
}; };
//# sourceMappingURL=make-renderless-component.js.map