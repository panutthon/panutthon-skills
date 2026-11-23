// In-page mobile audit. Inject via chrome-devtools navigate_page { initScript: <this file> } and call
// evaluate_script `() => window.__audit()` — or paste the whole file into evaluate_script once per page.
//
// Measures what makes phones hard to use:
//   overflow     elements past the right edge with no scroll/clip ancestor (whole page scrolls sideways)
//   smallTap     buttons/links shorter than minTapH or narrower than minTapW (table body rows excluded)
//   tinyText     text nodes smaller than minFont px
//   firstItemTop y of the first work item — the headline "does the page open on the work" metric
//
// Options: window.__audit({ firstItem: '.card', minTapH: 36, minTapW: 32, minFont: 11, limit: 40 })
// Hidden elements are skipped; results are de-duplicated and capped to stay readable in a tool result.
window.__audit = (opts = {}) => {
  const { firstItem = 'tbody tr, [role=listitem], li', minTapH = 36, minTapW = 32, minFont = 11, limit = 40 } = opts
  const vw = document.documentElement.clientWidth
  const out = { vw, docScrollW: document.documentElement.scrollWidth, overflow: [], smallTap: [], tinyText: [] }
  const label = (el) =>
    (el.getAttribute('aria-label') || el.innerText || el.title || el.tagName).toString().trim().replace(/\s+/g, ' ').slice(0, 40)
  for (const el of document.querySelectorAll('body *')) {
    const cs = getComputedStyle(el)
    if (cs.display === 'none' || cs.visibility === 'hidden') continue
    const r = el.getBoundingClientRect()
    if (!r.width || !r.height) continue
    let p = el
    let clipped = false
    while ((p = p.parentElement)) {
      const c = getComputedStyle(p)
      if (/(auto|scroll|hidden|clip)/.test(c.overflowX) && p !== document.body && p !== document.documentElement) {
        clipped = true
        break
      }
    }
    if (r.right > vw + 1 && !clipped) out.overflow.push(`${el.tagName} r=${Math.round(r.right)} "${label(el)}"`)
    if (
      el.matches('button,a,[role=button],[role=tab],select,input[type=checkbox],input[type=radio]') &&
      !el.closest('tbody') &&
      (r.height < minTapH || r.width < minTapW)
    ) {
      out.smallTap.push(`${Math.round(r.width)}x${Math.round(r.height)} "${label(el)}"`)
    }
    if ([...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim()) && parseFloat(cs.fontSize) < minFont) {
      out.tinyText.push(`${cs.fontSize} "${label(el)}"`)
    }
  }
  out.overflow = out.overflow.slice(0, 15)
  out.smallTap = [...new Set(out.smallTap)].slice(0, limit)
  out.tinyText = [...new Set(out.tinyText)].slice(0, limit)
  const first = [...document.querySelectorAll(firstItem)].find((e) => e.getBoundingClientRect().height > 0)
  out.firstItemTop = first ? Math.round(first.getBoundingClientRect().top) : null
  out.viewportH = window.innerHeight
  return out
}
