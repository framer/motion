import { MotionValue, Subscriber } from "./";
export declare function useOnChange<T>(value: MotionValue<T> | number | string, callback: Subscriber<T>): void;
export declare function useMultiOnChange(values: MotionValue[], handler: () => void): void;
