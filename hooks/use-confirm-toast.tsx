"use client"

import { useState } from "react"
import { ConfirmToast } from "@/components/confirm-toast"

export function useConfirmToast() {
  const [showConfirm, setShowConfirm] = useState(false)
  const [confirmMessage, setConfirmMessage] = useState("")
  const [resolveFn, setResolveFn] = useState<(value: boolean) => void>(() => {})

  const confirm = async (message: string): Promise<boolean> => {
    setConfirmMessage(message)
    setShowConfirm(true)
    
    return new Promise((resolve) => {
      setResolveFn(() => resolve)
    })
  }

  const handleConfirm = () => {
    setShowConfirm(false)
    resolveFn(true)
  }

  const handleCancel = () => {
    setShowConfirm(false)
    resolveFn(false)
  }

  const ConfirmDialog = () => {
    if (!showConfirm) return null
    
    return (
      <ConfirmToast
        message={confirmMessage}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
      />
    )
  }

  return { confirm, ConfirmDialog }
}