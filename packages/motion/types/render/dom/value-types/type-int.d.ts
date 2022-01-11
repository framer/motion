export declare const int: {
    transform: (x: number) => number;
    test: (v: any) => boolean;
    parse: (v: any) => any;
    createTransformer?: ((template: string) => import("style-value-types").Transformer) | undefined;
    default?: any;
    getAnimatableNone?: ((v: any) => any) | undefined;
};
