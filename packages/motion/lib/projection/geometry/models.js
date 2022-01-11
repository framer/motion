export var createAxisDelta = function () { return ({
    translate: 0,
    scale: 1,
    origin: 0,
    originPoint: 0,
}); };
export var createDelta = function () { return ({
    x: createAxisDelta(),
    y: createAxisDelta(),
}); };
export var createAxis = function () { return ({ min: 0, max: 0 }); };
export var createBox = function () { return ({
    x: createAxis(),
    y: createAxis(),
}); };
//# sourceMappingURL=models.js.map