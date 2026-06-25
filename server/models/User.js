const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 2,
    maxlength: 30
  },
  password: {
    type: String,
    required: true
  },
  nickname: {
    type: String,
    default: ''
  },
  avatar: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
})

module.exports = mongoose.model('User', userSchema)
