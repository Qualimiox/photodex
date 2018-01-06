'use strict';

const functions = require('firebase-functions');
const mkdirp = require('mkdirp-promise');
const gcs = require('@google-cloud/storage')({ keyFilename: 'serviceAccountKey.json' });
const admin = require('firebase-admin');
admin.initializeApp(functions.config().firebase);
const spawn = require('child-process-promise').spawn;
const path = require('path');
const os = require('os');
const fs = require('fs');

exports.processImages = functions.storage.object().onChange(event => {
  // Exit if this is triggered on a file that is not an image.
  if (!event.data.contentType.startsWith('image/')) {
    console.log('This is not an image.');
    return null;
  }

  // Exit if this is a move or deletion event.
  if (event.data.resourceState === 'not_exists') {
    console.log('This is a deletion event.');
    return null;
  }

  // File and directory paths.
  const filePath = event.data.name;
  const fileDir = path.dirname(filePath);
  const fileName = path.basename(filePath);
  const filePattern = /^photodex\/([^\/]+)\/snaps\/(\d+)\/raw$/;
  const match = filePath.match(filePattern);
  
  // Exit if the image is already transformed.
  if (!match) {
    console.log('Not a raw image.');
    return null;
  }

  const trainerId = match[1];
  const pokemon = match[2];

  const thumbFilePath = path.normalize(path.join(fileDir, 'thumb'));
  const tempLocalFile = path.join(os.tmpdir(), filePath);
  const tempLocalDir = path.dirname(tempLocalFile);
  const tempLocalThumbFile = path.join(os.tmpdir(), thumbFilePath);

  // Cloud Storage files.
  const bucket = gcs.bucket(event.data.bucket);
  const file = bucket.file(filePath);
  const thumbFile = bucket.file(thumbFilePath);
  const metadata = { contentType: 'image/jpeg' };

  // Create the temp directory where the storage file will be downloaded.
  return mkdirp(tempLocalDir).then(() => {
    // Download file from bucket.
    return file.download({ destination: tempLocalFile });
  }).then(() => {
    console.log('The file has been downloaded to', tempLocalFile);
    // Generate a thumbnail using ImageMagick.
    return spawn('convert', [tempLocalFile,
      '-thumbnail', '192x192^',
      '-gravity', 'center',
      '-extent', '192x192',
      '-format', 'jpg',
      tempLocalThumbFile], { capture: ['stdout', 'stderr'] });
  }).then(() => {
    console.log('Thumbnail created at', tempLocalThumbFile);
    // Uploading the Thumbnail.
    return bucket.upload(tempLocalThumbFile, { destination: thumbFilePath, metadata: metadata });
  }).then(() => {
    console.log('Thumbnail uploaded to Storage at', thumbFilePath);
    // Once the image has been uploaded delete the local files to free up disk space.
    fs.unlinkSync(tempLocalFile);
    fs.unlinkSync(tempLocalThumbFile);
    // Get the Signed URLs for the thumbnail and original image.
    const config = {
      action: 'read',
      expires: '03-01-2500'
    };
    return Promise.all([
      thumbFile.getSignedUrl(config)
    ]);
  }).then(results => {
    console.log('Got Signed URLs.');
    const thumbResult = results[0];
    const thumbFileUrl = thumbResult[0];
    // Add the URLs to Firestore.
    let updateData = {};
    updateData['thumbnails.' + pokemon] = thumbFileUrl;
    return admin.firestore().collection('users').doc(trainerId).update(updateData);
  }).then(() => console.log('Thumbnail URLs saved to Firestore.'));
});
