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

      const pages = docs.map(i => i._id)
      resolve(pages)
    })
  })
}

export function storeObject(db, obj) {
  if (obj.fan_count) {
    return storePage(db, obj)
  }
  if (obj.data && obj.data.length) {
    return storeArray(db, obj.data)
  }
}

function storePage(db, page) {
  return new Promise(resolve => {
    db.collection('pages').update({
      _id: page.id
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

function storeArray(db, list) {
  const items = list.map(i => {
    if (i.type) {
      return storeFeed(db, i)
    }
    return null
  }).filter(i => !!i)

  return items
}

function storeFeed(db, feed) {
  return new Promise(resolve => {
    db.collection('feed').update({
      _id: feed.id
    }, {
      $set: {
        caption: feed.caption,
        createdTime: feed.created_time,
        description: feed.description,
        from: feed.from,
        fullPicture: feed.full_picture,
        isHidden: feed.is_hidden,
        isPublished: feed.is_published,
        link: feed.link,
        message: feed.message,
        messageTags: feed.message_tags,
        name: feed.name,
        objectId: feed.object_id,
        parentId: feed.parent_id,
        permalinkUrl: feed.permalink_url,
        picture: feed.picture,
        properties: feed.properties,
        source: feed.source,
        statusType: feed.status_type,
        story: feed.story,
        type: feed.type,
        updatedTime: feed.updated_time
      }
    }, {
      upsert: true
    }, err => {
      if (err) {
        throw new Error(`Unable to update feed ${feed.id} on database!`)
      }
      console.log(`Updated feed ${feed.id} on database!`)
      resolve({})
    })
  })
}
