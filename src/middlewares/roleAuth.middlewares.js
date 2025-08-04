import { ApiError } from "../utils/apiError.js";

const isAuthorized = (...roles) => {
  return (req, res, next) => {
    const userRole = req.user?.role;
    if (!roles.includes(userRole)) {
      throw new ApiError(
        403,
        "Forbidden: You don't have permission to access this resource"
      );
    }
  };
};
export {isAuthorized}