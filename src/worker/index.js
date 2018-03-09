import { openDb } from './lib/db'
import { openMq, consume, produce } from './lib/mq'

const interval = 60 * 1000

Promise.all([
  openDb(),
  openMq(),
]).then(conns => {
  const [db, ch] = conns
  console.log('Connections to DB and MQ established successfully!')

  const loop = () => {
    console.log('Looping')
    setTimeout(() => loop(), interval)
  }

  loop()
})
