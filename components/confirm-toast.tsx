"use client"

import { Button } from "@/components/ui/button"
import { useEffect } from "react"

interface ConfirmToastProps {
  message: string
  onConfirm: () => void
  onCancel: () => void
}

export function ConfirmToast({ message, onConfirm, onCancel }: ConfirmToastProps) {
  useEffect(() => {
    document.body.style.overflow = "hidden"
    return () => {
      document.body.style.overflow = ""
    }
  }, [])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="flex flex-col space-y-4 p-6 bg-background border rounded-lg shadow-lg w-full max-w-md">
        <div className="text-sm font-medium">{message}</div>
        <div className="flex justify-end space-x-2">
          <Button variant="outline" size="sm" onClick={onCancel}>
            Cancel
          </Button>
          <Button variant="destructive" size="sm" onClick={onConfirm}>
            Delete
          </Button>
        </div>
      </div>
    </div>
  )
}