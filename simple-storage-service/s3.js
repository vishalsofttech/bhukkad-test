// Libs
const { Upload } = require("@aws-sdk/lib-storage");
const { S3Client } = require("@aws-sdk/client-s3");

async function S3bucketUpload(
  files,
  allowedFileSize,
  accessKeyId,
  secretAccessKey,
  region,
  Bucket
) {
  // console.log("files ", files, allowedFileSize);
  if (!files || Object.keys(files).length === 0) {
    return { success: false, msg: "No Files were uploaded...!!!" };
  }

  if (files.size > allowedFileSize * 1024 * 1024) {
    return {
      success: false,
      msg: `File size should not be greater than ${allowedFileSize} Mb`,
    };
  }

  // return console.log("files ", files);

  let uploaded = new Upload({
    client: new S3Client({
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
      region,
    }),
    params: {
      // ACL: "public-read",
      Bucket,
      Key: `${Date.now().toString()}-${files.originalname}`,
      Body: files.buffer,
    },
    tags: [], // optional tags
    queueSize: 4, // optional concurrency configuration
    partSize: 1024 * 1024 * 5, // optional size of each part, in bytes, at least 5MB
    leavePartsOnError: false, // optional manually handle dropped parts
  })
    .done()
    .then((data) => {
      // console.log("data aws ", data);
      return { success: true, img: data.Location, Key: data?.Key, error: "" };
    })
    .catch((err) => {
      // form.emit('error', err);
      return { success: false, img: "", Key: "", error: err };
    });
  return uploaded;
}

module.exports = {
  S3bucketUpload,
};
