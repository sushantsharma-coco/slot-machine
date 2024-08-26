const jwt = require("jsonwebtoken");
const { RedisError } = require("../../utils/RedisError.utils");
const { RedisSuccess } = require("../../utils/RedisSuccess.utils");

const checkAuthentic = async (socket, id, accessToken) => {
  try {
    let { id } = socket.handshake.query;
    let accessToken = socket.handshake.headers.token;

    if (!id || !accessToken)
      return RedisError(false, "id or auth-token not found");

    let tokenData = await jwt.verify(accessToken, process.env.JWT_SECRET);

    console.log(tokenData);

    if (!tokenData || !tokenData?.id)
      return new RedisError(false, "_id not found");

    if (tokenData?.id !== id)
      return new RedisError(
        false,
        "_id doesn't match with id sent in handshake"
      );

    if (tokenData?.exp && tokenData.exp < Date.now() / 1000)
      return new RedisError(false, "token has been expired");

    return new RedisSuccess();
  } catch (error) {
    console.error("error in checkAuthentic func :", error?.message);
  }
};

module.exports = { checkAuthentic };
