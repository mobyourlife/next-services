import { openDb, getPages, storeObject } from './lib/db'
// import { openMq, consume, produce } from './lib/mq'
import { fetchPage, fetchFeed, batchRequest } from './lib/fb'

const interval = 30 * 60 * 1000

Promise.all([
  openDb(),
  // openMq(),
]).then(conns => {
  const [db/*, ch*/] = conns
  // console.log('Connections to DB and MQ established successfully!')
  console.log('Connection to DB established successfully!')

  const loop = () => {
    console.log('Looping')

    getPages(db).then(pages => {
      const requests = pages.map(pageId => [
        fetchPage(pageId),
        fetchFeed(pageId),
      ])

      batchRequest(requests).then(data => {
        const store = data.map(i => storeObject(db, JSON.parse(i.body)))
        Promise.all(store).then(() => {
          setTimeout(() => loop(), interval)
        })
      })
    })
  }

  loop()
})
