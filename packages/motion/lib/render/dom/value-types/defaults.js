import { __assign } from "tslib";
import { color, filter } from "style-value-types";
import { numberValueTypes } from "./number";
/**
 * A map of default value types for common values
 */
export var defaultValueTypes = __assign(__assign({}, numberValueTypes), { 
    // Color props
    color: color, backgroundColor: color, outlineColor: color, fill: color, stroke: color, 
    // Border props
    borderColor: color, borderTopColor: color, borderRightColor: color, borderBottomColor: color, borderLeftColor: color, filter: filter, WebkitFilter: filter });
/**
 * Gets the default ValueType for the provided value key
 */
export var getDefaultValueType = function (key) { return defaultValueTypes[key]; };
//# sourceMappingURL=defaults.js.map