const { S3Client, DeleteObjectCommand } = require("@aws-sdk/client-s3");

function deleteImage(bucketName, key) {
  let params = {
    Bucket: bucketName,
    Key: key,
  };

  const command = new DeleteObjectCommand(params);

  const client = new S3Client({
    credentials: {
      accessKeyId: process.env.S3_ACCESS_KEY,
      secretAccessKey: process.env.S3_ACCESS_SECRET,
    },
    region: process.env.S3_REGION,
  });

  return client.send(command);
}

module.exports = {deleteImage}