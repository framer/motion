(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
    typeof define === 'function' && define.amd ? define(['exports'], factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.Projection = {}));
})(this, (function (exports) { 'use strict';

    /*! *****************************************************************************
    Copyright (c) Microsoft Corporation.

    Permission to use, copy, modify, and/or distribute this software for any
    purpose with or without fee is hereby granted.

    THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
    REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
    AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
    INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
    LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
    OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
    PERFORMANCE OF THIS SOFTWARE.
    ***************************************************************************** */

    var __assign = function() {
        __assign = Object.assign || function __assign(t) {
            for (var s, i = 1, n = arguments.length; i < n; i++) {
                s = arguments[i];
                for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
            }
            return t;
        };
        return __assign.apply(this, arguments);
    };

    function __rest(s, e) {
        var t = {};
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
            t[p] = s[p];
        if (s != null && typeof Object.getOwnPropertySymbols === "function")
            for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
                if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                    t[p[i]] = s[p[i]];
            }
        return t;
    }

    function __read(o, n) {
        var m = typeof Symbol === "function" && o[Symbol.iterator];
        if (!m) return o;
        var i = m.call(o), r, ar = [], e;
        try {
            while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
        }
        catch (error) { e = { error: error }; }
        finally {
            try {
                if (r && !r.done && (m = i["return"])) m.call(i);
            }
            finally { if (e) throw e.error; }
        }
        return ar;
    }

    function __spreadArray(to, from, pack) {
        if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
            if (ar || !(i in from)) {
                if (!ar) ar = Array.prototype.slice.call(from, 0, i);
                ar[i] = from[i];
            }
        }
        return to.concat(ar || Array.prototype.slice.call(from));
    }

    const defaultTimestep = (1 / 60) * 1000;
    const getCurrentTime = typeof performance !== "undefined"
        ? () => performance.now()
        : () => Date.now();
    const onNextFrame = typeof window !== "undefined"
        ? (callback) => window.requestAnimationFrame(callback)
        : (callback) => setTimeout(() => callback(getCurrentTime()), defaultTimestep);

    function createRenderStep(runNextFrame) {
        let toRun = [];
        let toRunNextFrame = [];
        let numToRun = 0;
        let isProcessing = false;
        let flushNextFrame = false;
        const toKeepAlive = new WeakSet();
        const step = {
            schedule: (callback, keepAlive = false, immediate = false) => {
                const addToCurrentFrame = immediate && isProcessing;
                const buffer = addToCurrentFrame ? toRun : toRunNextFrame;
                if (keepAlive)
                    toKeepAlive.add(callback);
                if (buffer.indexOf(callback) === -1) {
                    buffer.push(callback);
                    if (addToCurrentFrame && isProcessing)
                        numToRun = toRun.length;
                }
                return callback;
            },
            cancel: (callback) => {
                const index = toRunNextFrame.indexOf(callback);
                if (index !== -1)
                    toRunNextFrame.splice(index, 1);
                toKeepAlive.delete(callback);
            },
            process: (frameData) => {
                if (isProcessing) {
                    flushNextFrame = true;
                    return;
                }
                isProcessing = true;
                [toRun, toRunNextFrame] = [toRunNextFrame, toRun];
                toRunNextFrame.length = 0;
                numToRun = toRun.length;
                if (numToRun) {
                    for (let i = 0; i < numToRun; i++) {
                        const callback = toRun[i];
                        callback(frameData);
                        if (toKeepAlive.has(callback)) {
                            step.schedule(callback);
                            runNextFrame();
                        }
                    }
                }
                isProcessing = false;
                if (flushNextFrame) {
                    flushNextFrame = false;
                    step.process(frameData);
                }
            },
        };
        return step;
    }

    const maxElapsed = 40;
    let useDefaultElapsed = true;
    let runNextFrame = false;
    let isProcessing = false;
    const frame = {
        delta: 0,
        timestamp: 0,
    };
    const stepsOrder = [
        "read",
        "update",
        "preRender",
        "render",
        "postRender",
    ];
    const steps = stepsOrder.reduce((acc, key) => {
        acc[key] = createRenderStep(() => (runNextFrame = true));
        return acc;
    }, {});
    const sync = stepsOrder.reduce((acc, key) => {
        const step = steps[key];
        acc[key] = (process, keepAlive = false, immediate = false) => {
            if (!runNextFrame)
                startLoop();
            return step.schedule(process, keepAlive, immediate);
        };
        return acc;
    }, {});
    const cancelSync = stepsOrder.reduce((acc, key) => {
        acc[key] = steps[key].cancel;
        return acc;
    }, {});
    const flushSync = stepsOrder.reduce((acc, key) => {
        acc[key] = () => steps[key].process(frame);
        return acc;
    }, {});
    const processStep = (stepId) => steps[stepId].process(frame);
    const processFrame = (timestamp) => {
        runNextFrame = false;
        frame.delta = useDefaultElapsed
            ? defaultTimestep
            : Math.max(Math.min(timestamp - frame.timestamp, maxElapsed), 1);
        frame.timestamp = timestamp;
        isProcessing = true;
        stepsOrder.forEach(processStep);
        isProcessing = false;
        if (runNextFrame) {
            useDefaultElapsed = false;
            onNextFrame(processFrame);
        }
    };
    const startLoop = () => {
        runNextFrame = true;
        useDefaultElapsed = true;
        if (!isProcessing)
            onNextFrame(processFrame);
    };
    const getFrameData = () => frame;

    var warning = function () { };
    var invariant = function () { };
    {
        warning = function (check, message) {
            if (!check && typeof console !== 'undefined') {
                console.warn(message);
            }
        };
        invariant = function (check, message) {
            if (!check) {
                throw new Error(message);
            }
        };
    }

    const clamp$1 = (min, max, v) => Math.min(Math.max(v, min), max);

    const safeMin = 0.001;
    const minDuration = 0.01;
    const maxDuration = 10.0;
    const minDamping = 0.05;
    const maxDamping = 1;
    function findSpring({ duration = 800, bounce = 0.25, velocity = 0, mass = 1, }) {
        let envelope;
        let derivative;
        warning(duration <= maxDuration * 1000, "Spring duration must be 10 seconds or less");
        let dampingRatio = 1 - bounce;
        dampingRatio = clamp$1(minDamping, maxDamping, dampingRatio);
        duration = clamp$1(minDuration, maxDuration, duration / 1000);
        if (dampingRatio < 1) {
            envelope = (undampedFreq) => {
                const exponentialDecay = undampedFreq * dampingRatio;
                const delta = exponentialDecay * duration;
                const a = exponentialDecay - velocity;
                const b = calcAngularFreq(undampedFreq, dampingRatio);
                const c = Math.exp(-delta);
                return safeMin - (a / b) * c;
            };
            derivative = (undampedFreq) => {
                const exponentialDecay = undampedFreq * dampingRatio;
                const delta = exponentialDecay * duration;
                const d = delta * velocity + velocity;
                const e = Math.pow(dampingRatio, 2) * Math.pow(undampedFreq, 2) * duration;
                const f = Math.exp(-delta);
                const g = calcAngularFreq(Math.pow(undampedFreq, 2), dampingRatio);
                const factor = -envelope(undampedFreq) + safeMin > 0 ? -1 : 1;
                return (factor * ((d - e) * f)) / g;
            };
        }
        else {
            envelope = (undampedFreq) => {
                const a = Math.exp(-undampedFreq * duration);
                const b = (undampedFreq - velocity) * duration + 1;
                return -safeMin + a * b;
            };
            derivative = (undampedFreq) => {
                const a = Math.exp(-undampedFreq * duration);
                const b = (velocity - undampedFreq) * (duration * duration);
                return a * b;
            };
        }
        const initialGuess = 5 / duration;
        const undampedFreq = approximateRoot(envelope, derivative, initialGuess);
        duration = duration * 1000;
        if (isNaN(undampedFreq)) {
            return {
                stiffness: 100,
                damping: 10,
                duration,
            };
        }
        else {
            const stiffness = Math.pow(undampedFreq, 2) * mass;
            return {
                stiffness,
                damping: dampingRatio * 2 * Math.sqrt(mass * stiffness),
                duration,
            };
        }
    }
    const rootIterations = 12;
    function approximateRoot(envelope, derivative, initialGuess) {
        let result = initialGuess;
        for (let i = 1; i < rootIterations; i++) {
            result = result - envelope(result) / derivative(result);
        }
        return result;
    }
    function calcAngularFreq(undampedFreq, dampingRatio) {
        return undampedFreq * Math.sqrt(1 - dampingRatio * dampingRatio);
    }

    const durationKeys = ["duration", "bounce"];
    const physicsKeys = ["stiffness", "damping", "mass"];
    function isSpringType(options, keys) {
        return keys.some((key) => options[key] !== undefined);
    }
    function getSpringOptions(options) {
        let springOptions = Object.assign({ velocity: 0.0, stiffness: 100, damping: 10, mass: 1.0, isResolvedFromDuration: false }, options);
        if (!isSpringType(options, physicsKeys) &&
            isSpringType(options, durationKeys)) {
            const derived = findSpring(options);
            springOptions = Object.assign(Object.assign(Object.assign({}, springOptions), derived), { velocity: 0.0, mass: 1.0 });
            springOptions.isResolvedFromDuration = true;
        }
        return springOptions;
    }
    function spring(_a) {
        var { from = 0.0, to = 1.0, restSpeed = 2, restDelta } = _a, options = __rest(_a, ["from", "to", "restSpeed", "restDelta"]);
        const state = { done: false, value: from };
        let { stiffness, damping, mass, velocity, duration, isResolvedFromDuration, } = getSpringOptions(options);
        let resolveSpring = zero;
        let resolveVelocity = zero;
        function createSpring() {
            const initialVelocity = velocity ? -(velocity / 1000) : 0.0;
            const initialDelta = to - from;
            const dampingRatio = damping / (2 * Math.sqrt(stiffness * mass));
            const undampedAngularFreq = Math.sqrt(stiffness / mass) / 1000;
            if (restDelta === undefined) {
                restDelta = Math.min(Math.abs(to - from) / 100, 0.4);
            }
            if (dampingRatio < 1) {
                const angularFreq = calcAngularFreq(undampedAngularFreq, dampingRatio);
                resolveSpring = (t) => {
                    const envelope = Math.exp(-dampingRatio * undampedAngularFreq * t);
                    return (to -
                        envelope *
                            (((initialVelocity +
                                dampingRatio * undampedAngularFreq * initialDelta) /
                                angularFreq) *
                                Math.sin(angularFreq * t) +
                                initialDelta * Math.cos(angularFreq * t)));
                };
                resolveVelocity = (t) => {
                    const envelope = Math.exp(-dampingRatio * undampedAngularFreq * t);
                    return (dampingRatio *
                        undampedAngularFreq *
                        envelope *
                        ((Math.sin(angularFreq * t) *
                            (initialVelocity +
                                dampingRatio *
                                    undampedAngularFreq *
                                    initialDelta)) /
                            angularFreq +
                            initialDelta * Math.cos(angularFreq * t)) -
                        envelope *
                            (Math.cos(angularFreq * t) *
                                (initialVelocity +
                                    dampingRatio *
                                        undampedAngularFreq *
                                        initialDelta) -
                                angularFreq *
                                    initialDelta *
                                    Math.sin(angularFreq * t)));
                };
            }
            else if (dampingRatio === 1) {
                resolveSpring = (t) => to -
                    Math.exp(-undampedAngularFreq * t) *
                        (initialDelta +
                            (initialVelocity + undampedAngularFreq * initialDelta) *
                                t);
            }
            else {
                const dampedAngularFreq = undampedAngularFreq * Math.sqrt(dampingRatio * dampingRatio - 1);
                resolveSpring = (t) => {
                    const envelope = Math.exp(-dampingRatio * undampedAngularFreq * t);
                    const freqForT = Math.min(dampedAngularFreq * t, 300);
                    return (to -
                        (envelope *
                            ((initialVelocity +
                                dampingRatio * undampedAngularFreq * initialDelta) *
                                Math.sinh(freqForT) +
                                dampedAngularFreq *
                                    initialDelta *
                                    Math.cosh(freqForT))) /
                            dampedAngularFreq);
                };
            }
        }
        createSpring();
        return {
            next: (t) => {
                const current = resolveSpring(t);
                if (!isResolvedFromDuration) {
                    const currentVelocity = resolveVelocity(t) * 1000;
                    const isBelowVelocityThreshold = Math.abs(currentVelocity) <= restSpeed;
                    const isBelowDisplacementThreshold = Math.abs(to - current) <= restDelta;
                    state.done =
                        isBelowVelocityThreshold && isBelowDisplacementThreshold;
                }
                else {
                    state.done = t >= duration;
                }
                state.value = state.done ? to : current;
                return state;
            },
            flipTarget: () => {
                velocity = -velocity;
                [from, to] = [to, from];
                createSpring();
            },
        };
    }
    spring.needsInterpolation = (a, b) => typeof a === "string" || typeof b === "string";
    const zero = (_t) => 0;

    const progress = (from, to, value) => {
        const toFromDifference = to - from;
        return toFromDifference === 0 ? 1 : (value - from) / toFromDifference;
    };

    const mix = (from, to, progress) => -progress * from + progress * to + from;

    const clamp = (min, max) => (v) => Math.max(Math.min(v, max), min);
    const sanitize = (v) => (v % 1 ? Number(v.toFixed(5)) : v);
    const floatRegex = /(-)?([\d]*\.?[\d])+/g;
    const colorRegex = /(#[0-9a-f]{6}|#[0-9a-f]{3}|#(?:[0-9a-f]{2}){2,4}|(rgb|hsl)a?\((-?[\d\.]+%?[,\s]+){2,3}\s*\/*\s*[\d\.]+%?\))/gi;
    const singleColorRegex = /^(#[0-9a-f]{3}|#(?:[0-9a-f]{2}){2,4}|(rgb|hsl)a?\((-?[\d\.]+%?[,\s]+){2,3}\s*\/*\s*[\d\.]+%?\))$/i;
    function isString(v) {
        return typeof v === 'string';
    }

    const number = {
        test: (v) => typeof v === 'number',
        parse: parseFloat,
        transform: (v) => v,
    };
    const alpha = Object.assign(Object.assign({}, number), { transform: clamp(0, 1) });
    const scale = Object.assign(Object.assign({}, number), { default: 1 });

    const createUnitType = (unit) => ({
        test: (v) => isString(v) && v.endsWith(unit) && v.split(' ').length === 1,
        parse: parseFloat,
        transform: (v) => `${v}${unit}`,
    });
    const degrees = createUnitType('deg');
    const percent = createUnitType('%');
    const px = createUnitType('px');
    const vh = createUnitType('vh');
    const vw = createUnitType('vw');
    const progressPercentage = Object.assign(Object.assign({}, percent), { parse: (v) => percent.parse(v) / 100, transform: (v) => percent.transform(v * 100) });

    const isColorString = (type, testProp) => (v) => {
        return Boolean((isString(v) && singleColorRegex.test(v) && v.startsWith(type)) ||
            (testProp && Object.prototype.hasOwnProperty.call(v, testProp)));
    };
    const splitColor = (aName, bName, cName) => (v) => {
        if (!isString(v))
            return v;
        const [a, b, c, alpha] = v.match(floatRegex);
        return {
            [aName]: parseFloat(a),
            [bName]: parseFloat(b),
            [cName]: parseFloat(c),
            alpha: alpha !== undefined ? parseFloat(alpha) : 1,
        };
    };

    const hsla = {
        test: isColorString('hsl', 'hue'),
        parse: splitColor('hue', 'saturation', 'lightness'),
        transform: ({ hue, saturation, lightness, alpha: alpha$1 = 1 }) => {
            return ('hsla(' +
                Math.round(hue) +
                ', ' +
                percent.transform(sanitize(saturation)) +
                ', ' +
                percent.transform(sanitize(lightness)) +
                ', ' +
                sanitize(alpha.transform(alpha$1)) +
                ')');
        },
    };

    const clampRgbUnit = clamp(0, 255);
    const rgbUnit = Object.assign(Object.assign({}, number), { transform: (v) => Math.round(clampRgbUnit(v)) });
    const rgba = {
        test: isColorString('rgb', 'red'),
        parse: splitColor('red', 'green', 'blue'),
        transform: ({ red, green, blue, alpha: alpha$1 = 1 }) => 'rgba(' +
            rgbUnit.transform(red) +
            ', ' +
            rgbUnit.transform(green) +
            ', ' +
            rgbUnit.transform(blue) +
            ', ' +
            sanitize(alpha.transform(alpha$1)) +
            ')',
    };

    function parseHex(v) {
        let r = '';
        let g = '';
        let b = '';
        let a = '';
        if (v.length > 5) {
            r = v.substr(1, 2);
            g = v.substr(3, 2);
            b = v.substr(5, 2);
            a = v.substr(7, 2);
        }
        else {
            r = v.substr(1, 1);
            g = v.substr(2, 1);
            b = v.substr(3, 1);
            a = v.substr(4, 1);
            r += r;
            g += g;
            b += b;
            a += a;
        }
        return {
            red: parseInt(r, 16),
            green: parseInt(g, 16),
            blue: parseInt(b, 16),
            alpha: a ? parseInt(a, 16) / 255 : 1,
        };
    }
    const hex = {
        test: isColorString('#'),
        parse: parseHex,
        transform: rgba.transform,
    };

    const color = {
        test: (v) => rgba.test(v) || hex.test(v) || hsla.test(v),
        parse: (v) => {
            if (rgba.test(v)) {
                return rgba.parse(v);
            }
            else if (hsla.test(v)) {
                return hsla.parse(v);
            }
            else {
                return hex.parse(v);
            }
        },
        transform: (v) => {
            return isString(v)
                ? v
                : v.hasOwnProperty('red')
                    ? rgba.transform(v)
                    : hsla.transform(v);
        },
    };

    const colorToken = '${c}';
    const numberToken = '${n}';
    function test(v) {
        var _a, _b, _c, _d;
        return (isNaN(v) &&
            isString(v) &&
            ((_b = (_a = v.match(floatRegex)) === null || _a === void 0 ? void 0 : _a.length) !== null && _b !== void 0 ? _b : 0) + ((_d = (_c = v.match(colorRegex)) === null || _c === void 0 ? void 0 : _c.length) !== null && _d !== void 0 ? _d : 0) > 0);
    }
    function analyse$1(v) {
        if (typeof v === 'number')
            v = `${v}`;
        const values = [];
        let numColors = 0;
        const colors = v.match(colorRegex);
        if (colors) {
            numColors = colors.length;
            v = v.replace(colorRegex, colorToken);
            values.push(...colors.map(color.parse));
        }
        const numbers = v.match(floatRegex);
        if (numbers) {
            v = v.replace(floatRegex, numberToken);
            values.push(...numbers.map(number.parse));
        }
        return { values, numColors, tokenised: v };
    }
    function parse(v) {
        return analyse$1(v).values;
    }
    function createTransformer(v) {
        const { values, numColors, tokenised } = analyse$1(v);
        const numValues = values.length;
        return (v) => {
            let output = tokenised;
            for (let i = 0; i < numValues; i++) {
                output = output.replace(i < numColors ? colorToken : numberToken, i < numColors ? color.transform(v[i]) : sanitize(v[i]));
            }
            return output;
        };
    }
    const convertNumbersToZero = (v) => typeof v === 'number' ? 0 : v;
    function getAnimatableNone$1(v) {
        const parsed = parse(v);
        const transformer = createTransformer(v);
        return transformer(parsed.map(convertNumbersToZero));
    }
    const complex = { test, parse, createTransformer, getAnimatableNone: getAnimatableNone$1 };

    const maxDefaults = new Set(['brightness', 'contrast', 'saturate', 'opacity']);
    function applyDefaultFilter(v) {
        let [name, value] = v.slice(0, -1).split('(');
        if (name === 'drop-shadow')
            return v;
        const [number] = value.match(floatRegex) || [];
        if (!number)
            return v;
        const unit = value.replace(number, '');
        let defaultValue = maxDefaults.has(name) ? 1 : 0;
        if (number !== value)
            defaultValue *= 100;
        return name + '(' + defaultValue + unit + ')';
    }
    const functionRegex = /([a-z-]*)\(.*?\)/g;
    const filter = Object.assign(Object.assign({}, complex), { getAnimatableNone: (v) => {
            const functions = v.match(functionRegex);
            return functions ? functions.map(applyDefaultFilter).join(' ') : v;
        } });

    function hueToRgb(p, q, t) {
        if (t < 0)
            t += 1;
        if (t > 1)
            t -= 1;
        if (t < 1 / 6)
            return p + (q - p) * 6 * t;
        if (t < 1 / 2)
            return q;
        if (t < 2 / 3)
            return p + (q - p) * (2 / 3 - t) * 6;
        return p;
    }
    function hslaToRgba({ hue, saturation, lightness, alpha }) {
        hue /= 360;
        saturation /= 100;
        lightness /= 100;
        let red = 0;
        let green = 0;
        let blue = 0;
        if (!saturation) {
            red = green = blue = lightness;
        }
        else {
            const q = lightness < 0.5
                ? lightness * (1 + saturation)
                : lightness + saturation - lightness * saturation;
            const p = 2 * lightness - q;
            red = hueToRgb(p, q, hue + 1 / 3);
            green = hueToRgb(p, q, hue);
            blue = hueToRgb(p, q, hue - 1 / 3);
        }
        return {
            red: Math.round(red * 255),
            green: Math.round(green * 255),
            blue: Math.round(blue * 255),
            alpha,
        };
    }

    const mixLinearColor = (from, to, v) => {
        const fromExpo = from * from;
        const toExpo = to * to;
        return Math.sqrt(Math.max(0, v * (toExpo - fromExpo) + fromExpo));
    };
    const colorTypes = [hex, rgba, hsla];
    const getColorType = (v) => colorTypes.find((type) => type.test(v));
    const notAnimatable = (color) => `'${color}' is not an animatable color. Use the equivalent color code instead.`;
    const mixColor = (from, to) => {
        let fromColorType = getColorType(from);
        let toColorType = getColorType(to);
        invariant(!!fromColorType, notAnimatable(from));
        invariant(!!toColorType, notAnimatable(to));
        let fromColor = fromColorType.parse(from);
        let toColor = toColorType.parse(to);
        if (fromColorType === hsla) {
            fromColor = hslaToRgba(fromColor);
            fromColorType = rgba;
        }
        if (toColorType === hsla) {
            toColor = hslaToRgba(toColor);
            toColorType = rgba;
        }
        const blended = Object.assign({}, fromColor);
        return (v) => {
            for (const key in blended) {
                if (key !== "alpha") {
                    blended[key] = mixLinearColor(fromColor[key], toColor[key], v);
                }
            }
            blended.alpha = mix(fromColor.alpha, toColor.alpha, v);
            return fromColorType.transform(blended);
        };
    };

    const isNum = (v) => typeof v === 'number';

    const combineFunctions = (a, b) => (v) => b(a(v));
    const pipe = (...transformers) => transformers.reduce(combineFunctions);

    function getMixer(origin, target) {
        if (isNum(origin)) {
            return (v) => mix(origin, target, v);
        }
        else if (color.test(origin)) {
            return mixColor(origin, target);
        }
        else {
            return mixComplex(origin, target);
        }
    }
    const mixArray = (from, to) => {
        const output = [...from];
        const numValues = output.length;
        const blendValue = from.map((fromThis, i) => getMixer(fromThis, to[i]));
        return (v) => {
            for (let i = 0; i < numValues; i++) {
                output[i] = blendValue[i](v);
            }
            return output;
        };
    };
    const mixObject = (origin, target) => {
        const output = Object.assign(Object.assign({}, origin), target);
        const blendValue = {};
        for (const key in output) {
            if (origin[key] !== undefined && target[key] !== undefined) {
                blendValue[key] = getMixer(origin[key], target[key]);
            }
        }
        return (v) => {
            for (const key in blendValue) {
                output[key] = blendValue[key](v);
            }
            return output;
        };
    };
    function analyse(value) {
        const parsed = complex.parse(value);
        const numValues = parsed.length;
        let numNumbers = 0;
        let numRGB = 0;
        let numHSL = 0;
        for (let i = 0; i < numValues; i++) {
            if (numNumbers || typeof parsed[i] === "number") {
                numNumbers++;
            }
            else {
                if (parsed[i].hue !== undefined) {
                    numHSL++;
                }
                else {
                    numRGB++;
                }
            }
        }
        return { parsed, numNumbers, numRGB, numHSL };
    }
    const mixComplex = (origin, target) => {
        const template = complex.createTransformer(target);
        const originStats = analyse(origin);
        const targetStats = analyse(target);
        const canInterpolate = originStats.numHSL === targetStats.numHSL &&
            originStats.numRGB === targetStats.numRGB &&
            originStats.numNumbers >= targetStats.numNumbers;
        if (canInterpolate) {
            return pipe(mixArray(originStats.parsed, targetStats.parsed), template);
        }
        else {
            warning(true, `Complex values '${origin}' and '${target}' too different to mix. Ensure all colors are of the same type, and that each contains the same quantity of number and color values. Falling back to instant transition.`);
            return (p) => `${p > 0 ? target : origin}`;
        }
    };

    const mixNumber = (from, to) => (p) => mix(from, to, p);
    function detectMixerFactory(v) {
        if (typeof v === 'number') {
            return mixNumber;
        }
        else if (typeof v === 'string') {
            if (color.test(v)) {
                return mixColor;
            }
            else {
                return mixComplex;
            }
        }
        else if (Array.isArray(v)) {
            return mixArray;
        }
        else if (typeof v === 'object') {
            return mixObject;
        }
    }
    function createMixers(output, ease, customMixer) {
        const mixers = [];
        const mixerFactory = customMixer || detectMixerFactory(output[0]);
        const numMixers = output.length - 1;
        for (let i = 0; i < numMixers; i++) {
            let mixer = mixerFactory(output[i], output[i + 1]);
            if (ease) {
                const easingFunction = Array.isArray(ease) ? ease[i] : ease;
                mixer = pipe(easingFunction, mixer);
            }
            mixers.push(mixer);
        }
        return mixers;
    }
    function fastInterpolate([from, to], [mixer]) {
        return (v) => mixer(progress(from, to, v));
    }
    function slowInterpolate(input, mixers) {
        const inputLength = input.length;
        const lastInputIndex = inputLength - 1;
        return (v) => {
            let mixerIndex = 0;
            let foundMixerIndex = false;
            if (v <= input[0]) {
                foundMixerIndex = true;
            }
            else if (v >= input[lastInputIndex]) {
                mixerIndex = lastInputIndex - 1;
                foundMixerIndex = true;
            }
            if (!foundMixerIndex) {
                let i = 1;
                for (; i < inputLength; i++) {
                    if (input[i] > v || i === lastInputIndex) {
                        break;
                    }
                }
                mixerIndex = i - 1;
            }
            const progressInRange = progress(input[mixerIndex], input[mixerIndex + 1], v);
            return mixers[mixerIndex](progressInRange);
        };
    }
    function interpolate(input, output, { clamp: isClamp = true, ease, mixer } = {}) {
        const inputLength = input.length;
        invariant(inputLength === output.length, 'Both input and output ranges must be the same length');
        invariant(!ease || !Array.isArray(ease) || ease.length === inputLength - 1, 'Array of easing functions must be of length `input.length - 1`, as it applies to the transitions **between** the defined values.');
        if (input[0] > input[inputLength - 1]) {
            input = [].concat(input);
            output = [].concat(output);
            input.reverse();
            output.reverse();
        }
        const mixers = createMixers(output, ease, mixer);
        const interpolator = inputLength === 2
            ? fastInterpolate(input, mixers)
            : slowInterpolate(input, mixers);
        return isClamp
            ? (v) => interpolator(clamp$1(input[0], input[inputLength - 1], v))
            : interpolator;
    }

    const reverseEasing = easing => p => 1 - easing(1 - p);
    const mirrorEasing = easing => p => p <= 0.5 ? easing(2 * p) / 2 : (2 - easing(2 * (1 - p))) / 2;
    const createExpoIn = (power) => p => Math.pow(p, power);
    const createBackIn = (power) => p => p * p * ((power + 1) * p - power);
    const createAnticipate = (power) => {
        const backEasing = createBackIn(power);
        return p => (p *= 2) < 1
            ? 0.5 * backEasing(p)
            : 0.5 * (2 - Math.pow(2, -10 * (p - 1)));
    };

    const DEFAULT_OVERSHOOT_STRENGTH = 1.525;
    const BOUNCE_FIRST_THRESHOLD = 4.0 / 11.0;
    const BOUNCE_SECOND_THRESHOLD = 8.0 / 11.0;
    const BOUNCE_THIRD_THRESHOLD = 9.0 / 10.0;
    const linear = p => p;
    const easeIn = createExpoIn(2);
    const easeOut = reverseEasing(easeIn);
    const easeInOut = mirrorEasing(easeIn);
    const circIn = p => 1 - Math.sin(Math.acos(p));
    const circOut = reverseEasing(circIn);
    const circInOut = mirrorEasing(circOut);
    const backIn = createBackIn(DEFAULT_OVERSHOOT_STRENGTH);
    const backOut = reverseEasing(backIn);
    const backInOut = mirrorEasing(backIn);
    const anticipate = createAnticipate(DEFAULT_OVERSHOOT_STRENGTH);
    const ca = 4356.0 / 361.0;
    const cb = 35442.0 / 1805.0;
    const cc = 16061.0 / 1805.0;
    const bounceOut = (p) => {
        if (p === 1 || p === 0)
            return p;
        const p2 = p * p;
        return p < BOUNCE_FIRST_THRESHOLD
            ? 7.5625 * p2
            : p < BOUNCE_SECOND_THRESHOLD
                ? 9.075 * p2 - 9.9 * p + 3.4
                : p < BOUNCE_THIRD_THRESHOLD
                    ? ca * p2 - cb * p + cc
                    : 10.8 * p * p - 20.52 * p + 10.72;
    };
    const bounceIn = reverseEasing(bounceOut);
    const bounceInOut = (p) => p < 0.5
        ? 0.5 * (1.0 - bounceOut(1.0 - p * 2.0))
        : 0.5 * bounceOut(p * 2.0 - 1.0) + 0.5;

    function defaultEasing(values, easing) {
        return values.map(() => easing || easeInOut).splice(0, values.length - 1);
    }
    function defaultOffset(values) {
        const numValues = values.length;
        return values.map((_value, i) => i !== 0 ? i / (numValues - 1) : 0);
    }
    function convertOffsetToTimes(offset, duration) {
        return offset.map((o) => o * duration);
    }
    function keyframes$1({ from = 0, to = 1, ease, offset, duration = 300, }) {
        const state = { done: false, value: from };
        const values = Array.isArray(to) ? to : [from, to];
        const times = convertOffsetToTimes(offset && offset.length === values.length
            ? offset
            : defaultOffset(values), duration);
        function createInterpolator() {
            return interpolate(times, values, {
                ease: Array.isArray(ease) ? ease : defaultEasing(values, ease),
            });
        }
        let interpolator = createInterpolator();
        return {
            next: (t) => {
                state.value = interpolator(t);
                state.done = t >= duration;
                return state;
            },
            flipTarget: () => {
                values.reverse();
                interpolator = createInterpolator();
            },
        };
    }

    function decay({ velocity = 0, from = 0, power = 0.8, timeConstant = 350, restDelta = 0.5, modifyTarget, }) {
        const state = { done: false, value: from };
        let amplitude = power * velocity;
        const ideal = from + amplitude;
        const target = modifyTarget === undefined ? ideal : modifyTarget(ideal);
        if (target !== ideal)
            amplitude = target - from;
        return {
            next: (t) => {
                const delta = -amplitude * Math.exp(-t / timeConstant);
                state.done = !(delta > restDelta || delta < -restDelta);
                state.value = state.done ? target : target + delta;
                return state;
            },
            flipTarget: () => { },
        };
    }

    const types = { keyframes: keyframes$1, spring, decay };
    function detectAnimationFromOptions(config) {
        if (Array.isArray(config.to)) {
            return keyframes$1;
        }
        else if (types[config.type]) {
            return types[config.type];
        }
        const keys = new Set(Object.keys(config));
        if (keys.has("ease") ||
            (keys.has("duration") && !keys.has("dampingRatio"))) {
            return keyframes$1;
        }
        else if (keys.has("dampingRatio") ||
            keys.has("stiffness") ||
            keys.has("mass") ||
            keys.has("damping") ||
            keys.has("restSpeed") ||
            keys.has("restDelta")) {
            return spring;
        }
        return keyframes$1;
    }

    function loopElapsed(elapsed, duration, delay = 0) {
        return elapsed - duration - delay;
    }
    function reverseElapsed(elapsed, duration, delay = 0, isForwardPlayback = true) {
        return isForwardPlayback
            ? loopElapsed(duration + -elapsed, duration, delay)
            : duration - (elapsed - duration) + delay;
    }
    function hasRepeatDelayElapsed(elapsed, duration, delay, isForwardPlayback) {
        return isForwardPlayback ? elapsed >= duration + delay : elapsed <= -delay;
    }

    const framesync = (update) => {
        const passTimestamp = ({ delta }) => update(delta);
        return {
            start: () => sync.update(passTimestamp, true),
            stop: () => cancelSync.update(passTimestamp),
        };
    };
    function animate$1(_a) {
        var _b, _c;
        var { from, autoplay = true, driver = framesync, elapsed = 0, repeat: repeatMax = 0, repeatType = "loop", repeatDelay = 0, onPlay, onStop, onComplete, onRepeat, onUpdate } = _a, options = __rest(_a, ["from", "autoplay", "driver", "elapsed", "repeat", "repeatType", "repeatDelay", "onPlay", "onStop", "onComplete", "onRepeat", "onUpdate"]);
        let { to } = options;
        let driverControls;
        let repeatCount = 0;
        let computedDuration = options.duration;
        let latest;
        let isComplete = false;
        let isForwardPlayback = true;
        let interpolateFromNumber;
        const animator = detectAnimationFromOptions(options);
        if ((_c = (_b = animator).needsInterpolation) === null || _c === void 0 ? void 0 : _c.call(_b, from, to)) {
            interpolateFromNumber = interpolate([0, 100], [from, to], {
                clamp: false,
            });
            from = 0;
            to = 100;
        }
        const animation = animator(Object.assign(Object.assign({}, options), { from, to }));
        function repeat() {
            repeatCount++;
            if (repeatType === "reverse") {
                isForwardPlayback = repeatCount % 2 === 0;
                elapsed = reverseElapsed(elapsed, computedDuration, repeatDelay, isForwardPlayback);
            }
            else {
                elapsed = loopElapsed(elapsed, computedDuration, repeatDelay);
                if (repeatType === "mirror")
                    animation.flipTarget();
            }
            isComplete = false;
            onRepeat && onRepeat();
        }
        function complete() {
            driverControls.stop();
            onComplete && onComplete();
        }
        function update(delta) {
            if (!isForwardPlayback)
                delta = -delta;
            elapsed += delta;
            if (!isComplete) {
                const state = animation.next(Math.max(0, elapsed));
                latest = state.value;
                if (interpolateFromNumber)
                    latest = interpolateFromNumber(latest);
                isComplete = isForwardPlayback ? state.done : elapsed <= 0;
            }
            onUpdate === null || onUpdate === void 0 ? void 0 : onUpdate(latest);
            if (isComplete) {
                if (repeatCount === 0)
                    computedDuration !== null && computedDuration !== void 0 ? computedDuration : (computedDuration = elapsed);
                if (repeatCount < repeatMax) {
                    hasRepeatDelayElapsed(elapsed, computedDuration, repeatDelay, isForwardPlayback) && repeat();
                }
                else {
                    complete();
                }
            }
        }
        function play() {
            onPlay === null || onPlay === void 0 ? void 0 : onPlay();
            driverControls = driver(update);
            driverControls.start();
        }
        autoplay && play();
        return {
            stop: () => {
                onStop === null || onStop === void 0 ? void 0 : onStop();
                driverControls.stop();
            },
        };
    }

    function velocityPerSecond(velocity, frameDuration) {
        return frameDuration ? velocity * (1000 / frameDuration) : 0;
    }

    function inertia({ from = 0, velocity = 0, min, max, power = 0.8, timeConstant = 750, bounceStiffness = 500, bounceDamping = 10, restDelta = 1, modifyTarget, driver, onUpdate, onComplete, onStop, }) {
        let currentAnimation;
        function isOutOfBounds(v) {
            return (min !== undefined && v < min) || (max !== undefined && v > max);
        }
        function boundaryNearest(v) {
            if (min === undefined)
                return max;
            if (max === undefined)
                return min;
            return Math.abs(min - v) < Math.abs(max - v) ? min : max;
        }
        function startAnimation(options) {
            currentAnimation === null || currentAnimation === void 0 ? void 0 : currentAnimation.stop();
            currentAnimation = animate$1(Object.assign(Object.assign({}, options), { driver, onUpdate: (v) => {
                    var _a;
                    onUpdate === null || onUpdate === void 0 ? void 0 : onUpdate(v);
                    (_a = options.onUpdate) === null || _a === void 0 ? void 0 : _a.call(options, v);
                }, onComplete,
                onStop }));
        }
        function startSpring(options) {
            startAnimation(Object.assign({ type: "spring", stiffness: bounceStiffness, damping: bounceDamping, restDelta }, options));
        }
        if (isOutOfBounds(from)) {
            startSpring({ from, velocity, to: boundaryNearest(from) });
        }
        else {
            let target = power * velocity + from;
            if (typeof modifyTarget !== "undefined")
                target = modifyTarget(target);
            const boundary = boundaryNearest(target);
            const heading = boundary === min ? -1 : 1;
            let prev;
            let current;
            const checkBoundary = (v) => {
                prev = current;
                current = v;
                velocity = velocityPerSecond(v - prev, getFrameData().delta);
                if ((heading === 1 && v > boundary) ||
                    (heading === -1 && v < boundary)) {
                    startSpring({ from: v, to: boundary, velocity });
                }
            };
            startAnimation({
                type: "decay",
                from,
                velocity,
                timeConstant,
                power,
                restDelta,
                modifyTarget,
                onUpdate: isOutOfBounds(target) ? checkBoundary : undefined,
            });
        }
        return {
            stop: () => currentAnimation === null || currentAnimation === void 0 ? void 0 : currentAnimation.stop(),
        };
    }

    const isPoint = (point) => point.hasOwnProperty('x') && point.hasOwnProperty('y');

    const isPoint3D = (point) => isPoint(point) && point.hasOwnProperty('z');

    const distance1D = (a, b) => Math.abs(a - b);
    function distance(a, b) {
        if (isNum(a) && isNum(b)) {
            return distance1D(a, b);
        }
        else if (isPoint(a) && isPoint(b)) {
            const xDelta = distance1D(a.x, b.x);
            const yDelta = distance1D(a.y, b.y);
            const zDelta = isPoint3D(a) && isPoint3D(b) ? distance1D(a.z, b.z) : 0;
            return Math.sqrt(Math.pow(xDelta, 2) + Math.pow(yDelta, 2) + Math.pow(zDelta, 2));
        }
    }

    const a = (a1, a2) => 1.0 - 3.0 * a2 + 3.0 * a1;
    const b = (a1, a2) => 3.0 * a2 - 6.0 * a1;
    const c = (a1) => 3.0 * a1;
    const calcBezier = (t, a1, a2) => ((a(a1, a2) * t + b(a1, a2)) * t + c(a1)) * t;
    const getSlope = (t, a1, a2) => 3.0 * a(a1, a2) * t * t + 2.0 * b(a1, a2) * t + c(a1);
    const subdivisionPrecision = 0.0000001;
    const subdivisionMaxIterations = 10;
    function binarySubdivide(aX, aA, aB, mX1, mX2) {
        let currentX;
        let currentT;
        let i = 0;
        do {
            currentT = aA + (aB - aA) / 2.0;
            currentX = calcBezier(currentT, mX1, mX2) - aX;
            if (currentX > 0.0) {
                aB = currentT;
            }
            else {
                aA = currentT;
            }
        } while (Math.abs(currentX) > subdivisionPrecision &&
            ++i < subdivisionMaxIterations);
        return currentT;
    }
    const newtonIterations = 8;
    const newtonMinSlope = 0.001;
    function newtonRaphsonIterate(aX, aGuessT, mX1, mX2) {
        for (let i = 0; i < newtonIterations; ++i) {
            const currentSlope = getSlope(aGuessT, mX1, mX2);
            if (currentSlope === 0.0) {
                return aGuessT;
            }
            const currentX = calcBezier(aGuessT, mX1, mX2) - aX;
            aGuessT -= currentX / currentSlope;
        }
        return aGuessT;
    }
    const kSplineTableSize = 11;
    const kSampleStepSize = 1.0 / (kSplineTableSize - 1.0);
    function cubicBezier(mX1, mY1, mX2, mY2) {
        if (mX1 === mY1 && mX2 === mY2)
            return linear;
        const sampleValues = new Float32Array(kSplineTableSize);
        for (let i = 0; i < kSplineTableSize; ++i) {
            sampleValues[i] = calcBezier(i * kSampleStepSize, mX1, mX2);
        }
        function getTForX(aX) {
            let intervalStart = 0.0;
            let currentSample = 1;
            const lastSample = kSplineTableSize - 1;
            for (; currentSample !== lastSample && sampleValues[currentSample] <= aX; ++currentSample) {
                intervalStart += kSampleStepSize;
            }
            --currentSample;
            const dist = (aX - sampleValues[currentSample]) /
                (sampleValues[currentSample + 1] - sampleValues[currentSample]);
            const guessForT = intervalStart + dist * kSampleStepSize;
            const initialSlope = getSlope(guessForT, mX1, mX2);
            if (initialSlope >= newtonMinSlope) {
                return newtonRaphsonIterate(aX, guessForT, mX1, mX2);
            }
            else if (initialSlope === 0.0) {
                return guessForT;
            }
            else {
                return binarySubdivide(aX, intervalStart, intervalStart + kSampleStepSize, mX1, mX2);
            }
        }
        return (t) => t === 0 || t === 1 ? t : calcBezier(getTForX(t), mY1, mY2);
    }

    function addUniqueItem(arr, item) {
        arr.indexOf(item) === -1 && arr.push(item);
    }
    function removeItem(arr, item) {
        var index = arr.indexOf(item);
        index > -1 && arr.splice(index, 1);
    }

    var SubscriptionManager = /** @class */ (function () {
        function SubscriptionManager() {
            this.subscriptions = [];
        }
        SubscriptionManager.prototype.add = function (handler) {
            var _this = this;
            addUniqueItem(this.subscriptions, handler);
            return function () { return removeItem(_this.subscriptions, handler); };
        };
        SubscriptionManager.prototype.notify = function (a, b, c) {
            var numSubscriptions = this.subscriptions.length;
            if (!numSubscriptions)
                return;
            if (numSubscriptions === 1) {
                /**
                 * If there's only a single handler we can just call it without invoking a loop.
                 */
                this.subscriptions[0](a, b, c);
            }
            else {
                for (var i = 0; i < numSubscriptions; i++) {
                    /**
                     * Check whether the handler exists before firing as it's possible
                     * the subscriptions were modified during this loop running.
                     */
                    var handler = this.subscriptions[i];
                    handler && handler(a, b, c);
                }
            }
        };
        SubscriptionManager.prototype.getSize = function () {
            return this.subscriptions.length;
        };
        SubscriptionManager.prototype.clear = function () {
            this.subscriptions.length = 0;
        };
        return SubscriptionManager;
    }());

    var isFloat = function (value) {
        return !isNaN(parseFloat(value));
    };
    /**
     * `MotionValue` is used to track the state and velocity of motion values.
     *
     * @public
     */
    var MotionValue = /** @class */ (function () {
        /**
         * @param init - The initiating value
         * @param config - Optional configuration options
         *
         * -  `transformer`: A function to transform incoming values with.
         *
         * @internal
         */
        function MotionValue(init) {
            var _this = this;
            /**
             * Duration, in milliseconds, since last updating frame.
             *
             * @internal
             */
            this.timeDelta = 0;
            /**
             * Timestamp of the last time this `MotionValue` was updated.
             *
             * @internal
             */
            this.lastUpdated = 0;
            /**
             * Functions to notify when the `MotionValue` updates.
             *
             * @internal
             */
            this.updateSubscribers = new SubscriptionManager();
            /**
             * Functions to notify when the velocity updates.
             *
             * @internal
             */
            this.velocityUpdateSubscribers = new SubscriptionManager();
            /**
             * Functions to notify when the `MotionValue` updates and `render` is set to `true`.
             *
             * @internal
             */
            this.renderSubscribers = new SubscriptionManager();
            /**
             * Tracks whether this value can output a velocity. Currently this is only true
             * if the value is numerical, but we might be able to widen the scope here and support
             * other value types.
             *
             * @internal
             */
            this.canTrackVelocity = false;
            this.updateAndNotify = function (v, render) {
                if (render === void 0) { render = true; }
                _this.prev = _this.current;
                _this.current = v;
                // Update timestamp
                var _a = getFrameData(), delta = _a.delta, timestamp = _a.timestamp;
                if (_this.lastUpdated !== timestamp) {
                    _this.timeDelta = delta;
                    _this.lastUpdated = timestamp;
                    sync.postRender(_this.scheduleVelocityCheck);
                }
                // Update update subscribers
                if (_this.prev !== _this.current) {
                    _this.updateSubscribers.notify(_this.current);
                }
                // Update velocity subscribers
                if (_this.velocityUpdateSubscribers.getSize()) {
                    _this.velocityUpdateSubscribers.notify(_this.getVelocity());
                }
                // Update render subscribers
                if (render) {
                    _this.renderSubscribers.notify(_this.current);
                }
            };
            /**
             * Schedule a velocity check for the next frame.
             *
             * This is an instanced and bound function to prevent generating a new
             * function once per frame.
             *
             * @internal
             */
            this.scheduleVelocityCheck = function () { return sync.postRender(_this.velocityCheck); };
            /**
             * Updates `prev` with `current` if the value hasn't been updated this frame.
             * This ensures velocity calculations return `0`.
             *
             * This is an instanced and bound function to prevent generating a new
             * function once per frame.
             *
             * @internal
             */
            this.velocityCheck = function (_a) {
                var timestamp = _a.timestamp;
                if (timestamp !== _this.lastUpdated) {
                    _this.prev = _this.current;
                    _this.velocityUpdateSubscribers.notify(_this.getVelocity());
                }
            };
            this.hasAnimated = false;
            this.prev = this.current = init;
            this.canTrackVelocity = isFloat(this.current);
        }
        /**
         * Adds a function that will be notified when the `MotionValue` is updated.
         *
         * It returns a function that, when called, will cancel the subscription.
         *
         * When calling `onChange` inside a React component, it should be wrapped with the
         * `useEffect` hook. As it returns an unsubscribe function, this should be returned
         * from the `useEffect` function to ensure you don't add duplicate subscribers..
         *
         * ```jsx
         * export const MyComponent = () => {
         *   const x = useMotionValue(0)
         *   const y = useMotionValue(0)
         *   const opacity = useMotionValue(1)
         *
         *   useEffect(() => {
         *     function updateOpacity() {
         *       const maxXY = Math.max(x.get(), y.get())
         *       const newOpacity = transform(maxXY, [0, 100], [1, 0])
         *       opacity.set(newOpacity)
         *     }
         *
         *     const unsubscribeX = x.onChange(updateOpacity)
         *     const unsubscribeY = y.onChange(updateOpacity)
         *
         *     return () => {
         *       unsubscribeX()
         *       unsubscribeY()
         *     }
         *   }, [])
         *
         *   return <motion.div style={{ x }} />
         * }
         * ```
         *
         * @internalremarks
         *
         * We could look into a `useOnChange` hook if the above lifecycle management proves confusing.
         *
         * ```jsx
         * useOnChange(x, () => {})
         * ```
         *
         * @param subscriber - A function that receives the latest value.
         * @returns A function that, when called, will cancel this subscription.
         *
         * @public
         */
        MotionValue.prototype.onChange = function (subscription) {
            return this.updateSubscribers.add(subscription);
        };
        MotionValue.prototype.clearListeners = function () {
            this.updateSubscribers.clear();
        };
        /**
         * Adds a function that will be notified when the `MotionValue` requests a render.
         *
         * @param subscriber - A function that's provided the latest value.
         * @returns A function that, when called, will cancel this subscription.
         *
         * @internal
         */
        MotionValue.prototype.onRenderRequest = function (subscription) {
            // Render immediately
            subscription(this.get());
            return this.renderSubscribers.add(subscription);
        };
        /**
         * Attaches a passive effect to the `MotionValue`.
         *
         * @internal
         */
        MotionValue.prototype.attach = function (passiveEffect) {
            this.passiveEffect = passiveEffect;
        };
        /**
         * Sets the state of the `MotionValue`.
         *
         * @remarks
         *
         * ```jsx
         * const x = useMotionValue(0)
         * x.set(10)
         * ```
         *
         * @param latest - Latest value to set.
         * @param render - Whether to notify render subscribers. Defaults to `true`
         *
         * @public
         */
        MotionValue.prototype.set = function (v, render) {
            if (render === void 0) { render = true; }
            if (!render || !this.passiveEffect) {
                this.updateAndNotify(v, render);
            }
            else {
                this.passiveEffect(v, this.updateAndNotify);
            }
        };
        /**
         * Returns the latest state of `MotionValue`
         *
         * @returns - The latest state of `MotionValue`
         *
         * @public
         */
        MotionValue.prototype.get = function () {
            return this.current;
        };
        /**
         * @public
         */
        MotionValue.prototype.getPrevious = function () {
            return this.prev;
        };
        /**
         * Returns the latest velocity of `MotionValue`
         *
         * @returns - The latest velocity of `MotionValue`. Returns `0` if the state is non-numerical.
         *
         * @public
         */
        MotionValue.prototype.getVelocity = function () {
            // This could be isFloat(this.prev) && isFloat(this.current), but that would be wasteful
            return this.canTrackVelocity
                ? // These casts could be avoided if parseFloat would be typed better
                    velocityPerSecond(parseFloat(this.current) -
                        parseFloat(this.prev), this.timeDelta)
                : 0;
        };
        /**
         * Registers a new animation to control this `MotionValue`. Only one
         * animation can drive a `MotionValue` at one time.
         *
         * ```jsx
         * value.start()
         * ```
         *
         * @param animation - A function that starts the provided animation
         *
         * @internal
         */
        MotionValue.prototype.start = function (animation) {
            var _this = this;
            this.stop();
            return new Promise(function (resolve) {
                _this.hasAnimated = true;
                _this.stopAnimation = animation(resolve);
            }).then(function () { return _this.clearAnimation(); });
        };
        /**
         * Stop the currently active animation.
         *
         * @public
         */
        MotionValue.prototype.stop = function () {
            if (this.stopAnimation)
                this.stopAnimation();
            this.clearAnimation();
        };
        /**
         * Returns `true` if this value is currently animating.
         *
         * @public
         */
        MotionValue.prototype.isAnimating = function () {
            return !!this.stopAnimation;
        };
        MotionValue.prototype.clearAnimation = function () {
            this.stopAnimation = null;
        };
        /**
         * Destroy and clean up subscribers to this `MotionValue`.
         *
         * The `MotionValue` hooks like `useMotionValue` and `useTransform` automatically
         * handle the lifecycle of the returned `MotionValue`, so this method is only necessary if you've manually
         * created a `MotionValue` via the `motionValue` function.
         *
         * @public
         */
        MotionValue.prototype.destroy = function () {
            this.updateSubscribers.clear();
            this.renderSubscribers.clear();
            this.stop();
        };
        return MotionValue;
    }());
    /**
     * @internal
     */
    function motionValue(init) {
        return new MotionValue(init);
    }

    var isMotionValue = function (value) {
        return Boolean(value !== null && typeof value === "object" && value.getVelocity);
    };

    /**
     * Converts seconds to milliseconds
     *
     * @param seconds - Time in seconds.
     * @return milliseconds - Converted time in milliseconds.
     */
    var secondsToMilliseconds = function (seconds) { return seconds * 1000; };

    var easingLookup = {
        linear: linear,
        easeIn: easeIn,
        easeInOut: easeInOut,
        easeOut: easeOut,
        circIn: circIn,
        circInOut: circInOut,
        circOut: circOut,
        backIn: backIn,
        backInOut: backInOut,
        backOut: backOut,
        anticipate: anticipate,
        bounceIn: bounceIn,
        bounceInOut: bounceInOut,
        bounceOut: bounceOut,
    };
    var easingDefinitionToFunction = function (definition) {
        if (Array.isArray(definition)) {
            // If cubic bezier definition, create bezier curve
            invariant(definition.length === 4, "Cubic bezier arrays must contain four numerical values.");
            var _a = __read(definition, 4), x1 = _a[0], y1 = _a[1], x2 = _a[2], y2 = _a[3];
            return cubicBezier(x1, y1, x2, y2);
        }
        else if (typeof definition === "string") {
            // Else lookup from table
            invariant(easingLookup[definition] !== undefined, "Invalid easing type '".concat(definition, "'"));
            return easingLookup[definition];
        }
        return definition;
    };
    var isEasingArray = function (ease) {
        return Array.isArray(ease) && typeof ease[0] !== "number";
    };

    /**
     * Check if a value is animatable. Examples:
     *
     * ✅: 100, "100px", "#fff"
     * ❌: "block", "url(2.jpg)"
     * @param value
     *
     * @internal
     */
    var isAnimatable = function (key, value) {
        // If the list of keys tat might be non-animatable grows, replace with Set
        if (key === "zIndex")
            return false;
        // If it's a number or a keyframes array, we can animate it. We might at some point
        // need to do a deep isAnimatable check of keyframes, or let Popmotion handle this,
        // but for now lets leave it like this for performance reasons
        if (typeof value === "number" || Array.isArray(value))
            return true;
        if (typeof value === "string" && // It's animatable if we have a string
            complex.test(value) && // And it contains numbers and/or colors
            !value.startsWith("url(") // Unless it starts with "url("
        ) {
            return true;
        }
        return false;
    };

    var isKeyframesTarget = function (v) {
        return Array.isArray(v);
    };

    var underDampedSpring = function () { return ({
        type: "spring",
        stiffness: 500,
        damping: 25,
        restSpeed: 10,
    }); };
    var criticallyDampedSpring = function (to) { return ({
        type: "spring",
        stiffness: 550,
        damping: to === 0 ? 2 * Math.sqrt(550) : 30,
        restSpeed: 10,
    }); };
    var linearTween = function () { return ({
        type: "keyframes",
        ease: "linear",
        duration: 0.3,
    }); };
    var keyframes = function (values) { return ({
        type: "keyframes",
        duration: 0.8,
        values: values,
    }); };
    var defaultTransitions = {
        x: underDampedSpring,
        y: underDampedSpring,
        z: underDampedSpring,
        rotate: underDampedSpring,
        rotateX: underDampedSpring,
        rotateY: underDampedSpring,
        rotateZ: underDampedSpring,
        scaleX: criticallyDampedSpring,
        scaleY: criticallyDampedSpring,
        scale: criticallyDampedSpring,
        opacity: linearTween,
        backgroundColor: linearTween,
        color: linearTween,
        default: criticallyDampedSpring,
    };
    var getDefaultTransition = function (valueKey, to) {
        var transitionFactory;
        if (isKeyframesTarget(to)) {
            transitionFactory = keyframes;
        }
        else {
            transitionFactory =
                defaultTransitions[valueKey] || defaultTransitions.default;
        }
        return __assign({ to: to }, transitionFactory(to));
    };

    var int = __assign(__assign({}, number), { transform: Math.round });

    var numberValueTypes = {
        // Border props
        borderWidth: px,
        borderTopWidth: px,
        borderRightWidth: px,
        borderBottomWidth: px,
        borderLeftWidth: px,
        borderRadius: px,
        radius: px,
        borderTopLeftRadius: px,
        borderTopRightRadius: px,
        borderBottomRightRadius: px,
        borderBottomLeftRadius: px,
        // Positioning props
        width: px,
        maxWidth: px,
        height: px,
        maxHeight: px,
        size: px,
        top: px,
        right: px,
        bottom: px,
        left: px,
        // Spacing props
        padding: px,
        paddingTop: px,
        paddingRight: px,
        paddingBottom: px,
        paddingLeft: px,
        margin: px,
        marginTop: px,
        marginRight: px,
        marginBottom: px,
        marginLeft: px,
        // Transform props
        rotate: degrees,
        rotateX: degrees,
        rotateY: degrees,
        rotateZ: degrees,
        scale: scale,
        scaleX: scale,
        scaleY: scale,
        scaleZ: scale,
        skew: degrees,
        skewX: degrees,
        skewY: degrees,
        distance: px,
        translateX: px,
        translateY: px,
        translateZ: px,
        x: px,
        y: px,
        z: px,
        perspective: px,
        transformPerspective: px,
        opacity: alpha,
        originX: progressPercentage,
        originY: progressPercentage,
        originZ: px,
        // Misc
        zIndex: int,
        // SVG
        fillOpacity: alpha,
        strokeOpacity: alpha,
        numOctaves: int,
    };

    /**
     * A map of default value types for common values
     */
    var defaultValueTypes = __assign(__assign({}, numberValueTypes), { 
        // Color props
        color: color, backgroundColor: color, outlineColor: color, fill: color, stroke: color, 
        // Border props
        borderColor: color, borderTopColor: color, borderRightColor: color, borderBottomColor: color, borderLeftColor: color, filter: filter, WebkitFilter: filter });
    /**
     * Gets the default ValueType for the provided value key
     */
    var getDefaultValueType = function (key) { return defaultValueTypes[key]; };

    function getAnimatableNone(key, value) {
        var _a;
        var defaultValueType = getDefaultValueType(key);
        if (defaultValueType !== filter)
            defaultValueType = complex;
        // If value is not recognised as animatable, ie "none", create an animatable version origin based on the target
        return (_a = defaultValueType.getAnimatableNone) === null || _a === void 0 ? void 0 : _a.call(defaultValueType, value);
    }

    var instantAnimationState = {
        current: false,
    };

    var isCustomValue = function (v) {
        return Boolean(v && typeof v === "object" && v.mix && v.toValue);
    };
    var resolveFinalValueInKeyframes = function (v) {
        // TODO maybe throw if v.length - 1 is placeholder token?
        return isKeyframesTarget(v) ? v[v.length - 1] || 0 : v;
    };

    /**
     * Decide whether a transition is defined on a given Transition.
     * This filters out orchestration options and returns true
     * if any options are left.
     */
    function isTransitionDefined(_a) {
        _a.when; _a.delay; _a.delayChildren; _a.staggerChildren; _a.staggerDirection; _a.repeat; _a.repeatType; _a.repeatDelay; _a.from; var transition = __rest(_a, ["when", "delay", "delayChildren", "staggerChildren", "staggerDirection", "repeat", "repeatType", "repeatDelay", "from"]);
        return !!Object.keys(transition).length;
    }
    var legacyRepeatWarning = false;
    /**
     * Convert Framer Motion's Transition type into Popmotion-compatible options.
     */
    function convertTransitionToAnimationOptions(_a) {
        var ease = _a.ease, times = _a.times, yoyo = _a.yoyo, flip = _a.flip, loop = _a.loop, transition = __rest(_a, ["ease", "times", "yoyo", "flip", "loop"]);
        var options = __assign({}, transition);
        if (times)
            options["offset"] = times;
        /**
         * Convert any existing durations from seconds to milliseconds
         */
        if (transition.duration)
            options["duration"] = secondsToMilliseconds(transition.duration);
        if (transition.repeatDelay)
            options.repeatDelay = secondsToMilliseconds(transition.repeatDelay);
        /**
         * Map easing names to Popmotion's easing functions
         */
        if (ease) {
            options["ease"] = isEasingArray(ease)
                ? ease.map(easingDefinitionToFunction)
                : easingDefinitionToFunction(ease);
        }
        /**
         * Support legacy transition API
         */
        if (transition.type === "tween")
            options.type = "keyframes";
        /**
         * TODO: These options are officially removed from the API.
         */
        if (yoyo || loop || flip) {
            warning(!legacyRepeatWarning, "yoyo, loop and flip have been removed from the API. Replace with repeat and repeatType options.");
            legacyRepeatWarning = true;
            if (yoyo) {
                options.repeatType = "reverse";
            }
            else if (loop) {
                options.repeatType = "loop";
            }
            else if (flip) {
                options.repeatType = "mirror";
            }
            options.repeat = loop || yoyo || flip || transition.repeat;
        }
        /**
         * TODO: Popmotion 9 has the ability to automatically detect whether to use
         * a keyframes or spring animation, but does so by detecting velocity and other spring options.
         * It'd be good to introduce a similar thing here.
         */
        if (transition.type !== "spring")
            options.type = "keyframes";
        return options;
    }
    /**
     * Get the delay for a value by checking Transition with decreasing specificity.
     */
    function getDelayFromTransition(transition, key) {
        var _a, _b;
        var valueTransition = getValueTransition(transition, key) || {};
        return (_b = (_a = valueTransition.delay) !== null && _a !== void 0 ? _a : transition.delay) !== null && _b !== void 0 ? _b : 0;
    }
    function hydrateKeyframes(options) {
        if (Array.isArray(options.to) && options.to[0] === null) {
            options.to = __spreadArray([], __read(options.to), false);
            options.to[0] = options.from;
        }
        return options;
    }
    function getPopmotionAnimationOptions(transition, options, key) {
        var _a;
        if (Array.isArray(options.to)) {
            (_a = transition.duration) !== null && _a !== void 0 ? _a : (transition.duration = 0.8);
        }
        hydrateKeyframes(options);
        /**
         * Get a default transition if none is determined to be defined.
         */
        if (!isTransitionDefined(transition)) {
            transition = __assign(__assign({}, transition), getDefaultTransition(key, options.to));
        }
        return __assign(__assign({}, options), convertTransitionToAnimationOptions(transition));
    }
    /**
     *
     */
    function getAnimation(key, value, target, transition, onComplete) {
        var _a;
        var valueTransition = getValueTransition(transition, key);
        var origin = (_a = valueTransition.from) !== null && _a !== void 0 ? _a : value.get();
        var isTargetAnimatable = isAnimatable(key, target);
        if (origin === "none" && isTargetAnimatable && typeof target === "string") {
            /**
             * If we're trying to animate from "none", try and get an animatable version
             * of the target. This could be improved to work both ways.
             */
            origin = getAnimatableNone(key, target);
        }
        else if (isZero(origin) && typeof target === "string") {
            origin = getZeroUnit(target);
        }
        else if (!Array.isArray(target) &&
            isZero(target) &&
            typeof origin === "string") {
            target = getZeroUnit(origin);
        }
        var isOriginAnimatable = isAnimatable(key, origin);
        warning(isOriginAnimatable === isTargetAnimatable, "You are trying to animate ".concat(key, " from \"").concat(origin, "\" to \"").concat(target, "\". ").concat(origin, " is not an animatable value - to enable this animation set ").concat(origin, " to a value animatable to ").concat(target, " via the `style` property."));
        function start() {
            var options = {
                from: origin,
                to: target,
                velocity: value.getVelocity(),
                onComplete: onComplete,
                onUpdate: function (v) { return value.set(v); },
            };
            return valueTransition.type === "inertia" ||
                valueTransition.type === "decay"
                ? inertia(__assign(__assign({}, options), valueTransition))
                : animate$1(__assign(__assign({}, getPopmotionAnimationOptions(valueTransition, options, key)), { onUpdate: function (v) {
                        var _a;
                        options.onUpdate(v);
                        (_a = valueTransition.onUpdate) === null || _a === void 0 ? void 0 : _a.call(valueTransition, v);
                    }, onComplete: function () {
                        var _a;
                        options.onComplete();
                        (_a = valueTransition.onComplete) === null || _a === void 0 ? void 0 : _a.call(valueTransition);
                    } }));
        }
        function set() {
            var _a, _b;
            var finalTarget = resolveFinalValueInKeyframes(target);
            value.set(finalTarget);
            onComplete();
            (_a = valueTransition === null || valueTransition === void 0 ? void 0 : valueTransition.onUpdate) === null || _a === void 0 ? void 0 : _a.call(valueTransition, finalTarget);
            (_b = valueTransition === null || valueTransition === void 0 ? void 0 : valueTransition.onComplete) === null || _b === void 0 ? void 0 : _b.call(valueTransition);
            return { stop: function () { } };
        }
        return !isOriginAnimatable ||
            !isTargetAnimatable ||
            valueTransition.type === false
            ? set
            : start;
    }
    function isZero(value) {
        return (value === 0 ||
            (typeof value === "string" &&
                parseFloat(value) === 0 &&
                value.indexOf(" ") === -1));
    }
    function getZeroUnit(potentialUnitType) {
        return typeof potentialUnitType === "number"
            ? 0
            : getAnimatableNone("", potentialUnitType);
    }
    function getValueTransition(transition, key) {
        return transition[key] || transition["default"] || transition;
    }
    /**
     * Start animation on a MotionValue. This function is an interface between
     * Framer Motion and Popmotion
     *
     * @internal
     */
    function startAnimation(key, value, target, transition) {
        if (transition === void 0) { transition = {}; }
        if (instantAnimationState.current) {
            transition = { type: false };
        }
        return value.start(function (onComplete) {
            var delayTimer;
            var controls;
            var animation = getAnimation(key, value, target, transition, onComplete);
            var delay = getDelayFromTransition(transition, key);
            var start = function () { return (controls = animation()); };
            if (delay) {
                delayTimer = setTimeout(start, secondsToMilliseconds(delay));
            }
            else {
                start();
            }
            return function () {
                clearTimeout(delayTimer);
                controls === null || controls === void 0 ? void 0 : controls.stop();
            };
        });
    }

    /**
     * Animate a single value or a `MotionValue`.
     *
     * The first argument is either a `MotionValue` to animate, or an initial animation value.
     *
     * The second is either a value to animate to, or an array of keyframes to animate through.
     *
     * The third argument can be either tween or spring options, and optional lifecycle methods: `onUpdate`, `onPlay`, `onComplete`, `onRepeat` and `onStop`.
     *
     * Returns `AnimationPlaybackControls`, currently just a `stop` method.
     *
     * ```javascript
     * const x = useMotionValue(0)
     *
     * useEffect(() => {
     *   const controls = animate(x, 100, {
     *     type: "spring",
     *     stiffness: 2000,
     *     onComplete: v => {}
     *   })
     *
     *   return controls.stop
     * })
     * ```
     *
     * @public
     */
    function animate(from, to, transition) {
        if (transition === void 0) { transition = {}; }
        var value = isMotionValue(from) ? from : motionValue(from);
        startAnimation("", value, to, transition);
        return {
            stop: function () { return value.stop(); },
            isAnimating: function () { return value.isAnimating(); },
        };
    }

    var borders = ["TopLeft", "TopRight", "BottomLeft", "BottomRight"];
    var numBorders = borders.length;
    function mixValues(target, follow, lead, progress, shouldCrossfadeOpacity, isOnlyMember) {
        var _a, _b, _c, _d;
        if (shouldCrossfadeOpacity) {
            target.opacity = mix(0, 
            // (follow?.opacity as number) ?? 0,
            // TODO Reinstate this if only child
            (_a = lead.opacity) !== null && _a !== void 0 ? _a : 1, easeCrossfadeIn(progress));
            target.opacityExit = mix((_b = follow.opacity) !== null && _b !== void 0 ? _b : 1, 0, easeCrossfadeOut(progress));
        }
        else if (isOnlyMember) {
            target.opacity = mix((_c = follow.opacity) !== null && _c !== void 0 ? _c : 1, (_d = lead.opacity) !== null && _d !== void 0 ? _d : 1, progress);
        }
        /**
         * Mix border radius
         */
        for (var i = 0; i < numBorders; i++) {
            var borderLabel = "border".concat(borders[i], "Radius");
            var followRadius = getRadius(follow, borderLabel);
            var leadRadius = getRadius(lead, borderLabel);
            if (followRadius === undefined && leadRadius === undefined)
                continue;
            followRadius || (followRadius = 0);
            leadRadius || (leadRadius = 0);
            /**
             * Currently we're only crossfading between numerical border radius.
             * It would be possible to crossfade between percentages for a little
             * extra bundle size.
             */
            if (typeof followRadius === "number" &&
                typeof leadRadius === "number") {
                var radius = Math.max(mix(followRadius, leadRadius, progress), 0);
                target[borderLabel] = radius;
            }
        }
        /**
         * Mix rotation
         */
        if (follow.rotate || lead.rotate) {
            target.rotate = mix(follow.rotate || 0, lead.rotate || 0, progress);
        }
    }
    function getRadius(values, radiusName) {
        var _a;
        return (_a = values[radiusName]) !== null && _a !== void 0 ? _a : values.borderRadius;
    }
    // /**
    //  * We only want to mix the background color if there's a follow element
    //  * that we're not crossfading opacity between. For instance with switch
    //  * AnimateSharedLayout animations, this helps the illusion of a continuous
    //  * element being animated but also cuts down on the number of paints triggered
    //  * for elements where opacity is doing that work for us.
    //  */
    // if (
    //     !hasFollowElement &&
    //     latestLeadValues.backgroundColor &&
    //     latestFollowValues.backgroundColor
    // ) {
    //     /**
    //      * This isn't ideal performance-wise as mixColor is creating a new function every frame.
    //      * We could probably create a mixer that runs at the start of the animation but
    //      * the idea behind the crossfader is that it runs dynamically between two potentially
    //      * changing targets (ie opacity or borderRadius may be animating independently via variants)
    //      */
    //     leadState.backgroundColor = followState.backgroundColor = mixColor(
    //         latestFollowValues.backgroundColor as string,
    //         latestLeadValues.backgroundColor as string
    //     )(p)
    // }
    var easeCrossfadeIn = compress(0, 0.5, circOut);
    var easeCrossfadeOut = compress(0.5, 0.95, linear);
    function compress(min, max, easing) {
        return function (p) {
            // Could replace ifs with clamp
            if (p < min)
                return 0;
            if (p > max)
                return 1;
            return easing(progress(min, max, p));
        };
    }

    /**
     * Reset an axis to the provided origin box.
     *
     * This is a mutative operation.
     */
    function copyAxisInto(axis, originAxis) {
        axis.min = originAxis.min;
        axis.max = originAxis.max;
    }
    /**
     * Reset a box to the provided origin box.
     *
     * This is a mutative operation.
     */
    function copyBoxInto(box, originBox) {
        copyAxisInto(box.x, originBox.x);
        copyAxisInto(box.y, originBox.y);
    }

    function isIdentityScale(scale) {
        return scale === undefined || scale === 1;
    }
    function hasScale(_a) {
        var scale = _a.scale, scaleX = _a.scaleX, scaleY = _a.scaleY;
        return (!isIdentityScale(scale) ||
            !isIdentityScale(scaleX) ||
            !isIdentityScale(scaleY));
    }
    function hasTransform(values) {
        return (hasScale(values) ||
            hasTranslate(values.x) ||
            hasTranslate(values.y) ||
            values.z ||
            values.rotate ||
            values.rotateX ||
            values.rotateY);
    }
    function hasTranslate(value) {
        return value && value !== "0%";
    }

    /**
     * Scales a point based on a factor and an originPoint
     */
    function scalePoint(point, scale, originPoint) {
        var distanceFromOrigin = point - originPoint;
        var scaled = scale * distanceFromOrigin;
        return originPoint + scaled;
    }
    /**
     * Applies a translate/scale delta to a point
     */
    function applyPointDelta(point, translate, scale, originPoint, boxScale) {
        if (boxScale !== undefined) {
            point = scalePoint(point, boxScale, originPoint);
        }
        return scalePoint(point, scale, originPoint) + translate;
    }
    /**
     * Applies a translate/scale delta to an axis
     */
    function applyAxisDelta(axis, translate, scale, originPoint, boxScale) {
        if (translate === void 0) { translate = 0; }
        if (scale === void 0) { scale = 1; }
        axis.min = applyPointDelta(axis.min, translate, scale, originPoint, boxScale);
        axis.max = applyPointDelta(axis.max, translate, scale, originPoint, boxScale);
    }
    /**
     * Applies a translate/scale delta to a box
     */
    function applyBoxDelta(box, _a) {
        var x = _a.x, y = _a.y;
        applyAxisDelta(box.x, x.translate, x.scale, x.originPoint);
        applyAxisDelta(box.y, y.translate, y.scale, y.originPoint);
    }
    /**
     * Apply a tree of deltas to a box. We do this to calculate the effect of all the transforms
     * in a tree upon our box before then calculating how to project it into our desired viewport-relative box
     *
     * This is the final nested loop within updateLayoutDelta for future refactoring
     */
    function applyTreeDeltas(box, treeScale, treePath, isSharedTransition) {
        var _a, _b;
        if (isSharedTransition === void 0) { isSharedTransition = false; }
        var treeLength = treePath.length;
        if (!treeLength)
            return;
        // Reset the treeScale
        treeScale.x = treeScale.y = 1;
        var node;
        var delta;
        for (var i = 0; i < treeLength; i++) {
            node = treePath[i];
            delta = node.projectionDelta;
            if (((_b = (_a = node.instance) === null || _a === void 0 ? void 0 : _a.style) === null || _b === void 0 ? void 0 : _b.display) === "contents")
                continue;
            if (isSharedTransition &&
                node.options.layoutScroll &&
                node.scroll &&
                node !== node.root) {
                transformBox(box, { x: -node.scroll.x, y: -node.scroll.y });
            }
            if (delta) {
                // Incoporate each ancestor's scale into a culmulative treeScale for this component
                treeScale.x *= delta.x.scale;
                treeScale.y *= delta.y.scale;
                // Apply each ancestor's calculated delta into this component's recorded layout box
                applyBoxDelta(box, delta);
            }
            if (isSharedTransition && hasTransform(node.latestValues)) {
                transformBox(box, node.latestValues);
            }
        }
    }
    function translateAxis(axis, distance) {
        axis.min = axis.min + distance;
        axis.max = axis.max + distance;
    }
    /**
     * Apply a transform to an axis from the latest resolved motion values.
     * This function basically acts as a bridge between a flat motion value map
     * and applyAxisDelta
     */
    function transformAxis(axis, transforms, _a) {
        var _b = __read(_a, 3), key = _b[0], scaleKey = _b[1], originKey = _b[2];
        var axisOrigin = transforms[originKey] !== undefined ? transforms[originKey] : 0.5;
        var originPoint = mix(axis.min, axis.max, axisOrigin);
        // Apply the axis delta to the final axis
        applyAxisDelta(axis, transforms[key], transforms[scaleKey], originPoint, transforms.scale);
    }
    /**
     * The names of the motion values we want to apply as translation, scale and origin.
     */
    var xKeys$1 = ["x", "scaleX", "originX"];
    var yKeys$1 = ["y", "scaleY", "originY"];
    /**
     * Apply a transform to a box from the latest resolved motion values.
     */
    function transformBox(box, transform) {
        transformAxis(box.x, transform, xKeys$1);
        transformAxis(box.y, transform, yKeys$1);
    }

    function calcLength(axis) {
        return axis.max - axis.min;
    }
    function isNear(value, target, maxDistance) {
        if (target === void 0) { target = 0; }
        if (maxDistance === void 0) { maxDistance = 0.01; }
        return distance(value, target) < maxDistance;
    }
    function calcAxisDelta(delta, source, target, origin) {
        if (origin === void 0) { origin = 0.5; }
        delta.origin = origin;
        delta.originPoint = mix(source.min, source.max, delta.origin);
        delta.scale = calcLength(target) / calcLength(source);
        if (isNear(delta.scale, 1, 0.0001) || isNaN(delta.scale))
            delta.scale = 1;
        delta.translate =
            mix(target.min, target.max, delta.origin) - delta.originPoint;
        if (isNear(delta.translate) || isNaN(delta.translate))
            delta.translate = 0;
    }
    function calcBoxDelta(delta, source, target, origin) {
        calcAxisDelta(delta.x, source.x, target.x, origin === null || origin === void 0 ? void 0 : origin.originX);
        calcAxisDelta(delta.y, source.y, target.y, origin === null || origin === void 0 ? void 0 : origin.originY);
    }
    function calcRelativeAxis(target, relative, parent) {
        target.min = parent.min + relative.min;
        target.max = target.min + calcLength(relative);
    }
    function calcRelativeBox(target, relative, parent) {
        calcRelativeAxis(target.x, relative.x, parent.x);
        calcRelativeAxis(target.y, relative.y, parent.y);
    }
    function calcRelativeAxisPosition(target, layout, parent) {
        target.min = layout.min - parent.min;
        target.max = target.min + calcLength(layout);
    }
    function calcRelativePosition(target, layout, parent) {
        calcRelativeAxisPosition(target.x, layout.x, parent.x);
        calcRelativeAxisPosition(target.y, layout.y, parent.y);
    }

    /**
     * Remove a delta from a point. This is essentially the steps of applyPointDelta in reverse
     */
    function removePointDelta(point, translate, scale, originPoint, boxScale) {
        point -= translate;
        point = scalePoint(point, 1 / scale, originPoint);
        if (boxScale !== undefined) {
            point = scalePoint(point, 1 / boxScale, originPoint);
        }
        return point;
    }
    /**
     * Remove a delta from an axis. This is essentially the steps of applyAxisDelta in reverse
     */
    function removeAxisDelta(axis, translate, scale, origin, boxScale, originAxis, sourceAxis) {
        if (translate === void 0) { translate = 0; }
        if (scale === void 0) { scale = 1; }
        if (origin === void 0) { origin = 0.5; }
        if (originAxis === void 0) { originAxis = axis; }
        if (sourceAxis === void 0) { sourceAxis = axis; }
        if (percent.test(translate)) {
            translate = parseFloat(translate);
            var relativeProgress = mix(sourceAxis.min, sourceAxis.max, translate / 100);
            translate = relativeProgress - sourceAxis.min;
        }
        if (typeof translate !== "number")
            return;
        var originPoint = mix(originAxis.min, originAxis.max, origin);
        if (axis === originAxis)
            originPoint -= translate;
        axis.min = removePointDelta(axis.min, translate, scale, originPoint, boxScale);
        axis.max = removePointDelta(axis.max, translate, scale, originPoint, boxScale);
    }
    /**
     * Remove a transforms from an axis. This is essentially the steps of applyAxisTransforms in reverse
     * and acts as a bridge between motion values and removeAxisDelta
     */
    function removeAxisTransforms(axis, transforms, _a, origin, sourceAxis) {
        var _b = __read(_a, 3), key = _b[0], scaleKey = _b[1], originKey = _b[2];
        removeAxisDelta(axis, transforms[key], transforms[scaleKey], transforms[originKey], transforms.scale, origin, sourceAxis);
    }
    /**
     * The names of the motion values we want to apply as translation, scale and origin.
     */
    var xKeys = ["x", "scaleX", "originX"];
    var yKeys = ["y", "scaleY", "originY"];
    /**
     * Remove a transforms from an box. This is essentially the steps of applyAxisBox in reverse
     * and acts as a bridge between motion values and removeAxisDelta
     */
    function removeBoxTransforms(box, transforms, originBox, sourceBox) {
        removeAxisTransforms(box.x, transforms, xKeys, originBox === null || originBox === void 0 ? void 0 : originBox.x, sourceBox === null || sourceBox === void 0 ? void 0 : sourceBox.x);
        removeAxisTransforms(box.y, transforms, yKeys, originBox === null || originBox === void 0 ? void 0 : originBox.y, sourceBox === null || sourceBox === void 0 ? void 0 : sourceBox.y);
    }

    var createAxisDelta = function () { return ({
        translate: 0,
        scale: 1,
        origin: 0,
        originPoint: 0,
    }); };
    var createDelta = function () { return ({
        x: createAxisDelta(),
        y: createAxisDelta(),
    }); };
    var createAxis = function () { return ({ min: 0, max: 0 }); };
    var createBox = function () { return ({
        x: createAxis(),
        y: createAxis(),
    }); };

    function isAxisDeltaZero(delta) {
        return delta.translate === 0 && delta.scale === 1;
    }
    function isDeltaZero(delta) {
        return isAxisDeltaZero(delta.x) && isAxisDeltaZero(delta.y);
    }
    function boxEquals(a, b) {
        return (a.x.min === b.x.min &&
            a.x.max === b.x.max &&
            a.y.min === b.y.min &&
            a.y.max === b.y.max);
    }

    var NodeStack = /** @class */ (function () {
        function NodeStack() {
            this.members = [];
        }
        NodeStack.prototype.add = function (node) {
            addUniqueItem(this.members, node);
            node.scheduleRender();
        };
        NodeStack.prototype.remove = function (node) {
            removeItem(this.members, node);
            if (node === this.prevLead) {
                this.prevLead = undefined;
            }
            if (node === this.lead) {
                var prevLead = this.members[this.members.length - 1];
                if (prevLead) {
                    this.promote(prevLead);
                }
            }
        };
        NodeStack.prototype.relegate = function (node) {
            var indexOfNode = this.members.findIndex(function (member) { return node === member; });
            if (indexOfNode === 0)
                return false;
            /**
             * Find the next projection node that is present
             */
            var prevLead;
            for (var i = indexOfNode; i >= 0; i--) {
                var member = this.members[i];
                if (member.isPresent !== false) {
                    prevLead = member;
                    break;
                }
            }
            if (prevLead) {
                this.promote(prevLead);
                return true;
            }
            else {
                return false;
            }
        };
        NodeStack.prototype.promote = function (node, preserveFollowOpacity) {
            var _a;
            var prevLead = this.lead;
            if (node === prevLead)
                return;
            this.prevLead = prevLead;
            this.lead = node;
            node.show();
            if (prevLead) {
                prevLead.instance && prevLead.scheduleRender();
                node.scheduleRender();
                node.resumeFrom = prevLead;
                if (preserveFollowOpacity) {
                    node.resumeFrom.preserveOpacity = true;
                }
                if (prevLead.snapshot) {
                    node.snapshot = prevLead.snapshot;
                    node.snapshot.latestValues =
                        prevLead.animationValues || prevLead.latestValues;
                    node.snapshot.isShared = true;
                }
                if ((_a = node.root) === null || _a === void 0 ? void 0 : _a.isUpdating) {
                    node.isLayoutDirty = true;
                }
                var crossfade = node.options.crossfade;
                if (crossfade === false) {
                    prevLead.hide();
                }
                /**
                 * TODO:
                 *   - Test border radius when previous node was deleted
                 *   - boxShadow mixing
                 *   - Shared between element A in scrolled container and element B (scroll stays the same or changes)
                 *   - Shared between element A in transformed container and element B (transform stays the same or changes)
                 *   - Shared between element A in scrolled page and element B (scroll stays the same or changes)
                 * ---
                 *   - Crossfade opacity of root nodes
                 *   - layoutId changes after animation
                 *   - layoutId changes mid animation
                 */
            }
        };
        NodeStack.prototype.exitAnimationComplete = function () {
            this.members.forEach(function (node) {
                var _a, _b, _c, _d, _e;
                (_b = (_a = node.options).onExitComplete) === null || _b === void 0 ? void 0 : _b.call(_a);
                (_e = (_c = node.resumingFrom) === null || _c === void 0 ? void 0 : (_d = _c.options).onExitComplete) === null || _e === void 0 ? void 0 : _e.call(_d);
            });
        };
        NodeStack.prototype.scheduleRender = function () {
            this.members.forEach(function (node) {
                node.instance && node.scheduleRender(false);
            });
        };
        /**
         * Clear any leads that have been removed this render to prevent them from being
         * used in future animations and to prevent memory leaks
         */
        NodeStack.prototype.removeLeadSnapshot = function () {
            if (this.lead && this.lead.snapshot) {
                this.lead.snapshot = undefined;
            }
        };
        return NodeStack;
    }());

    var scaleCorrectors = {};
    function addScaleCorrector(correctors) {
        Object.assign(scaleCorrectors, correctors);
    }

    var identityProjection = "translate3d(0px, 0px, 0) scale(1, 1)";
    function buildProjectionTransform(delta, treeScale, latestTransform) {
        /**
         * The translations we use to calculate are always relative to the viewport coordinate space.
         * But when we apply scales, we also scale the coordinate space of an element and its children.
         * For instance if we have a treeScale (the culmination of all parent scales) of 0.5 and we need
         * to move an element 100 pixels, we actually need to move it 200 in within that scaled space.
         */
        var xTranslate = delta.x.translate / treeScale.x;
        var yTranslate = delta.y.translate / treeScale.y;
        var transform = "translate3d(".concat(xTranslate, "px, ").concat(yTranslate, "px, 0) ");
        if (latestTransform) {
            var rotate = latestTransform.rotate, rotateX = latestTransform.rotateX, rotateY = latestTransform.rotateY;
            if (rotate)
                transform += "rotate(".concat(rotate, "deg) ");
            if (rotateX)
                transform += "rotateX(".concat(rotateX, "deg) ");
            if (rotateY)
                transform += "rotateY(".concat(rotateY, "deg) ");
        }
        transform += "scale(".concat(delta.x.scale, ", ").concat(delta.y.scale, ")");
        return transform === identityProjection ? "none" : transform;
    }

    function eachAxis(callback) {
        return [callback("x"), callback("y")];
    }

    /**
     * A list of all transformable axes. We'll use this list to generated a version
     * of each axes for each transform.
     */
    var transformAxes = ["", "X", "Y", "Z"];
    /**
     * An ordered array of each transformable value. By default, transform values
     * will be sorted to this order.
     */
    var order = ["translate", "scale", "rotate", "skew"];
    /**
     * Generate a list of every possible transform key.
     */
    var transformProps = ["transformPerspective", "x", "y", "z"];
    order.forEach(function (operationKey) {
        return transformAxes.forEach(function (axesKey) {
            return transformProps.push(operationKey + axesKey);
        });
    });
    /**
     * A function to use with Array.sort to sort transform keys by their default order.
     */
    function sortTransformProps(a, b) {
        return transformProps.indexOf(a) - transformProps.indexOf(b);
    }
    /**
     * A quick lookup for transform props.
     */
    var transformPropSet = new Set(transformProps);
    function isTransformProp(key) {
        return transformPropSet.has(key);
    }
    /**
     * A quick lookup for transform origin props
     */
    var transformOriginProps = new Set(["originX", "originY", "originZ"]);
    function isTransformOriginProp(key) {
        return transformOriginProps.has(key);
    }

    var compareByDepth = function (a, b) {
        return a.depth - b.depth;
    };

    var FlatTree = /** @class */ (function () {
        function FlatTree() {
            this.children = [];
            this.isDirty = false;
        }
        FlatTree.prototype.add = function (child) {
            addUniqueItem(this.children, child);
            this.isDirty = true;
        };
        FlatTree.prototype.remove = function (child) {
            removeItem(this.children, child);
            this.isDirty = true;
        };
        FlatTree.prototype.forEach = function (callback) {
            this.isDirty && this.children.sort(compareByDepth);
            this.isDirty = false;
            this.children.forEach(callback);
        };
        return FlatTree;
    }());

    /**
     * If the provided value is a MotionValue, this returns the actual value, otherwise just the value itself
     *
     * TODO: Remove and move to library
     *
     * @internal
     */
    function resolveMotionValue(value) {
        var unwrappedValue = isMotionValue(value) ? value.get() : value;
        return isCustomValue(unwrappedValue)
            ? unwrappedValue.toValue()
            : unwrappedValue;
    }

    /**
     * We use 1000 as the animation target as 0-1000 maps better to pixels than 0-1
     * which has a noticeable difference in spring animations
     */
    var animationTarget = 1000;
    /**
     * This should only ever be modified on the client otherwise it'll
     * persist through server requests. If we need instanced states we
     * could lazy-init via root.
     */
    var globalProjectionState = {
        /**
         * Global flag as to whether the tree has animated since the last time
         * we resized the window
         */
        hasAnimatedSinceResize: true,
        /**
         * We set this to true once, on the first update. Any nodes added to the tree beyond that
         * update will be given a `data-projection-id` attribute.
         */
        hasEverUpdated: false,
    };
    function createProjectionNode(_a) {
        var attachResizeListener = _a.attachResizeListener, defaultParent = _a.defaultParent, measureScroll = _a.measureScroll, resetTransform = _a.resetTransform;
        return /** @class */ (function () {
            function ProjectionNode(id, latestValues, parent) {
                var _this = this;
                if (latestValues === void 0) { latestValues = {}; }
                if (parent === void 0) { parent = defaultParent === null || defaultParent === void 0 ? void 0 : defaultParent(); }
                /**
                 * A Set containing all this component's children. This is used to iterate
                 * through the children.
                 *
                 * TODO: This could be faster to iterate as a flat array stored on the root node.
                 */
                this.children = new Set();
                /**
                 * Options for the node. We use this to configure what kind of layout animations
                 * we should perform (if any).
                 */
                this.options = {};
                /**
                 * We use this to detect when its safe to shut down part of a projection tree.
                 * We have to keep projecting children for scale correction and relative projection
                 * until all their parents stop performing layout animations.
                 */
                this.isTreeAnimating = false;
                this.isAnimationBlocked = false;
                /**
                 * Flag to true if we think this layout has been changed. We can't always know this,
                 * currently we set it to true every time a component renders, or if it has a layoutDependency
                 * if that has changed between renders. Additionally, components can be grouped by LayoutGroup
                 * and if one node is dirtied, they all are.
                 */
                this.isLayoutDirty = false;
                /**
                 * Block layout updates for instant layout transitions throughout the tree.
                 */
                this.updateManuallyBlocked = false;
                this.updateBlockedByResize = false;
                /**
                 * Set to true between the start of the first `willUpdate` call and the end of the `didUpdate`
                 * call.
                 */
                this.isUpdating = false;
                /**
                 * If this is an SVG element we currently disable projection transforms
                 */
                this.isSVG = false;
                /**
                 * Flag to true (during promotion) if a node doing an instant layout transition needs to reset
                 * its projection styles.
                 */
                this.needsReset = false;
                /**
                 * Flags whether this node should have its transform reset prior to measuring.
                 */
                this.shouldResetTransform = false;
                /**
                 * An object representing the calculated contextual/accumulated/tree scale.
                 * This will be used to scale calculcated projection transforms, as these are
                 * calculated in screen-space but need to be scaled for elements to actually
                 * make it to their calculated destinations.
                 *
                 * TODO: Lazy-init
                 */
                this.treeScale = { x: 1, y: 1 };
                /**
                 *
                 */
                this.eventHandlers = new Map();
                // Note: Currently only running on root node
                this.potentialNodes = new Map();
                this.checkUpdateFailed = function () {
                    if (_this.isUpdating) {
                        _this.isUpdating = false;
                        _this.clearAllSnapshots();
                    }
                };
                this.updateProjection = function () {
                    _this.nodes.forEach(resolveTargetDelta);
                    _this.nodes.forEach(calcProjection);
                };
                this.hasProjected = false;
                this.isVisible = true;
                /**
                 * Animation
                 */
                this.animationProgress = 0;
                /**
                 * Shared layout
                 */
                // TODO Only running on root node
                this.sharedNodes = new Map();
                this.id = id;
                this.latestValues = latestValues;
                this.root = parent ? parent.root || parent : this;
                this.path = parent ? __spreadArray(__spreadArray([], __read(parent.path), false), [parent], false) : [];
                this.parent = parent;
                this.depth = parent ? parent.depth + 1 : 0;
                id && this.root.registerPotentialNode(id, this);
                for (var i = 0; i < this.path.length; i++) {
                    this.path[i].shouldResetTransform = true;
                }
                if (this.root === this)
                    this.nodes = new FlatTree();
            }
            ProjectionNode.prototype.addEventListener = function (name, handler) {
                if (!this.eventHandlers.has(name)) {
                    this.eventHandlers.set(name, new SubscriptionManager());
                }
                return this.eventHandlers.get(name).add(handler);
            };
            ProjectionNode.prototype.notifyListeners = function (name) {
                var args = [];
                for (var _i = 1; _i < arguments.length; _i++) {
                    args[_i - 1] = arguments[_i];
                }
                var subscriptionManager = this.eventHandlers.get(name);
                subscriptionManager === null || subscriptionManager === void 0 ? void 0 : subscriptionManager.notify.apply(subscriptionManager, __spreadArray([], __read(args), false));
            };
            ProjectionNode.prototype.hasListeners = function (name) {
                return this.eventHandlers.has(name);
            };
            ProjectionNode.prototype.registerPotentialNode = function (id, node) {
                this.potentialNodes.set(id, node);
            };
            /**
             * Lifecycles
             */
            ProjectionNode.prototype.mount = function (instance, isLayoutDirty) {
                var _this = this;
                var _a;
                if (isLayoutDirty === void 0) { isLayoutDirty = false; }
                if (this.instance)
                    return;
                this.isSVG =
                    instance instanceof SVGElement && instance.tagName !== "svg";
                this.instance = instance;
                var _b = this.options, layoutId = _b.layoutId, layout = _b.layout, visualElement = _b.visualElement;
                if (visualElement && !visualElement.getInstance()) {
                    visualElement.mount(instance);
                }
                this.root.nodes.add(this);
                (_a = this.parent) === null || _a === void 0 ? void 0 : _a.children.add(this);
                this.id && this.root.potentialNodes.delete(this.id);
                if (isLayoutDirty && (layout || layoutId)) {
                    this.isLayoutDirty = true;
                }
                if (attachResizeListener) {
                    var unblockTimeout_1;
                    var resizeUnblockUpdate_1 = function () {
                        return (_this.root.updateBlockedByResize = false);
                    };
                    attachResizeListener(instance, function () {
                        _this.root.updateBlockedByResize = true;
                        clearTimeout(unblockTimeout_1);
                        unblockTimeout_1 = setTimeout(resizeUnblockUpdate_1, 250);
                        if (globalProjectionState.hasAnimatedSinceResize) {
                            globalProjectionState.hasAnimatedSinceResize = false;
                            _this.nodes.forEach(finishAnimation);
                        }
                    });
                }
                if (layoutId) {
                    this.root.registerSharedNode(layoutId, this);
                }
                // Only register the handler if it requires layout animation
                if (this.options.animate !== false &&
                    visualElement &&
                    (layoutId || layout)) {
                    this.addEventListener("didUpdate", function (_a) {
                        var _b, _c, _d, _e, _f;
                        var delta = _a.delta, hasLayoutChanged = _a.hasLayoutChanged, hasRelativeTargetChanged = _a.hasRelativeTargetChanged, newLayout = _a.layout;
                        if (_this.isTreeAnimationBlocked()) {
                            _this.target = undefined;
                            _this.relativeTarget = undefined;
                            return;
                        }
                        // TODO: Check here if an animation exists
                        var layoutTransition = (_c = (_b = _this.options.transition) !== null && _b !== void 0 ? _b : visualElement.getDefaultTransition()) !== null && _c !== void 0 ? _c : defaultLayoutTransition;
                        var onLayoutAnimationComplete = visualElement.getProps().onLayoutAnimationComplete;
                        /**
                         * The target layout of the element might stay the same,
                         * but its position relative to its parent has changed.
                         */
                        var targetChanged = !_this.targetLayout ||
                            !boxEquals(_this.targetLayout, newLayout) ||
                            hasRelativeTargetChanged;
                        /**
                         * If the layout hasn't seemed to have changed, it might be that the
                         * element is visually in the same place in the document but its position
                         * relative to its parent has indeed changed. So here we check for that.
                         */
                        var hasOnlyRelativeTargetChanged = !hasLayoutChanged && hasRelativeTargetChanged;
                        if (((_d = _this.resumeFrom) === null || _d === void 0 ? void 0 : _d.instance) ||
                            hasOnlyRelativeTargetChanged ||
                            (hasLayoutChanged &&
                                (targetChanged || !_this.currentAnimation))) {
                            if (_this.resumeFrom) {
                                _this.resumingFrom = _this.resumeFrom;
                                _this.resumingFrom.resumingFrom = undefined;
                            }
                            _this.setAnimationOrigin(delta, hasOnlyRelativeTargetChanged);
                            _this.startAnimation(__assign(__assign({}, getValueTransition(layoutTransition, "layout")), { onComplete: onLayoutAnimationComplete }));
                        }
                        else {
                            _this.isLead() && ((_f = (_e = _this.options).onExitComplete) === null || _f === void 0 ? void 0 : _f.call(_e));
                        }
                        _this.targetLayout = newLayout;
                    });
                }
            };
            ProjectionNode.prototype.unmount = function () {
                var _a, _b;
                this.options.layoutId && this.willUpdate();
                this.root.nodes.remove(this);
                (_a = this.getStack()) === null || _a === void 0 ? void 0 : _a.remove(this);
                (_b = this.parent) === null || _b === void 0 ? void 0 : _b.children.delete(this);
                this.instance = undefined;
                cancelSync.preRender(this.updateProjection);
            };
            // only on the root
            ProjectionNode.prototype.blockUpdate = function () {
                this.updateManuallyBlocked = true;
            };
            ProjectionNode.prototype.unblockUpdate = function () {
                this.updateManuallyBlocked = false;
            };
            ProjectionNode.prototype.isUpdateBlocked = function () {
                return this.updateManuallyBlocked || this.updateBlockedByResize;
            };
            ProjectionNode.prototype.isTreeAnimationBlocked = function () {
                var _a;
                return (this.isAnimationBlocked ||
                    ((_a = this.parent) === null || _a === void 0 ? void 0 : _a.isTreeAnimationBlocked()) ||
                    false);
            };
            // Note: currently only running on root node
            ProjectionNode.prototype.startUpdate = function () {
                var _a;
                if (this.isUpdateBlocked())
                    return;
                this.isUpdating = true;
                (_a = this.nodes) === null || _a === void 0 ? void 0 : _a.forEach(resetRotation);
            };
            ProjectionNode.prototype.willUpdate = function (shouldNotifyListeners) {
                var _a, _b, _c;
                if (shouldNotifyListeners === void 0) { shouldNotifyListeners = true; }
                if (this.root.isUpdateBlocked()) {
                    (_b = (_a = this.options).onExitComplete) === null || _b === void 0 ? void 0 : _b.call(_a);
                    return;
                }
                !this.root.isUpdating && this.root.startUpdate();
                if (this.isLayoutDirty)
                    return;
                this.isLayoutDirty = true;
                for (var i = 0; i < this.path.length; i++) {
                    var node = this.path[i];
                    node.shouldResetTransform = true;
                    /**
                     * TODO: Check we haven't updated the scroll
                     * since the last didUpdate
                     */
                    node.updateScroll();
                }
                var _d = this.options, layoutId = _d.layoutId, layout = _d.layout;
                if (layoutId === undefined && !layout)
                    return;
                var transformTemplate = (_c = this.options.visualElement) === null || _c === void 0 ? void 0 : _c.getProps().transformTemplate;
                this.prevTransformTemplateValue = transformTemplate === null || transformTemplate === void 0 ? void 0 : transformTemplate(this.latestValues, "");
                this.updateSnapshot();
                shouldNotifyListeners && this.notifyListeners("willUpdate");
            };
            // Note: Currently only running on root node
            ProjectionNode.prototype.didUpdate = function () {
                var updateWasBlocked = this.isUpdateBlocked();
                // When doing an instant transition, we skip the layout update,
                // but should still clean up the measurements so that the next
                // snapshot could be taken correctly.
                if (updateWasBlocked) {
                    this.unblockUpdate();
                    this.clearAllSnapshots();
                    this.nodes.forEach(clearMeasurements);
                    return;
                }
                if (!this.isUpdating)
                    return;
                this.isUpdating = false;
                /**
                 * Search for and mount newly-added projection elements.
                 *
                 * TODO: Every time a new component is rendered we could search up the tree for
                 * the closest mounted node and query from there rather than document.
                 */
                if (this.potentialNodes.size) {
                    this.potentialNodes.forEach(mountNodeEarly);
                    this.potentialNodes.clear();
                }
                /**
                 * Write
                 */
                this.nodes.forEach(resetTransformStyle);
                /**
                 * Read ==================
                 */
                // Update layout measurements of updated children
                this.nodes.forEach(updateLayout);
                /**
                 * Write
                 */
                // Notify listeners that the layout is updated
                this.nodes.forEach(notifyLayoutUpdate);
                this.clearAllSnapshots();
                // Flush any scheduled updates
                flushSync.update();
                flushSync.preRender();
                flushSync.render();
            };
            ProjectionNode.prototype.clearAllSnapshots = function () {
                this.nodes.forEach(clearSnapshot);
                this.sharedNodes.forEach(removeLeadSnapshots);
            };
            ProjectionNode.prototype.scheduleUpdateProjection = function () {
                sync.preRender(this.updateProjection, false, true);
            };
            ProjectionNode.prototype.scheduleCheckAfterUnmount = function () {
                var _this = this;
                /**
                 * If the unmounting node is in a layoutGroup and did trigger a willUpdate,
                 * we manually call didUpdate to give a chance to the siblings to animate.
                 * Otherwise, cleanup all snapshots to prevents future nodes from reusing them.
                 */
                sync.postRender(function () {
                    if (_this.isLayoutDirty) {
                        _this.root.didUpdate();
                    }
                    else {
                        _this.root.checkUpdateFailed();
                    }
                });
            };
            /**
             * Update measurements
             */
            ProjectionNode.prototype.updateSnapshot = function () {
                if (this.snapshot || !this.instance)
                    return;
                var measured = this.measure();
                var layout = this.removeTransform(this.removeElementScroll(measured));
                roundBox(layout);
                this.snapshot = {
                    measured: measured,
                    layout: layout,
                    latestValues: {},
                };
            };
            ProjectionNode.prototype.updateLayout = function () {
                var _a;
                if (!this.instance)
                    return;
                // TODO: Incorporate into a forwarded scroll offset
                this.updateScroll();
                if (!(this.options.alwaysMeasureLayout && this.isLead()) &&
                    !this.isLayoutDirty) {
                    return;
                }
                /**
                 * When a node is mounted, it simply resumes from the prevLead's
                 * snapshot instead of taking a new one, but the ancestors scroll
                 * might have updated while the prevLead is unmounted. We need to
                 * update the scroll again to make sure the layout we measure is
                 * up to date.
                 */
                if (this.resumeFrom && !this.resumeFrom.instance) {
                    for (var i = 0; i < this.path.length; i++) {
                        var node = this.path[i];
                        node.updateScroll();
                    }
                }
                var measured = this.measure();
                roundBox(measured);
                var prevLayout = this.layout;
                this.layout = {
                    measured: measured,
                    actual: this.removeElementScroll(measured),
                };
                this.layoutCorrected = createBox();
                this.isLayoutDirty = false;
                this.projectionDelta = undefined;
                this.notifyListeners("measure", this.layout.actual);
                (_a = this.options.visualElement) === null || _a === void 0 ? void 0 : _a.notifyLayoutMeasure(this.layout.actual, prevLayout === null || prevLayout === void 0 ? void 0 : prevLayout.actual);
            };
            ProjectionNode.prototype.updateScroll = function () {
                if (this.options.layoutScroll && this.instance) {
                    this.scroll = measureScroll(this.instance);
                }
            };
            ProjectionNode.prototype.resetTransform = function () {
                var _a;
                if (!resetTransform)
                    return;
                var isResetRequested = this.isLayoutDirty || this.shouldResetTransform;
                var hasProjection = this.projectionDelta && !isDeltaZero(this.projectionDelta);
                var transformTemplate = (_a = this.options.visualElement) === null || _a === void 0 ? void 0 : _a.getProps().transformTemplate;
                var transformTemplateValue = transformTemplate === null || transformTemplate === void 0 ? void 0 : transformTemplate(this.latestValues, "");
                var transformTemplateHasChanged = transformTemplateValue !== this.prevTransformTemplateValue;
                if (isResetRequested &&
                    (hasProjection ||
                        hasTransform(this.latestValues) ||
                        transformTemplateHasChanged)) {
                    resetTransform(this.instance, transformTemplateValue);
                    this.shouldResetTransform = false;
                    this.scheduleRender();
                }
            };
            ProjectionNode.prototype.measure = function () {
                var visualElement = this.options.visualElement;
                if (!visualElement)
                    return createBox();
                var box = visualElement.measureViewportBox();
                // Remove viewport scroll to give page-relative coordinates
                var scroll = this.root.scroll;
                if (scroll) {
                    translateAxis(box.x, scroll.x);
                    translateAxis(box.y, scroll.y);
                }
                return box;
            };
            ProjectionNode.prototype.removeElementScroll = function (box) {
                var boxWithoutScroll = createBox();
                copyBoxInto(boxWithoutScroll, box);
                /**
                 * Performance TODO: Keep a cumulative scroll offset down the tree
                 * rather than loop back up the path.
                 */
                for (var i = 0; i < this.path.length; i++) {
                    var node = this.path[i];
                    var scroll_1 = node.scroll, options = node.options;
                    if (node !== this.root && scroll_1 && options.layoutScroll) {
                        translateAxis(boxWithoutScroll.x, scroll_1.x);
                        translateAxis(boxWithoutScroll.y, scroll_1.y);
                    }
                }
                return boxWithoutScroll;
            };
            ProjectionNode.prototype.applyTransform = function (box, transformOnly) {
                if (transformOnly === void 0) { transformOnly = false; }
                var withTransforms = createBox();
                copyBoxInto(withTransforms, box);
                for (var i = 0; i < this.path.length; i++) {
                    var node = this.path[i];
                    if (!transformOnly &&
                        node.options.layoutScroll &&
                        node.scroll &&
                        node !== node.root) {
                        transformBox(withTransforms, {
                            x: -node.scroll.x,
                            y: -node.scroll.y,
                        });
                    }
                    if (!hasTransform(node.latestValues))
                        continue;
                    transformBox(withTransforms, node.latestValues);
                }
                if (hasTransform(this.latestValues)) {
                    transformBox(withTransforms, this.latestValues);
                }
                return withTransforms;
            };
            ProjectionNode.prototype.removeTransform = function (box) {
                var _a;
                var boxWithoutTransform = createBox();
                copyBoxInto(boxWithoutTransform, box);
                for (var i = 0; i < this.path.length; i++) {
                    var node = this.path[i];
                    if (!node.instance)
                        continue;
                    if (!hasTransform(node.latestValues))
                        continue;
                    hasScale(node.latestValues) && node.updateSnapshot();
                    var sourceBox = createBox();
                    var nodeBox = node.measure();
                    copyBoxInto(sourceBox, nodeBox);
                    removeBoxTransforms(boxWithoutTransform, node.latestValues, (_a = node.snapshot) === null || _a === void 0 ? void 0 : _a.layout, sourceBox);
                }
                if (hasTransform(this.latestValues)) {
                    removeBoxTransforms(boxWithoutTransform, this.latestValues);
                }
                return boxWithoutTransform;
            };
            /**
             *
             */
            ProjectionNode.prototype.setTargetDelta = function (delta) {
                this.targetDelta = delta;
                this.root.scheduleUpdateProjection();
            };
            ProjectionNode.prototype.setOptions = function (options) {
                var _a;
                this.options = __assign(__assign(__assign({}, this.options), options), { crossfade: (_a = options.crossfade) !== null && _a !== void 0 ? _a : true });
            };
            ProjectionNode.prototype.clearMeasurements = function () {
                this.scroll = undefined;
                this.layout = undefined;
                this.snapshot = undefined;
                this.prevTransformTemplateValue = undefined;
                this.targetDelta = undefined;
                this.target = undefined;
                this.isLayoutDirty = false;
            };
            /**
             * Frame calculations
             */
            ProjectionNode.prototype.resolveTargetDelta = function () {
                var _a;
                var _b = this.options, layout = _b.layout, layoutId = _b.layoutId;
                /**
                 * If we have no layout, we can't perform projection, so early return
                 */
                if (!this.layout || !(layout || layoutId))
                    return;
                /**
                 * If we don't have a targetDelta but do have a layout, we can attempt to resolve
                 * a relativeParent. This will allow a component to perform scale correction
                 * even if no animation has started.
                 */
                // TODO If this is unsuccessful this currently happens every frame
                if (!this.targetDelta && !this.relativeTarget) {
                    // TODO: This is a semi-repetition of further down this function, make DRY
                    this.relativeParent = this.getClosestProjectingParent();
                    if (this.relativeParent && this.relativeParent.layout) {
                        this.relativeTarget = createBox();
                        this.relativeTargetOrigin = createBox();
                        calcRelativePosition(this.relativeTargetOrigin, this.layout.actual, this.relativeParent.layout.actual);
                        copyBoxInto(this.relativeTarget, this.relativeTargetOrigin);
                    }
                }
                /**
                 * If we have no relative target or no target delta our target isn't valid
                 * for this frame.
                 */
                if (!this.relativeTarget && !this.targetDelta)
                    return;
                /**
                 * Lazy-init target data structure
                 */
                if (!this.target) {
                    this.target = createBox();
                    this.targetWithTransforms = createBox();
                }
                /**
                 * If we've got a relative box for this component, resolve it into a target relative to the parent.
                 */
                if (this.relativeTarget &&
                    this.relativeTargetOrigin &&
                    ((_a = this.relativeParent) === null || _a === void 0 ? void 0 : _a.target)) {
                    calcRelativeBox(this.target, this.relativeTarget, this.relativeParent.target);
                    /**
                     * If we've only got a targetDelta, resolve it into a target
                     */
                }
                else if (this.targetDelta) {
                    if (Boolean(this.resumingFrom)) {
                        // TODO: This is creating a new object every frame
                        this.target = this.applyTransform(this.layout.actual);
                    }
                    else {
                        copyBoxInto(this.target, this.layout.actual);
                    }
                    applyBoxDelta(this.target, this.targetDelta);
                }
                else {
                    /**
                     * If no target, use own layout as target
                     */
                    copyBoxInto(this.target, this.layout.actual);
                }
                /**
                 * If we've been told to attempt to resolve a relative target, do so.
                 */
                if (this.attemptToResolveRelativeTarget) {
                    this.attemptToResolveRelativeTarget = false;
                    this.relativeParent = this.getClosestProjectingParent();
                    if (this.relativeParent &&
                        Boolean(this.relativeParent.resumingFrom) ===
                            Boolean(this.resumingFrom) &&
                        !this.relativeParent.options.layoutScroll &&
                        this.relativeParent.target) {
                        this.relativeTarget = createBox();
                        this.relativeTargetOrigin = createBox();
                        calcRelativePosition(this.relativeTargetOrigin, this.target, this.relativeParent.target);
                        copyBoxInto(this.relativeTarget, this.relativeTargetOrigin);
                    }
                }
            };
            ProjectionNode.prototype.getClosestProjectingParent = function () {
                if (!this.parent || hasTransform(this.parent.latestValues))
                    return undefined;
                if ((this.parent.relativeTarget || this.parent.targetDelta) &&
                    this.parent.layout) {
                    return this.parent;
                }
                else {
                    return this.parent.getClosestProjectingParent();
                }
            };
            ProjectionNode.prototype.calcProjection = function () {
                var _a;
                var _b = this.options, layout = _b.layout, layoutId = _b.layoutId;
                /**
                 * If this section of the tree isn't animating we can
                 * delete our target sources for the following frame.
                 */
                this.isTreeAnimating = Boolean(((_a = this.parent) === null || _a === void 0 ? void 0 : _a.isTreeAnimating) ||
                    this.currentAnimation ||
                    this.pendingAnimation);
                if (!this.isTreeAnimating) {
                    this.targetDelta = this.relativeTarget = undefined;
                }
                if (!this.layout || !(layout || layoutId))
                    return;
                var lead = this.getLead();
                /**
                 * Reset the corrected box with the latest values from box, as we're then going
                 * to perform mutative operations on it.
                 */
                copyBoxInto(this.layoutCorrected, this.layout.actual);
                /**
                 * Apply all the parent deltas to this box to produce the corrected box. This
                 * is the layout box, as it will appear on screen as a result of the transforms of its parents.
                 */
                applyTreeDeltas(this.layoutCorrected, this.treeScale, this.path, Boolean(this.resumingFrom) || this !== lead);
                var target = lead.target;
                if (!target)
                    return;
                if (!this.projectionDelta) {
                    this.projectionDelta = createDelta();
                    this.projectionDeltaWithTransform = createDelta();
                }
                var prevTreeScaleX = this.treeScale.x;
                var prevTreeScaleY = this.treeScale.y;
                var prevProjectionTransform = this.projectionTransform;
                /**
                 * Update the delta between the corrected box and the target box before user-set transforms were applied.
                 * This will allow us to calculate the corrected borderRadius and boxShadow to compensate
                 * for our layout reprojection, but still allow them to be scaled correctly by the user.
                 * It might be that to simplify this we may want to accept that user-set scale is also corrected
                 * and we wouldn't have to keep and calc both deltas, OR we could support a user setting
                 * to allow people to choose whether these styles are corrected based on just the
                 * layout reprojection or the final bounding box.
                 */
                calcBoxDelta(this.projectionDelta, this.layoutCorrected, target, this.latestValues);
                this.projectionTransform = buildProjectionTransform(this.projectionDelta, this.treeScale);
                if (this.projectionTransform !== prevProjectionTransform ||
                    this.treeScale.x !== prevTreeScaleX ||
                    this.treeScale.y !== prevTreeScaleY) {
                    this.hasProjected = true;
                    this.scheduleRender();
                    this.notifyListeners("projectionUpdate", target);
                }
            };
            ProjectionNode.prototype.hide = function () {
                this.isVisible = false;
                // TODO: Schedule render
            };
            ProjectionNode.prototype.show = function () {
                this.isVisible = true;
                // TODO: Schedule render
            };
            ProjectionNode.prototype.scheduleRender = function (notifyAll) {
                var _a, _b, _c;
                if (notifyAll === void 0) { notifyAll = true; }
                (_b = (_a = this.options).scheduleRender) === null || _b === void 0 ? void 0 : _b.call(_a);
                notifyAll && ((_c = this.getStack()) === null || _c === void 0 ? void 0 : _c.scheduleRender());
                if (this.resumingFrom && !this.resumingFrom.instance) {
                    this.resumingFrom = undefined;
                }
            };
            ProjectionNode.prototype.setAnimationOrigin = function (delta, hasOnlyRelativeTargetChanged) {
                var _this = this;
                var _a;
                if (hasOnlyRelativeTargetChanged === void 0) { hasOnlyRelativeTargetChanged = false; }
                var snapshot = this.snapshot;
                var snapshotLatestValues = (snapshot === null || snapshot === void 0 ? void 0 : snapshot.latestValues) || {};
                var mixedValues = __assign({}, this.latestValues);
                var targetDelta = createDelta();
                this.relativeTarget = this.relativeTargetOrigin = undefined;
                this.attemptToResolveRelativeTarget = !hasOnlyRelativeTargetChanged;
                var relativeLayout = createBox();
                var isSharedLayoutAnimation = snapshot === null || snapshot === void 0 ? void 0 : snapshot.isShared;
                var isOnlyMember = (((_a = this.getStack()) === null || _a === void 0 ? void 0 : _a.members.length) || 0) <= 1;
                var shouldCrossfadeOpacity = Boolean(isSharedLayoutAnimation &&
                    !isOnlyMember &&
                    this.options.crossfade === true &&
                    !this.path.some(hasOpacityCrossfade));
                this.mixTargetDelta = function (latest) {
                    var _a;
                    var progress = latest / 1000;
                    mixAxisDelta(targetDelta.x, delta.x, progress);
                    mixAxisDelta(targetDelta.y, delta.y, progress);
                    _this.setTargetDelta(targetDelta);
                    if (_this.relativeTarget &&
                        _this.relativeTargetOrigin &&
                        _this.layout &&
                        ((_a = _this.relativeParent) === null || _a === void 0 ? void 0 : _a.layout)) {
                        calcRelativePosition(relativeLayout, _this.layout.actual, _this.relativeParent.layout.actual);
                        mixBox(_this.relativeTarget, _this.relativeTargetOrigin, relativeLayout, progress);
                    }
                    if (isSharedLayoutAnimation) {
                        _this.animationValues = mixedValues;
                        mixValues(mixedValues, snapshotLatestValues, _this.latestValues, progress, shouldCrossfadeOpacity, isOnlyMember);
                    }
                    _this.root.scheduleUpdateProjection();
                    _this.scheduleRender();
                };
                this.mixTargetDelta(0);
            };
            ProjectionNode.prototype.startAnimation = function (options) {
                var _this = this;
                var _a, _b;
                (_a = this.currentAnimation) === null || _a === void 0 ? void 0 : _a.stop();
                if (this.resumingFrom) {
                    (_b = this.resumingFrom.currentAnimation) === null || _b === void 0 ? void 0 : _b.stop();
                }
                if (this.pendingAnimation) {
                    cancelSync.update(this.pendingAnimation);
                    this.pendingAnimation = undefined;
                }
                /**
                 * Start the animation in the next frame to have a frame with progress 0,
                 * where the target is the same as when the animation started, so we can
                 * calculate the relative positions correctly for instant transitions.
                 */
                this.pendingAnimation = sync.update(function () {
                    globalProjectionState.hasAnimatedSinceResize = true;
                    _this.currentAnimation = animate(0, animationTarget, __assign(__assign({}, options), { onUpdate: function (latest) {
                            var _a;
                            _this.mixTargetDelta(latest);
                            (_a = options.onUpdate) === null || _a === void 0 ? void 0 : _a.call(options, latest);
                        }, onComplete: function () {
                            var _a;
                            (_a = options.onComplete) === null || _a === void 0 ? void 0 : _a.call(options);
                            _this.completeAnimation();
                        } }));
                    if (_this.resumingFrom) {
                        _this.resumingFrom.currentAnimation = _this.currentAnimation;
                    }
                    _this.pendingAnimation = undefined;
                });
            };
            ProjectionNode.prototype.completeAnimation = function () {
                var _a;
                if (this.resumingFrom) {
                    this.resumingFrom.currentAnimation = undefined;
                    this.resumingFrom.preserveOpacity = undefined;
                }
                (_a = this.getStack()) === null || _a === void 0 ? void 0 : _a.exitAnimationComplete();
                this.resumingFrom =
                    this.currentAnimation =
                        this.animationValues =
                            undefined;
                this.notifyListeners("animationComplete");
            };
            ProjectionNode.prototype.finishAnimation = function () {
                var _a;
                if (this.currentAnimation) {
                    (_a = this.mixTargetDelta) === null || _a === void 0 ? void 0 : _a.call(this, animationTarget);
                    this.currentAnimation.stop();
                }
                this.completeAnimation();
            };
            ProjectionNode.prototype.applyTransformsToTarget = function () {
                var _a = this.getLead(), targetWithTransforms = _a.targetWithTransforms, target = _a.target, layout = _a.layout, latestValues = _a.latestValues;
                if (!targetWithTransforms || !target || !layout)
                    return;
                copyBoxInto(targetWithTransforms, target);
                /**
                 * Apply the latest user-set transforms to the targetBox to produce the targetBoxFinal.
                 * This is the final box that we will then project into by calculating a transform delta and
                 * applying it to the corrected box.
                 */
                transformBox(targetWithTransforms, latestValues);
                /**
                 * Update the delta between the corrected box and the final target box, after
                 * user-set transforms are applied to it. This will be used by the renderer to
                 * create a transform style that will reproject the element from its actual layout
                 * into the desired bounding box.
                 */
                calcBoxDelta(this.projectionDeltaWithTransform, this.layoutCorrected, targetWithTransforms, latestValues);
            };
            ProjectionNode.prototype.registerSharedNode = function (layoutId, node) {
                var _a, _b, _c;
                if (!this.sharedNodes.has(layoutId)) {
                    this.sharedNodes.set(layoutId, new NodeStack());
                }
                var stack = this.sharedNodes.get(layoutId);
                stack.add(node);
                node.promote({
                    transition: (_a = node.options.initialPromotionConfig) === null || _a === void 0 ? void 0 : _a.transition,
                    preserveFollowOpacity: (_c = (_b = node.options.initialPromotionConfig) === null || _b === void 0 ? void 0 : _b.shouldPreserveFollowOpacity) === null || _c === void 0 ? void 0 : _c.call(_b, node),
                });
            };
            ProjectionNode.prototype.isLead = function () {
                var stack = this.getStack();
                return stack ? stack.lead === this : true;
            };
            ProjectionNode.prototype.getLead = function () {
                var _a;
                var layoutId = this.options.layoutId;
                return layoutId ? ((_a = this.getStack()) === null || _a === void 0 ? void 0 : _a.lead) || this : this;
            };
            ProjectionNode.prototype.getPrevLead = function () {
                var _a;
                var layoutId = this.options.layoutId;
                return layoutId ? (_a = this.getStack()) === null || _a === void 0 ? void 0 : _a.prevLead : undefined;
            };
            ProjectionNode.prototype.getStack = function () {
                var layoutId = this.options.layoutId;
                if (layoutId)
                    return this.root.sharedNodes.get(layoutId);
            };
            ProjectionNode.prototype.promote = function (_a) {
                var _b = _a === void 0 ? {} : _a, needsReset = _b.needsReset, transition = _b.transition, preserveFollowOpacity = _b.preserveFollowOpacity;
                var stack = this.getStack();
                if (stack)
                    stack.promote(this, preserveFollowOpacity);
                if (needsReset) {
                    this.projectionDelta = undefined;
                    this.needsReset = true;
                }
                if (transition)
                    this.setOptions({ transition: transition });
            };
            ProjectionNode.prototype.relegate = function () {
                var stack = this.getStack();
                if (stack) {
                    return stack.relegate(this);
                }
                else {
                    return false;
                }
            };
            ProjectionNode.prototype.resetRotation = function () {
                var visualElement = this.options.visualElement;
                if (!visualElement)
                    return;
                // If there's no detected rotation values, we can early return without a forced render.
                var hasRotate = false;
                // Keep a record of all the values we've reset
                var resetValues = {};
                // Check the rotate value of all axes and reset to 0
                for (var i = 0; i < transformAxes.length; i++) {
                    var axis = transformAxes[i];
                    var key = "rotate" + axis;
                    // If this rotation doesn't exist as a motion value, then we don't
                    // need to reset it
                    if (!visualElement.getStaticValue(key)) {
                        continue;
                    }
                    hasRotate = true;
                    // Record the rotation and then temporarily set it to 0
                    resetValues[key] = visualElement.getStaticValue(key);
                    visualElement.setStaticValue(key, 0);
                }
                // If there's no rotation values, we don't need to do any more.
                if (!hasRotate)
                    return;
                // Force a render of this element to apply the transform with all rotations
                // set to 0.
                visualElement === null || visualElement === void 0 ? void 0 : visualElement.syncRender();
                // Put back all the values we reset
                for (var key in resetValues) {
                    visualElement.setStaticValue(key, resetValues[key]);
                }
                // Schedule a render for the next frame. This ensures we won't visually
                // see the element with the reset rotate value applied.
                visualElement.scheduleRender();
            };
            ProjectionNode.prototype.getProjectionStyles = function (styleProp) {
                var _a, _b, _c, _d, _e, _f;
                if (styleProp === void 0) { styleProp = {}; }
                // TODO: Return lifecycle-persistent object
                var styles = {};
                if (!this.instance || this.isSVG)
                    return styles;
                if (!this.isVisible) {
                    return { visibility: "hidden" };
                }
                else {
                    styles.visibility = "";
                }
                var transformTemplate = (_a = this.options.visualElement) === null || _a === void 0 ? void 0 : _a.getProps().transformTemplate;
                if (this.needsReset) {
                    this.needsReset = false;
                    styles.opacity = "";
                    styles.pointerEvents =
                        resolveMotionValue(styleProp.pointerEvents) || "";
                    styles.transform = transformTemplate
                        ? transformTemplate(this.latestValues, "")
                        : "none";
                    return styles;
                }
                var lead = this.getLead();
                if (!this.projectionDelta || !this.layout || !lead.target) {
                    var emptyStyles = {};
                    if (this.options.layoutId) {
                        emptyStyles.opacity = (_b = this.latestValues.opacity) !== null && _b !== void 0 ? _b : 1;
                        emptyStyles.pointerEvents =
                            resolveMotionValue(styleProp.pointerEvents) || "";
                    }
                    if (this.hasProjected && !hasTransform(this.latestValues)) {
                        emptyStyles.transform = transformTemplate
                            ? transformTemplate({}, "")
                            : "none";
                        this.hasProjected = false;
                    }
                    return emptyStyles;
                }
                var valuesToRender = lead.animationValues || lead.latestValues;
                this.applyTransformsToTarget();
                styles.transform = buildProjectionTransform(this.projectionDeltaWithTransform, this.treeScale, valuesToRender);
                if (transformTemplate) {
                    styles.transform = transformTemplate(valuesToRender, styles.transform);
                }
                var _g = this.projectionDelta, x = _g.x, y = _g.y;
                styles.transformOrigin = "".concat(x.origin * 100, "% ").concat(y.origin * 100, "% 0");
                if (lead.animationValues) {
                    /**
                     * If the lead component is animating, assign this either the entering/leaving
                     * opacity
                     */
                    styles.opacity =
                        lead === this
                            ? (_d = (_c = valuesToRender.opacity) !== null && _c !== void 0 ? _c : this.latestValues.opacity) !== null && _d !== void 0 ? _d : 1
                            : this.preserveOpacity
                                ? this.latestValues.opacity
                                : valuesToRender.opacityExit;
                }
                else {
                    /**
                     * Or we're not animating at all, set the lead component to its actual
                     * opacity and other components to hidden.
                     */
                    styles.opacity =
                        lead === this
                            ? (_e = valuesToRender.opacity) !== null && _e !== void 0 ? _e : ""
                            : (_f = valuesToRender.opacityExit) !== null && _f !== void 0 ? _f : 0;
                }
                /**
                 * Apply scale correction
                 */
                for (var key in scaleCorrectors) {
                    if (valuesToRender[key] === undefined)
                        continue;
                    var _h = scaleCorrectors[key], correct = _h.correct, applyTo = _h.applyTo;
                    var corrected = correct(valuesToRender[key], lead);
                    if (applyTo) {
                        var num = applyTo.length;
                        for (var i = 0; i < num; i++) {
                            styles[applyTo[i]] = corrected;
                        }
                    }
                    else {
                        styles[key] = corrected;
                    }
                }
                /**
                 * Disable pointer events on follow components. This is to ensure
                 * that if a follow component covers a lead component it doesn't block
                 * pointer events on the lead.
                 */
                if (this.options.layoutId) {
                    styles.pointerEvents =
                        lead === this
                            ? resolveMotionValue(styleProp.pointerEvents) || ""
                            : "none";
                }
                return styles;
            };
            ProjectionNode.prototype.clearSnapshot = function () {
                this.resumeFrom = this.snapshot = undefined;
            };
            // Only run on root
            ProjectionNode.prototype.resetTree = function () {
                this.root.nodes.forEach(function (node) { var _a; return (_a = node.currentAnimation) === null || _a === void 0 ? void 0 : _a.stop(); });
                this.root.nodes.forEach(clearMeasurements);
                this.root.sharedNodes.clear();
            };
            return ProjectionNode;
        }());
    }
    function updateLayout(node) {
        node.updateLayout();
    }
    function notifyLayoutUpdate(node) {
        var _a, _b, _c, _d;
        var snapshot = (_b = (_a = node.resumeFrom) === null || _a === void 0 ? void 0 : _a.snapshot) !== null && _b !== void 0 ? _b : node.snapshot;
        if (node.isLead() &&
            node.layout &&
            snapshot &&
            node.hasListeners("didUpdate")) {
            var _e = node.layout, layout_1 = _e.actual, measuredLayout = _e.measured;
            // TODO Maybe we want to also resize the layout snapshot so we don't trigger
            // animations for instance if layout="size" and an element has only changed position
            if (node.options.animationType === "size") {
                eachAxis(function (axis) {
                    var axisSnapshot = snapshot.isShared
                        ? snapshot.measured[axis]
                        : snapshot.layout[axis];
                    var length = calcLength(axisSnapshot);
                    axisSnapshot.min = layout_1[axis].min;
                    axisSnapshot.max = axisSnapshot.min + length;
                });
            }
            else if (node.options.animationType === "position") {
                eachAxis(function (axis) {
                    var axisSnapshot = snapshot.isShared
                        ? snapshot.measured[axis]
                        : snapshot.layout[axis];
                    var length = calcLength(layout_1[axis]);
                    axisSnapshot.max = axisSnapshot.min + length;
                });
            }
            var layoutDelta = createDelta();
            calcBoxDelta(layoutDelta, layout_1, snapshot.layout);
            var visualDelta = createDelta();
            if (snapshot.isShared) {
                calcBoxDelta(visualDelta, node.applyTransform(measuredLayout, true), snapshot.measured);
            }
            else {
                calcBoxDelta(visualDelta, layout_1, snapshot.layout);
            }
            var hasLayoutChanged = !isDeltaZero(layoutDelta);
            var hasRelativeTargetChanged = false;
            if (!node.resumeFrom) {
                node.relativeParent = node.getClosestProjectingParent();
                /**
                 * If the relativeParent is itself resuming from a different element then
                 * the relative snapshot is not relavent
                 */
                if (node.relativeParent && !node.relativeParent.resumeFrom) {
                    var _f = node.relativeParent, parentSnapshot = _f.snapshot, parentLayout = _f.layout;
                    if (parentSnapshot && parentLayout) {
                        var relativeSnapshot = createBox();
                        calcRelativePosition(relativeSnapshot, snapshot.layout, parentSnapshot.layout);
                        var relativeLayout = createBox();
                        calcRelativePosition(relativeLayout, layout_1, parentLayout.actual);
                        if (!boxEquals(relativeSnapshot, relativeLayout)) {
                            hasRelativeTargetChanged = true;
                        }
                    }
                }
            }
            node.notifyListeners("didUpdate", {
                layout: layout_1,
                snapshot: snapshot,
                delta: visualDelta,
                layoutDelta: layoutDelta,
                hasLayoutChanged: hasLayoutChanged,
                hasRelativeTargetChanged: hasRelativeTargetChanged,
            });
        }
        else if (node.isLead()) {
            (_d = (_c = node.options).onExitComplete) === null || _d === void 0 ? void 0 : _d.call(_c);
        }
        /**
         * Clearing transition
         * TODO: Investigate why this transition is being passed in as {type: false } from Framer
         * and why we need it at all
         */
        node.options.transition = undefined;
    }
    function clearSnapshot(node) {
        node.clearSnapshot();
    }
    function clearMeasurements(node) {
        node.clearMeasurements();
    }
    function resetTransformStyle(node) {
        node.resetTransform();
    }
    function finishAnimation(node) {
        node.finishAnimation();
        node.targetDelta = node.relativeTarget = node.target = undefined;
    }
    function resolveTargetDelta(node) {
        node.resolveTargetDelta();
    }
    function calcProjection(node) {
        node.calcProjection();
    }
    function resetRotation(node) {
        node.resetRotation();
    }
    function removeLeadSnapshots(stack) {
        stack.removeLeadSnapshot();
    }
    function mixAxisDelta(output, delta, p) {
        output.translate = mix(delta.translate, 0, p);
        output.scale = mix(delta.scale, 1, p);
        output.origin = delta.origin;
        output.originPoint = delta.originPoint;
    }
    function mixAxis(output, from, to, p) {
        output.min = mix(from.min, to.min, p);
        output.max = mix(from.max, to.max, p);
    }
    function mixBox(output, from, to, p) {
        mixAxis(output.x, from.x, to.x, p);
        mixAxis(output.y, from.y, to.y, p);
    }
    function hasOpacityCrossfade(node) {
        return (node.animationValues && node.animationValues.opacityExit !== undefined);
    }
    var defaultLayoutTransition = {
        duration: 0.45,
        ease: [0.4, 0, 0.1, 1],
    };
    function mountNodeEarly(node, id) {
        /**
         * Rather than searching the DOM from document we can search the
         * path for the deepest mounted ancestor and search from there
         */
        var searchNode = node.root;
        for (var i = node.path.length - 1; i >= 0; i--) {
            if (Boolean(node.path[i].instance)) {
                searchNode = node.path[i];
                break;
            }
        }
        var searchElement = searchNode && searchNode !== node.root ? searchNode.instance : document;
        var element = searchElement.querySelector("[data-projection-id=\"".concat(id, "\"]"));
        if (element)
            node.mount(element, true);
    }
    function roundAxis(axis) {
        axis.min = Math.round(axis.min);
        axis.max = Math.round(axis.max);
    }
    function roundBox(box) {
        roundAxis(box.x);
        roundAxis(box.y);
    }

    var DocumentProjectionNode = createProjectionNode({
        attachResizeListener: function (ref, notify) {
            ref.addEventListener("resize", notify, { passive: true });
            return function () { return ref.removeEventListener("resize", notify); };
        },
        measureScroll: function () { return ({
            x: document.documentElement.scrollLeft || document.body.scrollLeft,
            y: document.documentElement.scrollTop || document.body.scrollTop,
        }); },
    });

    var rootProjectionNode = {
        current: undefined,
    };
    var HTMLProjectionNode = createProjectionNode({
        measureScroll: function (instance) { return ({
            x: instance.scrollLeft,
            y: instance.scrollTop,
        }); },
        defaultParent: function () {
            if (!rootProjectionNode.current) {
                var documentNode = new DocumentProjectionNode(0, {});
                documentNode.mount(window);
                documentNode.setOptions({ layoutScroll: true });
                rootProjectionNode.current = documentNode;
            }
            return rootProjectionNode.current;
        },
        resetTransform: function (instance, value) {
            instance.style.transform = value !== null && value !== void 0 ? value : "none";
        },
    });

    var notify = function (node) {
        return !node.isLayoutDirty && node.willUpdate(false);
    };
    function nodeGroup() {
        var nodes = new Set();
        var subscriptions = new WeakMap();
        var dirtyAll = function () { return nodes.forEach(notify); };
        return {
            add: function (node) {
                nodes.add(node);
                subscriptions.set(node, node.addEventListener("willUpdate", dirtyAll));
            },
            remove: function (node) {
                var _a;
                nodes.delete(node);
                (_a = subscriptions.get(node)) === null || _a === void 0 ? void 0 : _a();
                subscriptions.delete(node);
                dirtyAll();
            },
            dirty: dirtyAll,
        };
    }

    var translateAlias = {
        x: "translateX",
        y: "translateY",
        z: "translateZ",
        transformPerspective: "perspective",
    };
    /**
     * Build a CSS transform style from individual x/y/scale etc properties.
     *
     * This outputs with a default order of transforms/scales/rotations, this can be customised by
     * providing a transformTemplate function.
     */
    function buildTransform(_a, _b, transformIsDefault, transformTemplate) {
        var transform = _a.transform, transformKeys = _a.transformKeys;
        var _c = _b.enableHardwareAcceleration, enableHardwareAcceleration = _c === void 0 ? true : _c, _d = _b.allowTransformNone, allowTransformNone = _d === void 0 ? true : _d;
        // The transform string we're going to build into.
        var transformString = "";
        // Transform keys into their default order - this will determine the output order.
        transformKeys.sort(sortTransformProps);
        // Track whether the defined transform has a defined z so we don't add a
        // second to enable hardware acceleration
        var transformHasZ = false;
        // Loop over each transform and build them into transformString
        var numTransformKeys = transformKeys.length;
        for (var i = 0; i < numTransformKeys; i++) {
            var key = transformKeys[i];
            transformString += "".concat(translateAlias[key] || key, "(").concat(transform[key], ") ");
            if (key === "z")
                transformHasZ = true;
        }
        if (!transformHasZ && enableHardwareAcceleration) {
            transformString += "translateZ(0)";
        }
        else {
            transformString = transformString.trim();
        }
        // If we have a custom `transform` template, pass our transform values and
        // generated transformString to that before returning
        if (transformTemplate) {
            transformString = transformTemplate(transform, transformIsDefault ? "" : transformString);
        }
        else if (allowTransformNone && transformIsDefault) {
            transformString = "none";
        }
        return transformString;
    }
    /**
     * Build a transformOrigin style. Uses the same defaults as the browser for
     * undefined origins.
     */
    function buildTransformOrigin(_a) {
        var _b = _a.originX, originX = _b === void 0 ? "50%" : _b, _c = _a.originY, originY = _c === void 0 ? "50%" : _c, _d = _a.originZ, originZ = _d === void 0 ? 0 : _d;
        return "".concat(originX, " ").concat(originY, " ").concat(originZ);
    }

    function pixelsToPercent(pixels, axis) {
        if (axis.max === axis.min)
            return 0;
        return (pixels / (axis.max - axis.min)) * 100;
    }
    /**
     * We always correct borderRadius as a percentage rather than pixels to reduce paints.
     * For example, if you are projecting a box that is 100px wide with a 10px borderRadius
     * into a box that is 200px wide with a 20px borderRadius, that is actually a 10%
     * borderRadius in both states. If we animate between the two in pixels that will trigger
     * a paint each time. If we animate between the two in percentage we'll avoid a paint.
     */
    var correctBorderRadius = {
        correct: function (latest, node) {
            if (!node.target)
                return latest;
            /**
             * If latest is a string, if it's a percentage we can return immediately as it's
             * going to be stretched appropriately. Otherwise, if it's a pixel, convert it to a number.
             */
            if (typeof latest === "string") {
                if (px.test(latest)) {
                    latest = parseFloat(latest);
                }
                else {
                    return latest;
                }
            }
            /**
             * If latest is a number, it's a pixel value. We use the current viewportBox to calculate that
             * pixel value as a percentage of each axis
             */
            var x = pixelsToPercent(latest, node.target.x);
            var y = pixelsToPercent(latest, node.target.y);
            return "".concat(x, "% ").concat(y, "%");
        },
    };

    function isCSSVariable$1(value) {
        return typeof value === "string" && value.startsWith("var(--");
    }
    /**
     * Parse Framer's special CSS variable format into a CSS token and a fallback.
     *
     * ```
     * `var(--foo, #fff)` => [`--foo`, '#fff']
     * ```
     *
     * @param current
     */
    var cssVariableRegex = /var\((--[a-zA-Z0-9-_]+),? ?([a-zA-Z0-9 ()%#.,-]+)?\)/;
    function parseCSSVariable(current) {
        var match = cssVariableRegex.exec(current);
        if (!match)
            return [,];
        var _a = __read(match, 3), token = _a[1], fallback = _a[2];
        return [token, fallback];
    }
    var maxDepth = 4;
    function getVariableValue(current, element, depth) {
        if (depth === void 0) { depth = 1; }
        invariant(depth <= maxDepth, "Max CSS variable fallback depth detected in property \"".concat(current, "\". This may indicate a circular fallback dependency."));
        var _a = __read(parseCSSVariable(current), 2), token = _a[0], fallback = _a[1];
        // No CSS variable detected
        if (!token)
            return;
        // Attempt to read this CSS variable off the element
        var resolved = window.getComputedStyle(element).getPropertyValue(token);
        if (resolved) {
            return resolved.trim();
        }
        else if (isCSSVariable$1(fallback)) {
            // The fallback might itself be a CSS variable, in which case we attempt to resolve it too.
            return getVariableValue(fallback, element, depth + 1);
        }
        else {
            return fallback;
        }
    }
    /**
     * Resolve CSS variables from
     *
     * @internal
     */
    function resolveCSSVariables(visualElement, _a, transitionEnd) {
        var _b;
        var target = __rest(_a, []);
        var element = visualElement.getInstance();
        if (!(element instanceof Element))
            return { target: target, transitionEnd: transitionEnd };
        // If `transitionEnd` isn't `undefined`, clone it. We could clone `target` and `transitionEnd`
        // only if they change but I think this reads clearer and this isn't a performance-critical path.
        if (transitionEnd) {
            transitionEnd = __assign({}, transitionEnd);
        }
        // Go through existing `MotionValue`s and ensure any existing CSS variables are resolved
        visualElement.forEachValue(function (value) {
            var current = value.get();
            if (!isCSSVariable$1(current))
                return;
            var resolved = getVariableValue(current, element);
            if (resolved)
                value.set(resolved);
        });
        // Cycle through every target property and resolve CSS variables. Currently
        // we only read single-var properties like `var(--foo)`, not `calc(var(--foo) + 20px)`
        for (var key in target) {
            var current = target[key];
            if (!isCSSVariable$1(current))
                continue;
            var resolved = getVariableValue(current, element);
            if (!resolved)
                continue;
            // Clone target if it hasn't already been
            target[key] = resolved;
            // If the user hasn't already set this key on `transitionEnd`, set it to the unresolved
            // CSS variable. This will ensure that after the animation the component will reflect
            // changes in the value of the CSS variable.
            if (transitionEnd)
                (_b = transitionEnd[key]) !== null && _b !== void 0 ? _b : (transitionEnd[key] = current);
        }
        return { target: target, transitionEnd: transitionEnd };
    }

    var varToken = "_$css";
    var correctBoxShadow = {
        correct: function (latest, _a) {
            var treeScale = _a.treeScale, projectionDelta = _a.projectionDelta;
            var original = latest;
            /**
             * We need to first strip and store CSS variables from the string.
             */
            var containsCSSVariables = latest.includes("var(");
            var cssVariables = [];
            if (containsCSSVariables) {
                latest = latest.replace(cssVariableRegex, function (match) {
                    cssVariables.push(match);
                    return varToken;
                });
            }
            var shadow = complex.parse(latest);
            // TODO: Doesn't support multiple shadows
            if (shadow.length > 5)
                return original;
            var template = complex.createTransformer(latest);
            var offset = typeof shadow[0] !== "number" ? 1 : 0;
            // Calculate the overall context scale
            var xScale = projectionDelta.x.scale * treeScale.x;
            var yScale = projectionDelta.y.scale * treeScale.y;
            shadow[0 + offset] /= xScale;
            shadow[1 + offset] /= yScale;
            /**
             * Ideally we'd correct x and y scales individually, but because blur and
             * spread apply to both we have to take a scale average and apply that instead.
             * We could potentially improve the outcome of this by incorporating the ratio between
             * the two scales.
             */
            var averageScale = mix(xScale, yScale, 0.5);
            // Blur
            if (typeof shadow[2 + offset] === "number")
                shadow[2 + offset] /= averageScale;
            // Spread
            if (typeof shadow[3 + offset] === "number")
                shadow[3 + offset] /= averageScale;
            var output = template(shadow);
            if (containsCSSVariables) {
                var i_1 = 0;
                output = output.replace(varToken, function () {
                    var cssVariable = cssVariables[i_1];
                    i_1++;
                    return cssVariable;
                });
            }
            return output;
        },
    };

    /**
     * Check if value is a numerical string, ie a string that is purely a number eg "100" or "-100.1"
     */
    var isNumericalString = function (v) { return /^\-?\d*\.?\d+$/.test(v); };

    /**
     * Check if the value is a zero value string like "0px" or "0%"
     */
    var isZeroValueString = function (v) { return /^0[^.\s]+$/.test(v); };

    /**
     * Tests a provided value against a ValueType
     */
    var testValueType = function (v) { return function (type) { return type.test(v); }; };

    /**
     * ValueType for "auto"
     */
    var auto = {
        test: function (v) { return v === "auto"; },
        parse: function (v) { return v; },
    };

    /**
     * A list of value types commonly used for dimensions
     */
    var dimensionValueTypes = [number, px, percent, degrees, vw, vh, auto];
    /**
     * Tests a dimensional value against the list of dimension ValueTypes
     */
    var findDimensionValueType = function (v) {
        return dimensionValueTypes.find(testValueType(v));
    };

    /**
     * A list of all ValueTypes
     */
    var valueTypes = __spreadArray(__spreadArray([], __read(dimensionValueTypes), false), [color, complex], false);
    /**
     * Tests a value against the list of ValueTypes
     */
    var findValueType = function (v) { return valueTypes.find(testValueType(v)); };

    /**
     * Decides if the supplied variable is an array of variant labels
     */
    function isVariantLabels(v) {
        return Array.isArray(v);
    }
    /**
     * Decides if the supplied variable is variant label
     */
    function isVariantLabel(v) {
        return typeof v === "string" || isVariantLabels(v);
    }
    function checkIfControllingVariants(props) {
        var _a;
        return (typeof ((_a = props.animate) === null || _a === void 0 ? void 0 : _a.start) === "function" ||
            isVariantLabel(props.initial) ||
            isVariantLabel(props.animate) ||
            isVariantLabel(props.whileHover) ||
            isVariantLabel(props.whileDrag) ||
            isVariantLabel(props.whileTap) ||
            isVariantLabel(props.whileFocus) ||
            isVariantLabel(props.exit));
    }
    function checkIfVariantNode(props) {
        return Boolean(checkIfControllingVariants(props) || props.variants);
    }

    function checkTargetForNewValues(visualElement, target, origin) {
        var _a, _b, _c;
        var _d;
        var newValueKeys = Object.keys(target).filter(function (key) { return !visualElement.hasValue(key); });
        var numNewValues = newValueKeys.length;
        if (!numNewValues)
            return;
        for (var i = 0; i < numNewValues; i++) {
            var key = newValueKeys[i];
            var targetValue = target[key];
            var value = null;
            /**
             * If the target is a series of keyframes, we can use the first value
             * in the array. If this first value is null, we'll still need to read from the DOM.
             */
            if (Array.isArray(targetValue)) {
                value = targetValue[0];
            }
            /**
             * If the target isn't keyframes, or the first keyframe was null, we need to
             * first check if an origin value was explicitly defined in the transition as "from",
             * if not read the value from the DOM. As an absolute fallback, take the defined target value.
             */
            if (value === null) {
                value = (_b = (_a = origin[key]) !== null && _a !== void 0 ? _a : visualElement.readValue(key)) !== null && _b !== void 0 ? _b : target[key];
            }
            /**
             * If value is still undefined or null, ignore it. Preferably this would throw,
             * but this was causing issues in Framer.
             */
            if (value === undefined || value === null)
                continue;
            if (typeof value === "string" &&
                (isNumericalString(value) || isZeroValueString(value))) {
                // If this is a number read as a string, ie "0" or "200", convert it to a number
                value = parseFloat(value);
            }
            else if (!findValueType(value) && complex.test(targetValue)) {
                value = getAnimatableNone(key, targetValue);
            }
            visualElement.addValue(key, motionValue(value));
            (_c = (_d = origin)[key]) !== null && _c !== void 0 ? _c : (_d[key] = value);
            visualElement.setBaseTarget(key, value);
        }
    }
    function getOriginFromTransition(key, transition) {
        if (!transition)
            return;
        var valueTransition = transition[key] || transition["default"] || transition;
        return valueTransition.from;
    }
    function getOrigin(target, transition, visualElement) {
        var _a, _b;
        var origin = {};
        for (var key in target) {
            origin[key] =
                (_a = getOriginFromTransition(key, transition)) !== null && _a !== void 0 ? _a : (_b = visualElement.getValue(key)) === null || _b === void 0 ? void 0 : _b.get();
        }
        return origin;
    }

    var AnimationType;
    (function (AnimationType) {
        AnimationType["Animate"] = "animate";
        AnimationType["Hover"] = "whileHover";
        AnimationType["Tap"] = "whileTap";
        AnimationType["Drag"] = "whileDrag";
        AnimationType["Focus"] = "whileFocus";
        AnimationType["InView"] = "whileInView";
        AnimationType["Exit"] = "exit";
    })(AnimationType || (AnimationType = {}));

    var variantPriorityOrder = [
        AnimationType.Animate,
        AnimationType.InView,
        AnimationType.Focus,
        AnimationType.Hover,
        AnimationType.Tap,
        AnimationType.Drag,
        AnimationType.Exit,
    ];
    __spreadArray([], __read(variantPriorityOrder), false).reverse();
    variantPriorityOrder.length;

    var names = [
        "LayoutMeasure",
        "BeforeLayoutMeasure",
        "LayoutUpdate",
        "ViewportBoxUpdate",
        "Update",
        "Render",
        "AnimationComplete",
        "LayoutAnimationComplete",
        "AnimationStart",
        "SetAxisTarget",
        "Unmount",
    ];
    function createLifecycles() {
        var managers = names.map(function () { return new SubscriptionManager(); });
        var propSubscriptions = {};
        var lifecycles = {
            clearAllListeners: function () { return managers.forEach(function (manager) { return manager.clear(); }); },
            updatePropListeners: function (props) {
                names.forEach(function (name) {
                    var _a;
                    var on = "on" + name;
                    var propListener = props[on];
                    // Unsubscribe existing subscription
                    (_a = propSubscriptions[name]) === null || _a === void 0 ? void 0 : _a.call(propSubscriptions);
                    // Add new subscription
                    if (propListener) {
                        propSubscriptions[name] = lifecycles[on](propListener);
                    }
                });
            },
        };
        managers.forEach(function (manager, i) {
            lifecycles["on" + names[i]] = function (handler) { return manager.add(handler); };
            lifecycles["notify" + names[i]] = function () {
                var args = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    args[_i] = arguments[_i];
                }
                manager.notify.apply(manager, __spreadArray([], __read(args), false));
            };
        });
        return lifecycles;
    }

    function updateMotionValuesFromProps(element, next, prev) {
        var _a;
        for (var key in next) {
            var nextValue = next[key];
            var prevValue = prev[key];
            if (isMotionValue(nextValue)) {
                /**
                 * If this is a motion value found in props or style, we want to add it
                 * to our visual element's motion value map.
                 */
                element.addValue(key, nextValue);
            }
            else if (isMotionValue(prevValue)) {
                /**
                 * If we're swapping to a new motion value, create a new motion value
                 * from that
                 */
                element.addValue(key, motionValue(nextValue));
            }
            else if (prevValue !== nextValue) {
                /**
                 * If this is a flat value that has changed, update the motion value
                 * or create one if it doesn't exist. We only want to do this if we're
                 * not handling the value with our animation state.
                 */
                if (element.hasValue(key)) {
                    var existingValue = element.getValue(key);
                    // TODO: Only update values that aren't being animated or even looked at
                    !existingValue.hasAnimated && existingValue.set(nextValue);
                }
                else {
                    element.addValue(key, motionValue((_a = element.getStaticValue(key)) !== null && _a !== void 0 ? _a : nextValue));
                }
            }
        }
        // Handle removed values
        for (var key in prev) {
            if (next[key] === undefined)
                element.removeValue(key);
        }
        return next;
    }

    var visualElement = function (_a) {
        var _b = _a.treeType, treeType = _b === void 0 ? "" : _b, build = _a.build, getBaseTarget = _a.getBaseTarget, makeTargetAnimatable = _a.makeTargetAnimatable, measureViewportBox = _a.measureViewportBox, renderInstance = _a.render, readValueFromInstance = _a.readValueFromInstance, removeValueFromRenderState = _a.removeValueFromRenderState, sortNodePosition = _a.sortNodePosition, scrapeMotionValuesFromProps = _a.scrapeMotionValuesFromProps;
        return function (_a, options) {
            var parent = _a.parent, props = _a.props, presenceId = _a.presenceId, blockInitialAnimation = _a.blockInitialAnimation, visualState = _a.visualState;
            if (options === void 0) { options = {}; }
            var isMounted = false;
            var latestValues = visualState.latestValues, renderState = visualState.renderState;
            /**
             * The instance of the render-specific node that will be hydrated by the
             * exposed React ref. So for example, this visual element can host a
             * HTMLElement, plain object, or Three.js object. The functions provided
             * in VisualElementConfig allow us to interface with this instance.
             */
            var instance;
            /**
             * Manages the subscriptions for a visual element's lifecycle, for instance
             * onRender
             */
            var lifecycles = createLifecycles();
            /**
             * A map of all motion values attached to this visual element. Motion
             * values are source of truth for any given animated value. A motion
             * value might be provided externally by the component via props.
             */
            var values = new Map();
            /**
             * A map of every subscription that binds the provided or generated
             * motion values onChange listeners to this visual element.
             */
            var valueSubscriptions = new Map();
            /**
             * A reference to the previously-provided motion values as returned
             * from scrapeMotionValuesFromProps. We use the keys in here to determine
             * if any motion values need to be removed after props are updated.
             */
            var prevMotionValues = {};
            /**
             * When values are removed from all animation props we need to search
             * for a fallback value to animate to. These values are tracked in baseTarget.
             */
            var baseTarget = __assign({}, latestValues);
            // Internal methods ========================
            /**
             * On mount, this will be hydrated with a callback to disconnect
             * this visual element from its parent on unmount.
             */
            var removeFromVariantTree;
            /**
             * Render the element with the latest styles outside of the React
             * render lifecycle
             */
            function render() {
                if (!instance || !isMounted)
                    return;
                triggerBuild();
                renderInstance(instance, renderState, props.style, element.projection);
            }
            function triggerBuild() {
                build(element, renderState, latestValues, options, props);
            }
            function update() {
                lifecycles.notifyUpdate(latestValues);
            }
            /**
             *
             */
            function bindToMotionValue(key, value) {
                var removeOnChange = value.onChange(function (latestValue) {
                    latestValues[key] = latestValue;
                    props.onUpdate && sync.update(update, false, true);
                });
                var removeOnRenderRequest = value.onRenderRequest(element.scheduleRender);
                valueSubscriptions.set(key, function () {
                    removeOnChange();
                    removeOnRenderRequest();
                });
            }
            /**
             * Any motion values that are provided to the element when created
             * aren't yet bound to the element, as this would technically be impure.
             * However, we iterate through the motion values and set them to the
             * initial values for this component.
             *
             * TODO: This is impure and we should look at changing this to run on mount.
             * Doing so will break some tests but this isn't neccessarily a breaking change,
             * more a reflection of the test.
             */
            var initialMotionValues = scrapeMotionValuesFromProps(props);
            for (var key in initialMotionValues) {
                var value = initialMotionValues[key];
                if (latestValues[key] !== undefined && isMotionValue(value)) {
                    value.set(latestValues[key], false);
                }
            }
            /**
             * Determine what role this visual element should take in the variant tree.
             */
            var isControllingVariants = checkIfControllingVariants(props);
            var isVariantNode = checkIfVariantNode(props);
            var element = __assign(__assign({ treeType: treeType, 
                /**
                 * This is a mirror of the internal instance prop, which keeps
                 * VisualElement type-compatible with React's RefObject.
                 */
                current: null, 
                /**
                 * The depth of this visual element within the visual element tree.
                 */
                depth: parent ? parent.depth + 1 : 0, parent: parent, children: new Set(), 
                /**
                 *
                 */
                presenceId: presenceId, 
                /**
                 * If this component is part of the variant tree, it should track
                 * any children that are also part of the tree. This is essentially
                 * a shadow tree to simplify logic around how to stagger over children.
                 */
                variantChildren: isVariantNode ? new Set() : undefined, 
                /**
                 * Whether this instance is visible. This can be changed imperatively
                 * by the projection tree, is analogous to CSS's visibility in that
                 * hidden elements should take up layout, and needs enacting by the configured
                 * render function.
                 */
                isVisible: undefined, 
                /**
                 * Normally, if a component is controlled by a parent's variants, it can
                 * rely on that ancestor to trigger animations further down the tree.
                 * However, if a component is created after its parent is mounted, the parent
                 * won't trigger that mount animation so the child needs to.
                 *
                 * TODO: This might be better replaced with a method isParentMounted
                 */
                manuallyAnimateOnMount: Boolean(parent === null || parent === void 0 ? void 0 : parent.isMounted()), 
                /**
                 * This can be set by AnimatePresence to force components that mount
                 * at the same time as it to mount as if they have initial={false} set.
                 */
                blockInitialAnimation: blockInitialAnimation, 
                /**
                 * Determine whether this component has mounted yet. This is mostly used
                 * by variant children to determine whether they need to trigger their
                 * own animations on mount.
                 */
                isMounted: function () { return Boolean(instance); }, mount: function (newInstance) {
                    isMounted = true;
                    instance = element.current = newInstance;
                    if (element.projection) {
                        element.projection.mount(newInstance);
                    }
                    if (isVariantNode && parent && !isControllingVariants) {
                        removeFromVariantTree = parent === null || parent === void 0 ? void 0 : parent.addVariantChild(element);
                    }
                    parent === null || parent === void 0 ? void 0 : parent.children.add(element);
                    element.setProps(props);
                }, 
                /**
                 *
                 */
                unmount: function () {
                    var _a;
                    (_a = element.projection) === null || _a === void 0 ? void 0 : _a.unmount();
                    cancelSync.update(update);
                    cancelSync.render(render);
                    valueSubscriptions.forEach(function (remove) { return remove(); });
                    removeFromVariantTree === null || removeFromVariantTree === void 0 ? void 0 : removeFromVariantTree();
                    parent === null || parent === void 0 ? void 0 : parent.children.delete(element);
                    lifecycles.clearAllListeners();
                    instance = undefined;
                    isMounted = false;
                }, 
                /**
                 * Add a child visual element to our set of children.
                 */
                addVariantChild: function (child) {
                    var _a;
                    var closestVariantNode = element.getClosestVariantNode();
                    if (closestVariantNode) {
                        (_a = closestVariantNode.variantChildren) === null || _a === void 0 ? void 0 : _a.add(child);
                        return function () {
                            return closestVariantNode.variantChildren.delete(child);
                        };
                    }
                }, sortNodePosition: function (other) {
                    /**
                     * If these nodes aren't even of the same type we can't compare their depth.
                     */
                    if (!sortNodePosition || treeType !== other.treeType)
                        return 0;
                    return sortNodePosition(element.getInstance(), other.getInstance());
                }, 
                /**
                 * Returns the closest variant node in the tree starting from
                 * this visual element.
                 */
                getClosestVariantNode: function () {
                    return isVariantNode ? element : parent === null || parent === void 0 ? void 0 : parent.getClosestVariantNode();
                }, 
                /**
                 * Expose the latest layoutId prop.
                 */
                getLayoutId: function () { return props.layoutId; }, 
                /**
                 * Returns the current instance.
                 */
                getInstance: function () { return instance; }, 
                /**
                 * Get/set the latest static values.
                 */
                getStaticValue: function (key) { return latestValues[key]; }, setStaticValue: function (key, value) { return (latestValues[key] = value); }, 
                /**
                 * Returns the latest motion value state. Currently only used to take
                 * a snapshot of the visual element - perhaps this can return the whole
                 * visual state
                 */
                getLatestValues: function () { return latestValues; }, 
                /**
                 * Set the visiblity of the visual element. If it's changed, schedule
                 * a render to reflect these changes.
                 */
                setVisibility: function (visibility) {
                    if (element.isVisible === visibility)
                        return;
                    element.isVisible = visibility;
                    element.scheduleRender();
                }, 
                /**
                 * Make a target animatable by Popmotion. For instance, if we're
                 * trying to animate width from 100px to 100vw we need to measure 100vw
                 * in pixels to determine what we really need to animate to. This is also
                 * pluggable to support Framer's custom value types like Color,
                 * and CSS variables.
                 */
                makeTargetAnimatable: function (target, canMutate) {
                    if (canMutate === void 0) { canMutate = true; }
                    return makeTargetAnimatable(element, target, props, canMutate);
                }, 
                /**
                 * Measure the current viewport box with or without transforms.
                 * Only measures axis-aligned boxes, rotate and skew must be manually
                 * removed with a re-render to work.
                 */
                measureViewportBox: function () {
                    return measureViewportBox(instance, props);
                }, 
                // Motion values ========================
                /**
                 * Add a motion value and bind it to this visual element.
                 */
                addValue: function (key, value) {
                    // Remove existing value if it exists
                    if (element.hasValue(key))
                        element.removeValue(key);
                    values.set(key, value);
                    latestValues[key] = value.get();
                    bindToMotionValue(key, value);
                }, 
                /**
                 * Remove a motion value and unbind any active subscriptions.
                 */
                removeValue: function (key) {
                    var _a;
                    values.delete(key);
                    (_a = valueSubscriptions.get(key)) === null || _a === void 0 ? void 0 : _a();
                    valueSubscriptions.delete(key);
                    delete latestValues[key];
                    removeValueFromRenderState(key, renderState);
                }, 
                /**
                 * Check whether we have a motion value for this key
                 */
                hasValue: function (key) { return values.has(key); }, 
                /**
                 * Get a motion value for this key. If called with a default
                 * value, we'll create one if none exists.
                 */
                getValue: function (key, defaultValue) {
                    var value = values.get(key);
                    if (value === undefined && defaultValue !== undefined) {
                        value = motionValue(defaultValue);
                        element.addValue(key, value);
                    }
                    return value;
                }, 
                /**
                 * Iterate over our motion values.
                 */
                forEachValue: function (callback) { return values.forEach(callback); }, 
                /**
                 * If we're trying to animate to a previously unencountered value,
                 * we need to check for it in our state and as a last resort read it
                 * directly from the instance (which might have performance implications).
                 */
                readValue: function (key) {
                    var _a;
                    return (_a = latestValues[key]) !== null && _a !== void 0 ? _a : readValueFromInstance(instance, key, options);
                }, 
                /**
                 * Set the base target to later animate back to. This is currently
                 * only hydrated on creation and when we first read a value.
                 */
                setBaseTarget: function (key, value) {
                    baseTarget[key] = value;
                }, 
                /**
                 * Find the base target for a value thats been removed from all animation
                 * props.
                 */
                getBaseTarget: function (key) {
                    if (getBaseTarget) {
                        var target = getBaseTarget(props, key);
                        if (target !== undefined && !isMotionValue(target))
                            return target;
                    }
                    return baseTarget[key];
                } }, lifecycles), { 
                /**
                 * Build the renderer state based on the latest visual state.
                 */
                build: function () {
                    triggerBuild();
                    return renderState;
                }, 
                /**
                 * Schedule a render on the next animation frame.
                 */
                scheduleRender: function () {
                    sync.render(render, false, true);
                }, 
                /**
                 * Synchronously fire render. It's prefered that we batch renders but
                 * in many circumstances, like layout measurement, we need to run this
                 * synchronously. However in those instances other measures should be taken
                 * to batch reads/writes.
                 */
                syncRender: render, 
                /**
                 * Update the provided props. Ensure any newly-added motion values are
                 * added to our map, old ones removed, and listeners updated.
                 */
                setProps: function (newProps) {
                    props = newProps;
                    lifecycles.updatePropListeners(newProps);
                    prevMotionValues = updateMotionValuesFromProps(element, scrapeMotionValuesFromProps(props), prevMotionValues);
                }, getProps: function () { return props; }, 
                // Variants ==============================
                /**
                 * Returns the variant definition with a given name.
                 */
                getVariant: function (name) { var _a; return (_a = props.variants) === null || _a === void 0 ? void 0 : _a[name]; }, 
                /**
                 * Returns the defined default transition on this component.
                 */
                getDefaultTransition: function () { return props.transition; }, getTransformPagePoint: function () {
                    return props.transformPagePoint;
                }, 
                /**
                 * Used by child variant nodes to get the closest ancestor variant props.
                 */
                getVariantContext: function (startAtParent) {
                    if (startAtParent === void 0) { startAtParent = false; }
                    if (startAtParent)
                        return parent === null || parent === void 0 ? void 0 : parent.getVariantContext();
                    if (!isControllingVariants) {
                        var context_1 = (parent === null || parent === void 0 ? void 0 : parent.getVariantContext()) || {};
                        if (props.initial !== undefined) {
                            context_1.initial = props.initial;
                        }
                        return context_1;
                    }
                    var context = {};
                    for (var i = 0; i < numVariantProps; i++) {
                        var name_1 = variantProps[i];
                        var prop = props[name_1];
                        if (isVariantLabel(prop) || prop === false) {
                            context[name_1] = prop;
                        }
                    }
                    return context;
                } });
            return element;
        };
    };
    var variantProps = __spreadArray(["initial"], __read(variantPriorityOrder), false);
    var numVariantProps = variantProps.length;

    /**
     * Returns true if the provided key is a CSS variable
     */
    function isCSSVariable(key) {
        return key.startsWith("--");
    }

    /**
     * Provided a value and a ValueType, returns the value as that value type.
     */
    var getValueAsType = function (value, type) {
        return type && typeof value === "number"
            ? type.transform(value)
            : value;
    };

    function buildHTMLStyles(state, latestValues, options, transformTemplate) {
        var _a;
        var style = state.style, vars = state.vars, transform = state.transform, transformKeys = state.transformKeys, transformOrigin = state.transformOrigin;
        // Empty the transformKeys array. As we're throwing out refs to its items
        // this might not be as cheap as suspected. Maybe using the array as a buffer
        // with a manual incrementation would be better.
        transformKeys.length = 0;
        // Track whether we encounter any transform or transformOrigin values.
        var hasTransform = false;
        var hasTransformOrigin = false;
        // Does the calculated transform essentially equal "none"?
        var transformIsNone = true;
        /**
         * Loop over all our latest animated values and decide whether to handle them
         * as a style or CSS variable.
         *
         * Transforms and transform origins are kept seperately for further processing.
         */
        for (var key in latestValues) {
            var value = latestValues[key];
            /**
             * If this is a CSS variable we don't do any further processing.
             */
            if (isCSSVariable(key)) {
                vars[key] = value;
                continue;
            }
            // Convert the value to its default value type, ie 0 -> "0px"
            var valueType = numberValueTypes[key];
            var valueAsType = getValueAsType(value, valueType);
            if (isTransformProp(key)) {
                // If this is a transform, flag to enable further transform processing
                hasTransform = true;
                transform[key] = valueAsType;
                transformKeys.push(key);
                // If we already know we have a non-default transform, early return
                if (!transformIsNone)
                    continue;
                // Otherwise check to see if this is a default transform
                if (value !== ((_a = valueType.default) !== null && _a !== void 0 ? _a : 0))
                    transformIsNone = false;
            }
            else if (isTransformOriginProp(key)) {
                transformOrigin[key] = valueAsType;
                // If this is a transform origin, flag and enable further transform-origin processing
                hasTransformOrigin = true;
            }
            else {
                style[key] = valueAsType;
            }
        }
        if (hasTransform) {
            style.transform = buildTransform(state, options, transformIsNone, transformTemplate);
        }
        else if (transformTemplate) {
            style.transform = transformTemplate({}, "");
        }
        if (hasTransformOrigin) {
            style.transformOrigin = buildTransformOrigin(transformOrigin);
        }
    }

    var positionalKeys = new Set([
        "width",
        "height",
        "top",
        "left",
        "right",
        "bottom",
        "x",
        "y",
    ]);
    var isPositionalKey = function (key) { return positionalKeys.has(key); };
    var hasPositionalKey = function (target) {
        return Object.keys(target).some(isPositionalKey);
    };
    var setAndResetVelocity = function (value, to) {
        // Looks odd but setting it twice doesn't render, it'll just
        // set both prev and current to the latest value
        value.set(to, false);
        value.set(to);
    };
    var isNumOrPxType = function (v) {
        return v === number || v === px;
    };
    var BoundingBoxDimension;
    (function (BoundingBoxDimension) {
        BoundingBoxDimension["width"] = "width";
        BoundingBoxDimension["height"] = "height";
        BoundingBoxDimension["left"] = "left";
        BoundingBoxDimension["right"] = "right";
        BoundingBoxDimension["top"] = "top";
        BoundingBoxDimension["bottom"] = "bottom";
    })(BoundingBoxDimension || (BoundingBoxDimension = {}));
    var getPosFromMatrix = function (matrix, pos) {
        return parseFloat(matrix.split(", ")[pos]);
    };
    var getTranslateFromMatrix = function (pos2, pos3) {
        return function (_bbox, _a) {
            var transform = _a.transform;
            if (transform === "none" || !transform)
                return 0;
            var matrix3d = transform.match(/^matrix3d\((.+)\)$/);
            if (matrix3d) {
                return getPosFromMatrix(matrix3d[1], pos3);
            }
            else {
                var matrix = transform.match(/^matrix\((.+)\)$/);
                if (matrix) {
                    return getPosFromMatrix(matrix[1], pos2);
                }
                else {
                    return 0;
                }
            }
        };
    };
    var transformKeys = new Set(["x", "y", "z"]);
    var nonTranslationalTransformKeys = transformProps.filter(function (key) { return !transformKeys.has(key); });
    function removeNonTranslationalTransform(visualElement) {
        var removedTransforms = [];
        nonTranslationalTransformKeys.forEach(function (key) {
            var value = visualElement.getValue(key);
            if (value !== undefined) {
                removedTransforms.push([key, value.get()]);
                value.set(key.startsWith("scale") ? 1 : 0);
            }
        });
        // Apply changes to element before measurement
        if (removedTransforms.length)
            visualElement.syncRender();
        return removedTransforms;
    }
    var positionalValues = {
        // Dimensions
        width: function (_a, _b) {
            var x = _a.x;
            var _c = _b.paddingLeft, paddingLeft = _c === void 0 ? "0" : _c, _d = _b.paddingRight, paddingRight = _d === void 0 ? "0" : _d;
            return x.max - x.min - parseFloat(paddingLeft) - parseFloat(paddingRight);
        },
        height: function (_a, _b) {
            var y = _a.y;
            var _c = _b.paddingTop, paddingTop = _c === void 0 ? "0" : _c, _d = _b.paddingBottom, paddingBottom = _d === void 0 ? "0" : _d;
            return y.max - y.min - parseFloat(paddingTop) - parseFloat(paddingBottom);
        },
        top: function (_bbox, _a) {
            var top = _a.top;
            return parseFloat(top);
        },
        left: function (_bbox, _a) {
            var left = _a.left;
            return parseFloat(left);
        },
        bottom: function (_a, _b) {
            var y = _a.y;
            var top = _b.top;
            return parseFloat(top) + (y.max - y.min);
        },
        right: function (_a, _b) {
            var x = _a.x;
            var left = _b.left;
            return parseFloat(left) + (x.max - x.min);
        },
        // Transform
        x: getTranslateFromMatrix(4, 13),
        y: getTranslateFromMatrix(5, 14),
    };
    var convertChangedValueTypes = function (target, visualElement, changedKeys) {
        var originBbox = visualElement.measureViewportBox();
        var element = visualElement.getInstance();
        var elementComputedStyle = getComputedStyle(element);
        var display = elementComputedStyle.display;
        var origin = {};
        // If the element is currently set to display: "none", make it visible before
        // measuring the target bounding box
        if (display === "none") {
            visualElement.setStaticValue("display", target.display || "block");
        }
        /**
         * Record origins before we render and update styles
         */
        changedKeys.forEach(function (key) {
            origin[key] = positionalValues[key](originBbox, elementComputedStyle);
        });
        // Apply the latest values (as set in checkAndConvertChangedValueTypes)
        visualElement.syncRender();
        var targetBbox = visualElement.measureViewportBox();
        changedKeys.forEach(function (key) {
            // Restore styles to their **calculated computed style**, not their actual
            // originally set style. This allows us to animate between equivalent pixel units.
            var value = visualElement.getValue(key);
            setAndResetVelocity(value, origin[key]);
            target[key] = positionalValues[key](targetBbox, elementComputedStyle);
        });
        return target;
    };
    var checkAndConvertChangedValueTypes = function (visualElement, target, origin, transitionEnd) {
        if (origin === void 0) { origin = {}; }
        if (transitionEnd === void 0) { transitionEnd = {}; }
        target = __assign({}, target);
        transitionEnd = __assign({}, transitionEnd);
        var targetPositionalKeys = Object.keys(target).filter(isPositionalKey);
        // We want to remove any transform values that could affect the element's bounding box before
        // it's measured. We'll reapply these later.
        var removedTransformValues = [];
        var hasAttemptedToRemoveTransformValues = false;
        var changedValueTypeKeys = [];
        targetPositionalKeys.forEach(function (key) {
            var value = visualElement.getValue(key);
            if (!visualElement.hasValue(key))
                return;
            var from = origin[key];
            var fromType = findDimensionValueType(from);
            var to = target[key];
            var toType;
            // TODO: The current implementation of this basically throws an error
            // if you try and do value conversion via keyframes. There's probably
            // a way of doing this but the performance implications would need greater scrutiny,
            // as it'd be doing multiple resize-remeasure operations.
            if (isKeyframesTarget(to)) {
                var numKeyframes = to.length;
                var fromIndex = to[0] === null ? 1 : 0;
                from = to[fromIndex];
                fromType = findDimensionValueType(from);
                for (var i = fromIndex; i < numKeyframes; i++) {
                    if (!toType) {
                        toType = findDimensionValueType(to[i]);
                        invariant(toType === fromType ||
                            (isNumOrPxType(fromType) && isNumOrPxType(toType)), "Keyframes must be of the same dimension as the current value");
                    }
                    else {
                        invariant(findDimensionValueType(to[i]) === toType, "All keyframes must be of the same type");
                    }
                }
            }
            else {
                toType = findDimensionValueType(to);
            }
            if (fromType !== toType) {
                // If they're both just number or px, convert them both to numbers rather than
                // relying on resize/remeasure to convert (which is wasteful in this situation)
                if (isNumOrPxType(fromType) && isNumOrPxType(toType)) {
                    var current = value.get();
                    if (typeof current === "string") {
                        value.set(parseFloat(current));
                    }
                    if (typeof to === "string") {
                        target[key] = parseFloat(to);
                    }
                    else if (Array.isArray(to) && toType === px) {
                        target[key] = to.map(parseFloat);
                    }
                }
                else if ((fromType === null || fromType === void 0 ? void 0 : fromType.transform) &&
                    (toType === null || toType === void 0 ? void 0 : toType.transform) &&
                    (from === 0 || to === 0)) {
                    // If one or the other value is 0, it's safe to coerce it to the
                    // type of the other without measurement
                    if (from === 0) {
                        value.set(toType.transform(from));
                    }
                    else {
                        target[key] = fromType.transform(to);
                    }
                }
                else {
                    // If we're going to do value conversion via DOM measurements, we first
                    // need to remove non-positional transform values that could affect the bbox measurements.
                    if (!hasAttemptedToRemoveTransformValues) {
                        removedTransformValues =
                            removeNonTranslationalTransform(visualElement);
                        hasAttemptedToRemoveTransformValues = true;
                    }
                    changedValueTypeKeys.push(key);
                    transitionEnd[key] =
                        transitionEnd[key] !== undefined
                            ? transitionEnd[key]
                            : target[key];
                    setAndResetVelocity(value, to);
                }
            }
        });
        if (changedValueTypeKeys.length) {
            var convertedTarget = convertChangedValueTypes(target, visualElement, changedValueTypeKeys);
            // If we removed transform values, reapply them before the next render
            if (removedTransformValues.length) {
                removedTransformValues.forEach(function (_a) {
                    var _b = __read(_a, 2), key = _b[0], value = _b[1];
                    visualElement.getValue(key).set(value);
                });
            }
            // Reapply original values
            visualElement.syncRender();
            return { target: convertedTarget, transitionEnd: transitionEnd };
        }
        else {
            return { target: target, transitionEnd: transitionEnd };
        }
    };
    /**
     * Convert value types for x/y/width/height/top/left/bottom/right
     *
     * Allows animation between `'auto'` -> `'100%'` or `0` -> `'calc(50% - 10vw)'`
     *
     * @internal
     */
    function unitConversion(visualElement, target, origin, transitionEnd) {
        return hasPositionalKey(target)
            ? checkAndConvertChangedValueTypes(visualElement, target, origin, transitionEnd)
            : { target: target, transitionEnd: transitionEnd };
    }

    /**
     * Parse a DOM variant to make it animatable. This involves resolving CSS variables
     * and ensuring animations like "20%" => "calc(50vw)" are performed in pixels.
     */
    var parseDomVariant = function (visualElement, target, origin, transitionEnd) {
        var resolved = resolveCSSVariables(visualElement, target, transitionEnd);
        target = resolved.target;
        transitionEnd = resolved.transitionEnd;
        return unitConversion(visualElement, target, origin, transitionEnd);
    };

    function isForcedMotionValue(key, _a) {
        var layout = _a.layout, layoutId = _a.layoutId;
        return (isTransformProp(key) ||
            isTransformOriginProp(key) ||
            ((layout || layoutId !== undefined) &&
                (!!scaleCorrectors[key] || key === "opacity")));
    }

    function scrapeMotionValuesFromProps(props) {
        var style = props.style;
        var newValues = {};
        for (var key in style) {
            if (isMotionValue(style[key]) || isForcedMotionValue(key, props)) {
                newValues[key] = style[key];
            }
        }
        return newValues;
    }

    function renderHTML(element, _a, styleProp, projection) {
        var style = _a.style, vars = _a.vars;
        Object.assign(element.style, style, projection && projection.getProjectionStyles(styleProp));
        // Loop over any CSS variables and assign those.
        for (var key in vars) {
            element.style.setProperty(key, vars[key]);
        }
    }

    /**
     * Bounding boxes tend to be defined as top, left, right, bottom. For various operations
     * it's easier to consider each axis individually. This function returns a bounding box
     * as a map of single-axis min/max values.
     */
    function convertBoundingBoxToBox(_a) {
        var top = _a.top, left = _a.left, right = _a.right, bottom = _a.bottom;
        return {
            x: { min: left, max: right },
            y: { min: top, max: bottom },
        };
    }
    /**
     * Applies a TransformPoint function to a bounding box. TransformPoint is usually a function
     * provided by Framer to allow measured points to be corrected for device scaling. This is used
     * when measuring DOM elements and DOM event points.
     */
    function transformBoxPoints(point, transformPoint) {
        if (!transformPoint)
            return point;
        var topLeft = transformPoint({ x: point.left, y: point.top });
        var bottomRight = transformPoint({ x: point.right, y: point.bottom });
        return {
            top: topLeft.y,
            left: topLeft.x,
            bottom: bottomRight.y,
            right: bottomRight.x,
        };
    }

    function measureViewportBox(instance, transformPoint) {
        return convertBoundingBoxToBox(transformBoxPoints(instance.getBoundingClientRect(), transformPoint));
    }

    function getComputedStyle$1(element) {
        return window.getComputedStyle(element);
    }
    var htmlConfig = {
        treeType: "dom",
        readValueFromInstance: function (domElement, key) {
            if (isTransformProp(key)) {
                var defaultType = getDefaultValueType(key);
                return defaultType ? defaultType.default || 0 : 0;
            }
            else {
                var computedStyle = getComputedStyle$1(domElement);
                return ((isCSSVariable(key)
                    ? computedStyle.getPropertyValue(key)
                    : computedStyle[key]) || 0);
            }
        },
        sortNodePosition: function (a, b) {
            /**
             * compareDocumentPosition returns a bitmask, by using the bitwise &
             * we're returning true if 2 in that bitmask is set to true. 2 is set
             * to true if b preceeds a.
             */
            return a.compareDocumentPosition(b) & 2 ? 1 : -1;
        },
        getBaseTarget: function (props, key) {
            var _a;
            return (_a = props.style) === null || _a === void 0 ? void 0 : _a[key];
        },
        measureViewportBox: function (element, _a) {
            var transformPagePoint = _a.transformPagePoint;
            return measureViewportBox(element, transformPagePoint);
        },
        /**
         * Reset the transform on the current Element. This is called as part
         * of a batched process across the entire layout tree. To remove this write
         * cycle it'd be interesting to see if it's possible to "undo" all the current
         * layout transforms up the tree in the same way this.getBoundingBoxWithoutTransforms
         * works
         */
        resetTransform: function (element, domElement, props) {
            var transformTemplate = props.transformTemplate;
            domElement.style.transform = transformTemplate
                ? transformTemplate({}, "")
                : "none";
            // Ensure that whatever happens next, we restore our transform on the next frame
            element.scheduleRender();
        },
        restoreTransform: function (instance, mutableState) {
            instance.style.transform = mutableState.style.transform;
        },
        removeValueFromRenderState: function (key, _a) {
            var vars = _a.vars, style = _a.style;
            delete vars[key];
            delete style[key];
        },
        /**
         * Ensure that HTML and Framer-specific value types like `px`->`%` and `Color`
         * can be animated by Motion.
         */
        makeTargetAnimatable: function (element, _a, _b, isMounted) {
            var transformValues = _b.transformValues;
            if (isMounted === void 0) { isMounted = true; }
            var transition = _a.transition, transitionEnd = _a.transitionEnd, target = __rest(_a, ["transition", "transitionEnd"]);
            var origin = getOrigin(target, transition || {}, element);
            /**
             * If Framer has provided a function to convert `Color` etc value types, convert them
             */
            if (transformValues) {
                if (transitionEnd)
                    transitionEnd = transformValues(transitionEnd);
                if (target)
                    target = transformValues(target);
                if (origin)
                    origin = transformValues(origin);
            }
            if (isMounted) {
                checkTargetForNewValues(element, target, origin);
                var parsed = parseDomVariant(element, target, origin, transitionEnd);
                transitionEnd = parsed.transitionEnd;
                target = parsed.target;
            }
            return __assign({ transition: transition, transitionEnd: transitionEnd }, target);
        },
        scrapeMotionValuesFromProps: scrapeMotionValuesFromProps,
        build: function (element, renderState, latestValues, options, props) {
            if (element.isVisible !== undefined) {
                renderState.style.visibility = element.isVisible
                    ? "visible"
                    : "hidden";
            }
            buildHTMLStyles(renderState, latestValues, options, props.transformTemplate);
        },
        render: renderHTML,
    };
    var htmlVisualElement = visualElement(htmlConfig);

    exports.HTMLProjectionNode = HTMLProjectionNode;
    exports.addScaleCorrector = addScaleCorrector;
    exports.animate = animate$1;
    exports.buildTransform = buildTransform;
    exports.calcBoxDelta = calcBoxDelta;
    exports.correctBorderRadius = correctBorderRadius;
    exports.correctBoxShadow = correctBoxShadow;
    exports.htmlVisualElement = htmlVisualElement;
    exports.mix = mix;
    exports.nodeGroup = nodeGroup;
    exports.sync = sync;

    Object.defineProperty(exports, '__esModule', { value: true });

}));
