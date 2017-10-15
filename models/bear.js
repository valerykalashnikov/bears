var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;

var BearSchema   = new Schema({
  name: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

// Sets the createdAt parameter equal to the current time
BearSchema.pre('save', next => {
  now = new Date();
  if(!this.createdAt) {
    this.createdAt = now;
  }
  next();
});

module.exports = mongoose.model('Bear', BearSchema);
