function validateNumber(param: string | undefined, fieldName: string) {
  if (param && isNaN(Number(param))) {
    throw { message: `${fieldName} must be a number`, status: 400 };
  }
}
export default validateNumber;
