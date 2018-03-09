import fs from 'fs'
import { spawn } from 'child_process'
import Handlebars from 'handlebars'

const templateSource = `
<!doctype html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">

  <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0/css/bootstrap.min.css" integrity="sha384-Gn5384xqQ1aoWXA+058RXPxPg6fy4IWvTNh0E263XmFcJlSAwiGgFAW/dAiS6JXm" crossorigin="anonymous">

  <title>{{ websiteTitle }}</title>

  <style type="text/css">
    .media {
      margin-bottom: 1em;
    }
  </style>
</head>
<body>

  <div class="jumbotron">
    <div class="container">
      <h1 class="display-4">{{ websiteTitle }}</h1>
      <p class="lead">{{ websiteAbout }}</p>
    </div>
  </div>

  <div class="container">
    {{#each feed}}
      <div class="media">
        <img class="align-self-start mr-3" src="{{ imageUrl }}" alt="{{ imageCaption }}">
        <div class="media-body">
          <h5 class="mt-0">{{ imageCaption }}</h5>
          <p>{{ postMessage }}</p>
        </div>
      </div>
    {{/each}}
  </div>

</body>
</html>
`

const compiledTemplate = Handlebars.compile(templateSource)

export function buildWebsite(db, pageId) {
  return new Promise(resolve => {
    db.collection('pages').find({ _id: pageId }).toArray((err, pages) => {
      if (err) {
        throw new Error(`Unable to get page ${pageId} information to build its website!`)
      }
      const pageInfo = pages[0]

      db.collection('feed').find({ 'from.id': pageId }).toArray((err, posts) => {
        if (err) {
          throw new Error(`Unable to get feeds of page ${pageId} to build its website!`)
        }

        const data = {
          websiteTitle: pageInfo.name,
          websiteAbout: pageInfo.about,
          feed: posts.map(i => ({
            imageUrl: i.fullPicture,
            imageCaption: i.name || i.caption,
            postMessage: i.message || i.description,
          }))
        }

        const html = compiledTemplate(data)

        const dir = '_build'
        if (!fs.existsSync(dir)) {
          fs.mkdirSync(dir)
        }

        fs.writeFileSync(`${dir}/index.html`, html)

        const cmd = `node`
        const args = ['node_modules/surge/lib/cli.js', '--project', '_build', '--domain', pageInfo.domainName]
        const child = spawn(cmd, args)

        child.on('exit', code => {
          if (code !== 0) {
            throw new Error(`Failed to publish website for page ${pageId}!`)
          }
          console.log(`Published website for page ${pageId} successfully!`)
          resolve({})
        })
      })
    })
  })
}
