import * as React from "react";
import { ReactHTML } from "react";
import { HTMLMotionProps } from "../../render/html/types";
export interface Props<V> {
    /**
     * A HTML element to render this component as. Defaults to `"ul"`.
     *
     * @public
     */
    as?: keyof ReactHTML;
    /**
     * The axis to reorder along. By default, items will be draggable on this axis.
     * To make draggable on both axes, set `<Reorder.Item drag />`
     *
     * @public
     */
    axis?: "x" | "y";
    /**
     * A callback to fire with the new value order. For instance, if the values
     * are provided as a state from `useState`, this could be the set state function.
     *
     * @public
     */
    onReorder: (newOrder: any[]) => void;
    /**
     * The latest values state.
     *
     * ```jsx
     * function Component() {
     *   const [items, setItems] = useState([0, 1, 2])
     *
     *   return (
     *     <Reorder.Group values={items} onReorder={setItems}>
     *         {items.map((item) => <Reorder.Item key={item} value={item} />)}
     *     </Reorder.Group>
     *   )
     * }
     * ```
     *
     * @public
     */
    values: V[];
}
export declare function ReorderGroup<V>({ children, as, axis, onReorder, values, ...props }: Props<V> & HTMLMotionProps<any> & React.PropsWithChildren<{}>, externalRef?: React.Ref<any>): JSX.Element;
export declare const Group: React.ForwardRefExoticComponent<Props<unknown> & {
    color?: string | undefined;
    translate?: "no" | "yes" | undefined;
    hidden?: boolean | undefined;
    onPlay?: React.ReactEventHandler<any> | undefined;
    className?: string | undefined;
    id?: string | undefined;
    lang?: string | undefined;
    role?: React.AriaRole | undefined;
    tabIndex?: number | undefined;
    "aria-activedescendant"?: string | undefined;
    "aria-atomic"?: boolean | "false" | "true" | undefined;
    "aria-autocomplete"?: "none" | "inline" | "both" | "list" | undefined;
    "aria-busy"?: boolean | "false" | "true" | undefined;
    "aria-checked"?: boolean | "mixed" | "false" | "true" | undefined;
    "aria-colcount"?: number | undefined;
    "aria-colindex"?: number | undefined;
    "aria-colspan"?: number | undefined;
    "aria-controls"?: string | undefined;
    "aria-current"?: boolean | "page" | "false" | "true" | "step" | "location" | "date" | "time" | undefined;
    "aria-describedby"?: string | undefined;
    "aria-details"?: string | undefined;
    "aria-disabled"?: boolean | "false" | "true" | undefined;
    "aria-dropeffect"?: "none" | "copy" | "move" | "link" | "execute" | "popup" | undefined;
    "aria-errormessage"?: string | undefined;
    "aria-expanded"?: boolean | "false" | "true" | undefined;
    "aria-flowto"?: string | undefined;
    "aria-grabbed"?: boolean | "false" | "true" | undefined;
    "aria-haspopup"?: boolean | "grid" | "listbox" | "menu" | "false" | "true" | "dialog" | "tree" | undefined;
    "aria-hidden"?: boolean | "false" | "true" | undefined;
    "aria-invalid"?: boolean | "false" | "true" | "grammar" | "spelling" | undefined;
    "aria-keyshortcuts"?: string | undefined;
    "aria-label"?: string | undefined;
    "aria-labelledby"?: string | undefined;
    "aria-level"?: number | undefined;
    "aria-live"?: "off" | "assertive" | "polite" | undefined;
    "aria-modal"?: boolean | "false" | "true" | undefined;
    "aria-multiline"?: boolean | "false" | "true" | undefined;
    "aria-multiselectable"?: boolean | "false" | "true" | undefined;
    "aria-orientation"?: "horizontal" | "vertical" | undefined;
    "aria-owns"?: string | undefined;
    "aria-placeholder"?: string | undefined;
    "aria-posinset"?: number | undefined;
    "aria-pressed"?: boolean | "mixed" | "false" | "true" | undefined;
    "aria-readonly"?: boolean | "false" | "true" | undefined;
    "aria-relevant"?: "all" | "text" | "additions" | "additions removals" | "additions text" | "removals" | "removals additions" | "removals text" | "text additions" | "text removals" | undefined;
    "aria-required"?: boolean | "false" | "true" | undefined;
    "aria-roledescription"?: string | undefined;
    "aria-rowcount"?: number | undefined;
    "aria-rowindex"?: number | undefined;
    "aria-rowspan"?: number | undefined;
    "aria-selected"?: boolean | "false" | "true" | undefined;
    "aria-setsize"?: number | undefined;
    "aria-sort"?: "none" | "ascending" | "descending" | "other" | undefined;
    "aria-valuemax"?: number | undefined;
    "aria-valuemin"?: number | undefined;
    "aria-valuenow"?: number | undefined;
    "aria-valuetext"?: string | undefined;
    children?: React.ReactNode;
    dangerouslySetInnerHTML?: {
        __html: string;
    } | undefined;
    onCopy?: React.ClipboardEventHandler<any> | undefined;
    onCopyCapture?: React.ClipboardEventHandler<any> | undefined;
    onCut?: React.ClipboardEventHandler<any> | undefined;
    onCutCapture?: React.ClipboardEventHandler<any> | undefined;
    onPaste?: React.ClipboardEventHandler<any> | undefined;
    onPasteCapture?: React.ClipboardEventHandler<any> | undefined;
    onCompositionEnd?: React.CompositionEventHandler<any> | undefined;
    onCompositionEndCapture?: React.CompositionEventHandler<any> | undefined;
    onCompositionStart?: React.CompositionEventHandler<any> | undefined;
    onCompositionStartCapture?: React.CompositionEventHandler<any> | undefined;
    onCompositionUpdate?: React.CompositionEventHandler<any> | undefined;
    onCompositionUpdateCapture?: React.CompositionEventHandler<any> | undefined;
    onFocus?: React.FocusEventHandler<any> | undefined;
    onFocusCapture?: React.FocusEventHandler<any> | undefined;
    onBlur?: React.FocusEventHandler<any> | undefined;
    onBlurCapture?: React.FocusEventHandler<any> | undefined;
    onChange?: React.FormEventHandler<any> | undefined;
    onChangeCapture?: React.FormEventHandler<any> | undefined;
    onBeforeInput?: React.FormEventHandler<any> | undefined;
    onBeforeInputCapture?: React.FormEventHandler<any> | undefined;
    onInput?: React.FormEventHandler<any> | undefined;
    onInputCapture?: React.FormEventHandler<any> | undefined;
    onReset?: React.FormEventHandler<any> | undefined;
    onResetCapture?: React.FormEventHandler<any> | undefined;
    onSubmit?: React.FormEventHandler<any> | undefined;
    onSubmitCapture?: React.FormEventHandler<any> | undefined;
    onInvalid?: React.FormEventHandler<any> | undefined;
    onInvalidCapture?: React.FormEventHandler<any> | undefined;
    onLoad?: React.ReactEventHandler<any> | undefined;
    onLoadCapture?: React.ReactEventHandler<any> | undefined;
    onError?: React.ReactEventHandler<any> | undefined;
    onErrorCapture?: React.ReactEventHandler<any> | undefined;
    onKeyDown?: React.KeyboardEventHandler<any> | undefined;
    onKeyDownCapture?: React.KeyboardEventHandler<any> | undefined;
    onKeyPress?: React.KeyboardEventHandler<any> | undefined;
    onKeyPressCapture?: React.KeyboardEventHandler<any> | undefined;
    onKeyUp?: React.KeyboardEventHandler<any> | undefined;
    onKeyUpCapture?: React.KeyboardEventHandler<any> | undefined;
    onAbort?: React.ReactEventHandler<any> | undefined;
    onAbortCapture?: React.ReactEventHandler<any> | undefined;
    onCanPlay?: React.ReactEventHandler<any> | undefined;
    onCanPlayCapture?: React.ReactEventHandler<any> | undefined;
    onCanPlayThrough?: React.ReactEventHandler<any> | undefined;
    onCanPlayThroughCapture?: React.ReactEventHandler<any> | undefined;
    onDurationChange?: React.ReactEventHandler<any> | undefined;
    onDurationChangeCapture?: React.ReactEventHandler<any> | undefined;
    onEmptied?: React.ReactEventHandler<any> | undefined;
    onEmptiedCapture?: React.ReactEventHandler<any> | undefined;
    onEncrypted?: React.ReactEventHandler<any> | undefined;
    onEncryptedCapture?: React.ReactEventHandler<any> | undefined;
    onEnded?: React.ReactEventHandler<any> | undefined;
    onEndedCapture?: React.ReactEventHandler<any> | undefined;
    onLoadedData?: React.ReactEventHandler<any> | undefined;
    onLoadedDataCapture?: React.ReactEventHandler<any> | undefined;
    onLoadedMetadata?: React.ReactEventHandler<any> | undefined;
    onLoadedMetadataCapture?: React.ReactEventHandler<any> | undefined;
    onLoadStart?: React.ReactEventHandler<any> | undefined;
    onLoadStartCapture?: React.ReactEventHandler<any> | undefined;
    onPause?: React.ReactEventHandler<any> | undefined;
    onPauseCapture?: React.ReactEventHandler<any> | undefined;
    onPlayCapture?: React.ReactEventHandler<any> | undefined;
    onPlaying?: React.ReactEventHandler<any> | undefined;
    onPlayingCapture?: React.ReactEventHandler<any> | undefined;
    onProgress?: React.ReactEventHandler<any> | undefined;
    onProgressCapture?: React.ReactEventHandler<any> | undefined;
    onRateChange?: React.ReactEventHandler<any> | undefined;
    onRateChangeCapture?: React.ReactEventHandler<any> | undefined;
    onSeeked?: React.ReactEventHandler<any> | undefined;
    onSeekedCapture?: React.ReactEventHandler<any> | undefined;
    onSeeking?: React.ReactEventHandler<any> | undefined;
    onSeekingCapture?: React.ReactEventHandler<any> | undefined;
    onStalled?: React.ReactEventHandler<any> | undefined;
    onStalledCapture?: React.ReactEventHandler<any> | undefined;
    onSuspend?: React.ReactEventHandler<any> | undefined;
    onSuspendCapture?: React.ReactEventHandler<any> | undefined;
    onTimeUpdate?: React.ReactEventHandler<any> | undefined;
    onTimeUpdateCapture?: React.ReactEventHandler<any> | undefined;
    onVolumeChange?: React.ReactEventHandler<any> | undefined;
    onVolumeChangeCapture?: React.ReactEventHandler<any> | undefined;
    onWaiting?: React.ReactEventHandler<any> | undefined;
    onWaitingCapture?: React.ReactEventHandler<any> | undefined;
    onAuxClick?: React.MouseEventHandler<any> | undefined;
    onAuxClickCapture?: React.MouseEventHandler<any> | undefined;
    onClick?: React.MouseEventHandler<any> | undefined;
    onClickCapture?: React.MouseEventHandler<any> | undefined;
    onContextMenu?: React.MouseEventHandler<any> | undefined;
    onContextMenuCapture?: React.MouseEventHandler<any> | undefined;
    onDoubleClick?: React.MouseEventHandler<any> | undefined;
    onDoubleClickCapture?: React.MouseEventHandler<any> | undefined;
    onDragCapture?: React.DragEventHandler<any> | undefined;
    onDragEndCapture?: React.DragEventHandler<any> | undefined;
    onDragEnter?: React.DragEventHandler<any> | undefined;
    onDragEnterCapture?: React.DragEventHandler<any> | undefined;
    onDragExit?: React.DragEventHandler<any> | undefined;
    onDragExitCapture?: React.DragEventHandler<any> | undefined;
    onDragLeave?: React.DragEventHandler<any> | undefined;
    onDragLeaveCapture?: React.DragEventHandler<any> | undefined;
    onDragOver?: React.DragEventHandler<any> | undefined;
    onDragOverCapture?: React.DragEventHandler<any> | undefined;
    onDragStartCapture?: React.DragEventHandler<any> | undefined;
    onDrop?: React.DragEventHandler<any> | undefined;
    onDropCapture?: React.DragEventHandler<any> | undefined;
    onMouseDown?: React.MouseEventHandler<any> | undefined;
    onMouseDownCapture?: React.MouseEventHandler<any> | undefined;
    onMouseEnter?: React.MouseEventHandler<any> | undefined;
    onMouseLeave?: React.MouseEventHandler<any> | undefined;
    onMouseMove?: React.MouseEventHandler<any> | undefined;
    onMouseMoveCapture?: React.MouseEventHandler<any> | undefined;
    onMouseOut?: React.MouseEventHandler<any> | undefined;
    onMouseOutCapture?: React.MouseEventHandler<any> | undefined;
    onMouseOver?: React.MouseEventHandler<any> | undefined;
    onMouseOverCapture?: React.MouseEventHandler<any> | undefined;
    onMouseUp?: React.MouseEventHandler<any> | undefined;
    onMouseUpCapture?: React.MouseEventHandler<any> | undefined;
    onSelect?: React.ReactEventHandler<any> | undefined;
    onSelectCapture?: React.ReactEventHandler<any> | undefined;
    onTouchCancel?: React.TouchEventHandler<any> | undefined;
    onTouchCancelCapture?: React.TouchEventHandler<any> | undefined;
    onTouchEnd?: React.TouchEventHandler<any> | undefined;
    onTouchEndCapture?: React.TouchEventHandler<any> | undefined;
    onTouchMove?: React.TouchEventHandler<any> | undefined;
    onTouchMoveCapture?: React.TouchEventHandler<any> | undefined;
    onTouchStart?: React.TouchEventHandler<any> | undefined;
    onTouchStartCapture?: React.TouchEventHandler<any> | undefined;
    onPointerDown?: React.PointerEventHandler<any> | undefined;
    onPointerDownCapture?: React.PointerEventHandler<any> | undefined;
    onPointerMove?: React.PointerEventHandler<any> | undefined;
    onPointerMoveCapture?: React.PointerEventHandler<any> | undefined;
    onPointerUp?: React.PointerEventHandler<any> | undefined;
    onPointerUpCapture?: React.PointerEventHandler<any> | undefined;
    onPointerCancel?: React.PointerEventHandler<any> | undefined;
    onPointerCancelCapture?: React.PointerEventHandler<any> | undefined;
    onPointerEnter?: React.PointerEventHandler<any> | undefined;
    onPointerEnterCapture?: React.PointerEventHandler<any> | undefined;
    onPointerLeave?: React.PointerEventHandler<any> | undefined;
    onPointerLeaveCapture?: React.PointerEventHandler<any> | undefined;
    onPointerOver?: React.PointerEventHandler<any> | undefined;
    onPointerOverCapture?: React.PointerEventHandler<any> | undefined;
    onPointerOut?: React.PointerEventHandler<any> | undefined;
    onPointerOutCapture?: React.PointerEventHandler<any> | undefined;
    onGotPointerCapture?: React.PointerEventHandler<any> | undefined;
    onGotPointerCaptureCapture?: React.PointerEventHandler<any> | undefined;
    onLostPointerCapture?: React.PointerEventHandler<any> | undefined;
    onLostPointerCaptureCapture?: React.PointerEventHandler<any> | undefined;
    onScroll?: React.UIEventHandler<any> | undefined;
    onScrollCapture?: React.UIEventHandler<any> | undefined;
    onWheel?: React.WheelEventHandler<any> | undefined;
    onWheelCapture?: React.WheelEventHandler<any> | undefined;
    onAnimationStartCapture?: React.AnimationEventHandler<any> | undefined;
    onAnimationEnd?: React.AnimationEventHandler<any> | undefined;
    onAnimationEndCapture?: React.AnimationEventHandler<any> | undefined;
    onAnimationIteration?: React.AnimationEventHandler<any> | undefined;
    onAnimationIterationCapture?: React.AnimationEventHandler<any> | undefined;
    onTransitionEnd?: React.TransitionEventHandler<any> | undefined;
    onTransitionEndCapture?: React.TransitionEventHandler<any> | undefined;
    slot?: string | undefined;
    title?: string | undefined;
    defaultChecked?: boolean | undefined;
    defaultValue?: string | number | readonly string[] | undefined;
    suppressContentEditableWarning?: boolean | undefined;
    suppressHydrationWarning?: boolean | undefined;
    accessKey?: string | undefined;
    contentEditable?: "inherit" | (boolean | "false" | "true") | undefined;
    contextMenu?: string | undefined;
    dir?: string | undefined;
    draggable?: (boolean | "false" | "true") | undefined;
    placeholder?: string | undefined;
    spellCheck?: (boolean | "false" | "true") | undefined;
    radioGroup?: string | undefined;
    about?: string | undefined;
    datatype?: string | undefined;
    inlist?: any;
    prefix?: string | undefined;
    property?: string | undefined;
    resource?: string | undefined;
    typeof?: string | undefined;
    vocab?: string | undefined;
    autoCapitalize?: string | undefined;
    autoCorrect?: string | undefined;
    autoSave?: string | undefined;
    itemProp?: string | undefined;
    itemScope?: boolean | undefined;
    itemType?: string | undefined;
    itemID?: string | undefined;
    itemRef?: string | undefined;
    results?: number | undefined;
    security?: string | undefined;
    unselectable?: "off" | "on" | undefined;
    inputMode?: "none" | "text" | "search" | "tel" | "url" | "email" | "numeric" | "decimal" | undefined;
    is?: string | undefined;
} & import("../..").MotionProps & React.RefAttributes<any>>;
