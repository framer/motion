import { Color } from "three";
const readVector = (name, defaultValue) => (axis) => (instance) => {
    const value = instance[name];
    return value ? value[axis] : defaultValue;
};
const readPosition = readVector("position", 0);
const readScale = readVector("scale", 1);
const readRotation = readVector("rotation", 0);
const readers = {
    x: readPosition("x"),
    y: readPosition("y"),
    z: readPosition("z"),
    scale: readScale("x"),
    scaleX: readScale("x"),
    scaleY: readScale("y"),
    scaleZ: readScale("z"),
    rotateX: readRotation("x"),
    rotateY: readRotation("y"),
    rotateZ: readRotation("z"),
};
function readAnimatableValue(value) {
    if (value === undefined) {
        return;
    }
    else if (value instanceof Color) {
        return value.getStyle();
    }
    else {
        return value;
    }
}
export function readThreeValue(instance, name) {
    return name in readers
        ? readers[name](instance)
        : readAnimatableValue(instance[name]) || 0;
}
//# sourceMappingURL=read-value.js.map