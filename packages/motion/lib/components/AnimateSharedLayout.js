import * as React from "react";
import { useConstant } from "../utils/use-constant";
import { LayoutGroup } from "./LayoutGroup";
var id = 0;
export var AnimateSharedLayout = function (_a) {
    var children = _a.children;
    return (React.createElement(LayoutGroup, { id: useConstant(function () { return "asl-".concat(id++); }) }, children));
};
//# sourceMappingURL=AnimateSharedLayout.js.map