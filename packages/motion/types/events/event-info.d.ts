import { EventInfo } from "./types";
export declare type EventListenerWithPointInfo = (e: MouseEvent | TouchEvent | PointerEvent, info: EventInfo) => void;
export declare function extractEventInfo(event: MouseEvent | TouchEvent | PointerEvent, pointType?: "page" | "client"): EventInfo;
export declare function getViewportPointFromEvent(event: MouseEvent | TouchEvent | PointerEvent): EventInfo;
export declare const wrapHandler: (handler: EventListenerWithPointInfo, shouldFilterPrimaryPointer?: boolean) => EventListener;
