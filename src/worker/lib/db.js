import { MongoClient } from 'mongodb'

export function openDb() {
  console.log('Connecting to database server...')
  return new Promise(resolve => {
    MongoClient.connect(process.env.MONGODB_URI, (err, db) => {
      if (err) {
        throw new Error(`Unable to connect to database server! ${err}`)
      }
      console.log('Connected to database server!')

      resolve(db)
    })
  })
}
