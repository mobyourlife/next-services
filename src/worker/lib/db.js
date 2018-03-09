import { MongoClient } from 'mongodb'

export function openDb() {
  console.log('Connecting to database server...')
  return new Promise(resolve => {
    MongoClient.connect(process.env.MONGODB_URI, (err, client) => {
      if (err) {
        throw new Error(`Unable to connect to database server! ${err}`)
      }
      console.log('Connected to database server!')

      const db = client.db()
      resolve(db)
    })
  })
}

export function getPages(db) {
  return new Promise(resolve => {
    db.collection('pages').find({}).toArray((err, docs) => {
      if (err) {
        throw new Error(`Unable to get pages from database! ${err}`)
      }

      const pages = docs.map(i => i.pageId)
      resolve(pages)
    })
  })
}

export function storeObject(db, obj) {
  if (obj.fan_count) {
    return storePage(db, obj)
  }
  console.log('Unrecognised object, anything was stored!')
}

function storePage(db, page) {
  return new Promise(resolve => {
    db.collection('pages').update({
      pageId: page.id
    }, {
      $set: {
        about: page.about,
        category: page.category,
        categoryList: page.category_list,
        cover: page.cover,
        emails: page.emails,
        engagement: page.engagement,
        fan_count: page.fan_count,
        isPublished: page.is_published,
        isVerified: page.is_verified,
        isWebhooksSubscribed: page.is_webhooks_subscribed,
        link: page.link,
        location: page.location,
        name: page.name,
        overallStarRating: page.overall_star_rating,
        phone: page.phone,
        picture: page.picture && !page.picture.data.is_silhouette && page.picture.data.url,
        ratingCount: page.rating_count,
        talkingAboutCount: page.talking_about_count,
        verificationStatus: page.verification_status,
        voipInfo: page.voip_info,
        wereHereCount: page.were_here_count
      }
    }, err => {
      if (err) {
        throw new Error(`Unable to update page ${page.id} on database!`)
      }
      console.log(`Updated page ${page.id} on database!`)
      resolve({})
    })
  })
}
