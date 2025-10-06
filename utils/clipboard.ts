// Utility functions for clipboard operations

export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch (error) {
    console.error('Failed to copy to clipboard:', error)
    return false
  }
}

export async function shareContent(title: string, text: string, url: string): Promise<boolean> {
  if (navigator.share) {
    try {
      await navigator.share({ title, text, url })
      return true
    } catch (error) {
      console.error('Share failed:', error)
      return false
    }
  }
  return false
}
