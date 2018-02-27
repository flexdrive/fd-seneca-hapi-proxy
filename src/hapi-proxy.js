const assert = require('assert')

exports.register = (server, options, next) => {
  const seneca = server.seneca
  assert(seneca, 'hapi-proxy requires seneca')

  seneca.add(
    {
      role: 'mono',
      cmd: 'proxy_internal'
    },
    proxyInternal
  )

  function proxyInternal({ label, path, method, credentials, payload }, reply) {
    const service = server.select('services').select(label)

    if (!service) {
      reply(null, { ok: false, why: 'Service not found' })
    }

    service
      .proxyInternal({
        method,
        url: path,
        credentials,
        payload
      })
      .then(res => reply(null, { ok: true, data: res }))
      .catch(error => reply(null, { ok: false, why: error }))
  }

  return next()
}

exports.register.attributes = {
  name: 'hapi-proxy',
  version: process.env.npm_package_version
}
