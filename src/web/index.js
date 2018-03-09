import Koa from 'koa'

const app = new Koa()
const port = process.env.PORT || 7001

app.use(ctx => {
  ctx.body = 'Hello Mobie!'
})

app.listen(port)
console.log(`Running web on port ${port}`)
