import type { Extension, CommandProps } from '@/types'

// URL validation regex
const URL_REGEX = /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/

export const LinkExtension: Extension = {
  name: 'link',
  type: 'mark',

  addCommands() {
    return {
      setLink: (href: string, title?: string, target?: string) => ({ editor }: CommandProps) => {
        if (!href) return false

        // Validate URL
        if (!isValidUrl(href)) {
          console.warn('Invalid URL provided to setLink:', href)
          return false
        }

        return editor.commands.link(href, title, target)
      },

      toggleLink: (href?: string, title?: string, target?: string) => ({ editor }: CommandProps) => {
        // If selection has link, remove it
        if (editor.isActive('link')) {
          return editor.commands.unsetLink()
        }

        // Otherwise set link if href provided
        if (href) {
          return editor.commands.link(href, title, target)
        }

        return false
      },

      unsetLink: () => ({ editor }: CommandProps) => editor.commands.unsetLink(),

      editLink: (href: string, title?: string, target?: string) => ({ editor }: CommandProps) => {
        if (!href || !isValidUrl(href)) return false
        return editor.commands.link(href, title, target)
      },

      isLinkActive: () => ({ editor }: CommandProps) => {
        return editor.isActive('link')
      }
    }
  },

  addKeyboardShortcuts() {
    return {
      'Mod-k': () => false // Will be handled by editor commands
    }
  },

  addOptions() {
    return {
      openOnClick: true,
      linkOnPaste: true,
      autolink: true,
      protocols: ['http', 'https', 'ftp', 'mailto'],
      HTMLAttributes: {
        class: 'text-editor-link',
        rel: 'noopener noreferrer nofollow'
      },
      validate: (url: string) => isValidUrl(url)
    }
  }
}

// Helper function to validate URLs
export function isValidUrl(url: string): boolean {
  if (!url || typeof url !== 'string') return false

  // Allow relative URLs
  if (url.startsWith('/') || url.startsWith('./') || url.startsWith('../')) {
    return true
  }

  // Allow mailto links
  if (url.startsWith('mailto:')) {
    return /^mailto:[^\s@]+@[^\s@]+\.[^\s@]+$/.test(url)
  }

  // Allow other protocols
  if (url.includes('://')) {
    return URL_REGEX.test(url)
  }

  // Try with https prefix
  return URL_REGEX.test(`https://${url}`)
}

// Helper function to normalize URLs
export function normalizeUrl(url: string): string {
  if (!url) return ''

  // Already has protocol
  if (url.includes('://')) return url

  // Mailto
  if (url.includes('@') && !url.includes('/')) {
    return `mailto:${url}`
  }

  // Add https for regular URLs
  return `https://${url}`
}