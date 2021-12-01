type UnionStringArray<T extends Readonly<string[]>> = T[number]

export const threeElements = ["mesh"] as const
export type ThreeElements = UnionStringArray<typeof threeElements>
