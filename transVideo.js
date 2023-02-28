import ffmpeg from "fluent-ffmpeg";
import fs from "fs";
import path from "path";
import crypto from "crypto";
import { fileURLToPath } from 'url';
import process from 'node:process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const transHttpLiveStream = (input, output, encrypto = false) => {
  
  if (!fs.existsSync(output)) {
    fs.mkdirSync(output);
  }

  let outputOptions = [
    '-hls_time 10',
    '-hls_list_size 0',    
  ]

  if (encrypto === true) {
    const keyFile = "secret.key";
    // 生成 16 字節的 AES 加密密鑰
    const key = crypto.randomBytes(16);
    // 生成一個隨機的 initialization vector (IV)
    const iv = crypto.randomBytes(16);

    // 將 key 和 iv 寫入 key_info_file
    const keyInfoFilePath = path.join(__dirname, `${output}/key_info_file`);

    const keyInfoFileData = `http://172.17.27.109:3000/${output}/${keyFile}\n${output}/${keyFile}\n${iv.toString('hex')}`;

    fs.writeFileSync(keyInfoFilePath, keyInfoFileData);
    console.log("keyInfoFilePath", keyInfoFilePath);
    console.log("keyInfoFileData", keyInfoFileData);

    // 將 key 寫入獨立的文件中
    const keyFilePath = path.join(__dirname, `${output}/${keyFile}`);
    fs.writeFileSync(keyFilePath, key);

    console.log("keyFilePath", keyFilePath);
    console.log("keyFilePathData", fs.readFileSync(keyFilePath));

    // 將 key_info_file 配置到輸出選項中
    outputOptions.push(`-hls_key_info_file ${output}/key_info_file`);
  }  

  ffmpeg(input, { })
    // .videoCodec('copy')
    // .audioCodec('copy')
    // .format('hls')
    .addOptions([
      '-profile:v baseline', // baseline profile (level 3.0) for H264 video codec
      '-level 3.0', 
      // '-s 640x360',          // 640px width, 360px height output video dimensions
      '-start_number 0',     // start the first .ts segment at index 0      
      '-f hls'               // HLS format
    ])
    .outputOptions(outputOptions)
    .output(`${output}/index.m3u8`)
    .on('start', function(commandLine) {
      console.log('Starting ffmpeg with command:', commandLine);
    })
    .on('error', function(err) {
      console.error('An error occurred: ' + err.message);
    })
    .on('end', function() {
      console.log('Transcoding succeeded!');
    })
    .on('progress', function(progress) {
      console.log('Processing: ' + progress.percent + '% done');
    })
    .run();
}

// let input = "videos/animations/刀劍神域/艾恩葛朗特篇/4.mp4"
// let output = "output/videos/animations/刀劍神域/艾恩葛朗特篇/ep4";
// let encrypto = true;

let input = "";
let output = "";
let encrypto = false;

process.argv.forEach(function (val, index, array) {
  console.log(index + ": " + val);
  
  switch(index) {
    case 2:
      input = val;
      break;
    case 3:
      output = val;
      break;
    case 4:
      encrypto = (val === "yes");
      break;      
  }   
});

if (!fs.existsSync(input)) {
  console.error("input not exist!");
  process.exit(1);
} 

if (output === "") {
  console.error("output not allow empty!");
  process.exit(1);
} 

transHttpLiveStream(input, output, encrypto);