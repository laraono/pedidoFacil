import { ref } from "vue";

export interface ValidationRule {
  validator: (value: unknown) => boolean;
  message: string;
}

export type ValidationRules = Record<string, ValidationRule[]>;

export function useFormValidation(rules: ValidationRules = {}) {
  const errors = ref<Record<string, string>>({});
  const touched = ref<Record<string, boolean>>({});

  const validateField = (field: string, value: unknown): boolean => {
    const fieldRules = rules[field];
    if (!fieldRules) return true;

    for (const rule of fieldRules) {
      const { validator, message } = rule;
      if (!validator(value)) {
        errors.value[field] = message;
        return false;
      }
    }
    delete errors.value[field];
    return true;
  };

  const touchField = (field: string, value: unknown): void => {
    touched.value[field] = true;
    validateField(field, value);
  };

  const validateAll = (form: Record<string, unknown>): boolean => {
    let isValid = true;
    Object.keys(rules).forEach((field) => {
      if (!validateField(field, form[field])) {
        isValid = false;
      }
    });
    return isValid;
  };

  return {
    errors,
    touched,
    validateField,
    touchField,
    validateAll,
  };
}
