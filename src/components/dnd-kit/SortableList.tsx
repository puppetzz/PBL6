import {
  type Active,
  DndContext,
  KeyboardSensor,
  PointerSensor,
  type UniqueIdentifier,
  useSensor,
  useSensors
} from '@dnd-kit/core'
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates
} from '@dnd-kit/sortable'
import { type ReactNode, useMemo, useState } from 'react'
import { SortableOverlay } from './SortableOverlay'
import { DragHandle, SortableItem } from './SortableItem'

type BaseItem = {
  id: UniqueIdentifier
}

type Props<T extends BaseItem> = {
  items: T[]
  onChange(items: T[]): void
  renderItem(item: T): ReactNode
}

export function SortableList<T extends BaseItem>({
  items,
  onChange,
  renderItem
}: Props<T>) {
  const [active, setActive] = useState<Active | null>(null)

  const activeItem = useMemo(
    () => items.find((item) => item.id === active?.id),
    [active, items]
  )
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates
    })
  )

  return (
    <DndContext
      sensors={sensors}
      onDragStart={({ active }) => setActive(active)}
      onDragEnd={({ active, over }) => {
        if (over && active.id !== over?.id) {
          const activeIndex = items.findIndex(({ id }) => id === active.id)

          const overIndex = items.findIndex(({ id }) => id === over.id)

          onChange(arrayMove(items, activeIndex, overIndex))
        }
        setActive(null)
      }}
      onDragCancel={() => setActive(null)}
    >
      <SortableContext items={items}>
        <ul
          className="m-0 flex flex-col gap-2 overflow-y-auto p-0"
          role="application"
        >
          {items.map((item) => (
            <div key={item.id}>{renderItem(item)}</div>
          ))}
        </ul>
      </SortableContext>
      <SortableOverlay>
        {activeItem ? renderItem(activeItem) : null}
      </SortableOverlay>
    </DndContext>
  )
}

SortableList.Item = SortableItem
SortableList.DragHandle = DragHandle
