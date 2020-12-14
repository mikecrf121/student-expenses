const jwt = require("express-jwt");
const { secret } = require("config.json");
const db = require("_helpers/db");

module.exports = authorize;

function authorize(roles = []) {
  // roles param can be a single role string (e.g. Role.User or 'User')
  // or an array of roles (e.g. [Role.Admin, Role.User] or ['Admin', 'User'])
  if (typeof roles === "string") {
    roles = [roles];
  }

  return [
    // authenticate JWT token and attach user to request object (req.user)
    jwt({ secret, algorithms: ["HS256"] }),

    // authorize based on user role
    async (req, res, next) => {
      const account = await db.Account.findById(req.user.id);
      //console.log("account??",account)
      const refreshTokens = await db.RefreshToken.find({ account: account.id });
      if (!account || (roles.length && !roles.includes(account.role))) {
        // account no longer exists or role not authorized
        console.log("why here???");
        return await res
          .status(402)
          .json({ message: "Unauthorized_USER_TRIED_SOMETHING_BAD" });
      }
      // authentication and authorization successful
      req.user.role = account.role;
      //console.log(req.user,"req user")
      req.user.ownsToken = (token) =>
        !!refreshTokens.find((x) => x.token === token);
      next();
    },
  ];
}
