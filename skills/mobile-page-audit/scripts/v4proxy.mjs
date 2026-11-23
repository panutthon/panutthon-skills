// `adb reverse` connects to 127.0.0.1, but some dev servers (Vite on Windows/macOS by default) listen only on ::1,
// so the phone gets ERR_EMPTY_RESPONSE. This forwards IPv4 → IPv6 on the same port. Real-device testing only.
//   node v4proxy.mjs <port>
// Alternative: start the dev server with --host 127.0.0.1 (or 0.0.0.0).
import net from 'node:net'

const port = Number(process.argv[2])
if (!port) {
  console.error('usage: node v4proxy.mjs <port>')
  process.exit(2)
}
net
  .createServer((client) => {
    const upstream = net.connect({ host: '::1', port })
    client.pipe(upstream).pipe(client)
    const end = () => {
      client.destroy()
      upstream.destroy()
    }
    client.on('error', end)
    upstream.on('error', end)
  })
  .listen(port, '127.0.0.1', () => console.log(`proxy 127.0.0.1:${port} -> [::1]:${port}`))
