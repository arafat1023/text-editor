import type { Extension } from '@/types'

// URL validation regex
const URL_REGEX = /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/

export const LinkExtension: Extension = {
  name: 'link',
  type: 'mark',

  addCommands() {
    return {
      setLink: (href: string, title?: string, target?: string) => ({ commands }) => {
        if (!href) return false

        // Validate URL
        if (!isValidUrl(href)) {
          console.warn('Invalid URL provided to setLink:', href)
          return false
        }

        return commands.link(href, title, target)
      },

      toggleLink: (href?: string, title?: string, target?: string) => ({ commands }) => {
        // If selection has link, remove it
        if (commands.isLinkActive()) {
          return commands.unsetLink()
        }

        // Otherwise set link if href provided
        if (href) {
          return commands.setLink(href, title, target)
        }

        return false
      },

      unsetLink: () => ({ commands }) => commands.unsetLink(),

      editLink: (href: string, title?: string, target?: string) => ({ commands }) => {
        if (!href || !isValidUrl(href)) return false
        return commands.setLink(href, title, target)
      },

      isLinkActive: () => ({ editor }) => {
        return editor.isActive('link')
      },

      getLinkAttrs: () => ({ editor }) => {
        const { selection } = editor.state
        const mark = selection.$from.marks().find(m => m.type.name === 'link')
        return mark ? mark.attrs : null
      }
    }
  },

  addKeyboardShortcuts() {
    return {
      'Mod-k': () => ({ commands, editor }) => {
        // Get current link if exists
        const attrs = commands.getLinkAttrs()

        // Trigger link dialog (will be implemented)
        if (typeof window !== 'undefined') {
          const href = window.prompt('Enter URL:', attrs?.href || '')
          if (href) {
            return commands.setLink(href)
          } else if (href === '') {
            return commands.unsetLink()
          }
        }

        return false
      }
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