import { ValidationOptions, ValidateIf } from "class-validator";
export function Nullable(validationOptions?: ValidationOptions) {
  return ValidateIf((_object, value) => value !== null, validationOptions);
}
