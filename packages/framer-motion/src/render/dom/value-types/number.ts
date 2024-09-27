import { alpha } from "../../../value/types/numbers"
import { px } from "../../../value/types/numbers/units"
import { browserNumberValueTypes } from "./number-browser"
import { transformValueTypes } from "./transform"
import { int } from "./type-int"
import { ValueTypeMap } from "./types"

export const numberValueTypes: ValueTypeMap = {
    ...browserNumberValueTypes,
    ...transformValueTypes,
    zIndex: int,
    size: px,

    // SVG
    fillOpacity: alpha,
    strokeOpacity: alpha,
    numOctaves: int,
}
