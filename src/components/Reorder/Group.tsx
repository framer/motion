export const Group = () => {}

// ({ children, axis, onReorder, as = "ul" }) => {
//   const Component = useConstant(() => motion<typeof as>(as))
//   const order: ItemData<T>[] = []
//   const isReordering = useRef(false)

//   const context: ReorderContextProps<any> = {
//       axis,
//       registerItem: (id, layout) => {
//           order.push({ id, layout: layout[axis] })
//       },
//       updateOrder: (id, offset, velocity) => {
//           if (isReordering.current) return

//           const newOrder = checkReorder(order, id, offset, velocity)

//           if (order !== newOrder) {
//               isReordering.current = true
//               onReorder(newOrder.map((item) => item.id))
//           }
//       },
//   }

//   useEffect(() => {
//       isReordering.current = false
//   })

//   return (
//       <Component>
//           <ReorderContext.Provider value={context}>
//               {children}
//           </ReorderContext.Provider>
//       </Component>
//   )
// },
