/**
 * Hopefully one day there will be a need to enumerate the list of schools in a
 * more scalable way. However for version 1.0 it is just a hardcoded list
 */
class Schools {
  static get UVIC() {
    return 'UVIC_SCHOOL'
  }
  static get UBC() {
    return 'UBC_SCHOOL'
  }
  static get SFU() {
    return 'SFU_SCHOOL'
  }

  static get SCHOOLS() {
    return [Schools.UVIC, Schools.UBC, Schools.SFU]
  }

  static getSchoolName(school) {
    if (school === Schools.UVIC) {
      return 'UVic'
    } else if (school === Schools.UBC) {
      return 'UBC'
    } else if (school === Schools.SFU) {
      return 'SFU'
    } else {
      return ''
    }
  }
}

module.exports = Schools