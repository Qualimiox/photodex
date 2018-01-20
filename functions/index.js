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

  const thumbnailFilePath = path.normalize(path.join(fileDir, 'thumbnail'));
  const galleryFilePath = path.normalize(path.join(fileDir, 'gallery'));
  const tempLocalFile = path.join(os.tmpdir(), filePath);
  const tempLocalDir = path.dirname(tempLocalFile);
  const tempLocalThumbnailFile = path.join(os.tmpdir(), thumbnailFilePath);
  const tempLocalGalleryFile = path.join(os.tmpdir(), galleryFilePath);

  // Cloud Storage files.
  const bucket = gcs.bucket(event.data.bucket);
  const file = bucket.file(filePath);
  const thumbnailFile = bucket.file(thumbnailFilePath);
  const galleryFile = bucket.file(galleryFilePath);
  const metadata = { contentType: 'image/jpeg' };

  // Create the temp directory where the storage file will be downloaded.
  return mkdirp(tempLocalDir).then(() => {
    // Download file from bucket.
    return file.download({ destination: tempLocalFile });
  }).then(() => {
    // Update status.
    let updateData = {};
    updateData[`snaps.${pokemon}.status`] = 'Creating thumbnail';
    return admin.firestore().collection('users').doc(trainerId).update(updateData);
  }).then(() => {
    console.log('The file has been downloaded to', tempLocalFile);
    // Generate a thumbnail and gallery image using ImageMagick.
    return Promise.all([
      spawn('convert', [tempLocalFile,
        '-thumbnail', '192x192^',
        '-gravity', 'center',
        '-extent', '192x192',
        '-format', 'jpg',
        tempLocalThumbnailFile], { capture: ['stdout', 'stderr'] }),
      spawn('convert', [tempLocalFile,
        '-resize', '1200x1200>',
        '-format', 'jpg',
        tempLocalGalleryFile], { capture: ['stdout', 'stderr'] })
    ]);
  }).then(() => {
    console.log('Thumbnail created at', tempLocalThumbnailFile);
    console.log('Gallery image created at', tempLocalGalleryFile);
    // Uploading the images.
    return Promise.all([
      bucket.upload(tempLocalThumbnailFile, { destination: thumbnailFilePath, metadata: metadata }),
      bucket.upload(tempLocalGalleryFile, { destination: galleryFilePath, metadata: metadata })
    ]);
  }).then(() => {
    console.log('Thumbnail uploaded to Storage at', thumbnailFilePath);
    console.log('Gallery image uploaded to Storage at', galleryFilePath);
    // Once the images have been uploaded delete the local files to free up disk space.
    fs.unlinkSync(tempLocalFile);
    fs.unlinkSync(tempLocalThumbnailFile);
    fs.unlinkSync(tempLocalGalleryFile);
    // Get the Signed URLs for the thumbnail and gallery image.
    const config = {
      action: 'read',
      expires: '03-01-2500'
    };
    return Promise.all([
      thumbnailFile.getSignedUrl(config),
      galleryFile.getSignedUrl(config)
    ]);
  }).then(results => {
    console.log('Got Signed URL.');
    const version = +new Date();
    const thumbnailResult = results[0];
    const thumbnailFileUrl = thumbnailResult[0] + `&v=${version}`;
    const galleryResult = results[1];
    const galleryFileUrl = galleryResult[0] + `&v=${version}`;
    // Add the URLs to Firestore.
    let updateData = {}
    updateData[`snaps.${pokemon}.thumbnail`] = thumbnailFileUrl;
    updateData[`snaps.${pokemon}.gallery`] = galleryFileUrl;
    updateData[`snaps.${pokemon}.status`] = null;
    return admin.firestore().collection('users').doc(trainerId).update(updateData);
  }).then(() => console.log('Thumbnail and gallery image URLs saved to Firestore.'));
});
