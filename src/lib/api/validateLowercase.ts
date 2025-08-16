function validateLowercase(param: string, fieldName: string) {
  if (!param || param !== param.toLowerCase()) {
    throw { message: `${fieldName} must be lowercase`, status: 400 };
  }
}
export default validateLowercase;
