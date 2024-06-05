import { Euler, Vector3, Color } from "three";
const setVector = (name, defaultValue) => (i) => (instance, value) => {
    if (instance[name] === undefined) {
        instance[name] = new Vector3(defaultValue);
    }
    const vector = instance[name];
    vector.setComponent(i, value);
};
const setEuler = (name, defaultValue) => (axis) => (instance, value) => {
    if (instance[name] === undefined) {
        instance[name] = new Euler(defaultValue);
    }
    const euler = instance[name];
    euler[axis] = value;
};
const setColor = (name) => (instance, value) => {
    if (instance[name] === undefined) {
        instance[name] = new Color(value);
    }
    instance[name].set(value);
};
const setScale = setVector("scale", 1);
const setPosition = setVector("position", 0);
const setRotation = setEuler("rotation", 0);
const setters = {
    x: setPosition(0),
    y: setPosition(1),
    z: setPosition(2),
    scale: (instance, value) => {
        if (instance.scale === undefined) {
            instance.scale = new Vector3(1);
        }
        const scale = instance.scale;
        scale.set(value, value, value);
    },
    scaleX: setScale(0),
    scaleY: setScale(1),
    scaleZ: setScale(2),
    rotateX: setRotation("x"),
    rotateY: setRotation("y"),
    rotateZ: setRotation("z"),
    color: setColor("color"),
    specular: setColor("specular"),
};
export function setThreeValue(instance, key, values) {
    if (key in setters) {
        setters[key](instance, values[key]);
    }
    else {
        if (key === "opacity" && !instance.transparent) {
            instance.transparent = true;
        }
        instance[key] = values[key];
    }
}
//# sourceMappingURL=set-value.js.map