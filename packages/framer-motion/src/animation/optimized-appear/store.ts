export interface AppearStoreEntry {
    animation: Animation
    ready: boolean
}

export const appearAnimationStore = new Map<string, AppearStoreEntry>()
