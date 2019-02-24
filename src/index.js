// equivalent to the validation on browser 'email' inputs
const EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

/**
 * Validates a form and displays error messages
 */
module.exports = class FormValidator {
  static language = 'en';

  // built-in validators
  static validators = {
    required: () => ({
      validate: value => !!value,
      messages: {
        en: '{label} is required'
      }
    }),
    email: () => ({
      validate: value => EMAIL_REGEX.test(value),
      messages: {
        en: '{label} must be a valid email'
      }
    }),
    minLength: min => ({
      validate: value => value.length >= min,
      messageData: () => ({ min }),
      messages: {
        en: '{label} must be at least {min} characters long'
      }
    }),
    minSelections: min => ({
      validate: value => value.length >= min,
      messageData: () => ({ min }),
      messages: {
        en: 'You must choose at least {min} items'
      }
    })
  };

  // create an instance of the validator and attach it to the specified element
  static init(el, config) {
    const validator = new FormValidator(config);
    validator.attach(el);
    return validator;
  }

  static registerValidator(name, validator) {
    FormValidator.validators[name] = validator;
  }

  constructor(config) {
    this.config = config;
    this.validations = config.fields(FormValidator.validators);
  }

  attach(el) {
    this.el = el;
    el.addEventListener('submit', this.handleSubmit);
    el.addEventListener('change', this.validate);
    el.addEventListener('keyup', this.validate);
  }

  handleSubmit = e => {
    e.preventDefault();

    this.submitAttempted = true;
    this.validate();

    if (this.valid) {
      this.el.submit();
    }
  };

  validate = () => {
    const formData = this.readForm(Object.keys(this.validations));

    this.valid = true;
    this.errors = {};

    // go through each field we were given and validate it
    for (const [name, fieldData] of Object.entries(this.validations)) {
      const fieldValid = true;
      for (const validator of fieldData.validators) {
        if (!validator.validate(formData[name], formData)) {
          fieldValid = false;
          this.valid = false;
          const messageData = validator.messageData
            ? validator.messageData()
            : {};
          messageData.label = fieldData.label;
          const error = this.formatMessage(
            validator.messages[FormValidator.language],
            messageData
          );
          this.errors[name] = error;
          break;
        }
      }
    }

    // only show errors in the UI if we've tried to submit the form before - if
    // the user's still just filling out the form, don't show anything
    if (this.submitAttempted) {
      this.showErrors();
    }
  };

  showErrors() {
    for (const name of Object.keys(this.validations)) {
      this.fieldError(name, this.errors[name] || null);
    }

    if (this.config.formError) {
      this.config.formError(this.el, !this.valid);
    }
  }

  // read in data from the supplied form inputs for use in the validations
  readForm(names) {
    const formData = {};

    for (const name of names) {
      const inputValues = [
        ...this.el.querySelectorAll('[name=' + name + ']')
      ].map(input => {
        if (input.nodeName === 'INPUT') {
          switch (input.type.toLowerCase()) {
            case 'checkbox':
              return input.checked ? input.value : undefined;
            case 'radio':
              throw new Error('Not implemented');
            default:
              return input.value;
          }
        }

        if (input.nodeName === 'SELECT') {
          return input.value;
        }

        // we don't know how to get the value of this element
        return undefined;
      });

      // if we have multiple inputs with the same name, return an array of their values
      // (minus any that are undefined - that would be unchecked checkboxes, etc)
      formData[name] =
        inputValues.length > 1
          ? inputValues.filter(x => x !== undefined)
          : inputValues[0];
    }

    return formData;
  }

  fieldError(name, error) {
    const field = this.el.querySelector('[name=' + name + ']');
    if (!field) {
      return;
    }
    if (error !== null) {
      field.setAttribute('aria-invalid', 'true');
    } else {
      field.removeAttribute('aria-invalid');
    }
    if (this.config.fieldError) {
      this.config.fieldError(field, error);
    }
  }

  formatMessage(message, replacements) {
    for (const [key, value] of Object.entries(replacements)) {
      // only replaces the first instance... a better solution would be to parse the replace tags with a regex
      message = message.replace('{' + key + '}', value);
    }
    return message;
  }
};
