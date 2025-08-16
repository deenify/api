export const isNullish = (value: any): boolean =>
  value === null ||
  value === undefined ||
  value === false ||
  value === "" ||
  value === "undefined" ||
  value === "null" ||
  value === "NULL" ||
  value === "none";
