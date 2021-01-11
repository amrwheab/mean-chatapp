const mongoose = require('mongoose')


const registerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  address: {
    type: String,
    required: true
  },
  gender: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  info: {
    type: String,
    required: false
  },
  imgUrl: {
    type: String,
    required: true
  },
  freindRequists: {
    type: Array,
    required: true
  },
  freindList: {
    type: Array,
    required: true
  },
  online: {
    type: Boolean,
    required: true
  }
})

const User = mongoose.model('user', registerSchema)

module.exports = User