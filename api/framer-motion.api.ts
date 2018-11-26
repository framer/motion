// @public (undocumented)
export function usePose<AllowedPoses extends ComponentType | string = string>(
    initialPose?: (PoseNames<AllowedPoses>) | PoseNames<AllowedPoses>[],
    cyclePoses?: (PoseNames<AllowedPoses>)[]
): [
    MotionValue<any>,
    PoseSetter<DefaultPose<AllowedPoses extends ComponentType<{}> ? ComponentPoseNames<AllowedPoses> : AllowedPoses>>
]

// WARNING: Unsupported export: motion
// WARNING: Unsupported export: useMotionValue
// WARNING: Unsupported export: useTransform
// (No @packagedocumentation comment for this package)
