class RedisSuccess {
  constructor(success = true, message = "success", error = null) {
    this.success = success;
    this.message = message;
    this.error = error;
  }
}

module.exports = { RedisSuccess };
