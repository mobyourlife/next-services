import Koa from 'koa'

const app = new Koa()
const port = process.env.PORT || 7002

app.use(ctx => {
  ctx.body = 'Hello Worker!'
})

app.listen(port)
console.log(`Running worker on port ${port}`)
