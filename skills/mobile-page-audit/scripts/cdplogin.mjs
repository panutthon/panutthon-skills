// Type credentials into a login form on the phone with real key events (Input.insertText), then submit.
// Real key events matter: controlled inputs (React etc.) ignore values set directly on the DOM.
//   node cdplogin.mjs <user> <pass>
// Env: CDP_PORT (default 9333), CDP_MATCH (default "localhost"),
//      LOGIN_USER_SELECTOR, LOGIN_PASS_SELECTOR, LOGIN_SUBMIT_TEXT (button text if there is no type=submit).
const [, , user, pass] = process.argv
if (!user || !pass) {
  console.error('usage: node cdplogin.mjs <user> <pass>')
  process.exit(2)
}
const port = process.env.CDP_PORT ?? '9333'
const match = process.env.CDP_MATCH ?? 'localhost'
const userSel =
  process.env.LOGIN_USER_SELECTOR ??
  'input[autocomplete="username"], input[type="email"], input[name*="user" i], input:not([type=password]):not([type=checkbox]):not([type=hidden])'
const passSel = process.env.LOGIN_PASS_SELECTOR ?? 'input[type=password]'
const submitText = process.env.LOGIN_SUBMIT_TEXT ?? ''

const list = await (await fetch(`http://127.0.0.1:${port}/json/list`)).json()
const page = list.find((t) => t.type === 'page' && t.url.includes(match))
if (!page) {
  console.error(`no page tab matching "${match}"`)
  process.exit(1)
}
const ws = new WebSocket(page.webSocketDebuggerUrl)
let id = 0
const pending = new Map()
ws.onmessage = (m) => {
  const d = JSON.parse(m.data)
  if (d.id && pending.has(d.id)) {
    pending.get(d.id)(d)
    pending.delete(d.id)
  }
}
const send = (method, params = {}) =>
  new Promise((resolve) => {
    const i = ++id
    pending.set(i, resolve)
    ws.send(JSON.stringify({ id: i, method, params }))
  })
const evalJs = (expression) => send('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true })
await new Promise((resolve) => (ws.onopen = resolve))

await evalJs(`document.querySelector(${JSON.stringify(userSel)}).focus()`)
await send('Input.insertText', { text: user })
await evalJs(`document.querySelector(${JSON.stringify(passSel)}).focus()`)
await send('Input.insertText', { text: pass })
await evalJs(`(() => {
  const btns = [...document.querySelectorAll('button')]
  const t = ${JSON.stringify(submitText)}
  const b = btns.find((x) => x.type === 'submit') || (t && btns.find((x) => x.innerText.trim() === t))
  b ? b.click() : document.querySelector(${JSON.stringify(passSel)}).form?.requestSubmit()
})()`)
await new Promise((resolve) => setTimeout(resolve, 4000))
const res = await evalJs('location.pathname')
console.log('after login:', res.result.result.value)
ws.close()
