'use client'

import { useState } from 'react'
import { Menu, X, FileSpreadsheet, FolderOpen } from 'lucide-react'
import { Button } from './ui/button'
import { ManageCategoriesDialog } from './ManageCategoriesDialog'

interface MobileMenuProps {
  spreadsheetId: string | null
  categories: Array<{ name: string; type: string }>
  onCategoriesUpdate: () => void
}

export function MobileMenu({ spreadsheetId, categories, onCategoriesUpdate }: MobileMenuProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        className="lg:hidden"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </Button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={() => setIsOpen(false)}
          />
          <div className="fixed top-16 left-0 right-0 bg-white shadow-lg z-50 lg:hidden border-b-2 border-gray-200">
            <div className="p-4 space-y-2">
              {spreadsheetId && (
                <a
                  href={`https://docs.google.com/spreadsheets/d/${spreadsheetId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors text-blue-600 font-semibold"
                  onClick={() => setIsOpen(false)}
                >
                  <FileSpreadsheet className="h-5 w-5" />
                  <span className="font-medium">פתח ב-Google Sheets</span>
                </a>
              )}
              
              <ManageCategoriesDialog
                categories={categories}
                spreadsheetId={spreadsheetId}
                onUpdate={() => {
                  onCategoriesUpdate()
                  setIsOpen(false)
                }}
                trigger={
                  <button className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors text-gray-900">
                    <FolderOpen className="h-5 w-5" />
                    <span className="font-bold">ניהול קטגוריות</span>
                  </button>
                }
              />
            </div>
          </div>
        </>
      )}
    </>
  )
}
