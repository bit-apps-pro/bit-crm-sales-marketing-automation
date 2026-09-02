/*
 * Splits a stored email body into the fresh text and the quoted history the
 * view folds behind a "..." toggle. The history lives in the outermost
 * <blockquote>; the attribution above it ("On ..., x wrote:", Zoho's
 * From/To/Date header) sits in the same wrapper element, and providers fold
 * that wrapper as a whole -- Gmail its div.gmail_quote, Zoho its
 * div.zmail_extra -- so the fold is the blockquote's parent when the
 * blockquote closes it, and the bare blockquote otherwise.
 */
export const splitQuotedBody = (html: string) => {
  if (!html || typeof DOMParser === 'undefined') {
    return { main: html, quoted: '' }
  }

  // An inert document: nothing in it runs, loads, or renders.
  const doc = new DOMParser().parseFromString(html, 'text/html')
  const quote = doc.body.querySelector('blockquote')

  if (!quote) {
    return { main: html, quoted: '' }
  }

  const wrapper = quote.parentElement
  const fold = wrapper && wrapper !== doc.body && wrapper.lastElementChild === quote ? wrapper : quote

  fold.remove()

  return { main: doc.body.innerHTML, quoted: fold.outerHTML }
}
