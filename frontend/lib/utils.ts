import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(dateString: string | Date | null | undefined) {
  if (!dateString) return "N/A"
  try {
    let date: Date
    if (typeof dateString === 'string') {
      const s = dateString.trim()
      const needsUtc = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?$/.test(s)
      date = new Date(needsUtc ? `${s}Z` : s)
    } else {
      date = dateString
    }
    if (isNaN(date.getTime())) return String(dateString)
    
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date)
  } catch (e) {
    return String(dateString)
  }
}

export function formatDateShort(dateString: string | Date | null | undefined) {
  if (!dateString) return "N/A"
  try {
    let date: Date
    if (typeof dateString === 'string') {
      const s = dateString.trim()
      const needsUtc = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?$/.test(s)
      date = new Date(needsUtc ? `${s}Z` : s)
    } else {
      date = dateString
    }
    if (isNaN(date.getTime())) return String(dateString)
    
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).format(date)
  } catch (e) {
    return String(dateString)
  }
}
