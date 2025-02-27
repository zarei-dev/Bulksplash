import fetch from 'node-fetch';
import request from 'request';
import * as fs from 'fs';
import https from 'https';
import * as path from 'path';
import ProgressBar from 'progress';
import inquirer from 'inquirer';
import {
  firstQuestions
} from './questions.js';
import {
  nextQuestions
} from './questions.js';


/*eslint-disable */
function imageData(id, callback, apiKey) {
  const req = request({
    url: 'https://api.unsplash.com/photos/' + id + '?client_id=' + apiKey,
    json: true
  }, function (error, response, body) {
    if (error || response.statusCode !== 200) {
      return callback(error || {statusCode: response.statusCode});
    }
    callback(null, body);  
  })
}

// async function imageData(image_id) {
//   const response = await fetch(`https://api.unsplash.com/photos/${image_id}?client_id=ttUqGcFjnw_kag6oa9X-oM_9H5BSHFG32rFa9sIbwKs`)
//   const resData = await response.json();
//   return await resData;
// }

// async function fuckyou(i) {
//   return await imageData(i);
// }

// console.log('fuck');
const bulksplashh = async (args) => {


  
  // const imageData = (image_id) => {
  //   https.get(`https://api.unsplash.com/photos/${image_id}?client_id=ttUqGcFjnw_kag6oa9X-oM_9H5BSHFG32rFa9sIbwKs`, response => {
  //     response.json()
  //   }).on('error', function (e) {
  //     console.log('🚨 Error while Getting ', image_id, e.code)
  //   })

  //   // make request to Unsplash download endpoint to meet API requirements
  //   // we don't download from endpoint because it deosn't let us download custom sizes
  //   request(`https://api.unsplash.com/photos/${image_id}?client_id=ttUqGcFjnw_kag6oa9X-oM_9H5BSHFG32rFa9sIbwKs`, (error, response) => {
  //     // do nothing
  //   })
  // }

  let basePath = "";

  const options = {}

  const ask = async () => {
    await inquirer.prompt([{
        type: 'input',
        name: 'path',
        message: '📂 Which directory do you want to save to?',
        default: '.'
      },
      {
        type: 'list',
        name: 'random',
        message: '📸 Which images do you want to download?',
        choices: ['Random', 'From a collection', ],
        filter: function (val) {
          return val === 'Random'
        }
      }
    ]).then(answers => {
      options.random = answers.random;
      basePath = answers.path === "." ? "" : answers.path
    })

    if (options.random) { // random
      await inquirer.prompt([{
        type: 'input',
        name: 'search',
        message: '🔍 What search term?'
      }]).then(answers => options.search = answers.search)
    } else { // from a collection
      await inquirer.prompt([{
        type: 'input',
        name: 'collection',
        message: '📎 Enter the URL of the Unsplash collection you want to download from',
        validate: (value) => {
          if (value.startsWith("https://unsplash.com/collections/")) {
            return true;
          }

          return "🚨 Please enter a valid Unsplash Collections URL!"
        }
      }]).then(answers => options.collection = answers.collection)
    }

    await inquirer.prompt(firstQuestions).then(answers => {
      for (let a in answers) {
        options[a] = answers[a]
      }
    })

    if (options.random) {
      if (options.orientation === 'custom') {
        await inquirer.prompt(
          [
            nextQuestions({
              required: true,
              side: 'width',
            }),
            nextQuestions({
              required: true,
              side: 'height',
            }),
          ]
        ).then(answers => {
          options.width = answers.width
          options.height = answers.height
        })
      } else {
        await inquirer.prompt(
          [
            nextQuestions({
              required: false,
              side: 'width',
            }),
          ]
        ).then(answers => {
          options.width = answers.width
        })
        if (!options.width) {
          await inquirer.prompt(
            [
              nextQuestions({
                required: false,
                side: 'height',
              }),
            ]
          ).then(answers => {
            options.height = answers.height
          })
        }
      }
    }

    if (options.orientation === 'custom' || options.orientation === 'mixed') {
      delete options.orientation
    }

    await inquirer.prompt([{
      type: 'confirm',
      name: 'saveCredits',
      message: '🗂  Export the credits for the photos to a .json file?',
      default: true
    }]).then(answers => {
      options.saveCredits = answers.saveCredits;
    })

    return options
  }


  if (args.length != 0) {
    args = require("minimist")(args)

    basePath = args["d"] ? args["d"] : ""

    options.random = true;

    if (args["c"] && args["c"].startsWith("https://unsplash.com/collections/")) {
      options.random = false;
      options.collection = args["c"]
    }


    options.search = args["q"] ? args["q"] : ""
    options.amount = args["a"] && parseInt(args["a"]) > 0 ? parseInt(args["a"]) : 20
    options.width = args["w"] && parseInt(args["w"]) > 0 ? parseInt(args["w"]) : null
    options.height = args["h"] && parseInt(args["h"]) > 0 ? parseInt(args["h"]) : null
    options.orientation = args["o"] && ["landscape", "portrait", "squarish"].includes(args["o"]) ? args["o"] : ""
    options.featured = args["f"] ? args["f"] : false
    options.saveCredits = args["j"] ? args["j"] : false
  } else {
    await ask()
  }


  let apiKeys = ["KU76e-L5LwjeOxB98AWi_NJ1BfnSe1bFQ1A7Aul9foA"];
  let apiKey = apiKeys[Math.floor(Math.random() * apiKeys.length)];

  // console.log(options)

  const buildUrl = ({
    featured,
    orientation,
    search,
    width,
    height,
    amount,
    random,
    collection
  }) => {
    let base;

    if (random) {
      base = 'https://api.unsplash.com/photos/random?'
    } else if (collection) {
      let collectionId = collection.split("/")[4];
      base = `https://api.unsplash.com/collections/${collectionId}/photos?`
    }

    const clientId = '&client_id=' + apiKey;
    const f = random && featured ? '&featured' : ''
    const a = random ? (amount > 30 ? `&count=30` : `&count=${amount}`) : ""
    const p = !random && collection ? (amount > 30 ? `&per_page=30` : `&per_page=${amount}`) : ""
    const o = orientation ? `&orientation=${orientation}` : ''
    const s = search && random ? `&query=${search}` : ''
    const w = width ? `&w=${width}` : ''
    const h = height ? `&h=${height}` : ''
    return `${base}${a}${p}${o}${f}${w}${h}${s}${clientId}`
  }

  let url;


  console.log('\n🤖 Welcome to Bulksplash! (Powered by Unsplash.com)')
  // eslint-disable-next-line max-len
  console.log(`\n🔰 Downloading ${options.amount}${options.featured ? ' featured' : ''}${options.search ? ' "' + options.search + '"' : ''} images from:`)

  let bar;

  let creditsAlreadyPrinted = {};
  let c = 0;
  const saveCredits = (credits, dest) => {
    credits = Object.values(credits)
    Object.values(credits).forEach(v => {
      let id = v.id;
      let chunks = imageData(id, (err, body) => {
        // body = JSON.stringify(body, null, "\t");
        const data = {
          photo: {
            id: body.id,
            width: body.width,
            height: body.height,
            description: body.description,
            alt_description: body.alt_description,
            // link: body.links.html,
            likes: body.likes,
            views: body.views,
            downloads: body.downloads,
          },
          camera: body.exif,
          location: body.location,
          user: {
            id: body.user.id,
            username: body.user.username,
            name: body.user.name,
            twitter: body.user.twitter_username,
            portfolio_url: body.user.portfolio_url,
            links: body.user.links.html,
            bio: body.user.bio,
            location: body.user.location
          },
          tags: []
        }

        body.tags.forEach(e => {
          data.tags.push(e.title)
        });
        body.related_collections = '';
        fs.writeFile(dest + `/omegado-${v.username}-${v.id}.txt`, JSON.stringify(data, null, "\t"), "utf8", (err) => {
          if (err) {
            return;
          }
          console.log("🗂  A .json file with details about the photographers has been saved to " + dest + "/bulksplash-credits.json\n")
        })

      }, apiKey)
      
    })


  }

  const download = ({
    imageUrl,
    dest,
    img
  }) => {
    let dir = path.parse(dest).dir;

    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir);
    }

    let {
      owner
    } = img

    if (!(owner.id in creditsAlreadyPrinted)) {
      console.log(`📸 ${owner.name} (${owner.link})`)
      creditsAlreadyPrinted[owner.id] = owner;
    }

    c += 1;
    if (c == bar.total) {
      console.log("\n⏳ Preparing download...\n")
    }

    const file = fs.createWriteStream(dest)

    file.on('close', () => {
      bar.tick()
      if (bar.complete) {
        console.log('\n😌 All the photos have been downloaded!\n')

        if (options.saveCredits) {
          saveCredits(creditsAlreadyPrinted, dir)
        }
      }
    }, {
      once: true,
    })

    https.get(imageUrl, response => {
      response.pipe(file)
    }).on('error', function (e) {
      fs.unlink(dest, () => {});
      console.log('🚨 Error while downloading', imageUrl, e.code)
    })

    // make request to Unsplash download endpoint to meet API requirements
    // we don't download from endpoint because it deosn't let us download custom sizes
    request(`https://api.unsplash.com/photos/${img.id}/download?client_id=${apiKey}`, (error, response) => {
      // do nothing
    })
  }


  let promises = [];
  let images = []
  let iterations = 1;
  let tAmount = options.amount - 30;

  if (tAmount > 30) {
    while (tAmount > 0) {
      iterations += 1;
      tAmount -= 30;
    }
  }


  let processImages = () => {
    return new Promise(resolve => {
      request(url, (error, response, body) => {

        if (!error && response.statusCode === 200) {
          body = JSON.parse(body)

          Object.values(body).forEach(v => {
            const img = (options.random && (options.width || options.height)) ? v.urls.custom : v.urls.full

            images.push({
              imageUrl: img,
              id: v.id,
              owner: {
                id: v.id,
                name: v.user.name,
                username: v.user.username,
              },
            })

          })

          resolve(images)
        } else {
          console.log(`🚨 Something went wrong, got response code ${response.statusCode} from Unsplash - ${response.statusMessage}`)
        }
      })
    })
  }

  let page = 1;
  for (let i = 0; i < iterations; i++) {
    url = buildUrl(options);
    if (options.random && options.amount > 30) {
      options.amount -= 30;
    } else if (!options.random && page <= iterations) {
      options.amount -= 30;
      url += "&page=" + page;
      page += 1;
    }

    promises.push(processImages())
  }

  Promise.all(promises).then((images) => {
    images = [].concat.apply([], [...new Set(images)]);

    bar = new ProgressBar('🤩 DOWNLOADING [:bar]', {
      total: images.length,
      complete: "=",
      incomplete: " "
    })
    // let image_ids= [];
    // images.map(img => {image_ids.push(img.id)})
    // var file = fs.createWriteStream('ids.txt');
    // file.on('error', function(err) { /* error handling */ });
    // file.write(JSON.stringify(image_ids, null, "\t"));
    // console.log(images);
    // file.end();
    images.map(img => {
      download({
        imageUrl: img.imageUrl,
        dest: path.join(process.cwd(), `${basePath}/omegado-${img.owner.username}-${img.id}.jpg`),
        img
      })
    })
  })



};
/*eslint-disable */
export {
  bulksplashh
};