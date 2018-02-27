const Code = require('code')
const Lab = require('lab')
const Seneca = require('seneca')

const lab = (exports.lab = Lab.script())
const describe = lab.describe
const it = lab.it
const expect = Code.expect

const Hapi = require('hapi')

const proxyInternal = require('./proxyInternal')
const hapiProxy = require('../src/hapi-proxy')

describe('hapi proxy', function() {
  it(
    'calls proxyInternal when seneca message received',
    { timeout: 8888 },
    function() {
      return new Promise((resolve, reject) => {
        const server = new Hapi.Server()
        const seneca = Seneca()
          // Place Seneca into test mode. Errors will be passed to done callback,
          // so no need to handle them in callbacks.
          .test(reject)

          // Insures acts are handled sync
          .gate()

        const testService = server.connection({
          port: 9000,
          labels: ['services', 'testservice']
        })

        server.decorate('server', 'seneca', seneca)

        server.register([
          proxyInternal,
          { register: hapiProxy, options: { seneca } }
        ])

        testService.route({
          method: 'GET',
          path: '/test',
          handler: function(request, reply) {
            reply(null, { works: true })
          }
        })

        server.start(err => {
          if (err) {
            console.error(err)
            return reject('Server failed to start')
          }

          seneca.act(
            {
              role: 'mono',
              cmd: 'proxy_internal',
              label: 'testservice',
              path: '/test'
            },
            function(ignore, out) {
              expect(out.data.works).to.be.true()
              resolve()
            }
          )
        })
      })
    }
  )
})
