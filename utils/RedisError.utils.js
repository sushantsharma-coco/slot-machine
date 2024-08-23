class RedisError {
  constructor(success = false, error = "error", message = null) {
    this.success = success;
    this.error = error;
    this.message = message;
  }
}

module.exports = { RedisError };
