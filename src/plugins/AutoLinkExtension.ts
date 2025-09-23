import type { Extension } from '@/types'
import { Plugin, PluginKey } from 'prosemirror-state'
import { Decoration, DecorationSet } from 'prosemirror-view'
import { normalizeUrl, isValidUrl } from './LinkExtension'

// URL detection regex patterns
const URL_REGEX = /(https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9]+\.[^\s]{2,}|www\.[a-zA-Z0-9]+\.[^\s]{2,})/gi

const EMAIL_REGEX = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/gi

interface AutoLinkState {
  decorations: DecorationSet
  pendingLinks: Map<string, { from: number; to: number; url: string }>
}

export const AutoLinkExtension: Extension = {
  name: 'autolink',
  type: 'extension',
  priority: 100,

  addProseMirrorPlugins() {
    const pluginKey = new PluginKey<AutoLinkState>('autolink')

    return [
      new Plugin<AutoLinkState>({
        key: pluginKey,

        state: {
          init() {
            return {
              decorations: DecorationSet.empty,
              pendingLinks: new Map()
            }
          },

          apply(tr, state, _oldState, _newState) {
            const { decorations, pendingLinks } = state
            let newDecorations = decorations.map(tr.mapping, tr.doc)
            let newPendingLinks = new Map(pendingLinks)

            // Clear pending links that are no longer valid
            for (const [key, link] of newPendingLinks) {
              if (tr.mapping.map(link.from) >= tr.mapping.map(link.to)) {
                newPendingLinks.delete(key)
              }
            }

            // If content changed, scan for new URLs
            if (tr.docChanged) {
              const foundLinks = findAutoLinks(tr.doc)

              // Remove old decorations
              newDecorations = DecorationSet.empty
              newPendingLinks.clear()

              // Add new decorations for detected URLs
              foundLinks.forEach(link => {
                const decoration = Decoration.inline(link.from, link.to, {
                  class: 'auto-link-detected',
                  title: `Press Space or Enter to convert "${link.url}" to a link`
                })

                newDecorations = newDecorations.add(tr.doc, [decoration])
                newPendingLinks.set(`${link.from}-${link.to}`, link)
              })
            }

            return {
              decorations: newDecorations,
              pendingLinks: newPendingLinks
            }
          }
        },

        props: {
          decorations(state) {
            const pluginState = this.getState(state)
            return pluginState?.decorations || DecorationSet.empty
          },

          handleKeyDown(view, event) {
            const pluginState = this.getState(view.state)
            if (!pluginState || pluginState.pendingLinks.size === 0) {
              return false
            }

            // Convert pending links on Space or Enter
            if (event.key === ' ' || event.key === 'Enter') {
              const { state, dispatch } = view
              const { tr } = state
              let modified = false

              // Process pending links in reverse order to maintain positions
              const sortedLinks = Array.from(pluginState.pendingLinks.values())
                .sort((a, b) => b.from - a.from)

              for (const link of sortedLinks) {
                const linkMark = state.schema.marks.link
                if (linkMark) {
                  const normalizedUrl = normalizeUrl(link.url)
                  if (isValidUrl(normalizedUrl)) {
                    tr.addMark(link.from, link.to, linkMark.create({
                      href: normalizedUrl,
                      title: null,
                      target: null
                    }))
                    modified = true
                  }
                }
              }

              if (modified) {
                dispatch(tr)
                return true
              }
            }

            // Cancel auto-link detection on Escape
            if (event.key === 'Escape') {
              if (pluginState.pendingLinks.size > 0) {
                const { dispatch } = view
                const tr = view.state.tr
                dispatch(tr) // This will clear decorations through the state update
                return true
              }
            }

            return false
          }
        }
      })
    ]
  }
}

interface AutoLink {
  from: number
  to: number
  url: string
}

function findAutoLinks(doc: any): AutoLink[] {
  const links: AutoLink[] = []

  doc.descendants((node: any, pos: number) => {
    if (node.isText) {
      const text = node.text

      // Find URLs
      let match
      URL_REGEX.lastIndex = 0
      while ((match = URL_REGEX.exec(text)) !== null) {
        const from = pos + match.index
        const to = from + match[0].length

        // Check if this text is already part of a link
        if (!isInsideLink(doc, from, to)) {
          links.push({
            from,
            to,
            url: match[0]
          })
        }
      }

      // Find emails
      EMAIL_REGEX.lastIndex = 0
      while ((match = EMAIL_REGEX.exec(text)) !== null) {
        const from = pos + match.index
        const to = from + match[0].length

        // Check if this text is already part of a link
        if (!isInsideLink(doc, from, to)) {
          links.push({
            from,
            to,
            url: `mailto:${match[0]}`
          })
        }
      }
    }
  })

  return links
}

function isInsideLink(doc: any, from: number, to: number): boolean {
  // const $from = doc.resolve(from)
  // const $to = doc.resolve(to)

  // Check if any position has a link mark
  for (let pos = from; pos < to; pos++) {
    const resolved = doc.resolve(pos)
    if (resolved.marks().some((mark: any) => mark.type.name === 'link')) {
      return true
    }
  }

  return false
}