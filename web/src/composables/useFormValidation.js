import { ref } from 'vue';

export function useFormValidation(rules = {}) {
  const errors = ref({});
  const touched = ref({});

  const validateField = (field, value) => {
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

  const touchField = (field, value) => {
    touched.value[field] = true;
    validateField(field, value);
  };

  const validateAll = (form) => {
    let isValid = true;
    Object.keys(rules).forEach(field => {
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
    validateAll
  };
}