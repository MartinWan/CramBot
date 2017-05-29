/**
 * Script to import content to the chatbot.
 * WARNING: This script will overwrite all content in the mongo database and S3 buckets
 */
const mongoose = require('mongoose')
const Resource = require('../models/resource')
const Conversation = require('../models/conversation')
const async = require('async')
const fs = require('fs')
const uuid = require('uuid/v1')
const aws = require('aws-sdk')
const _ = require('underscore')
const Schools = require('../models/schools')


// test database connection
const MONGODB_URI = process.env.MONGODB_URI
if (!MONGODB_URI) {
  console.error(`Could not find the MONGODB_URI environment variable. Please make sure it is set.`)
  process.exit(1)
}
mongoose.connect(MONGODB_URI)
mongoose.connection.on('error', () => {
  console.error('MongoDB Connection Error. Please make sure MongoDB is running')
  process.exit(1)
})

// test S3 connection
const ACCESS_KEY_ID = process.env.AWS_ACCESS_KEY_ID
const SECRET_ACCESS_KEY = process.env.AWS_SECRET_ACCESS_KEY
const REGION = process.env.AWS_REGION
const S3_BUCKET = process.env.S3_BUCKET
const S3_BUCKET_RESIZED = process.env.S3_BUCKET_RESIZED
if (!(ACCESS_KEY_ID && SECRET_ACCESS_KEY && REGION && S3_BUCKET && S3_BUCKET_RESIZED)) {
  console.error(`Could not find correct AWS S3 environment variables. Please make sure they are set correctly.`)
  process.exit(1)
}
const S3 = new aws.S3({
  accessKeyId: ACCESS_KEY_ID,
  secretAccessKey: SECRET_ACCESS_KEY,
  region: REGION
})

if (process.argv.length <= 2) {
  console.log("Usage: node import-content.js [node options] <content directory>")
  process.exit(-1)
}
const CONTENT_DIRECTORY = _.last(process.argv)

// invoke async operations in series
async.series([
  clearDatabase,
  clearS3Buckets,
  processDirectory
], (err) => {
  if (err) throw err

  console.log(`Successfully imported content from directory ${CONTENT_DIRECTORY}. Have a nice day.`)
  process.exit(0)
})


/**
 * Clears Resource and Conversation collections in the database
 * @param done
 */
function clearDatabase(done) {
  console.log(`Clearing database...`)
  async.parallel([
    (callback) => Resource.remove({}, callback),
    (callback) => Conversation.remove({}, callback)
  ], done)
}


/**
 * Clear all S3 buckets
 * @param done
 */
function clearS3Buckets(done) {
  console.log('Clearing S3 Buckets...')
  async.each([S3_BUCKET, S3_BUCKET_RESIZED], emptyBucket, done)
}


/**
 * Empty the S3 bucket of all its contents
 * @param bucketName
 * @param done
 */
function emptyBucket(bucketName, done) {
  S3.listObjects({
    Bucket: bucketName
  }, (error, data) => {
    if (error) return done(error)
    if (data.Contents.length === 0) return done(null)

    const bucketObjects = data.Contents.map(content => {
      return { Key: content.Key }
    })
    S3.deleteObjects({
      Bucket: bucketName,
      Delete: {
        Objects: bucketObjects
      }
    }, (error, data) => {
      if (error) {
        return done(error)
      }
      if (data.Deleted.length == 1000) {
        // S3 allows deletions of at most 1000 keys
        // http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/S3.html#deleteObjects
        return emptyBucket(bucketName, done)
      }
      done(null)
    })
  })
}


/**
 * Reads files from the directory, creates resource from the file name,
 * persists the resources to mongoDB and files to S3
 * @param done
 */
function processDirectory(done) {
  console.log(`Reading files from directory: ${CONTENT_DIRECTORY} ...`)

  const fileNames = fs.readdirSync(CONTENT_DIRECTORY).filter(f => f != '.DS_Store') // filter out Apple's finder file because it's annoying
  fileNames.forEach(parseFileName) // validate all file names first

  async.map(fileNames, createResourceFromFileName, (err, resources) => {
    if (err) throw err

    if (resources.length !== fileNames.length) {
      throw new Error('Failed to load all resources for some unknown reason.')
    }

    const fileNamesWithResources = _.zip(fileNames, resources)

    async.each(fileNamesWithResources, processFileNameWithResource, done)
  })
}


/**
 * Creates a resource from a valid filename.
 *
 * @param fileName
 * @param done
 */
function createResourceFromFileName(fileName, done) {
  const schoolIdAndCourse = parseFileName(fileName)
  const resourceKey = uuid()
  const resource = new Resource({
    school: schoolIdAndCourse[0],
    course: schoolIdAndCourse[1],
    key: resourceKey,
    isApproved: true
  })
  resource.validate((error) => {
    if (error) throw error
    done(null, resource)
  })
}


/**
 * Processes the tupple [fileName, resource]
 * @param fileNameAndResource
 * @param done
 */
function processFileNameWithResource(fileNameAndResource, done) {
  const fileName = fileNameAndResource[0]
  const resource = fileNameAndResource[1]

  const fileDirectory = CONTENT_DIRECTORY + fileName
  console.log(`Attempting to read file in directory ${fileDirectory}`)
  const fileBuffer = fs.readFileSync(fileDirectory)

  S3.putObject({
    Bucket: S3_BUCKET,
    Key: resource.key,
    Body: fileBuffer
  }, (err) => {
    if (err) return done(err)

    console.log(`Persisted ${fileDirectory} successfully to S3`)
    resource.save((error) => {
      if (error) return done(error)
      console.log(`Saved metadata of resource in ${fileDirectory} successfully to MongoDB`)
      done()
    })
  })
}


/**
 * Parses a file name. Of the format SCHOOLID-COURSE.extension
 * Throws exception if the file is not in this format.
 * @param file
 * @returns {[*,*]}
 */
function parseFileName(file) {
  const tokens = file.split('-')
  if (tokens.length < 2) {
    throw new Error(`Invalid file name ${file}. Files should be format: SCHOOLID-COURSE`)
  } else {
    const schoolId = tokens[0]
    const course = tokens[1].split('.')[0] // remove file extension
    if (Schools.SCHOOLS.includes(schoolId)) {
      return [schoolId, course]
    } else {
      throw new Error(`Invalid school id: ${schoolId}. Valid school ids are defined in the Schools model`)
    }
  }
}