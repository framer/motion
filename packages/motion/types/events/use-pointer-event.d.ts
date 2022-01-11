import { RefObject } from "react";
import { EventListenerWithPointInfo } from "./event-info";
export declare function addPointerEvent(target: EventTarget, eventName: string, handler: EventListenerWithPointInfo, options?: AddEventListenerOptions): () => void;
export declare function usePointerEvent(ref: RefObject<Element>, eventName: string, handler?: EventListenerWithPointInfo | undefined, options?: AddEventListenerOptions): void;
