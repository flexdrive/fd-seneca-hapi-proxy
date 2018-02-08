const assignDeep = require('assign-deep')
const Boom = require('boom')

const internals = {
  proxyInternal(options) {
    return Promise.resolve(this.inject(options))
      .then(internals.validateResponse)
      .then(response => response.result)
  },

  validateResponse(response) {
    const { statusCode } = response

    // return any 2xx/3xx responses
    if (statusCode < 400) return response

    // reconstruct the response as an error
    const { message, ...data } = response.result
    const err = Boom.create(statusCode, message, data)
    assignDeep(err.output.payload, err.data)

    throw err
  }
}

exports.register = (server, options, next) => {
  server.decorate('server', 'proxyInternal', internals.proxyInternal)
  return next()
}

exports.register.attributes = {
  name: 'server-proxy-plugin',
  version: process.env.npm_package_version
}
