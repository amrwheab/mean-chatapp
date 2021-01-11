const mongoose = require('mongoose')

const msgSchema = new mongoose.Schema({
  user1: {
    type: String,
    required: true
  },
  user2: {
    type: String,
    required: true
  },
  msgs: {
    type: Array
  }
})

const Messages = mongoose.model('message', msgSchema)

module.exports = Messages