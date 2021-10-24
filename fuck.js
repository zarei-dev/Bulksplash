'use strict';
import fetch from 'node-fetch';
import request from 'request';
import * as fs from 'fs';
import https from 'https';
import * as path from 'path';
import ProgressBar from 'progress';
import inquirer from 'inquirer';
import axios from 'axios';


function imageData(id, callback, apiKey) {
    const req = request({
      url: 'https://api.unsplash.com/photos/' + id + '?client_id=' + apiKey,
      json: true
    }, function (error, response, body) {
      if (error || response.statusCode !== 200) {
        return callback(error || {statusCode: response.statusCode});
        } 
        console.log(response);
        console.log('req');
      callback(null, response.body);  
    })
}

const write_file = (err, body) => {
    let dest = __dirname + '/imgs';
// console.log(body)
// body = JSON.parse(body);
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
fs.writeFile(dest + `/omegado-${data.user.username}-${data.photo.id}.txt`, JSON.stringify(data, null, "\t"), "utf8", (err) => {
  if (err) {
    console.log(err)
  }
  console.log("🗂  done! " + data.photo.id)
})

}

var collection = 'https://unsplash.com/collections/9375837'
let collectionId = collection.split("/")[4];
let apiKeys = ["fymYR5htky3PF1O4-P8YN4FqcpVim6lHd2S5bv79F5M", "ttUqGcFjnw_kag6oa9X-oM_9H5BSHFG32rFa9sIbwKs", "HQtqmJS7bjUyzlWJd8D1EKSmugm6CNTlYul58-DVN3Q", "KU76e-L5LwjeOxB98AWi_NJ1BfnSe1bFQ1A7Aul9foA"];
let apiKey = apiKeys[Math.floor(Math.random() * apiKeys.length)];

const bulksplashh = async () => {

    
    let rawdata = fs.readFileSync('ids.json');
    let imgages = JSON.parse(rawdata);
    
    imgages.forEach(img => {
        // let path = './file.txt';
        let id = img;
        (async () => {
            try {
              const response = await axios.get('https://api.unsplash.com/photos/' + id + '?client_id=' + "HQtqmJS7bjUyzlWJd8D1EKSmugm6CNTlYul58-DVN3Q")
            //   console.log(response.data);
            //   console.log(response.data.explanation);
                write_file(null, response.data);
            } catch (error) {
              console.log('wrong!' + id);
            }
          })();
    });
    
    

    
};
// bulksplashh()

// imageData('BSlEq_yMQIE', write_file, "KU76e-L5LwjeOxB98AWi_NJ1BfnSe1bFQ1A7Aul9foA")
bulksplashh()

// (async () => {
//     try {
//       const response = await axios.get('https://api.unsplash.com/photos/' + 'BSlEq_yMQIE' + '?client_id=' + "VwOfv7hQ1LMf98ByfH0R92cd67Xd7jhYy4wq9VtWtBI")
//     //   console.log(response.data);
//     //   console.log(response.data.explanation);
//         write_file(null, response.data);
//     } catch (error) {
//       console.log(error);
//     }
//   })();


// const options = {
//     hostname: 'api.unsplash.com',
//     port: 443,
//     path: '/photos/' + 'BSlEq_yMQIE' + '?client_id=' + "VwOfv7hQ1LMf98ByfH0R92cd67Xd7jhYy4wq9VtWtBI",
//     method: 'GET'
//   }
  
//   const req = https.request(options, res => {
//     console.log(`statusCode: ${res.statusCode}`)
  
//     res.on('data', d => {
//         // process.stdout.write(d)
//         // console.log(d.body)
//         write_file(null, d.body)
        
//     })
//   })
  
//   req.on('error', error => {
//     // console.error(error)
//   })
  
//   req.end()





export {
  bulksplashh
};