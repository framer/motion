/**
 * Per-node data, in 32-bit floats. Homographies are row-major 3x3, as in
 * `quad/mat3`, and components are `quad/decompose`'s eight.
 *
 * Inputs, written by the CPU each frame:
 */
export const IN = 44
export const LIVE = 0 // the lead's own transform, from its layout
export const SPACE = 9 // the space it's drawn in, or (with PARENT) the part below its parent
export const RECT = 18 // its layout: min x, min y, max x, max y
export const START = 22 // the snapshot, as components resolved in its space
export const BASE = 30 // its live components when the animation resolved
export const PROGRESS = 38
export const PARENT = 39 // 1 + the slot whose visual SPACE is drawn in, or 0
export const LEAD = 40 // for followers, 1 + the lead's slot, otherwise 0
export const FLAGS = 41 // 1 if shared, plus 2 * the animationType code

/**
 * Outputs, read back by the CPU:
 */
export const OUT = 26
export const OUTPUT = 0 // the node's own transform, in page space
export const VISUAL = 9 // SPACE * OUTPUT
export const MIXED = 18 // the mixed components

/**
 * Dispatches are made level by level, so every node is computed after the
 * parent and lead it depends on. Each level's range of `order` is a
 * uniform at this stride, bound with a dynamic offset.
 */
export const LEVEL_STRIDE = 256
export const MAX_LEVELS = 32
export const WORKGROUP_SIZE = 64

export const animationTypes: { [key: string]: number } = {
    position: 1,
    size: 2,
    x: 3,
    y: 4,
    "preserve-aspect": 5,
}

const matrix = (name: string, buffer: string) => `
fn ${name}(at: u32) -> mat3x3<f32> {
    return mat3x3<f32>(
        ${buffer}[at], ${buffer}[at + 3u], ${buffer}[at + 6u],
        ${buffer}[at + 1u], ${buffer}[at + 4u], ${buffer}[at + 7u],
        ${buffer}[at + 2u], ${buffer}[at + 5u], ${buffer}[at + 8u]
    );
}`

/**
 * The same maths as the CPU quad engine's per-frame step (calcQuadLead
 * and calcQuadFollow in node/quad-projection), one node per invocation.
 * Resolving the snapshot into a lead's space happens once per animation,
 * on the CPU, so it isn't repeated here.
 *
 * Built on demand, so bundles that never create the engine drop it.
 */
export const createShader = () => /* wgsl */ `
struct Level {
    offset: u32,
    count: u32,
    padding: vec2<u32>,
}

alias Components = array<f32, 8>;

@group(0) @binding(0) var<storage, read> inputs: array<f32>;
@group(0) @binding(1) var<storage, read_write> rotations: array<f32>;
@group(0) @binding(2) var<storage, read_write> outputs: array<f32>;
@group(0) @binding(3) var<storage, read> order: array<u32>;
@group(0) @binding(4) var<uniform> level: Level;

const TAU = 6.283185307179586;
${matrix("loadInput", "inputs")}
${matrix("loadOutput", "outputs")}

fn storeOutput(at: u32, m: mat3x3<f32>) {
    outputs[at] = m[0].x;
    outputs[at + 1u] = m[1].x;
    outputs[at + 2u] = m[2].x;
    outputs[at + 3u] = m[0].y;
    outputs[at + 4u] = m[1].y;
    outputs[at + 5u] = m[2].y;
    outputs[at + 6u] = m[0].z;
    outputs[at + 7u] = m[1].z;
    outputs[at + 8u] = m[2].z;
}

fn loadComponents(at: u32) -> Components {
    return Components(
        inputs[at], inputs[at + 1u], inputs[at + 2u], inputs[at + 3u],
        inputs[at + 4u], inputs[at + 5u], inputs[at + 6u], inputs[at + 7u]
    );
}

fn loadRect(at: u32) -> vec4<f32> {
    return vec4<f32>(inputs[at], inputs[at + 1u], inputs[at + 2u], inputs[at + 3u]);
}

fn translate(x: f32, y: f32) -> mat3x3<f32> {
    return mat3x3<f32>(1.0, 0.0, 0.0, 0.0, 1.0, 0.0, x, y, 1.0);
}

fn inverse(m: mat3x3<f32>) -> mat3x3<f32> {
    let r0 = cross(m[1], m[2]);
    let r1 = cross(m[2], m[0]);
    let r2 = cross(m[0], m[1]);
    return transpose(mat3x3<f32>(r0, r1, r2)) * (1.0 / dot(m[0], r0));
}

struct Decomposed {
    ok: bool,
    components: Components,
}

fn decompose(m: mat3x3<f32>, cx: f32, cy: f32) -> Decomposed {
    var result: Decomposed;
    var g = m * translate(cx, cy);
    let w = g[2].z;
    if (w == 0.0) {
        return result;
    }
    g = g * (1.0 / w);

    let px = g[0].z;
    let py = g[1].z;
    let x = g[2].x;
    let y = g[2].y;
    let a = g[0].x - x * px;
    let b = g[1].x - x * py;
    let c = g[0].y - y * px;
    let d = g[1].y - y * py;

    var scaleX = sqrt(a * a + c * c);
    if (a * d - b * c < 0.0 && a < d) {
        scaleX = -scaleX;
    }
    var rotate = 0.0;
    if (scaleX != 0.0) {
        rotate = atan2(c / scaleX, a / scaleX);
    }
    let cosine = cos(rotate);
    let sine = sin(rotate);

    result.ok = true;
    result.components = Components(
        x, y, rotate, scaleX,
        d * cosine - b * sine, b * cosine + d * sine,
        px, py
    );
    return result;
}

fn compose(k: Components, cx: f32, cy: f32) -> mat3x3<f32> {
    let cosine = cos(k[2]);
    let sine = sin(k[2]);
    let a = cosine * k[3];
    let b = cosine * k[5] - sine * k[4];
    let c = sine * k[3];
    let d = sine * k[5] + cosine * k[4];
    let m = mat3x3<f32>(
        a + k[0] * k[6], c + k[1] * k[6], k[6],
        b + k[0] * k[7], d + k[1] * k[7], k[7],
        k[0], k[1], 1.0
    );
    return m * translate(-cx, -cy);
}

/**
 * mixToLive and constrain in node/quad-projection.
 */
fn mixToLive(start: Components, base: Components, live: Components, progress: f32, isShared: bool) -> Components {
    var s = start;
    var b = base;
    var l = live;
    var out: Components;
    for (var i = 0u; i < 8u; i++) {
        let mixed = s[i] + (b[i] - s[i]) * progress;
        let change = l[i] - b[i];
        if ((i == 3u || i == 4u) && b[i] != 0.0) {
            out[i] = mixed * (l[i] / b[i]);
        } else if (isShared && i > 1u) {
            out[i] = mixed + change * progress;
        } else {
            out[i] = mixed + change;
        }
    }
    return out;
}

fn constrain(mixed: Components, to: Components, animationType: u32, start: Components) -> Components {
    var m = mixed;
    var t = to;
    var kind = animationType;
    if (kind == 5u) {
        if (abs(start[3] / start[4] - to[3] / to[4]) <= 0.2) {
            return m;
        }
        kind = 1u;
    }
    if (kind == 1u) {
        for (var i = 2u; i < 8u; i++) {
            m[i] = t[i];
        }
    } else if (kind == 2u) {
        m[0] = t[0];
        m[1] = t[1];
    } else if (kind == 3u) {
        m[1] = t[1];
        m[4] = t[4];
    } else if (kind == 4u) {
        m[0] = t[0];
        m[3] = t[3];
    }
    return m;
}

@compute @workgroup_size(${WORKGROUP_SIZE})
fn main(@builtin(global_invocation_id) id: vec3<u32>) {
    if (id.x >= level.count) {
        return;
    }
    let slot = order[level.offset + id.x];
    let at = slot * ${IN}u;
    let out = slot * ${OUT}u;
    let rect = loadRect(at + ${RECT}u);

    var space = loadInput(at + ${SPACE}u);
    let parent = u32(inputs[at + ${PARENT}u]);
    if (parent > 0u) {
        space = loadOutput((parent - 1u) * ${OUT}u + ${VISUAL}u) * space;
    }

    let lead = u32(inputs[at + ${LEAD}u]);
    if (lead > 0u) {
        /**
         * A follower: fit its layout to the lead's, then draw it wherever
         * the lead is, from its own space.
         */
        let leadOut = (lead - 1u) * ${OUT}u;
        let leadRect = loadRect((lead - 1u) * ${IN}u + ${RECT}u);
        if (determinant(space) == 0.0) {
            return;
        }
        let sx = (leadRect.z - leadRect.x) / (rect.z - rect.x);
        let sy = (leadRect.w - leadRect.y) / (rect.w - rect.y);
        let fit = mat3x3<f32>(
            sx, 0.0, 0.0,
            0.0, sy, 0.0,
            leadRect.x - rect.x * sx, leadRect.y - rect.y * sy, 1.0
        );
        let visual = loadOutput(leadOut + ${VISUAL}u);
        storeOutput(out + ${OUTPUT}u, inverse(space) * visual * fit);
        storeOutput(out + ${VISUAL}u, visual);
        for (var i = 0u; i < 8u; i++) {
            outputs[out + ${MIXED}u + i] = outputs[leadOut + ${MIXED}u + i];
        }
        outputs[out + ${MIXED}u + 3u] *= sx;
        outputs[out + ${MIXED}u + 4u] *= sy;
        return;
    }

    /**
     * A lead: mix from the snapshot towards its live transform.
     */
    let cx = (rect.x + rect.z) * 0.5;
    let cy = (rect.y + rect.w) * 0.5;
    let base = loadComponents(at + ${BASE}u);
    let start = loadComponents(at + ${START}u);
    let decomposed = decompose(loadInput(at + ${LIVE}u), cx, cy);
    var live = base;
    if (decomposed.ok) {
        live = decomposed.components;
    }
    live[2] -= round((live[2] - rotations[slot]) / TAU) * TAU;
    rotations[slot] = live[2];

    let flags = u32(inputs[at + ${FLAGS}u]);
    var mixed = mixToLive(start, base, live, inputs[at + ${PROGRESS}u], (flags & 1u) != 0u);
    mixed = constrain(mixed, live, flags >> 1u, start);

    let output = compose(mixed, cx, cy);
    storeOutput(out + ${OUTPUT}u, output);
    storeOutput(out + ${VISUAL}u, space * output);
    for (var i = 0u; i < 8u; i++) {
        outputs[out + ${MIXED}u + i] = mixed[i];
    }
}
`
