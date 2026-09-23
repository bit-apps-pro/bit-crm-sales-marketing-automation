/*
 * Splits a stored email body into the fresh text and the quoted history the
 * view folds behind a "..." toggle. The history lives in the outermost
 * <blockquote>; the attribution above it ("On ..., x wrote:", Zoho's
 * From/To/Date header) sits in the same wrapper element, and providers fold
 * that wrapper as a whole -- Gmail its div.gmail_quote, Zoho its
 * div.zmail_extra -- so the fold is the blockquote's parent when the
 * blockquote closes it, and the bare blockquote otherwise.
 *
 * Every link is also forced to open in a new tab with the opener severed: a
 * mail link that navigates the CRM tab away is worse than one that opens a
 * new tab, and the sender's own target choice should not decide that.
 */
export const splitQuotedBody = (html: string) => {
  if (!html || typeof DOMParser === 'undefined') {
    return { main: html, quoted: '' }
  }

  // An inert document: nothing in it runs, loads, or renders.
  const doc = new DOMParser().parseFromString(html, 'text/html')

  doc.body.querySelectorAll('a').forEach(link => {
    link.setAttribute('target', '_blank')
    link.setAttribute('rel', 'noopener noreferrer')
  })

  const quote = doc.body.querySelector('blockquote')

  if (!quote) {
    return { main: doc.body.innerHTML, quoted: '' }
  }

  const wrapper = quote.parentElement
  const fold = wrapper && wrapper !== doc.body && wrapper.lastElementChild === quote ? wrapper : quote

  fold.remove()

  return { main: doc.body.innerHTML, quoted: fold.outerHTML }
}
