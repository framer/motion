export interface AppearStoreEntry {
    animation: Animation
    startTime: number | null
}

export const appearAnimationStore = new Map<string, AppearStoreEntry>()
