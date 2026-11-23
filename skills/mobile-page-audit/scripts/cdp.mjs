// Drive Chrome on an Android phone over CDP (after `adb forward tcp:9333 localabstract:chrome_devtools_remote`).
//   node cdp.mjs nav <url>
//   node cdp.mjs eval "<js expression>"
// Env: CDP_PORT (default 9333), CDP_MATCH = substring of the tab URL to attach to (default "localhost").
// Requires Node 22+ (global WebSocket).
const [, , cmd, arg] = process.argv
const port = process.env.CDP_PORT ?? '9333'
const match = process.env.CDP_MATCH ?? 'localhost'

if (!cmd || !arg) {
  console.error('usage: node cdp.mjs nav <url> | eval "<js>"')
  process.exit(2)
}

const list = await (await fetch(`http://127.0.0.1:${port}/json/list`)).json()
const page = list.find((t) => t.type === 'page' && t.url.includes(match))
if (!page) {
  console.error(`no page tab matching "${match}"`, list.map((t) => t.url))
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
await new Promise((resolve) => (ws.onopen = resolve))

if (cmd === 'nav') {
  // Page.navigate is sometimes ignored on phone tabs; location.assign is reliable.
  await send('Runtime.evaluate', { expression: `location.assign(${JSON.stringify(arg)})` })
  await new Promise((resolve) => setTimeout(resolve, 4000))
  console.log('navigated', arg)
} else if (cmd === 'eval') {
  const res = await send('Runtime.evaluate', { expression: arg, awaitPromise: true, returnByValue: true })
  console.log(JSON.stringify(res.result?.result?.value ?? res.result, null, 1))
}
ws.close()
