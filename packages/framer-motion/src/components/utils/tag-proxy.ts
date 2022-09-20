import { ComponentType, PropsWithChildren } from "react"

export type CreateComponent<Props> = (
    key: string | ComponentType<PropsWithChildren<Props>>
) => ComponentType<PropsWithChildren<Props>>

type BindProps<ComponentProps, TagProps> = ComponentProps &
    Omit<TagProps, keyof ComponentProps>

type BoundComponents<ComponentProps, TagsWithProps> = {
    [K in keyof TagsWithProps]: ComponentType<
        PropsWithChildren<BindProps<ComponentProps, TagsWithProps[K]>>
    >
}

export function tagProxy<ComponentProps extends {}, TagsWithProps>(
    createComponent: CreateComponent<ComponentProps>
) {
    const cache = new Map<string, any>()

    return new Proxy(createComponent, {
        get: (_, key: string) => {
            if (!cache.has(key)) cache.set(key, createComponent(key))
            return cache.get(key)
        },
    }) as (<TagProps>(
        Component: ComponentType<any>
    ) => ComponentType<
        PropsWithChildren<BindProps<ComponentProps, TagProps>>
    >) &
        BoundComponents<ComponentProps, TagsWithProps>
}
