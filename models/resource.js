const mongoose = require('mongoose')
const BlobService = require('../services/blob-service')
const Schools = require('./schools')

/**
 * A resource is something that can help the user cram for a course at a given school.
 * The mongoose document only stores the metadata about the resource with the actual
 * object stored in an external storage service and is identified by the resource's key
 */
const resourceSchema = new mongoose.Schema({
  school: {
    type: String,
    required: true,
    enum: Schools.SCHOOLS
  },
  course: {
    type: String,
    required: true
  },
  key: {
    type: String,
    required: true
  },
  isApproved: { // if this resource is approved by administrators of the application
    type: Boolean,
    required: true,
    default: false
  }
})

resourceSchema.methods.getURL = function() {
  return BlobService.getURL(this.key)
}

resourceSchema.methods.getThumbnailURL = function() {
  return BlobService.getThumbnailURL(this.key)
}

resourceSchema.methods.getSchoolName = function() {
  return Schools.getSchoolName(this.school)
}


module.exports = mongoose.model('Resource', resourceSchema)