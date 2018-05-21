const Koa = require('koa')
const serve = require('koa-static')
const views = require('koa-views')
const bodyParser = require('koa-bodyparser')
const c2k = require('koa-connect')
const Router = require('koa-router')
const path = require('path')
const cors = require('@koa/cors')
const { RPCServer, isConfigured, noLogin } = require('./RPCServer')

// RPCServer
const app = new Koa()

app.use(bodyParser())
app.use(async (ctx, next) => {
  ctx.req.body = ctx.request.body
  await next()
})

app.use(cors({
  method: 'POST'
}))
app.use(c2k(RPCServer.middleware()))

// Web Server
const server = new Koa()
server.use(async (ctx, next) => {
  try {
    await next()
  } catch (err) {
    ctx.status = 500
    ctx.message = err.message || 'Sorry, an error has occurred.'
  }
})

server.use(views(path.join(__dirname, '../views'), {
  extension: 'pug'
}))

server.use(serve(path.join(__dirname, '../static')))

const router = new Router()
router.get('/console', async (ctx) => {
  if (isConfigured) {
    await ctx.render('index', {
      NO_LOGIN: noLogin
    })
  } else {
    await ctx.render('unauthorized')
  }
})

server.use(router.routes()).use(router.allowedMethods())

server.listen(3000)
app.listen(4000)
