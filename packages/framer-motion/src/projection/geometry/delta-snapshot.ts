import { Measurements, ProjectionNodeOptions } from "../node/types"
import { eachAxis } from "../utils/each-axis"
import { calcBoxDelta, calcLength } from "./delta-calc"
import { createDelta } from "./models"
import { Box } from "./types"
import { aspectRatio, isCloseTo } from "./utils"

export function shouldAnimatePositionOnly(
    animationType: ProjectionNodeOptions["animationType"],
    snapshot: Box,
    layout: Box
) {
    return (
        animationType === "position" ||
        (animationType === "preserve-aspect" &&
            !isCloseTo(aspectRatio(snapshot), aspectRatio(layout), 0.2))
    )
}

export function resizeSnapshot(
    snapshot: Measurements,
    layout: Measurements,
    animationType: ProjectionNodeOptions["animationType"],
    isShared: boolean
) {
    const snapshotToResize = isShared
        ? snapshot.viewportBox
        : snapshot.layoutBox

    if (animationType === "size") {
        eachAxis((axis) => {
            const length = calcLength(snapshotToResize[axis])
            snapshotToResize[axis].min = layout.layoutBox[axis].min
            snapshotToResize[axis].max = snapshotToResize[axis].min + length
        })
        snapshot.treeScroll = layout.treeScroll
    } else if (
        shouldAnimatePositionOnly(
            animationType,
            snapshot.layoutBox,
            layout.layoutBox
        )
    ) {
        eachAxis((axis) => {
            const length = calcLength(layout.layoutBox[axis])
            snapshotToResize[axis].max = snapshotToResize[axis].min + length
        })
    }
}

export function calcSnapshotDelta(
    snapshot: Measurements,
    layout: Measurements,
    animationType: ProjectionNodeOptions["animationType"] = "both"
) {
    const isShared = snapshot.source !== layout.source

    resizeSnapshot(snapshot, layout, animationType, isShared)

    const delta = createDelta()

    if (snapshot.relative && layout.relative) {
        console.log(layout.relative.box, snapshot.relative.box)
        calcBoxDelta(delta, layout.relative.box, snapshot.relative.box)
    }

    return delta
}

// const layoutDelta = createDelta()
// calcBoxDelta(layoutDelta, layout, snapshot.layoutBox)
// const visualDelta = createDelta()
// if (isShared) {
//     calcBoxDelta(
//         visualDelta,
//         node.applyTransform(measuredLayout, true),
//         snapshot.measuredBox
//     )
// } else {
//     calcBoxDelta(visualDelta, layout, snapshot.layoutBox)
// }

// const hasLayoutChanged = !isDeltaZero(layoutDelta)
// let hasRelativeTargetChanged = false

// if (!node.resumeFrom) {
//     const relativeParent = node.getClosestProjectingParent()

//     /**
//      * If the relativeParent is itself resuming from a different element then
//      * the relative snapshot is not relavent
//      */
//     if (relativeParent && !relativeParent.resumeFrom) {
//         const { snapshot: parentSnapshot, layout: parentLayout } =
//             relativeParent

//         if (parentSnapshot && parentLayout) {
//             const relativeSnapshot = createBox()
//             calcRelativePosition(
//                 relativeSnapshot,
//                 snapshot.layoutBox,
//                 parentSnapshot.layoutBox
//             )

//             const relativeLayout = createBox()
//             calcRelativePosition(
//                 relativeLayout,
//                 layout,
//                 parentLayout.layoutBox
//             )

//             if (!boxEquals(relativeSnapshot, relativeLayout)) {
//                 hasRelativeTargetChanged = true
//             }
//         }
//     }
// }
