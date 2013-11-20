// Those functions are GOLD
Array.prototype.first = function() {
  return this[0];
}
Array.prototype.second = function() {
  return this[1];
}
Array.prototype.last = function() {
  return this[this.length-1];
}
Array.prototype.each = function(callback) {
  for(var i = 0; i < this.length; i++) {
    callback(this[i]);
  }
}
Array.prototype.eachWithIndex = function(callback) {
  for(var i = 0; i < this.length; i++) {
    callback(this[i], i);
  }
}
