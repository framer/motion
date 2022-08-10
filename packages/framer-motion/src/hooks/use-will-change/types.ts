export interface WillChange {
    add(name: string): void
    remove(name: string): void
    get(): void
}
