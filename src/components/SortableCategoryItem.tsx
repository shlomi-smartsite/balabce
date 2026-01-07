'use client'

import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical, Trash2 } from 'lucide-react'
import { Button } from './ui/button'

interface SortableCategoryItemProps {
  id: string
  name: string
  type: string
  onDelete: () => void
  isDeleting: boolean
}

export function SortableCategoryItem({ id, name, type, onDelete, isDeleting }: SortableCategoryItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  const bgColor = type === 'הכנסה' ? 'bg-emerald-50' : 'bg-red-50'
  const borderColor = type === 'הכנסה' ? 'border-emerald-200' : 'border-red-200'
  const hoverBg = type === 'הכנסה' ? 'hover:bg-emerald-100' : 'hover:bg-red-100'

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center gap-2 p-3 ${bgColor} border ${borderColor} rounded-lg group ${hoverBg} transition-colors`}
    >
      <button
        className="cursor-grab active:cursor-grabbing p-1 hover:bg-white/50 rounded touch-none"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="h-4 w-4 text-gray-600" />
      </button>
      <span className="flex-1 font-bold text-gray-900">{name}</span>
      <Button
        variant="ghost"
        size="sm"
        onClick={onDelete}
        disabled={isDeleting}
        className="text-red-600 hover:text-red-700 hover:bg-red-100 p-2"
        title="מחק קטגוריה"
      >
        <Trash2 className="h-5 w-5" />
      </Button>
    </div>
  )
}
