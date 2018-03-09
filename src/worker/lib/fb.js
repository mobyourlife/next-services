import { stringify } from 'querystring'
import fetch from 'node-fetch'
import FormData from 'form-data'

const batchSize = 50

export function fetchPage(pageId) {
  return {
    endpoint: pageId,
    fields: [
      'id',
      'about',
      'category',
      'category_list',
      'cover',
      'description',
      'emails',
      'engagement',
      'fan_count',
      'is_published',
      'is_verified',
      'is_webhooks_subscribed',
      'link',
      'location',
      'name',
      'overall_star_rating',
      'phone',
      'picture',
      'rating_count',
      'talking_about_count',
      'username',
      'verification_status',
      'voip_info',
      'were_here_count'
    ]
  }
}

export function fetchPhotos(pageId) {

}

export function fetchFeed(pageId) {

}

export function batchRequest(data) {
  return new Promise(resolve => {
    getAccessToken().then(token => {
      data = data.reduce((acc, n) => acc.concat(n), []).filter(i => !!i)

      const batches = []
      while (data.length > 0) {
        batches.push({
          items: data.splice(0, batchSize)
        })
      }

      const requests = batches.map(req => {
        const batch = req.items.map(i => ({
          method: 'GET',
          relative_url: `${i.endpoint}?fields=${i.fields.join(',')}`
        }))
        const body = new FormData()
        body.append('access_token', token)
        body.append('batch', JSON.stringify(batch))

        return fetch(`https://graph.facebook.com/v2.12?locale=pt_BR`, {
          method: 'POST',
          body
        }).then(res => res.json())
      })

      Promise.all(requests).then(res => {
        const ret = res.reduce((acc, n) => acc.concat(n), [])
        resolve(ret)
      })
    })
  })
}

function getAccessToken() {
  const { FACEBOOK_APP_ID, FACEBOOK_APP_SECRET } = process.env

  const args = stringify({
    client_id: FACEBOOK_APP_ID,
    client_secret: FACEBOOK_APP_SECRET,
    grant_type: 'client_credentials'
  })

  return fetch(`https://graph.facebook.com/v2.12/oauth/access_token?${args}`)
    .then(res => res.json())
    .then(json => json.access_token)
    .then(token => {
      if (!token) {
        throw new Error('Unable to get access token from Facebook API!')
      }

      return token
    })
}
