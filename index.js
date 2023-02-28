import ffmpeg from "fluent-ffmpeg";
import fs from "fs";
import path from "path";
import { fileURLToPath } from 'url';
import HlsServer from "hls-server";
import http from "http";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// const keyFile = "secret.key";
// let input = "./videos/animations/刀劍神域/艾恩葛朗特篇/1.mp4"
// let output = "./output/videos/animations/刀劍神域/艾恩葛朗特篇/ep1/index.m3u8";

// Below is FFMPEG converting MP4 to HLS with reasonable options.
// https://www.ffmpeg.org/ffmpeg-formats.html#hls-2

// ffmpeg(input, { timeout: 432000 }).addOptions([
//   '-profile:v baseline', // baseline profile (level 3.0) for H264 video codec
//   '-level 3.0', 
//   '-s 640x360',          // 640px width, 360px height output video dimensions
//   '-start_number 0',     // start the first .ts segment at index 0
//   '-hls_time 10',        // 10 second segment duration
//   '-hls_list_size 0',    // Maxmimum number of playlist entries (0 means all entries/infinite)
//   '-f hls'               // HLS format
// ]).output(output).on('end', function() {
//   console.log('Transcoding succeeded!');
// }).run();
    
const server = http.createServer((req, res) => {  
  const { headers, method, url } = req;

  console.log("headers", headers);
  console.log("method", method);
  console.log("url", url);
  // console.log(req);

  fs.readFile(__dirname + decodeURI(req.url), (err, data) => {
    if (err) {
      res.statusCode = 404;
      res.setHeader('Content-Type', 'text/plain');
      res.end('404: File not found');
    } else {
      res.statusCode = 200;
      res.setHeader('Content-Type', 'text/plain');
      res.end(data);
    }
  });

  // res.statusCode = 200;
  // res.setHeader('Content-Type', 'text/plain');
  // res.end('Hello, World!\n');  
});

server.on('clientError', (err, socket) => {
  socket.end('HTTP/1.1 400 Bad Request\r\n\r\n');
});
server.listen(8080);
console.log('server running on port 8080');

const hlsServer = http.createServer();
const hls = new HlsServer(hlsServer, {
  // Base URI to output HLS streams
  // path: '/streams/animations/刀劍神域/艾恩葛朗特篇/ep1/index.m3u8',
  path: '/streams/animations/SAO/season1/ep1/index.m3u8',
  // Directory that input files are stored
  dir: "./output/videos/animations/刀劍神域/艾恩葛朗特篇/ep1/index.m3u8",
});

// hls.attach(hlsServer, {
//   path: '/streams/animations/SAO/season1/ep2/index.m3u8',
//   dir: "./output/videos/animations/刀劍神域/艾恩葛朗特篇/ep2/index.m3u8",
// });

// hls.attach(hlsServer, {
//   path: '/streams/animations/SAO/season1/ep3/index.m3u8',
//   dir: "./output/videos/animations/刀劍神域/艾恩葛朗特篇/ep3/index.m3u8",
// });

hlsServer.listen(8000);
console.log('HLS server running on port 8000');