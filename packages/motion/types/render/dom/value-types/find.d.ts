/**
 * Tests a value against the list of ValueTypes
 */
export declare const findValueType: (v: any) => import("style-value-types").ValueType | {
    test: (v: any) => boolean;
    parse: (v: string | number) => (number | import("style-value-types").RGBA | import("style-value-types").HSLA)[];
    createTransformer: (v: string | number) => (v: (string | number | import("style-value-types").Color)[]) => string;
    getAnimatableNone: (v: string | number) => string;
} | undefined;
