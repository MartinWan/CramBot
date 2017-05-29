const ACCESS_KEY_ID = process.env.AWS_ACCESS_KEY_ID
const SECRET_ACCESS_KEY = process.env.AWS_SECRET_ACCESS_KEY
const REGION = process.env.AWS_REGION
const S3_BUCKET = process.env.S3_BUCKET
const S3_BUCKET_RESIZED = process.env.S3_BUCKET_RESIZED
if (!(ACCESS_KEY_ID && SECRET_ACCESS_KEY && REGION && S3_BUCKET && S3_BUCKET_RESIZED)) {
  console.error("Missing config values for blob service");
  process.exit(1);
}

const aws = require('aws-sdk')
const S3 = new aws.S3({
  accessKeyId: ACCESS_KEY_ID,
  secretAccessKey: SECRET_ACCESS_KEY,
  region: REGION
})
const uuid = require('uuid/v1');
const request = require('request').defaults({ encoding: null })

/**
 * Takes the file located at the url and uploads it to permanent storage,
 * responding with a unique key to access the file.
 *
 * @param url to locate the file
 * @param callback of the form function(error, response) {}
 */
exports.put = function(url, callback) {
  request.get(url, (error, response, body) => {
    if (error) return callback(error)
    if (response.statusCode !== 200)
      return callback(
        new Error('Error fetching resource with status code: ' + response.statusCode)
      )

    const key = uuid()
    S3.putObject({
      Bucket: S3_BUCKET,
      Key: key,
      Body: body
    }, (err) => {
      if (err) return callback(err)

      callback(null, key)
    })
  })
}

/**
 * Get a URL for the file uniquely identified by the key
 * @param key
 */
exports.getURL = function(key) {
  return toURL(key, S3_BUCKET)
}

/**
 * Get thumbnail URL for the file uniquely identified by the key
 */
exports.getThumbnailURL = function(key) {
  return toURL(key, S3_BUCKET_RESIZED)
}

/**
 * Converts the key to url with region and s3 bucket
 * E.g. https://s3-us-west-2.amazonaws.com/goflatmap/FILE_KEY
 *
 * @param key
 * @bucket the S3 bucket
 */
function toURL(key, bucket) {
  return "https://s3-" + REGION + ".amazonaws.com/" + bucket + "/" + key
}