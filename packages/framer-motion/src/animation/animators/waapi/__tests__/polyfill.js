// Copyright 2014 Google Inc. All rights reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
//     You may obtain a copy of the License at
//
// http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
//     See the License for the specific language governing permissions and
// limitations under the License.

/**
 * This is an edited version of the WAAPI polyfill
 * that adds support for value and offset arrays.
 */

!(function () {
    var a = {},
        b = {}
    !(function (a, b) {
        function c(a) {
            if ("number" == typeof a) return a
            var b = {}
            for (var c in a) b[c] = a[c]
            return b
        }
        function d() {
            ;(this._delay = 0),
                (this._endDelay = 0),
                (this._fill = "none"),
                (this._iterationStart = 0),
                (this._iterations = 1),
                (this._duration = 0),
                (this._playbackRate = 1),
                (this._direction = "normal"),
                (this._easing = "linear"),
                (this._easingFunction = x)
        }
        function e() {
            return a.isDeprecated(
                "Invalid timing inputs",
                "2016-03-02",
                "TypeError exceptions will be thrown instead.",
                !0
            )
        }
        function f(b, c, e) {
            var f = new d()
            return (
                c && ((f.fill = "both"), (f.duration = "auto")),
                "number" != typeof b || isNaN(b)
                    ? void 0 !== b &&
                      Object.getOwnPropertyNames(b).forEach(function (c) {
                          if ("auto" != b[c]) {
                              if (
                                  ("number" == typeof f[c] ||
                                      "duration" == c) &&
                                  ("number" != typeof b[c] || isNaN(b[c]))
                              )
                                  return
                              if ("fill" == c && -1 == v.indexOf(b[c])) return
                              if ("direction" == c && -1 == w.indexOf(b[c]))
                                  return
                              if (
                                  "playbackRate" == c &&
                                  1 !== b[c] &&
                                  a.isDeprecated(
                                      "AnimationEffectTiming.playbackRate",
                                      "2014-11-28",
                                      "Use Animation.playbackRate instead."
                                  )
                              )
                                  return
                              f[c] = b[c]
                          }
                      })
                    : (f.duration = b),
                f
            )
        }
        function g(a) {
            return (
                "number" == typeof a &&
                    (a = isNaN(a) ? { duration: 0 } : { duration: a }),
                a
            )
        }
        function h(b, c) {
            return (b = a.numericTimingToObject(b)), f(b, c)
        }
        function i(a, b, c, d) {
            return a < 0 || a > 1 || c < 0 || c > 1
                ? x
                : function (e) {
                      function f(a, b, c) {
                          return (
                              3 * a * (1 - c) * (1 - c) * c +
                              3 * b * (1 - c) * c * c +
                              c * c * c
                          )
                      }
                      if (e <= 0) {
                          var g = 0
                          return (
                              a > 0 ? (g = b / a) : !b && c > 0 && (g = d / c),
                              g * e
                          )
                      }
                      if (e >= 1) {
                          var h = 0
                          return (
                              c < 1
                                  ? (h = (d - 1) / (c - 1))
                                  : 1 == c && a < 1 && (h = (b - 1) / (a - 1)),
                              1 + h * (e - 1)
                          )
                      }
                      for (var i = 0, j = 1; i < j; ) {
                          var k = (i + j) / 2,
                              l = f(a, c, k)
                          if (Math.abs(e - l) < 1e-5) return f(b, d, k)
                          l < e ? (i = k) : (j = k)
                      }
                      return f(b, d, k)
                  }
        }
        function j(a, b) {
            return function (c) {
                if (c >= 1) return 1
                var d = 1 / a
                return (c += b * d) - (c % d)
            }
        }
        function k(a) {
            C || (C = document.createElement("div").style),
                (C.animationTimingFunction = ""),
                (C.animationTimingFunction = a)
            var b = C.animationTimingFunction
            if ("" == b && e())
                throw new TypeError(a + " is not a valid value for easing")
            return b
        }
        function l(a) {
            if ("linear" == a) return x
            var b = E.exec(a)
            if (b) return i.apply(this, b.slice(1).map(Number))
            var c = F.exec(a)
            if (c) return j(Number(c[1]), A)
            var d = G.exec(a)
            return d
                ? j(Number(d[1]), { start: y, middle: z, end: A }[d[2]])
                : B[a] || x
        }
        function m(a) {
            return Math.abs(n(a) / a.playbackRate)
        }
        function n(a) {
            return 0 === a.duration || 0 === a.iterations
                ? 0
                : a.duration * a.iterations
        }
        function o(a, b, c) {
            if (null == b) return H
            var d = c.delay + a + c.endDelay
            return b < Math.min(c.delay, d)
                ? I
                : b >= Math.min(c.delay + a, d)
                ? J
                : K
        }
        function p(a, b, c, d, e) {
            switch (d) {
                case I:
                    return "backwards" == b || "both" == b ? 0 : null
                case K:
                    return c - e
                case J:
                    return "forwards" == b || "both" == b ? a : null
                case H:
                    return null
            }
        }
        function q(a, b, c, d, e) {
            var f = e
            return 0 === a ? b !== I && (f += c) : (f += d / a), f
        }
        function r(a, b, c, d, e, f) {
            var g = a === 1 / 0 ? b % 1 : a % 1
            return (
                0 !== g ||
                    c !== J ||
                    0 === d ||
                    (0 === e && 0 !== f) ||
                    (g = 1),
                g
            )
        }
        function s(a, b, c, d) {
            return a === J && b === 1 / 0
                ? 1 / 0
                : 1 === c
                ? Math.floor(d) - 1
                : Math.floor(d)
        }
        function t(a, b, c) {
            var d = a
            if ("normal" !== a && "reverse" !== a) {
                var e = b
                "alternate-reverse" === a && (e += 1),
                    (d = "normal"),
                    e !== 1 / 0 && e % 2 != 0 && (d = "reverse")
            }
            return "normal" === d ? c : 1 - c
        }
        function u(a, b, c) {
            var d = o(a, b, c),
                e = p(a, c.fill, b, d, c.delay)
            if (null === e) return null
            var f = q(c.duration, d, c.iterations, e, c.iterationStart),
                g = r(f, c.iterationStart, d, c.iterations, e, c.duration),
                h = s(d, c.iterations, g, f),
                i = t(c.direction, h, g)
            return c._easingFunction(i)
        }
        var v = "backwards|forwards|both|none".split("|"),
            w = "reverse|alternate|alternate-reverse".split("|"),
            x = function (a) {
                return a
            }
        d.prototype = {
            _setMember: function (b, c) {
                ;(this["_" + b] = c),
                    this._effect &&
                        ((this._effect._timingInput[b] = c),
                        (this._effect._timing = a.normalizeTimingInput(
                            this._effect._timingInput
                        )),
                        (this._effect.activeDuration =
                            a.calculateActiveDuration(this._effect._timing)),
                        this._effect._animation &&
                            this._effect._animation._rebuildUnderlyingAnimation())
            },
            get playbackRate() {
                return this._playbackRate
            },
            set delay(a) {
                this._setMember("delay", a)
            },
            get delay() {
                return this._delay
            },
            set endDelay(a) {
                this._setMember("endDelay", a)
            },
            get endDelay() {
                return this._endDelay
            },
            set fill(a) {
                this._setMember("fill", a)
            },
            get fill() {
                return this._fill
            },
            set iterationStart(a) {
                if ((isNaN(a) || a < 0) && e())
                    throw new TypeError(
                        "iterationStart must be a non-negative number, received: " +
                            a
                    )
                this._setMember("iterationStart", a)
            },
            get iterationStart() {
                return this._iterationStart
            },
            set duration(a) {
                if ("auto" != a && (isNaN(a) || a < 0) && e())
                    throw new TypeError(
                        "duration must be non-negative or auto, received: " + a
                    )
                this._setMember("duration", a)
            },
            get duration() {
                return this._duration
            },
            set direction(a) {
                this._setMember("direction", a)
            },
            get direction() {
                return this._direction
            },
            set easing(a) {
                ;(this._easingFunction = l(k(a))), this._setMember("easing", a)
            },
            get easing() {
                return this._easing
            },
            set iterations(a) {
                if ((isNaN(a) || a < 0) && e())
                    throw new TypeError(
                        "iterations must be non-negative, received: " + a
                    )
                this._setMember("iterations", a)
            },
            get iterations() {
                return this._iterations
            },
        }
        var y = 1,
            z = 0.5,
            A = 0,
            B = {
                ease: i(0.25, 0.1, 0.25, 1),
                "ease-in": i(0.42, 0, 1, 1),
                "ease-out": i(0, 0, 0.58, 1),
                "ease-in-out": i(0.42, 0, 0.58, 1),
                "step-start": j(1, y),
                "step-middle": j(1, z),
                "step-end": j(1, A),
            },
            C = null,
            D = "\\s*(-?\\d+\\.?\\d*|-?\\.\\d+)\\s*",
            E = new RegExp(
                "cubic-bezier\\(" + D + "," + D + "," + D + "," + D + "\\)"
            ),
            F = /steps\(\s*(\d+)\s*\)/,
            G = /steps\(\s*(\d+)\s*,\s*(start|middle|end)\s*\)/,
            H = 0,
            I = 1,
            J = 2,
            K = 3
        ;(a.cloneTimingInput = c),
            (a.makeTiming = f),
            (a.numericTimingToObject = g),
            (a.normalizeTimingInput = h),
            (a.calculateActiveDuration = m),
            (a.calculateIterationProgress = u),
            (a.calculatePhase = o),
            (a.normalizeEasing = k),
            (a.parseEasingFunction = l)
    })(a),
        (function (a, b) {
            function c(a, b) {
                return a in k ? k[a][b] || b : b
            }
            function d(a) {
                return (
                    "display" === a ||
                    0 === a.lastIndexOf("animation", 0) ||
                    0 === a.lastIndexOf("transition", 0)
                )
            }
            function e(a, b, e) {
                if (!d(a)) {
                    var f = h[a]
                    if (f) {
                        i.style[a] = b
                        for (var g in f) {
                            var j = f[g],
                                k = i.style[j]
                            e[j] = c(j, k)
                        }
                    } else e[a] = c(a, b)
                }
            }
            function f(a) {
                var b = []
                for (var c in a)
                    if (!(c in ["easing", "offset", "composite"])) {
                        var d = a[c]
                        Array.isArray(d) || (d = [d])
                        for (var e, f = d.length, g = 0; g < f; g++)
                            (e = {}),
                                (e.offset =
                                    "offset" in a
                                        ? a.offset
                                        : 1 == f
                                        ? 1
                                        : g / (f - 1)),
                                "easing" in a && (e.easing = a.easing),
                                "composite" in a && (e.composite = a.composite),
                                (e[c] = d[g]),
                                b.push(e)
                    }
                return (
                    b.sort(function (a, b) {
                        return a.offset - b.offset
                    }),
                    b
                )
            }
            function g(b) {
                function c() {
                    var a = d.length
                    null == d[a - 1].offset && (d[a - 1].offset = 1),
                        a > 1 && null == d[0].offset && (d[0].offset = 0)
                    for (var b = 0, c = d[0].offset, e = 1; e < a; e++) {
                        var f = d[e].offset
                        if (null != f) {
                            for (var g = 1; g < e - b; g++)
                                d[b + g].offset = c + ((f - c) * g) / (e - b)
                            ;(b = e), (c = f)
                        }
                    }
                }
                if (null == b) return []
                window.Symbol &&
                    Symbol.iterator &&
                    Array.prototype.from &&
                    b[Symbol.iterator] &&
                    (b = Array.from(b)),
                    Array.isArray(b) || (b = f(b))
                for (
                    var d = b.map(function (b) {
                            var c = {}
                            for (var d in b) {
                                var f = b[d]
                                if ("offset" == d) {
                                    if (null != f) {
                                        if (((f = Number(f)), !isFinite(f)))
                                            throw new TypeError(
                                                "Keyframe offsets must be numbers."
                                            )
                                        if (f < 0 || f > 1)
                                            throw new TypeError(
                                                "Keyframe offsets must be between 0 and 1."
                                            )
                                    }
                                } else if ("composite" == d) {
                                    if ("add" == f || "accumulate" == f)
                                        throw {
                                            type: DOMException.NOT_SUPPORTED_ERR,
                                            name: "NotSupportedError",
                                            message:
                                                "add compositing is not supported",
                                        }
                                    if ("replace" != f)
                                        throw new TypeError(
                                            "Invalid composite mode " + f + "."
                                        )
                                } else
                                    f =
                                        "easing" == d
                                            ? a.normalizeEasing(f)
                                            : "" + f
                                e(d, f, c)
                            }
                            return (
                                void 0 == c.offset && (c.offset = null),
                                void 0 == c.easing && (c.easing = "linear"),
                                c
                            )
                        }),
                        g = !0,
                        h = -1 / 0,
                        i = 0;
                    i < d.length;
                    i++
                ) {
                    var j = d[i].offset
                    if (null != j) {
                        if (j < h)
                            throw new TypeError(
                                "Keyframes are not loosely sorted by offset. Sort or specify offsets."
                            )
                        h = j
                    } else g = !1
                }
                return (
                    (d = d.filter(function (a) {
                        return a.offset >= 0 && a.offset <= 1
                    })),
                    g || c(),
                    d
                )
            }
            var h = {
                    background: [
                        "backgroundImage",
                        "backgroundPosition",
                        "backgroundSize",
                        "backgroundRepeat",
                        "backgroundAttachment",
                        "backgroundOrigin",
                        "backgroundClip",
                        "backgroundColor",
                    ],
                    border: [
                        "borderTopColor",
                        "borderTopStyle",
                        "borderTopWidth",
                        "borderRightColor",
                        "borderRightStyle",
                        "borderRightWidth",
                        "borderBottomColor",
                        "borderBottomStyle",
                        "borderBottomWidth",
                        "borderLeftColor",
                        "borderLeftStyle",
                        "borderLeftWidth",
                    ],
                    borderBottom: [
                        "borderBottomWidth",
                        "borderBottomStyle",
                        "borderBottomColor",
                    ],
                    borderColor: [
                        "borderTopColor",
                        "borderRightColor",
                        "borderBottomColor",
                        "borderLeftColor",
                    ],
                    borderLeft: [
                        "borderLeftWidth",
                        "borderLeftStyle",
                        "borderLeftColor",
                    ],
                    borderRadius: [
                        "borderTopLeftRadius",
                        "borderTopRightRadius",
                        "borderBottomRightRadius",
                        "borderBottomLeftRadius",
                    ],
                    borderRight: [
                        "borderRightWidth",
                        "borderRightStyle",
                        "borderRightColor",
                    ],
                    borderTop: [
                        "borderTopWidth",
                        "borderTopStyle",
                        "borderTopColor",
                    ],
                    borderWidth: [
                        "borderTopWidth",
                        "borderRightWidth",
                        "borderBottomWidth",
                        "borderLeftWidth",
                    ],
                    flex: ["flexGrow", "flexShrink", "flexBasis"],
                    font: [
                        "fontFamily",
                        "fontSize",
                        "fontStyle",
                        "fontVariant",
                        "fontWeight",
                        "lineHeight",
                    ],
                    margin: [
                        "marginTop",
                        "marginRight",
                        "marginBottom",
                        "marginLeft",
                    ],
                    outline: ["outlineColor", "outlineStyle", "outlineWidth"],
                    padding: [
                        "paddingTop",
                        "paddingRight",
                        "paddingBottom",
                        "paddingLeft",
                    ],
                },
                i = document.createElementNS(
                    "http://www.w3.org/1999/xhtml",
                    "div"
                ),
                j = { thin: "1px", medium: "3px", thick: "5px" },
                k = {
                    borderBottomWidth: j,
                    borderLeftWidth: j,
                    borderRightWidth: j,
                    borderTopWidth: j,
                    fontSize: {
                        "xx-small": "60%",
                        "x-small": "75%",
                        small: "89%",
                        medium: "100%",
                        large: "120%",
                        "x-large": "150%",
                        "xx-large": "200%",
                    },
                    fontWeight: { normal: "400", bold: "700" },
                    outlineWidth: j,
                    textShadow: { none: "0px 0px 0px transparent" },
                    boxShadow: { none: "0px 0px 0px 0px transparent" },
                }
            ;(a.convertToArrayForm = f), (a.normalizeKeyframes = g)
        })(a),
        (function (a) {
            var b = {}
            ;(a.isDeprecated = function (a, c, d, e) {
                var f = e ? "are" : "is",
                    g = new Date(),
                    h = new Date(c)
                return (
                    h.setMonth(h.getMonth() + 3),
                    !(
                        g < h &&
                        (a in b ||
                            console.warn(
                                "Web Animations: " +
                                    a +
                                    " " +
                                    f +
                                    " deprecated and will stop working on " +
                                    h.toDateString() +
                                    ". " +
                                    d
                            ),
                        (b[a] = !0),
                        1)
                    )
                )
            }),
                (a.deprecated = function (b, c, d, e) {
                    var f = e ? "are" : "is"
                    if (a.isDeprecated(b, c, d, e))
                        throw new Error(
                            b + " " + f + " no longer supported. " + d
                        )
                })
        })(a),
        (function () {
            if (document.documentElement.animate) {
                var c = document.documentElement.animate([], 0),
                    d = !0
                if (
                    (c &&
                        ((d = !1),
                        "play|currentTime|pause|reverse|playbackRate|cancel|finish|startTime|playState"
                            .split("|")
                            .forEach(function (a) {
                                void 0 === c[a] && (d = !0)
                            })),
                    !d)
                )
                    return
            }
            !(function (a, b, c) {
                function d(a) {
                    for (var b = {}, c = 0; c < a.length; c++)
                        for (var d in a[c])
                            if (
                                "offset" != d &&
                                "easing" != d &&
                                "composite" != d
                            ) {
                                var e = {
                                    offset: a[c].offset,
                                    easing: a[c].easing,
                                    value: a[c][d],
                                }
                                ;(b[d] = b[d] || []), b[d].push(e)
                            }
                    for (var f in b) {
                        var g = b[f]

                        /**
                         * EDIT:
                         * First offset should be 0, last should be 1
                         */

                        if (0 != g[0].offset || 1 != g[g.length - 1].offset)
                            throw {
                                type: DOMException.NOT_SUPPORTED_ERR,
                                name: "NotSupportedError",
                                message: "Partial keyframes are not supported",
                            }
                    }
                    return b
                }
                function e(c) {
                    var d = []
                    for (var e in c)
                        for (var f = c[e], g = 0; g < f.length - 1; g++) {
                            var h = g,
                                i = g + 1,
                                j = f[h].offset,
                                k = f[i].offset,
                                l = j,
                                m = k
                            0 == g && ((l = -1 / 0), 0 == k && (i = h)),
                                g == f.length - 2 &&
                                    ((m = 1 / 0), 1 == j && (h = i)),
                                d.push({
                                    applyFrom: l,
                                    applyTo: m,
                                    startOffset: f[h].offset,
                                    endOffset: f[i].offset,
                                    easingFunction: a.parseEasingFunction(
                                        f[h].easing
                                    ),
                                    property: e,
                                    interpolation: b.propertyInterpolation(
                                        e,
                                        f[h].value,
                                        f[i].value
                                    ),
                                })
                        }
                    return (
                        d.sort(function (a, b) {
                            return a.startOffset - b.startOffset
                        }),
                        d
                    )
                }
                b.convertEffectInput = function (c) {
                    var f = a.normalizeKeyframes(c),
                        g = d(f),
                        h = e(g)
                    return function (a, c) {
                        if (null != c)
                            h.filter(function (a) {
                                return c >= a.applyFrom && c < a.applyTo
                            }).forEach(function (d) {
                                var e = c - d.startOffset,
                                    f = d.endOffset - d.startOffset,
                                    g = 0 == f ? 0 : d.easingFunction(e / f)
                                b.apply(a, d.property, d.interpolation(g))
                            })
                        else
                            for (var d in g)
                                "offset" != d &&
                                    "easing" != d &&
                                    "composite" != d &&
                                    b.clear(a, d)
                    }
                }
            })(a, b),
                (function (a, b, c) {
                    function d(a) {
                        return a.replace(/-(.)/g, function (a, b) {
                            return b.toUpperCase()
                        })
                    }
                    function e(a, b, c) {
                        ;(h[c] = h[c] || []), h[c].push([a, b])
                    }
                    function f(a, b, c) {
                        for (var f = 0; f < c.length; f++) {
                            e(a, b, d(c[f]))
                        }
                    }
                    function g(c, e, f) {
                        var g = c
                        ;/-/.test(c) &&
                            !a.isDeprecated(
                                "Hyphenated property names",
                                "2016-03-22",
                                "Use camelCase instead.",
                                !0
                            ) &&
                            (g = d(c)),
                            ("initial" != e && "initial" != f) ||
                                ("initial" == e && (e = i[g]),
                                "initial" == f && (f = i[g]))
                        for (
                            var j = e == f ? [] : h[g], k = 0;
                            j && k < j.length;
                            k++
                        ) {
                            var l = j[k][0](e),
                                m = j[k][0](f)
                            if (void 0 !== l && void 0 !== m) {
                                var n = j[k][1](l, m)
                                if (n) {
                                    var o = b.Interpolation.apply(null, n)
                                    return function (a) {
                                        return 0 == a ? e : 1 == a ? f : o(a)
                                    }
                                }
                            }
                        }
                        return b.Interpolation(!1, !0, function (a) {
                            return a ? f : e
                        })
                    }
                    var h = {}
                    b.addPropertiesHandler = f
                    var i = {
                        backgroundColor: "transparent",
                        backgroundPosition: "0% 0%",
                        borderBottomColor: "currentColor",
                        borderBottomLeftRadius: "0px",
                        borderBottomRightRadius: "0px",
                        borderBottomWidth: "3px",
                        borderLeftColor: "currentColor",
                        borderLeftWidth: "3px",
                        borderRightColor: "currentColor",
                        borderRightWidth: "3px",
                        borderSpacing: "2px",
                        borderTopColor: "currentColor",
                        borderTopLeftRadius: "0px",
                        borderTopRightRadius: "0px",
                        borderTopWidth: "3px",
                        bottom: "auto",
                        clip: "rect(0px, 0px, 0px, 0px)",
                        color: "black",
                        fontSize: "100%",
                        fontWeight: "400",
                        height: "auto",
                        left: "auto",
                        letterSpacing: "normal",
                        lineHeight: "120%",
                        marginBottom: "0px",
                        marginLeft: "0px",
                        marginRight: "0px",
                        marginTop: "0px",
                        maxHeight: "none",
                        maxWidth: "none",
                        minHeight: "0px",
                        minWidth: "0px",
                        opacity: "1.0",
                        outlineColor: "invert",
                        outlineOffset: "0px",
                        outlineWidth: "3px",
                        paddingBottom: "0px",
                        paddingLeft: "0px",
                        paddingRight: "0px",
                        paddingTop: "0px",
                        right: "auto",
                        strokeDasharray: "none",
                        strokeDashoffset: "0px",
                        textIndent: "0px",
                        textShadow: "0px 0px 0px transparent",
                        top: "auto",
                        transform: "",
                        verticalAlign: "0px",
                        visibility: "visible",
                        width: "auto",
                        wordSpacing: "normal",
                        zIndex: "auto",
                    }
                    b.propertyInterpolation = g
                })(a, b),
                (function (a, b, c) {
                    function d(b) {
                        var c = a.calculateActiveDuration(b),
                            d = function (d) {
                                return a.calculateIterationProgress(c, d, b)
                            }
                        return (d._totalDuration = b.delay + c + b.endDelay), d
                    }
                    b.KeyframeEffect = function (c, e, f, g) {
                        var h,
                            i = d(a.normalizeTimingInput(f)),
                            j = b.convertEffectInput(e),
                            k = function () {
                                j(c, h)
                            }
                        return (
                            (k._update = function (a) {
                                return null !== (h = i(a))
                            }),
                            (k._clear = function () {
                                j(c, null)
                            }),
                            (k._hasSameTarget = function (a) {
                                return c === a
                            }),
                            (k._target = c),
                            (k._totalDuration = i._totalDuration),
                            (k._id = g),
                            k
                        )
                    }
                })(a, b),
                (function (a, b) {
                    function c(a, b) {
                        return (
                            !(
                                !b.namespaceURI ||
                                -1 == b.namespaceURI.indexOf("/svg")
                            ) &&
                            (g in a ||
                                (a[g] =
                                    /Trident|MSIE|IEMobile|Edge|Android 4/i.test(
                                        a.navigator.userAgent
                                    )),
                            a[g])
                        )
                    }
                    function d(a, b, c) {
                        ;(c.enumerable = !0),
                            (c.configurable = !0),
                            Object.defineProperty(a, b, c)
                    }
                    function e(a) {
                        ;(this._element = a),
                            (this._surrogateStyle = document.createElementNS(
                                "http://www.w3.org/1999/xhtml",
                                "div"
                            ).style),
                            (this._style = a.style),
                            (this._length = 0),
                            (this._isAnimatedProperty = {}),
                            (this._updateSvgTransformAttr = c(window, a)),
                            (this._savedTransformAttr = null)
                        for (var b = 0; b < this._style.length; b++) {
                            var d = this._style[b]
                            this._surrogateStyle[d] = this._style[d]
                        }
                        this._updateIndices()
                    }
                    function f(a) {
                        if (!a._webAnimationsPatchedStyle) {
                            var b = new e(a)
                            try {
                                d(a, "style", {
                                    get: function () {
                                        return b
                                    },
                                })
                            } catch (b) {
                                ;(a.style._set = function (b, c) {
                                    a.style[b] = c
                                }),
                                    (a.style._clear = function (b) {
                                        a.style[b] = ""
                                    })
                            }
                            a._webAnimationsPatchedStyle = a.style
                        }
                    }
                    var g = "_webAnimationsUpdateSvgTransformAttr",
                        h = { cssText: 1, length: 1, parentRule: 1 },
                        i = {
                            getPropertyCSSValue: 1,
                            getPropertyPriority: 1,
                            getPropertyValue: 1,
                            item: 1,
                            removeProperty: 1,
                            setProperty: 1,
                        },
                        j = { removeProperty: 1, setProperty: 1 }
                    e.prototype = {
                        get cssText() {
                            return this._surrogateStyle.cssText
                        },
                        set cssText(a) {
                            for (
                                var b = {}, c = 0;
                                c < this._surrogateStyle.length;
                                c++
                            )
                                b[this._surrogateStyle[c]] = !0
                            ;(this._surrogateStyle.cssText = a),
                                this._updateIndices()
                            for (
                                var c = 0;
                                c < this._surrogateStyle.length;
                                c++
                            )
                                b[this._surrogateStyle[c]] = !0
                            for (var d in b)
                                this._isAnimatedProperty[d] ||
                                    this._style.setProperty(
                                        d,
                                        this._surrogateStyle.getPropertyValue(d)
                                    )
                        },
                        get length() {
                            return this._surrogateStyle.length
                        },
                        get parentRule() {
                            return this._style.parentRule
                        },
                        _updateIndices: function () {
                            for (; this._length < this._surrogateStyle.length; )
                                Object.defineProperty(this, this._length, {
                                    configurable: !0,
                                    enumerable: !1,
                                    get: (function (a) {
                                        return function () {
                                            return this._surrogateStyle[a]
                                        }
                                    })(this._length),
                                }),
                                    this._length++
                            for (; this._length > this._surrogateStyle.length; )
                                this._length--,
                                    Object.defineProperty(this, this._length, {
                                        configurable: !0,
                                        enumerable: !1,
                                        value: void 0,
                                    })
                        },
                        _set: function (b, c) {
                            ;(this._style[b] = c),
                                (this._isAnimatedProperty[b] = !0),
                                this._updateSvgTransformAttr &&
                                    "transform" ==
                                        a.unprefixedPropertyName(b) &&
                                    (null == this._savedTransformAttr &&
                                        (this._savedTransformAttr =
                                            this._element.getAttribute(
                                                "transform"
                                            )),
                                    this._element.setAttribute(
                                        "transform",
                                        a.transformToSvgMatrix(c)
                                    ))
                        },
                        _clear: function (b) {
                            ;(this._style[b] = this._surrogateStyle[b]),
                                this._updateSvgTransformAttr &&
                                    "transform" ==
                                        a.unprefixedPropertyName(b) &&
                                    (this._savedTransformAttr
                                        ? this._element.setAttribute(
                                              "transform",
                                              this._savedTransformAttr
                                          )
                                        : this._element.removeAttribute(
                                              "transform"
                                          ),
                                    (this._savedTransformAttr = null)),
                                delete this._isAnimatedProperty[b]
                        },
                    }
                    for (var k in i)
                        e.prototype[k] = (function (a, b) {
                            return function () {
                                var c = this._surrogateStyle[a].apply(
                                    this._surrogateStyle,
                                    arguments
                                )
                                return (
                                    b &&
                                        (this._isAnimatedProperty[
                                            arguments[0]
                                        ] ||
                                            this._style[a].apply(
                                                this._style,
                                                arguments
                                            ),
                                        this._updateIndices()),
                                    c
                                )
                            }
                        })(k, k in j)
                    for (var l in document.documentElement.style)
                        l in h ||
                            l in i ||
                            (function (a) {
                                d(e.prototype, a, {
                                    get: function () {
                                        return this._surrogateStyle[a]
                                    },
                                    set: function (b) {
                                        if (a === "_length") return
                                        this._surrogateStyle[a] = b
                                        this._updateIndices()

                                        this._isAnimatedProperty[a] ||
                                            (this._style[a] = b)
                                    },
                                })
                            })(l)
                    ;(a.apply = function (b, c, d) {
                        f(b), b.style._set(a.propertyName(c), d)
                    }),
                        (a.clear = function (b, c) {
                            b._webAnimationsPatchedStyle &&
                                b.style._clear(a.propertyName(c))
                        })
                })(b),
                (function (a) {
                    window.Element.prototype.animate = function (b, c) {
                        /**
                         * EDIT: Polyfill doesn't support values as arrays
                         * or offset as arrays, so converting these here
                         */
                        const keyframes = []
                        for (const key in b) {
                            if (key === "easing" || key === "offset") continue

                            const valueKeyframes = b[key]
                            for (let i = 0; i < valueKeyframes.length; i++) {
                                keyframes[i] = {
                                    ...keyframes[i],
                                    [key]: valueKeyframes[i],
                                }
                                if (b.easing && b.easing[i]) {
                                    keyframes.easing = b.easing[i]
                                }
                                if (b.offset && b.offset[i]) {
                                    keyframes.offset = b.offset[i]
                                }
                            }
                        }

                        var d = ""
                        return (
                            c && c.id && (d = c.id),
                            a.timeline._play(
                                a.KeyframeEffect(this, keyframes, c, d)
                            )
                        )
                    }
                })(b),
                (function (a, b) {
                    function c(a, b, d) {
                        if ("number" == typeof a && "number" == typeof b)
                            return a * (1 - d) + b * d
                        if ("boolean" == typeof a && "boolean" == typeof b)
                            return d < 0.5 ? a : b
                        if (a.length == b.length) {
                            for (var e = [], f = 0; f < a.length; f++)
                                e.push(c(a[f], b[f], d))
                            return e
                        }
                        throw (
                            "Mismatched interpolation arguments " + a + ":" + b
                        )
                    }
                    a.Interpolation = function (a, b, d) {
                        return function (e) {
                            return d(c(a, b, e))
                        }
                    }
                })(b),
                (function (a, b) {
                    function c(a, b, c) {
                        return Math.max(Math.min(a, c), b)
                    }
                    function d(b, d, e) {
                        var f = a.dot(b, d)
                        f = c(f, -1, 1)
                        var g = []
                        if (1 === f) g = b
                        else
                            for (
                                var h = Math.acos(f),
                                    i =
                                        (1 * Math.sin(e * h)) /
                                        Math.sqrt(1 - f * f),
                                    j = 0;
                                j < 4;
                                j++
                            )
                                g.push(
                                    b[j] * (Math.cos(e * h) - f * i) + d[j] * i
                                )
                        return g
                    }
                    var e = (function () {
                        function a(a, b) {
                            for (
                                var c = [
                                        [0, 0, 0, 0],
                                        [0, 0, 0, 0],
                                        [0, 0, 0, 0],
                                        [0, 0, 0, 0],
                                    ],
                                    d = 0;
                                d < 4;
                                d++
                            )
                                for (var e = 0; e < 4; e++)
                                    for (var f = 0; f < 4; f++)
                                        c[d][e] += b[d][f] * a[f][e]
                            return c
                        }
                        function b(a) {
                            return (
                                0 == a[0][2] &&
                                0 == a[0][3] &&
                                0 == a[1][2] &&
                                0 == a[1][3] &&
                                0 == a[2][0] &&
                                0 == a[2][1] &&
                                1 == a[2][2] &&
                                0 == a[2][3] &&
                                0 == a[3][2] &&
                                1 == a[3][3]
                            )
                        }
                        function c(c, d, e, f, g) {
                            for (
                                var h = [
                                        [1, 0, 0, 0],
                                        [0, 1, 0, 0],
                                        [0, 0, 1, 0],
                                        [0, 0, 0, 1],
                                    ],
                                    i = 0;
                                i < 4;
                                i++
                            )
                                h[i][3] = g[i]
                            for (var i = 0; i < 3; i++)
                                for (var j = 0; j < 3; j++)
                                    h[3][i] += c[j] * h[j][i]
                            var k = f[0],
                                l = f[1],
                                m = f[2],
                                n = f[3],
                                o = [
                                    [1, 0, 0, 0],
                                    [0, 1, 0, 0],
                                    [0, 0, 1, 0],
                                    [0, 0, 0, 1],
                                ]
                            ;(o[0][0] = 1 - 2 * (l * l + m * m)),
                                (o[0][1] = 2 * (k * l - m * n)),
                                (o[0][2] = 2 * (k * m + l * n)),
                                (o[1][0] = 2 * (k * l + m * n)),
                                (o[1][1] = 1 - 2 * (k * k + m * m)),
                                (o[1][2] = 2 * (l * m - k * n)),
                                (o[2][0] = 2 * (k * m - l * n)),
                                (o[2][1] = 2 * (l * m + k * n)),
                                (o[2][2] = 1 - 2 * (k * k + l * l)),
                                (h = a(h, o))
                            var p = [
                                [1, 0, 0, 0],
                                [0, 1, 0, 0],
                                [0, 0, 1, 0],
                                [0, 0, 0, 1],
                            ]
                            e[2] && ((p[2][1] = e[2]), (h = a(h, p))),
                                e[1] &&
                                    ((p[2][1] = 0),
                                    (p[2][0] = e[0]),
                                    (h = a(h, p))),
                                e[0] &&
                                    ((p[2][0] = 0),
                                    (p[1][0] = e[0]),
                                    (h = a(h, p)))
                            for (var i = 0; i < 3; i++)
                                for (var j = 0; j < 3; j++) h[i][j] *= d[i]
                            return b(h)
                                ? [
                                      h[0][0],
                                      h[0][1],
                                      h[1][0],
                                      h[1][1],
                                      h[3][0],
                                      h[3][1],
                                  ]
                                : h[0].concat(h[1], h[2], h[3])
                        }
                        return c
                    })()
                    ;(a.composeMatrix = e), (a.quat = d)
                })(b),
                (function (a, b, c) {
                    a.sequenceNumber = 0
                    var d = function (a, b, c) {
                        ;(this.target = a),
                            (this.currentTime = b),
                            (this.timelineTime = c),
                            (this.type = "finish"),
                            (this.bubbles = !1),
                            (this.cancelable = !1),
                            (this.currentTarget = a),
                            (this.defaultPrevented = !1),
                            (this.eventPhase = Event.AT_TARGET),
                            (this.timeStamp = Date.now())
                    }
                    ;(b.Animation = function (b) {
                        ;(this.id = ""),
                            b && b._id && (this.id = b._id),
                            (this._sequenceNumber = a.sequenceNumber++),
                            (this._currentTime = 0),
                            (this._startTime = null),
                            (this._paused = !1),
                            (this._playbackRate = 1),
                            (this._inTimeline = !0),
                            (this._finishedFlag = !0),
                            (this.onfinish = null),
                            (this._finishHandlers = []),
                            (this._effect = b),
                            (this._inEffect = this._effect._update(0)),
                            (this._idle = !0),
                            (this._currentTimePending = !1)
                    }),
                        (b.Animation.prototype = {
                            _ensureAlive: function () {
                                this.playbackRate < 0 && 0 === this.currentTime
                                    ? (this._inEffect =
                                          this._effect._update(-1))
                                    : (this._inEffect = this._effect._update(
                                          this.currentTime
                                      )),
                                    this._inTimeline ||
                                        (!this._inEffect &&
                                            this._finishedFlag) ||
                                        ((this._inTimeline = !0),
                                        b.timeline._animations.push(this))
                            },
                            _tickCurrentTime: function (a, b) {
                                a != this._currentTime &&
                                    ((this._currentTime = a),
                                    this._isFinished &&
                                        !b &&
                                        (this._currentTime =
                                            this._playbackRate > 0
                                                ? this._totalDuration
                                                : 0),
                                    this._ensureAlive())
                            },
                            get currentTime() {
                                return this._idle || this._currentTimePending
                                    ? null
                                    : this._currentTime
                            },
                            set currentTime(a) {
                                ;(a = +a),
                                    isNaN(a) ||
                                        (b.restart(),
                                        this._paused ||
                                            null == this._startTime ||
                                            (this._startTime =
                                                this._timeline.currentTime -
                                                a / this._playbackRate),
                                        (this._currentTimePending = !1),
                                        this._currentTime != a &&
                                            (this._idle &&
                                                ((this._idle = !1),
                                                (this._paused = !0)),
                                            this._tickCurrentTime(a, !0),
                                            b.applyDirtiedAnimation(this)))
                            },
                            get startTime() {
                                return this._startTime
                            },
                            set startTime(a) {
                                ;(a = +a),
                                    isNaN(a) ||
                                        this._paused ||
                                        this._idle ||
                                        ((this._startTime = a),
                                        this._tickCurrentTime(
                                            (this._timeline.currentTime -
                                                this._startTime) *
                                                this.playbackRate
                                        ),
                                        b.applyDirtiedAnimation(this))
                            },
                            get playbackRate() {
                                return this._playbackRate
                            },
                            set playbackRate(a) {
                                if (a != this._playbackRate) {
                                    var c = this.currentTime
                                    ;(this._playbackRate = a),
                                        (this._startTime = null),
                                        "paused" != this.playState &&
                                            "idle" != this.playState &&
                                            ((this._finishedFlag = !1),
                                            (this._idle = !1),
                                            this._ensureAlive(),
                                            b.applyDirtiedAnimation(this)),
                                        null != c && (this.currentTime = c)
                                }
                            },
                            get _isFinished() {
                                return (
                                    !this._idle &&
                                    ((this._playbackRate > 0 &&
                                        this._currentTime >=
                                            this._totalDuration) ||
                                        (this._playbackRate < 0 &&
                                            this._currentTime <= 0))
                                )
                            },
                            get _totalDuration() {
                                return this._effect._totalDuration
                            },
                            get playState() {
                                return this._idle
                                    ? "idle"
                                    : (null == this._startTime &&
                                          !this._paused &&
                                          0 != this.playbackRate) ||
                                      this._currentTimePending
                                    ? "pending"
                                    : this._paused
                                    ? "paused"
                                    : this._isFinished
                                    ? "finished"
                                    : "running"
                            },
                            _rewind: function () {
                                if (this._playbackRate >= 0)
                                    this._currentTime = 0
                                else {
                                    if (!(this._totalDuration < 1 / 0))
                                        throw new DOMException(
                                            "Unable to rewind negative playback rate animation with infinite duration",
                                            "InvalidStateError"
                                        )
                                    this._currentTime = this._totalDuration
                                }
                            },
                            play: function () {
                                ;(this._paused = !1),
                                    (this._isFinished || this._idle) &&
                                        (this._rewind(),
                                        (this._startTime = null)),
                                    (this._finishedFlag = !1),
                                    (this._idle = !1),
                                    this._ensureAlive(),
                                    b.applyDirtiedAnimation(this)
                            },
                            pause: function () {
                                this._isFinished || this._paused || this._idle
                                    ? this._idle &&
                                      (this._rewind(), (this._idle = !1))
                                    : (this._currentTimePending = !0),
                                    (this._startTime = null),
                                    (this._paused = !0)
                            },
                            /**
                             * EDIT: Adding commitStyles
                             */
                            commitStyles: function () {},
                            finish: function () {
                                this._idle ||
                                    ((this.currentTime =
                                        this._playbackRate > 0
                                            ? this._totalDuration
                                            : 0),
                                    (this._startTime =
                                        this._totalDuration - this.currentTime),
                                    (this._currentTimePending = !1),
                                    b.applyDirtiedAnimation(this))
                            },
                            cancel: function () {
                                this._inEffect &&
                                    ((this._inEffect = !1),
                                    (this._idle = !0),
                                    (this._paused = !1),
                                    (this._finishedFlag = !0),
                                    (this._currentTime = 0),
                                    (this._startTime = null),
                                    this._effect._update(null),
                                    b.applyDirtiedAnimation(this))
                            },
                            reverse: function () {
                                ;(this.playbackRate *= -1), this.play()
                            },
                            addEventListener: function (a, b) {
                                "function" == typeof b &&
                                    "finish" == a &&
                                    this._finishHandlers.push(b)
                            },
                            removeEventListener: function (a, b) {
                                if ("finish" == a) {
                                    var c = this._finishHandlers.indexOf(b)
                                    c >= 0 && this._finishHandlers.splice(c, 1)
                                }
                            },
                            _fireEvents: function (a) {
                                if (this._isFinished) {
                                    if (!this._finishedFlag) {
                                        var b = new d(
                                                this,
                                                this._currentTime,
                                                a
                                            ),
                                            c = this._finishHandlers.concat(
                                                this.onfinish
                                                    ? [this.onfinish]
                                                    : []
                                            )
                                        setTimeout(function () {
                                            c.forEach(function (a) {
                                                a.call(b.target, b)
                                            })
                                        }, 0),
                                            (this._finishedFlag = !0)
                                    }
                                } else this._finishedFlag = !1
                            },
                            _tick: function (a, b) {
                                this._idle ||
                                    this._paused ||
                                    (null == this._startTime
                                        ? b &&
                                          (this.startTime =
                                              a -
                                              this._currentTime /
                                                  this.playbackRate)
                                        : this._isFinished ||
                                          this._tickCurrentTime(
                                              (a - this._startTime) *
                                                  this.playbackRate
                                          )),
                                    b &&
                                        ((this._currentTimePending = !1),
                                        this._fireEvents(a))
                            },
                            get _needsTick() {
                                return (
                                    this.playState in
                                        { pending: 1, running: 1 } ||
                                    !this._finishedFlag
                                )
                            },
                            _targetAnimations: function () {
                                var a = this._effect._target
                                return (
                                    a._animations || (a._animations = []),
                                    a._animations
                                )
                            },
                            _markTarget: function () {
                                var a = this._targetAnimations()
                                ;-1 === a.indexOf(this) && a.push(this)
                            },
                            _unmarkTarget: function () {
                                var a = this._targetAnimations(),
                                    b = a.indexOf(this)
                                ;-1 !== b && a.splice(b, 1)
                            },
                        })
                })(a, b),
                (function (a, b, c) {
                    function d(a) {
                        var b = j
                        ;(j = []),
                            a < q.currentTime && (a = q.currentTime),
                            q._animations.sort(e),
                            (q._animations = h(a, !0, q._animations)[0]),
                            b.forEach(function (b) {
                                b[1](a)
                            }),
                            g(),
                            (l = void 0)
                    }
                    function e(a, b) {
                        return a._sequenceNumber - b._sequenceNumber
                    }
                    function f() {
                        ;(this._animations = []),
                            (this.currentTime =
                                window.performance && performance.now
                                    ? performance.now()
                                    : 0)
                    }
                    function g() {
                        o.forEach(function (a) {
                            a()
                        }),
                            (o.length = 0)
                    }
                    function h(a, c, d) {
                        ;(p = !0),
                            (n = !1),
                            (b.timeline.currentTime = a),
                            (m = !1)
                        var e = [],
                            f = [],
                            g = [],
                            h = []
                        return (
                            d.forEach(function (b) {
                                b._tick(a, c),
                                    b._inEffect
                                        ? (f.push(b._effect), b._markTarget())
                                        : (e.push(b._effect),
                                          b._unmarkTarget()),
                                    b._needsTick && (m = !0)
                                var d = b._inEffect || b._needsTick
                                ;(b._inTimeline = d), d ? g.push(b) : h.push(b)
                            }),
                            o.push.apply(o, e),
                            o.push.apply(o, f),
                            m && requestAnimationFrame(function () {}),
                            (p = !1),
                            [g, h]
                        )
                    }
                    var i = window.requestAnimationFrame,
                        j = [],
                        k = 0
                    ;(window.requestAnimationFrame = function (a) {
                        var b = k++
                        return 0 == j.length && i(d), j.push([b, a]), b
                    }),
                        (window.cancelAnimationFrame = function (a) {
                            j.forEach(function (b) {
                                b[0] == a && (b[1] = function () {})
                            })
                        }),
                        (f.prototype = {
                            _play: function (c) {
                                c._timing = a.normalizeTimingInput(c.timing)
                                var d = new b.Animation(c)
                                return (
                                    (d._idle = !1),
                                    (d._timeline = this),
                                    this._animations.push(d),
                                    b.restart(),
                                    b.applyDirtiedAnimation(d),
                                    d
                                )
                            },
                        })
                    var l = void 0,
                        m = !1,
                        n = !1
                    ;(b.restart = function () {
                        return (
                            m ||
                                ((m = !0),
                                requestAnimationFrame(function () {}),
                                (n = !0)),
                            n
                        )
                    }),
                        (b.applyDirtiedAnimation = function (a) {
                            if (!p) {
                                a._markTarget()
                                var c = a._targetAnimations()
                                c.sort(e),
                                    h(
                                        b.timeline.currentTime,
                                        !1,
                                        c.slice()
                                    )[1].forEach(function (a) {
                                        var b = q._animations.indexOf(a)
                                        ;-1 !== b && q._animations.splice(b, 1)
                                    }),
                                    g()
                            }
                        })
                    var o = [],
                        p = !1,
                        q = new f()
                    b.timeline = q
                })(a, b),
                (function (a, b) {
                    function c(a, b) {
                        for (var c = 0, d = 0; d < a.length; d++)
                            c += a[d] * b[d]
                        return c
                    }
                    function d(a, b) {
                        return [
                            a[0] * b[0] +
                                a[4] * b[1] +
                                a[8] * b[2] +
                                a[12] * b[3],
                            a[1] * b[0] +
                                a[5] * b[1] +
                                a[9] * b[2] +
                                a[13] * b[3],
                            a[2] * b[0] +
                                a[6] * b[1] +
                                a[10] * b[2] +
                                a[14] * b[3],
                            a[3] * b[0] +
                                a[7] * b[1] +
                                a[11] * b[2] +
                                a[15] * b[3],
                            a[0] * b[4] +
                                a[4] * b[5] +
                                a[8] * b[6] +
                                a[12] * b[7],
                            a[1] * b[4] +
                                a[5] * b[5] +
                                a[9] * b[6] +
                                a[13] * b[7],
                            a[2] * b[4] +
                                a[6] * b[5] +
                                a[10] * b[6] +
                                a[14] * b[7],
                            a[3] * b[4] +
                                a[7] * b[5] +
                                a[11] * b[6] +
                                a[15] * b[7],
                            a[0] * b[8] +
                                a[4] * b[9] +
                                a[8] * b[10] +
                                a[12] * b[11],
                            a[1] * b[8] +
                                a[5] * b[9] +
                                a[9] * b[10] +
                                a[13] * b[11],
                            a[2] * b[8] +
                                a[6] * b[9] +
                                a[10] * b[10] +
                                a[14] * b[11],
                            a[3] * b[8] +
                                a[7] * b[9] +
                                a[11] * b[10] +
                                a[15] * b[11],
                            a[0] * b[12] +
                                a[4] * b[13] +
                                a[8] * b[14] +
                                a[12] * b[15],
                            a[1] * b[12] +
                                a[5] * b[13] +
                                a[9] * b[14] +
                                a[13] * b[15],
                            a[2] * b[12] +
                                a[6] * b[13] +
                                a[10] * b[14] +
                                a[14] * b[15],
                            a[3] * b[12] +
                                a[7] * b[13] +
                                a[11] * b[14] +
                                a[15] * b[15],
                        ]
                    }
                    function e(a) {
                        var b = a.rad || 0
                        return (
                            ((a.deg || 0) / 360 +
                                (a.grad || 0) / 400 +
                                (a.turn || 0)) *
                                (2 * Math.PI) +
                            b
                        )
                    }
                    function f(a) {
                        switch (a.t) {
                            case "rotatex":
                                var b = e(a.d[0])
                                return [
                                    1,
                                    0,
                                    0,
                                    0,
                                    0,
                                    Math.cos(b),
                                    Math.sin(b),
                                    0,
                                    0,
                                    -Math.sin(b),
                                    Math.cos(b),
                                    0,
                                    0,
                                    0,
                                    0,
                                    1,
                                ]
                            case "rotatey":
                                var b = e(a.d[0])
                                return [
                                    Math.cos(b),
                                    0,
                                    -Math.sin(b),
                                    0,
                                    0,
                                    1,
                                    0,
                                    0,
                                    Math.sin(b),
                                    0,
                                    Math.cos(b),
                                    0,
                                    0,
                                    0,
                                    0,
                                    1,
                                ]
                            case "rotate":
                            case "rotatez":
                                var b = e(a.d[0])
                                return [
                                    Math.cos(b),
                                    Math.sin(b),
                                    0,
                                    0,
                                    -Math.sin(b),
                                    Math.cos(b),
                                    0,
                                    0,
                                    0,
                                    0,
                                    1,
                                    0,
                                    0,
                                    0,
                                    0,
                                    1,
                                ]
                            case "rotate3d":
                                var c = a.d[0],
                                    d = a.d[1],
                                    f = a.d[2],
                                    b = e(a.d[3]),
                                    g = c * c + d * d + f * f
                                if (0 === g) (c = 1), (d = 0), (f = 0)
                                else if (1 !== g) {
                                    var h = Math.sqrt(g)
                                    ;(c /= h), (d /= h), (f /= h)
                                }
                                var i = Math.sin(b / 2),
                                    j = i * Math.cos(b / 2),
                                    k = i * i
                                return [
                                    1 - 2 * (d * d + f * f) * k,
                                    2 * (c * d * k + f * j),
                                    2 * (c * f * k - d * j),
                                    0,
                                    2 * (c * d * k - f * j),
                                    1 - 2 * (c * c + f * f) * k,
                                    2 * (d * f * k + c * j),
                                    0,
                                    2 * (c * f * k + d * j),
                                    2 * (d * f * k - c * j),
                                    1 - 2 * (c * c + d * d) * k,
                                    0,
                                    0,
                                    0,
                                    0,
                                    1,
                                ]
                            case "scale":
                                return [
                                    a.d[0],
                                    0,
                                    0,
                                    0,
                                    0,
                                    a.d[1],
                                    0,
                                    0,
                                    0,
                                    0,
                                    1,
                                    0,
                                    0,
                                    0,
                                    0,
                                    1,
                                ]
                            case "scalex":
                                return [
                                    a.d[0],
                                    0,
                                    0,
                                    0,
                                    0,
                                    1,
                                    0,
                                    0,
                                    0,
                                    0,
                                    1,
                                    0,
                                    0,
                                    0,
                                    0,
                                    1,
                                ]
                            case "scaley":
                                return [
                                    1,
                                    0,
                                    0,
                                    0,
                                    0,
                                    a.d[0],
                                    0,
                                    0,
                                    0,
                                    0,
                                    1,
                                    0,
                                    0,
                                    0,
                                    0,
                                    1,
                                ]
                            case "scalez":
                                return [
                                    1,
                                    0,
                                    0,
                                    0,
                                    0,
                                    1,
                                    0,
                                    0,
                                    0,
                                    0,
                                    a.d[0],
                                    0,
                                    0,
                                    0,
                                    0,
                                    1,
                                ]
                            case "scale3d":
                                return [
                                    a.d[0],
                                    0,
                                    0,
                                    0,
                                    0,
                                    a.d[1],
                                    0,
                                    0,
                                    0,
                                    0,
                                    a.d[2],
                                    0,
                                    0,
                                    0,
                                    0,
                                    1,
                                ]
                            case "skew":
                                var l = e(a.d[0]),
                                    m = e(a.d[1])
                                return [
                                    1,
                                    Math.tan(m),
                                    0,
                                    0,
                                    Math.tan(l),
                                    1,
                                    0,
                                    0,
                                    0,
                                    0,
                                    1,
                                    0,
                                    0,
                                    0,
                                    0,
                                    1,
                                ]
                            case "skewx":
                                var b = e(a.d[0])
                                return [
                                    1,
                                    0,
                                    0,
                                    0,
                                    Math.tan(b),
                                    1,
                                    0,
                                    0,
                                    0,
                                    0,
                                    1,
                                    0,
                                    0,
                                    0,
                                    0,
                                    1,
                                ]
                            case "skewy":
                                var b = e(a.d[0])
                                return [
                                    1,
                                    Math.tan(b),
                                    0,
                                    0,
                                    0,
                                    1,
                                    0,
                                    0,
                                    0,
                                    0,
                                    1,
                                    0,
                                    0,
                                    0,
                                    0,
                                    1,
                                ]
                            case "translate":
                                var c = a.d[0].px || 0,
                                    d = a.d[1].px || 0
                                return [
                                    1,
                                    0,
                                    0,
                                    0,
                                    0,
                                    1,
                                    0,
                                    0,
                                    0,
                                    0,
                                    1,
                                    0,
                                    c,
                                    d,
                                    0,
                                    1,
                                ]
                            case "translatex":
                                var c = a.d[0].px || 0
                                return [
                                    1,
                                    0,
                                    0,
                                    0,
                                    0,
                                    1,
                                    0,
                                    0,
                                    0,
                                    0,
                                    1,
                                    0,
                                    c,
                                    0,
                                    0,
                                    1,
                                ]
                            case "translatey":
                                var d = a.d[0].px || 0
                                return [
                                    1,
                                    0,
                                    0,
                                    0,
                                    0,
                                    1,
                                    0,
                                    0,
                                    0,
                                    0,
                                    1,
                                    0,
                                    0,
                                    d,
                                    0,
                                    1,
                                ]
                            case "translatez":
                                var f = a.d[0].px || 0
                                return [
                                    1,
                                    0,
                                    0,
                                    0,
                                    0,
                                    1,
                                    0,
                                    0,
                                    0,
                                    0,
                                    1,
                                    0,
                                    0,
                                    0,
                                    f,
                                    1,
                                ]
                            case "translate3d":
                                var c = a.d[0].px || 0,
                                    d = a.d[1].px || 0,
                                    f = a.d[2].px || 0
                                return [
                                    1,
                                    0,
                                    0,
                                    0,
                                    0,
                                    1,
                                    0,
                                    0,
                                    0,
                                    0,
                                    1,
                                    0,
                                    c,
                                    d,
                                    f,
                                    1,
                                ]
                            case "perspective":
                                return [
                                    1,
                                    0,
                                    0,
                                    0,
                                    0,
                                    1,
                                    0,
                                    0,
                                    0,
                                    0,
                                    1,
                                    a.d[0].px ? -1 / a.d[0].px : 0,
                                    0,
                                    0,
                                    0,
                                    1,
                                ]
                            case "matrix":
                                return [
                                    a.d[0],
                                    a.d[1],
                                    0,
                                    0,
                                    a.d[2],
                                    a.d[3],
                                    0,
                                    0,
                                    0,
                                    0,
                                    1,
                                    0,
                                    a.d[4],
                                    a.d[5],
                                    0,
                                    1,
                                ]
                            case "matrix3d":
                                return a.d
                        }
                    }
                    function g(a) {
                        return 0 === a.length
                            ? [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]
                            : a.map(f).reduce(d)
                    }
                    function h(a) {
                        return [i(g(a))]
                    }
                    var i = (function () {
                        function a(a) {
                            return (
                                a[0][0] * a[1][1] * a[2][2] +
                                a[1][0] * a[2][1] * a[0][2] +
                                a[2][0] * a[0][1] * a[1][2] -
                                a[0][2] * a[1][1] * a[2][0] -
                                a[1][2] * a[2][1] * a[0][0] -
                                a[2][2] * a[0][1] * a[1][0]
                            )
                        }
                        function b(b) {
                            for (
                                var c = 1 / a(b),
                                    d = b[0][0],
                                    e = b[0][1],
                                    f = b[0][2],
                                    g = b[1][0],
                                    h = b[1][1],
                                    i = b[1][2],
                                    j = b[2][0],
                                    k = b[2][1],
                                    l = b[2][2],
                                    m = [
                                        [
                                            (h * l - i * k) * c,
                                            (f * k - e * l) * c,
                                            (e * i - f * h) * c,
                                            0,
                                        ],
                                        [
                                            (i * j - g * l) * c,
                                            (d * l - f * j) * c,
                                            (f * g - d * i) * c,
                                            0,
                                        ],
                                        [
                                            (g * k - h * j) * c,
                                            (j * e - d * k) * c,
                                            (d * h - e * g) * c,
                                            0,
                                        ],
                                    ],
                                    n = [],
                                    o = 0;
                                o < 3;
                                o++
                            ) {
                                for (var p = 0, q = 0; q < 3; q++)
                                    p += b[3][q] * m[q][o]
                                n.push(p)
                            }
                            return n.push(1), m.push(n), m
                        }
                        function d(a) {
                            return [
                                [a[0][0], a[1][0], a[2][0], a[3][0]],
                                [a[0][1], a[1][1], a[2][1], a[3][1]],
                                [a[0][2], a[1][2], a[2][2], a[3][2]],
                                [a[0][3], a[1][3], a[2][3], a[3][3]],
                            ]
                        }
                        function e(a, b) {
                            for (var c = [], d = 0; d < 4; d++) {
                                for (var e = 0, f = 0; f < 4; f++)
                                    e += a[f] * b[f][d]
                                c.push(e)
                            }
                            return c
                        }
                        function f(a) {
                            var b = g(a)
                            return [a[0] / b, a[1] / b, a[2] / b]
                        }
                        function g(a) {
                            return Math.sqrt(
                                a[0] * a[0] + a[1] * a[1] + a[2] * a[2]
                            )
                        }
                        function h(a, b, c, d) {
                            return [
                                c * a[0] + d * b[0],
                                c * a[1] + d * b[1],
                                c * a[2] + d * b[2],
                            ]
                        }
                        function i(a, b) {
                            return [
                                a[1] * b[2] - a[2] * b[1],
                                a[2] * b[0] - a[0] * b[2],
                                a[0] * b[1] - a[1] * b[0],
                            ]
                        }
                        function j(j) {
                            var k = [
                                j.slice(0, 4),
                                j.slice(4, 8),
                                j.slice(8, 12),
                                j.slice(12, 16),
                            ]
                            if (1 !== k[3][3]) return null
                            for (var l = [], m = 0; m < 4; m++)
                                l.push(k[m].slice())
                            for (var m = 0; m < 3; m++) l[m][3] = 0
                            if (0 === a(l)) return null
                            var n,
                                o = []
                            k[0][3] || k[1][3] || k[2][3]
                                ? (o.push(k[0][3]),
                                  o.push(k[1][3]),
                                  o.push(k[2][3]),
                                  o.push(k[3][3]),
                                  (n = e(o, d(b(l)))))
                                : (n = [0, 0, 0, 1])
                            var p = k[3].slice(0, 3),
                                q = []
                            q.push(k[0].slice(0, 3))
                            var r = []
                            r.push(g(q[0])), (q[0] = f(q[0]))
                            var s = []
                            q.push(k[1].slice(0, 3)),
                                s.push(c(q[0], q[1])),
                                (q[1] = h(q[1], q[0], 1, -s[0])),
                                r.push(g(q[1])),
                                (q[1] = f(q[1])),
                                (s[0] /= r[1]),
                                q.push(k[2].slice(0, 3)),
                                s.push(c(q[0], q[2])),
                                (q[2] = h(q[2], q[0], 1, -s[1])),
                                s.push(c(q[1], q[2])),
                                (q[2] = h(q[2], q[1], 1, -s[2])),
                                r.push(g(q[2])),
                                (q[2] = f(q[2])),
                                (s[1] /= r[2]),
                                (s[2] /= r[2])
                            var t = i(q[1], q[2])
                            if (c(q[0], t) < 0)
                                for (var m = 0; m < 3; m++)
                                    (r[m] *= -1),
                                        (q[m][0] *= -1),
                                        (q[m][1] *= -1),
                                        (q[m][2] *= -1)
                            var u,
                                v,
                                w = q[0][0] + q[1][1] + q[2][2] + 1
                            return (
                                w > 1e-4
                                    ? ((u = 0.5 / Math.sqrt(w)),
                                      (v = [
                                          (q[2][1] - q[1][2]) * u,
                                          (q[0][2] - q[2][0]) * u,
                                          (q[1][0] - q[0][1]) * u,
                                          0.25 / u,
                                      ]))
                                    : q[0][0] > q[1][1] && q[0][0] > q[2][2]
                                    ? ((u =
                                          2 *
                                          Math.sqrt(
                                              1 + q[0][0] - q[1][1] - q[2][2]
                                          )),
                                      (v = [
                                          0.25 * u,
                                          (q[0][1] + q[1][0]) / u,
                                          (q[0][2] + q[2][0]) / u,
                                          (q[2][1] - q[1][2]) / u,
                                      ]))
                                    : q[1][1] > q[2][2]
                                    ? ((u =
                                          2 *
                                          Math.sqrt(
                                              1 + q[1][1] - q[0][0] - q[2][2]
                                          )),
                                      (v = [
                                          (q[0][1] + q[1][0]) / u,
                                          0.25 * u,
                                          (q[1][2] + q[2][1]) / u,
                                          (q[0][2] - q[2][0]) / u,
                                      ]))
                                    : ((u =
                                          2 *
                                          Math.sqrt(
                                              1 + q[2][2] - q[0][0] - q[1][1]
                                          )),
                                      (v = [
                                          (q[0][2] + q[2][0]) / u,
                                          (q[1][2] + q[2][1]) / u,
                                          0.25 * u,
                                          (q[1][0] - q[0][1]) / u,
                                      ])),
                                [p, r, s, v, n]
                            )
                        }
                        return j
                    })()
                    ;(a.dot = c),
                        (a.makeMatrixDecomposition = h),
                        (a.transformListToMatrix = g)
                })(b),
                (function (a) {
                    function b(a, b) {
                        var c = a.exec(b)
                        if (c)
                            return (
                                (c = a.ignoreCase ? c[0].toLowerCase() : c[0]),
                                [c, b.substr(c.length)]
                            )
                    }
                    function c(a, b) {
                        b = b.replace(/^\s*/, "")
                        var c = a(b)
                        if (c) return [c[0], c[1].replace(/^\s*/, "")]
                    }
                    function d(a, d, e) {
                        a = c.bind(null, a)
                        for (var f = []; ; ) {
                            var g = a(e)
                            if (!g) return [f, e]
                            if (
                                (f.push(g[0]),
                                (e = g[1]),
                                !(g = b(d, e)) || "" == g[1])
                            )
                                return [f, e]
                            e = g[1]
                        }
                    }
                    function e(a, b) {
                        for (
                            var c = 0, d = 0;
                            d < b.length && (!/\s|,/.test(b[d]) || 0 != c);
                            d++
                        )
                            if ("(" == b[d]) c++
                            else if (
                                ")" == b[d] &&
                                (c--, 0 == c && d++, c <= 0)
                            )
                                break
                        var e = a(b.substr(0, d))
                        return void 0 == e ? void 0 : [e, b.substr(d)]
                    }
                    function f(a, b) {
                        for (var c = a, d = b; c && d; )
                            c > d ? (c %= d) : (d %= c)
                        return (c = (a * b) / (c + d))
                    }
                    function g(a) {
                        return function (b) {
                            var c = a(b)
                            return c && (c[0] = void 0), c
                        }
                    }
                    function h(a, b) {
                        return function (c) {
                            return a(c) || [b, c]
                        }
                    }
                    function i(b, c) {
                        for (var d = [], e = 0; e < b.length; e++) {
                            var f = a.consumeTrimmed(b[e], c)
                            if (!f || "" == f[0]) return
                            void 0 !== f[0] && d.push(f[0]), (c = f[1])
                        }
                        if ("" == c) return d
                    }
                    function j(a, b, c, d, e) {
                        for (
                            var g = [],
                                h = [],
                                i = [],
                                j = f(d.length, e.length),
                                k = 0;
                            k < j;
                            k++
                        ) {
                            var l = b(d[k % d.length], e[k % e.length])
                            if (!l) return
                            g.push(l[0]), h.push(l[1]), i.push(l[2])
                        }
                        return [
                            g,
                            h,
                            function (b) {
                                var d = b
                                    .map(function (a, b) {
                                        return i[b](a)
                                    })
                                    .join(c)
                                return a ? a(d) : d
                            },
                        ]
                    }
                    function k(a, b, c) {
                        for (
                            var d = [], e = [], f = [], g = 0, h = 0;
                            h < c.length;
                            h++
                        )
                            if ("function" == typeof c[h]) {
                                var i = c[h](a[g], b[g++])
                                d.push(i[0]), e.push(i[1]), f.push(i[2])
                            } else
                                !(function (a) {
                                    d.push(!1),
                                        e.push(!1),
                                        f.push(function () {
                                            return c[a]
                                        })
                                })(h)
                        return [
                            d,
                            e,
                            function (a) {
                                for (var b = "", c = 0; c < a.length; c++)
                                    b += f[c](a[c])
                                return b
                            },
                        ]
                    }
                    ;(a.consumeToken = b),
                        (a.consumeTrimmed = c),
                        (a.consumeRepeated = d),
                        (a.consumeParenthesised = e),
                        (a.ignore = g),
                        (a.optional = h),
                        (a.consumeList = i),
                        (a.mergeNestedRepeated = j.bind(null, null)),
                        (a.mergeWrappedNestedRepeated = j),
                        (a.mergeList = k)
                })(b),
                (function (a) {
                    function b(b) {
                        function c(b) {
                            var c = a.consumeToken(/^inset/i, b)
                            return c
                                ? ((d.inset = !0), c)
                                : (c = a.consumeLengthOrPercent(b))
                                ? (d.lengths.push(c[0]), c)
                                : ((c = a.consumeColor(b)),
                                  c ? ((d.color = c[0]), c) : void 0)
                        }
                        var d = { inset: !1, lengths: [], color: null },
                            e = a.consumeRepeated(c, /^/, b)
                        if (e && e[0].length) return [d, e[1]]
                    }
                    function c(c) {
                        var d = a.consumeRepeated(b, /^,/, c)
                        if (d && "" == d[1]) return d[0]
                    }
                    function d(b, c) {
                        for (
                            ;
                            b.lengths.length <
                            Math.max(b.lengths.length, c.lengths.length);

                        )
                            b.lengths.push({ px: 0 })
                        for (
                            ;
                            c.lengths.length <
                            Math.max(b.lengths.length, c.lengths.length);

                        )
                            c.lengths.push({ px: 0 })
                        if (b.inset == c.inset && !!b.color == !!c.color) {
                            for (
                                var d, e = [], f = [[], 0], g = [[], 0], h = 0;
                                h < b.lengths.length;
                                h++
                            ) {
                                var i = a.mergeDimensions(
                                    b.lengths[h],
                                    c.lengths[h],
                                    2 == h
                                )
                                f[0].push(i[0]), g[0].push(i[1]), e.push(i[2])
                            }
                            if (b.color && c.color) {
                                var j = a.mergeColors(b.color, c.color)
                                ;(f[1] = j[0]), (g[1] = j[1]), (d = j[2])
                            }
                            return [
                                f,
                                g,
                                function (a) {
                                    for (
                                        var c = b.inset ? "inset " : " ", f = 0;
                                        f < e.length;
                                        f++
                                    )
                                        c += e[f](a[0][f]) + " "
                                    return d && (c += d(a[1])), c
                                },
                            ]
                        }
                    }
                    function e(b, c, d, e) {
                        function f(a) {
                            return {
                                inset: a,
                                color: [0, 0, 0, 0],
                                lengths: [
                                    { px: 0 },
                                    { px: 0 },
                                    { px: 0 },
                                    { px: 0 },
                                ],
                            }
                        }
                        for (
                            var g = [], h = [], i = 0;
                            i < d.length || i < e.length;
                            i++
                        ) {
                            var j = d[i] || f(e[i].inset),
                                k = e[i] || f(d[i].inset)
                            g.push(j), h.push(k)
                        }
                        return a.mergeNestedRepeated(b, c, g, h)
                    }
                    var f = e.bind(null, d, ", ")
                    a.addPropertiesHandler(c, f, ["box-shadow", "text-shadow"])
                })(b),
                (function (a, b) {
                    function c(a) {
                        return a
                            .toFixed(3)
                            .replace(/0+$/, "")
                            .replace(/\.$/, "")
                    }
                    function d(a, b, c) {
                        return Math.min(b, Math.max(a, c))
                    }
                    function e(a) {
                        if (/^\s*[-+]?(\d*\.)?\d+\s*$/.test(a)) return Number(a)
                    }
                    function f(a, b) {
                        return [a, b, c]
                    }
                    function g(a, b) {
                        if (0 != a) return i(0, 1 / 0)(a, b)
                    }
                    function h(a, b) {
                        return [
                            a,
                            b,
                            function (a) {
                                return Math.round(d(1, 1 / 0, a))
                            },
                        ]
                    }
                    function i(a, b) {
                        return function (e, f) {
                            return [
                                e,
                                f,
                                function (e) {
                                    return c(d(a, b, e))
                                },
                            ]
                        }
                    }
                    function j(a) {
                        var b = a.trim().split(/\s*[\s,]\s*/)
                        if (0 !== b.length) {
                            for (var c = [], d = 0; d < b.length; d++) {
                                var f = e(b[d])
                                if (void 0 === f) return
                                c.push(f)
                            }
                            return c
                        }
                    }
                    function k(a, b) {
                        if (a.length == b.length)
                            return [
                                a,
                                b,
                                function (a) {
                                    return a.map(c).join(" ")
                                },
                            ]
                    }
                    function l(a, b) {
                        return [a, b, Math.round]
                    }
                    ;(a.clamp = d),
                        a.addPropertiesHandler(j, k, ["stroke-dasharray"]),
                        a.addPropertiesHandler(e, i(0, 1 / 0), [
                            "border-image-width",
                            "line-height",
                        ]),
                        a.addPropertiesHandler(e, i(0, 1), [
                            "opacity",
                            "shape-image-threshold",
                        ]),
                        a.addPropertiesHandler(e, g, [
                            "flex-grow",
                            "flex-shrink",
                        ]),
                        a.addPropertiesHandler(e, h, ["orphans", "widows"]),
                        a.addPropertiesHandler(e, l, ["z-index"]),
                        (a.parseNumber = e),
                        (a.parseNumberList = j),
                        (a.mergeNumbers = f),
                        (a.numberToString = c)
                })(b),
                (function (a, b) {
                    function c(a, b) {
                        if ("visible" == a || "visible" == b)
                            return [
                                0,
                                1,
                                function (c) {
                                    return c <= 0 ? a : c >= 1 ? b : "visible"
                                },
                            ]
                    }
                    a.addPropertiesHandler(String, c, ["visibility"])
                })(b),
                (function (a, b) {
                    function c(a) {
                        return [255, 255, 255, 1]
                    }
                    function d(b, c) {
                        return [
                            b,
                            c,
                            function (b) {
                                function c(a) {
                                    return Math.max(0, Math.min(255, a))
                                }
                                if (b[3])
                                    for (var d = 0; d < 3; d++)
                                        b[d] = Math.round(c(b[d] / b[3]))
                                return (
                                    (b[3] = a.numberToString(
                                        a.clamp(0, 1, b[3])
                                    )),
                                    "rgba(" + b.join(",") + ")"
                                )
                            },
                        ]
                    }
                    var e = document.createElementNS(
                        "http://www.w3.org/1999/xhtml",
                        "canvas"
                    )
                    e.width = e.height = 1
                    a.addPropertiesHandler(c, d, [
                        "background-color",
                        "border-bottom-color",
                        "border-left-color",
                        "border-right-color",
                        "border-top-color",
                        "color",
                        "fill",
                        "flood-color",
                        "lighting-color",
                        "outline-color",
                        "stop-color",
                        "stroke",
                        "text-decoration-color",
                    ]),
                        (a.consumeColor = a.consumeParenthesised.bind(null, c)),
                        (a.mergeColors = d)
                })(b),
                (function (a, b) {
                    function c(a) {
                        function b() {
                            var b = h.exec(a)
                            g = b ? b[0] : void 0
                        }
                        function c() {
                            var a = Number(g)
                            return b(), a
                        }
                        function d() {
                            if ("(" !== g) return c()
                            b()
                            var a = f()
                            return ")" !== g ? NaN : (b(), a)
                        }
                        function e() {
                            for (var a = d(); "*" === g || "/" === g; ) {
                                var c = g
                                b()
                                var e = d()
                                "*" === c ? (a *= e) : (a /= e)
                            }
                            return a
                        }
                        function f() {
                            for (var a = e(); "+" === g || "-" === g; ) {
                                var c = g
                                b()
                                var d = e()
                                "+" === c ? (a += d) : (a -= d)
                            }
                            return a
                        }
                        var g,
                            h = /([\+\-\w\.]+|[\(\)\*\/])/g
                        return b(), f()
                    }
                    function d(a, b) {
                        if (
                            "0" == (b = b.trim().toLowerCase()) &&
                            "px".search(a) >= 0
                        )
                            return { px: 0 }
                        if (/^[^(]*$|^calc/.test(b)) {
                            b = b.replace(/calc\(/g, "(")
                            var d = {}
                            b = b.replace(a, function (a) {
                                return (d[a] = null), "U" + a
                            })
                            for (
                                var e = "U(" + a.source + ")",
                                    f = b
                                        .replace(
                                            /[-+]?(\d*\.)?\d+([Ee][-+]?\d+)?/g,
                                            "N"
                                        )
                                        .replace(new RegExp("N" + e, "g"), "D")
                                        .replace(/\s[+-]\s/g, "O")
                                        .replace(/\s/g, ""),
                                    g = [
                                        /N\*(D)/g,
                                        /(N|D)[*\/]N/g,
                                        /(N|D)O\1/g,
                                        /\((N|D)\)/g,
                                    ],
                                    h = 0;
                                h < g.length;

                            )
                                g[h].test(f)
                                    ? ((f = f.replace(g[h], "$1")), (h = 0))
                                    : h++
                            if ("D" == f) {
                                for (var i in d) {
                                    var j = c(
                                        b
                                            .replace(
                                                new RegExp("U" + i, "g"),
                                                ""
                                            )
                                            .replace(new RegExp(e, "g"), "*0")
                                    )
                                    if (!isFinite(j)) return
                                    d[i] = j
                                }
                                return d
                            }
                        }
                    }
                    function e(a, b) {
                        return f(a, b, !0)
                    }
                    function f(b, c, d) {
                        var e,
                            f = []
                        for (e in b) f.push(e)
                        for (e in c) f.indexOf(e) < 0 && f.push(e)
                        return (
                            (b = f.map(function (a) {
                                return b[a] || 0
                            })),
                            (c = f.map(function (a) {
                                return c[a] || 0
                            })),
                            [
                                b,
                                c,
                                function (b) {
                                    var c = b
                                        .map(function (c, e) {
                                            return (
                                                1 == b.length &&
                                                    d &&
                                                    (c = Math.max(c, 0)),
                                                a.numberToString(c) + f[e]
                                            )
                                        })
                                        .join(" + ")
                                    return b.length > 1 ? "calc(" + c + ")" : c
                                },
                            ]
                        )
                    }
                    var g = "px|em|ex|ch|rem|vw|vh|vmin|vmax|cm|mm|in|pt|pc",
                        h = d.bind(null, new RegExp(g, "g")),
                        i = d.bind(null, new RegExp(g + "|%", "g")),
                        j = d.bind(null, /deg|rad|grad|turn/g)
                    ;(a.parseLength = h),
                        (a.parseLengthOrPercent = i),
                        (a.consumeLengthOrPercent = a.consumeParenthesised.bind(
                            null,
                            i
                        )),
                        (a.parseAngle = j),
                        (a.mergeDimensions = f)
                    var k = a.consumeParenthesised.bind(null, h),
                        l = a.consumeRepeated.bind(void 0, k, /^/),
                        m = a.consumeRepeated.bind(void 0, l, /^,/)
                    a.consumeSizePairList = m
                    var n = function (a) {
                            var b = m(a)
                            if (b && "" == b[1]) return b[0]
                        },
                        o = a.mergeNestedRepeated.bind(void 0, e, " "),
                        p = a.mergeNestedRepeated.bind(void 0, o, ",")
                    ;(a.mergeNonNegativeSizePair = o),
                        a.addPropertiesHandler(n, p, ["background-size"]),
                        a.addPropertiesHandler(i, e, [
                            "border-bottom-width",
                            "border-image-width",
                            "border-left-width",
                            "border-right-width",
                            "border-top-width",
                            "flex-basis",
                            "font-size",
                            "height",
                            "line-height",
                            "max-height",
                            "max-width",
                            "outline-width",
                            "width",
                        ]),
                        a.addPropertiesHandler(i, f, [
                            "border-bottom-left-radius",
                            "border-bottom-right-radius",
                            "border-top-left-radius",
                            "border-top-right-radius",
                            "bottom",
                            "left",
                            "letter-spacing",
                            "margin-bottom",
                            "margin-left",
                            "margin-right",
                            "margin-top",
                            "min-height",
                            "min-width",
                            "outline-offset",
                            "padding-bottom",
                            "padding-left",
                            "padding-right",
                            "padding-top",
                            "perspective",
                            "right",
                            "shape-margin",
                            "stroke-dashoffset",
                            "text-indent",
                            "top",
                            "vertical-align",
                            "word-spacing",
                        ])
                })(b),
                (function (a, b) {
                    function c(b) {
                        return (
                            a.consumeLengthOrPercent(b) ||
                            a.consumeToken(/^auto/, b)
                        )
                    }
                    function d(b) {
                        var d = a.consumeList(
                            [
                                a.ignore(a.consumeToken.bind(null, /^rect/)),
                                a.ignore(a.consumeToken.bind(null, /^\(/)),
                                a.consumeRepeated.bind(null, c, /^,/),
                                a.ignore(a.consumeToken.bind(null, /^\)/)),
                            ],
                            b
                        )
                        if (d && 4 == d[0].length) return d[0]
                    }
                    function e(b, c) {
                        return "auto" == b || "auto" == c
                            ? [
                                  !0,
                                  !1,
                                  function (d) {
                                      var e = d ? b : c
                                      if ("auto" == e) return "auto"
                                      var f = a.mergeDimensions(e, e)
                                      return f[2](f[0])
                                  },
                              ]
                            : a.mergeDimensions(b, c)
                    }
                    function f(a) {
                        return "rect(" + a + ")"
                    }
                    var g = a.mergeWrappedNestedRepeated.bind(null, f, e, ", ")
                    ;(a.parseBox = d),
                        (a.mergeBoxes = g),
                        a.addPropertiesHandler(d, g, ["clip"])
                })(b),
                (function (a, b) {
                    function c(a) {
                        return function (b) {
                            var c = 0
                            return a.map(function (a) {
                                return a === k ? b[c++] : a
                            })
                        }
                    }
                    function d(a) {
                        return a
                    }
                    function e(b) {
                        if ("none" == (b = b.toLowerCase().trim())) return []
                        for (
                            var c, d = /\s*(\w+)\(([^)]*)\)/g, e = [], f = 0;
                            (c = d.exec(b));

                        ) {
                            if (c.index != f) return
                            f = c.index + c[0].length
                            var g = c[1],
                                h = n[g]
                            if (!h) return
                            var i = c[2].split(","),
                                j = h[0]
                            if (j.length < i.length) return
                            for (var k = [], o = 0; o < j.length; o++) {
                                var p,
                                    q = i[o],
                                    r = j[o]
                                if (
                                    void 0 ===
                                    (p = q
                                        ? {
                                              A: function (b) {
                                                  return "0" == b.trim()
                                                      ? m
                                                      : a.parseAngle(b)
                                              },
                                              N: a.parseNumber,
                                              T: a.parseLengthOrPercent,
                                              L: a.parseLength,
                                          }[r.toUpperCase()](q)
                                        : { a: m, n: k[0], t: l }[r])
                                )
                                    return
                                k.push(p)
                            }
                            if (
                                (e.push({ t: g, d: k }),
                                d.lastIndex == b.length)
                            )
                                return e
                        }
                    }
                    function f(a) {
                        return a.toFixed(6).replace(".000000", "")
                    }
                    function g(b, c) {
                        if (b.decompositionPair !== c) {
                            b.decompositionPair = c
                            var d = a.makeMatrixDecomposition(b)
                        }
                        if (c.decompositionPair !== b) {
                            c.decompositionPair = b
                            var e = a.makeMatrixDecomposition(c)
                        }
                        return null == d[0] || null == e[0]
                            ? [
                                  [!1],
                                  [!0],
                                  function (a) {
                                      return a ? c[0].d : b[0].d
                                  },
                              ]
                            : (d[0].push(0),
                              e[0].push(1),
                              [
                                  d,
                                  e,
                                  function (b) {
                                      var c = a.quat(d[0][3], e[0][3], b[5])
                                      return a
                                          .composeMatrix(
                                              b[0],
                                              b[1],
                                              b[2],
                                              c,
                                              b[4]
                                          )
                                          .map(f)
                                          .join(",")
                                  },
                              ])
                    }
                    function h(a) {
                        return a.replace(/[xy]/, "")
                    }
                    function i(a) {
                        return a.replace(/(x|y|z|3d)?$/, "3d")
                    }
                    function j(b, c) {
                        var d = a.makeMatrixDecomposition && !0,
                            e = !1
                        if (!b.length || !c.length) {
                            b.length || ((e = !0), (b = c), (c = []))
                            for (var f = 0; f < b.length; f++) {
                                var j = b[f].t,
                                    k = b[f].d,
                                    l = "scale" == j.substr(0, 5) ? 1 : 0
                                c.push({
                                    t: j,
                                    d: k.map(function (a) {
                                        if ("number" == typeof a) return l
                                        var b = {}
                                        for (var c in a) b[c] = l
                                        return b
                                    }),
                                })
                            }
                        }
                        var m = function (a, b) {
                                return (
                                    ("perspective" == a &&
                                        "perspective" == b) ||
                                    (("matrix" == a || "matrix3d" == a) &&
                                        ("matrix" == b || "matrix3d" == b))
                                )
                            },
                            o = [],
                            p = [],
                            q = []
                        if (b.length != c.length) {
                            if (!d) return
                            var r = g(b, c)
                            ;(o = [r[0]]),
                                (p = [r[1]]),
                                (q = [["matrix", [r[2]]]])
                        } else
                            for (var f = 0; f < b.length; f++) {
                                var j,
                                    s = b[f].t,
                                    t = c[f].t,
                                    u = b[f].d,
                                    v = c[f].d,
                                    w = n[s],
                                    x = n[t]
                                if (m(s, t)) {
                                    if (!d) return
                                    var r = g([b[f]], [c[f]])
                                    o.push(r[0]),
                                        p.push(r[1]),
                                        q.push(["matrix", [r[2]]])
                                } else {
                                    if (s == t) j = s
                                    else if (w[2] && x[2] && h(s) == h(t))
                                        (j = h(s)), (u = w[2](u)), (v = x[2](v))
                                    else {
                                        if (!w[1] || !x[1] || i(s) != i(t)) {
                                            if (!d) return
                                            var r = g(b, c)
                                            ;(o = [r[0]]),
                                                (p = [r[1]]),
                                                (q = [["matrix", [r[2]]]])
                                            break
                                        }
                                        ;(j = i(s)),
                                            (u = w[1](u)),
                                            (v = x[1](v))
                                    }
                                    for (
                                        var y = [], z = [], A = [], B = 0;
                                        B < u.length;
                                        B++
                                    ) {
                                        var C =
                                                "number" == typeof u[B]
                                                    ? a.mergeNumbers
                                                    : a.mergeDimensions,
                                            r = C(u[B], v[B])
                                        ;(y[B] = r[0]),
                                            (z[B] = r[1]),
                                            A.push(r[2])
                                    }
                                    o.push(y), p.push(z), q.push([j, A])
                                }
                            }
                        if (e) {
                            var D = o
                            ;(o = p), (p = D)
                        }
                        return [
                            o,
                            p,
                            function (a) {
                                return a
                                    .map(function (a, b) {
                                        var c = a
                                            .map(function (a, c) {
                                                return q[b][1][c](a)
                                            })
                                            .join(",")
                                        return (
                                            "matrix" == q[b][0] &&
                                                16 == c.split(",").length &&
                                                (q[b][0] = "matrix3d"),
                                            q[b][0] + "(" + c + ")"
                                        )
                                    })
                                    .join(" ")
                            },
                        ]
                    }
                    var k = null,
                        l = { px: 0 },
                        m = { deg: 0 },
                        n = {
                            matrix: [
                                "NNNNNN",
                                [
                                    k,
                                    k,
                                    0,
                                    0,
                                    k,
                                    k,
                                    0,
                                    0,
                                    0,
                                    0,
                                    1,
                                    0,
                                    k,
                                    k,
                                    0,
                                    1,
                                ],
                                d,
                            ],
                            matrix3d: ["NNNNNNNNNNNNNNNN", d],
                            rotate: ["A"],
                            rotatex: ["A"],
                            rotatey: ["A"],
                            rotatez: ["A"],
                            rotate3d: ["NNNA"],
                            perspective: ["L"],
                            scale: ["Nn", c([k, k, 1]), d],
                            scalex: ["N", c([k, 1, 1]), c([k, 1])],
                            scaley: ["N", c([1, k, 1]), c([1, k])],
                            scalez: ["N", c([1, 1, k])],
                            scale3d: ["NNN", d],
                            skew: ["Aa", null, d],
                            skewx: ["A", null, c([k, m])],
                            skewy: ["A", null, c([m, k])],
                            translate: ["Tt", c([k, k, l]), d],
                            translatex: ["T", c([k, l, l]), c([k, l])],
                            translatey: ["T", c([l, k, l]), c([l, k])],
                            translatez: ["L", c([l, l, k])],
                            translate3d: ["TTL", d],
                        }
                    a.addPropertiesHandler(e, j, ["transform"]),
                        (a.transformToSvgMatrix = function (b) {
                            var c = a.transformListToMatrix(e(b))
                            return (
                                "matrix(" +
                                f(c[0]) +
                                " " +
                                f(c[1]) +
                                " " +
                                f(c[4]) +
                                " " +
                                f(c[5]) +
                                " " +
                                f(c[12]) +
                                " " +
                                f(c[13]) +
                                ")"
                            )
                        })
                })(b),
                (function (a) {
                    function b(a) {
                        var b = Number(a)
                        if (!(isNaN(b) || b < 100 || b > 900 || b % 100 != 0))
                            return b
                    }
                    function c(b) {
                        return (
                            (b = 100 * Math.round(b / 100)),
                            (b = a.clamp(100, 900, b)),
                            400 === b
                                ? "normal"
                                : 700 === b
                                ? "bold"
                                : String(b)
                        )
                    }
                    function d(a, b) {
                        return [a, b, c]
                    }
                    a.addPropertiesHandler(b, d, ["font-weight"])
                })(b),
                (function (a) {
                    function b(a) {
                        var b = {}
                        for (var c in a) b[c] = -a[c]
                        return b
                    }
                    function c(b) {
                        return (
                            a.consumeToken(
                                /^(left|center|right|top|bottom)\b/i,
                                b
                            ) || a.consumeLengthOrPercent(b)
                        )
                    }
                    function d(b, d) {
                        var e = a.consumeRepeated(c, /^/, d)
                        if (e && "" == e[1]) {
                            var f = e[0]
                            if (
                                ((f[0] = f[0] || "center"),
                                (f[1] = f[1] || "center"),
                                3 == b && (f[2] = f[2] || { px: 0 }),
                                f.length == b)
                            ) {
                                if (
                                    /top|bottom/.test(f[0]) ||
                                    /left|right/.test(f[1])
                                ) {
                                    var h = f[0]
                                    ;(f[0] = f[1]), (f[1] = h)
                                }
                                if (
                                    /left|right|center|Object/.test(f[0]) &&
                                    /top|bottom|center|Object/.test(f[1])
                                )
                                    return f.map(function (a) {
                                        return "object" == typeof a ? a : g[a]
                                    })
                            }
                        }
                    }
                    function e(d) {
                        var e = a.consumeRepeated(c, /^/, d)
                        if (e) {
                            for (
                                var f = e[0],
                                    h = [{ "%": 50 }, { "%": 50 }],
                                    i = 0,
                                    j = !1,
                                    k = 0;
                                k < f.length;
                                k++
                            ) {
                                var l = f[k]
                                "string" == typeof l
                                    ? ((j = /bottom|right/.test(l)),
                                      (i = {
                                          left: 0,
                                          right: 0,
                                          center: i,
                                          top: 1,
                                          bottom: 1,
                                      }[l]),
                                      (h[i] = g[l]),
                                      "center" == l && i++)
                                    : (j &&
                                          ((l = b(l)),
                                          (l["%"] = (l["%"] || 0) + 100)),
                                      (h[i] = l),
                                      i++,
                                      (j = !1))
                            }
                            return [h, e[1]]
                        }
                    }
                    function f(b) {
                        var c = a.consumeRepeated(e, /^,/, b)
                        if (c && "" == c[1]) return c[0]
                    }
                    var g = {
                            left: { "%": 0 },
                            center: { "%": 50 },
                            right: { "%": 100 },
                            top: { "%": 0 },
                            bottom: { "%": 100 },
                        },
                        h = a.mergeNestedRepeated.bind(
                            null,
                            a.mergeDimensions,
                            " "
                        )
                    a.addPropertiesHandler(d.bind(null, 3), h, [
                        "transform-origin",
                    ]),
                        a.addPropertiesHandler(d.bind(null, 2), h, [
                            "perspective-origin",
                        ]),
                        (a.consumePosition = e),
                        (a.mergeOffsetList = h)
                    var i = a.mergeNestedRepeated.bind(null, h, ", ")
                    a.addPropertiesHandler(f, i, [
                        "background-position",
                        "object-position",
                    ])
                })(b),
                (function (a) {
                    function b(b) {
                        var c = a.consumeToken(/^circle/, b)
                        if (c && c[0])
                            return ["circle"].concat(
                                a.consumeList(
                                    [
                                        a.ignore(
                                            a.consumeToken.bind(void 0, /^\(/)
                                        ),
                                        d,
                                        a.ignore(
                                            a.consumeToken.bind(void 0, /^at/)
                                        ),
                                        a.consumePosition,
                                        a.ignore(
                                            a.consumeToken.bind(void 0, /^\)/)
                                        ),
                                    ],
                                    c[1]
                                )
                            )
                        var f = a.consumeToken(/^ellipse/, b)
                        if (f && f[0])
                            return ["ellipse"].concat(
                                a.consumeList(
                                    [
                                        a.ignore(
                                            a.consumeToken.bind(void 0, /^\(/)
                                        ),
                                        e,
                                        a.ignore(
                                            a.consumeToken.bind(void 0, /^at/)
                                        ),
                                        a.consumePosition,
                                        a.ignore(
                                            a.consumeToken.bind(void 0, /^\)/)
                                        ),
                                    ],
                                    f[1]
                                )
                            )
                        var g = a.consumeToken(/^polygon/, b)
                        return g && g[0]
                            ? ["polygon"].concat(
                                  a.consumeList(
                                      [
                                          a.ignore(
                                              a.consumeToken.bind(void 0, /^\(/)
                                          ),
                                          a.optional(
                                              a.consumeToken.bind(
                                                  void 0,
                                                  /^nonzero\s*,|^evenodd\s*,/
                                              ),
                                              "nonzero,"
                                          ),
                                          a.consumeSizePairList,
                                          a.ignore(
                                              a.consumeToken.bind(void 0, /^\)/)
                                          ),
                                      ],
                                      g[1]
                                  )
                              )
                            : void 0
                    }
                    function c(b, c) {
                        if (b[0] === c[0])
                            return "circle" == b[0]
                                ? a.mergeList(b.slice(1), c.slice(1), [
                                      "circle(",
                                      a.mergeDimensions,
                                      " at ",
                                      a.mergeOffsetList,
                                      ")",
                                  ])
                                : "ellipse" == b[0]
                                ? a.mergeList(b.slice(1), c.slice(1), [
                                      "ellipse(",
                                      a.mergeNonNegativeSizePair,
                                      " at ",
                                      a.mergeOffsetList,
                                      ")",
                                  ])
                                : "polygon" == b[0] && b[1] == c[1]
                                ? a.mergeList(b.slice(2), c.slice(2), [
                                      "polygon(",
                                      b[1],
                                      g,
                                      ")",
                                  ])
                                : void 0
                    }
                    var d = a.consumeParenthesised.bind(
                            null,
                            a.parseLengthOrPercent
                        ),
                        e = a.consumeRepeated.bind(void 0, d, /^/),
                        f = a.mergeNestedRepeated.bind(
                            void 0,
                            a.mergeDimensions,
                            " "
                        ),
                        g = a.mergeNestedRepeated.bind(void 0, f, ",")
                    a.addPropertiesHandler(b, c, ["shape-outside"])
                })(b),
                (function (a, b) {
                    function c(a, b) {
                        b.concat([a]).forEach(function (b) {
                            b in document.documentElement.style && (d[a] = b),
                                (e[b] = a)
                        })
                    }
                    var d = {},
                        e = {}
                    c("transform", ["webkitTransform", "msTransform"]),
                        c("transformOrigin", ["webkitTransformOrigin"]),
                        c("perspective", ["webkitPerspective"]),
                        c("perspectiveOrigin", ["webkitPerspectiveOrigin"]),
                        (a.propertyName = function (a) {
                            return d[a] || a
                        }),
                        (a.unprefixedPropertyName = function (a) {
                            return e[a] || a
                        })
                })(b)
        })(),
        (function () {
            if (void 0 === document.createElement("div").animate([]).oncancel) {
                var a
                if (window.performance && performance.now)
                    var a = function () {
                        return performance.now()
                    }
                else
                    var a = function () {
                        return Date.now()
                    }
                var b = function (a, b, c) {
                        ;(this.target = a),
                            (this.currentTime = b),
                            (this.timelineTime = c),
                            (this.type = "cancel"),
                            (this.bubbles = !1),
                            (this.cancelable = !1),
                            (this.currentTarget = a),
                            (this.defaultPrevented = !1),
                            (this.eventPhase = Event.AT_TARGET),
                            (this.timeStamp = Date.now())
                    },
                    c = window.Element.prototype.animate
                window.Element.prototype.animate = function (d, e) {
                    var f = c.call(this, d, e)
                    ;(f._cancelHandlers = []), (f.oncancel = null)
                    var g = f.cancel
                    f.cancel = function () {
                        g.call(this)
                        var c = new b(this, null, a()),
                            d = this._cancelHandlers.concat(
                                this.oncancel ? [this.oncancel] : []
                            )
                        setTimeout(function () {
                            d.forEach(function (a) {
                                a.call(c.target, c)
                            })
                        }, 0)
                    }
                    var h = f.addEventListener
                    f.addEventListener = function (a, b) {
                        "function" == typeof b && "cancel" == a
                            ? this._cancelHandlers.push(b)
                            : h.call(this, a, b)
                    }
                    var i = f.removeEventListener
                    return (
                        (f.removeEventListener = function (a, b) {
                            if ("cancel" == a) {
                                var c = this._cancelHandlers.indexOf(b)
                                c >= 0 && this._cancelHandlers.splice(c, 1)
                            } else i.call(this, a, b)
                        }),
                        f
                    )
                }
            }
        })(),
        (function (a) {
            var b = document.documentElement,
                c = null,
                d = !1
            try {
                var e = getComputedStyle(b).getPropertyValue("opacity"),
                    f = "0" == e ? "1" : "0"
                ;(c = b.animate({ opacity: [f, f] }, { duration: 1 })),
                    (c.currentTime = 0),
                    (d = getComputedStyle(b).getPropertyValue("opacity") == f)
            } catch (a) {
            } finally {
                c && c.cancel()
            }
            if (!d) {
                var g = window.Element.prototype.animate
                window.Element.prototype.animate = function (b, c) {
                    return (
                        window.Symbol &&
                            Symbol.iterator &&
                            Array.prototype.from &&
                            b[Symbol.iterator] &&
                            (b = Array.from(b)),
                        Array.isArray(b) ||
                            null === b ||
                            (b = a.convertToArrayForm(b)),
                        g.call(this, b, c)
                    )
                }
            }
        })(a)
})()
//# sourceMappingURL=web-animations.min.js.map
