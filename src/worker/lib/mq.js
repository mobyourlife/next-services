import amqp from 'amqplib/callback_api'
import { Observable } from 'rxjs/Observable'

const durable = true
const persistent = true

export function openMq() {
  console.log('Connecting to message queue server...')
  return new Promise(resolve => {
    amqp.connect(process.env.CLOUDAMQP_URL, (err, conn) => {
      if (err) {
        throw new Error(`Unable to connect to message queue server! ${err}`)
      }
      console.log('Connected to message queue server!')

      conn.createChannel((err, ch) => {
        if (err) {
          throw new Error(`Unable to create channel with message queue! ${err}`)
        }
        console.log('Connected to message queue channel!')

        resolve(ch)
      })
    })
  })
}

export function consume(ch, queueName) {
  ch.assertQueue(queueName, { durable })

  return Observable.create(observer => {
    ch.consume(queueName, msg => {
      try {
        const data = JSON.parse(msg.content.toString())
        observer.next({
          data,
          ack: () => ch.ack(msg)
        })
      } catch (err) {
        throw new Error(`Error trying to consume message from queue ${queueName}!`)
      }
    })
  })
}

export function produce(ch, queueName, data) {
  return new Promise(resolve => {
    const msg = JSON.stringify(data)
    ch.assertQueue(queueName, { durable })
    ch.sendToQueue(queueName, new Buffer(msg), { persistent })
  })
}
