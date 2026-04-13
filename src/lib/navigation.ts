import { Role } from "./types";

/**
 * Returns the default home route for a given user role.
 * admin -> /admin/dashboard
 * mentor -> /mentor/dashboard
 * student -> /dashboard
 */
export const getHomeRoute = (role: Role): string => {
  switch (role) {
    case "admin":
      return "/admin/dashboard";
    case "mentor":
      return "/mentor/dashboard";
    case "student":
    default:
      return "/dashboard";
  }
};
