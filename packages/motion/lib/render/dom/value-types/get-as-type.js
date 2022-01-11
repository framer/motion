/**
 * Provided a value and a ValueType, returns the value as that value type.
 */
export var getValueAsType = function (value, type) {
    return type && typeof value === "number"
        ? type.transform(value)
        : value;
};
//# sourceMappingURL=get-as-type.js.map