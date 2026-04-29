import { spawn } from 'node:child_process'

const npm = process.platform === 'win32' ? 'npm.cmd' : 'npm'

const processes = [
  spawn(npm, ['run', 'dev:client'], { stdio: 'inherit', shell: false }),
  spawn(npm, ['run', 'dev:server'], { stdio: 'inherit', shell: false })
]

function shutdown() {
  processes.forEach(child => child.kill())
  process.exit(0)
}

process.on('SIGINT', shutdown)
process.on('SIGTERM', shutdown)
