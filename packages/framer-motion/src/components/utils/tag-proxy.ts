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
    function make<TagProps>(
        Component
    ): ComponentType<PropsWithChildren<BindProps<ComponentProps, TagProps>>> {
        return createComponent(Component)
    }

    const cache = new Map<string, any>()

    return new Proxy(createComponent, {
        get: (_, key: string) => {
            if (!cache.has(key)) cache.set(key, make(key))
            return cache.get(key)
        },
        // TODO BindProps here for custom components
    }) as typeof make & BoundComponents<ComponentProps, TagsWithProps>
}
