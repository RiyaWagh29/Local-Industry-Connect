/**
 * Centralized utility to handle backend multilingual objects (e.g., { en: string, mr: string })
 * and prevent "Objects are not valid as a React child" crashes.
 */
export const getText = (value: any): string => {
  if (!value) return "";
  if (typeof value === "string") return value;
  if (typeof value === "object") {
    return value.en || value.mr || "";
  }
  return "";
};
