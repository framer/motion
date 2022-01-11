export declare type Lock = (() => void) | false;
export declare function createLock(name: string): () => Lock;
export declare function getGlobalLock(drag: boolean | "x" | "y" | "lockDirection"): Lock;
export declare function isDragActive(): boolean;
