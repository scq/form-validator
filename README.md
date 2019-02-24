FormValidator
=============

A simple, zero-dependency library for validating forms.

Quick start
-----------

Call `FormValidator.init` and pass it the form element and a config object:

```
FormValidator.init(document.getElementById('my-form'), {
  fields: v => ({
    // the object key is the name of the field
    name: {
      label: 'Name',
      validators: [v.required(), v.minLength(2)]
    },
    email: {
      label: 'Email',
      validators: [v.required(), v.email()]
    },
  }),

  fieldError: (field, error) => {
    // display an error message for the field here
    // field is the input element and error is a string, or null if there is no error
  },

  formError: (form, error) => {
    // if you need to mark the entire form as invalid, you can do that here
    // form is the original form element you passed in, and error is a boolean
  }
});
```

The `fields` option above is where you specify the fields in the form to
validate. It takes a function that is passed an object containing all of the
validators as a convenience, and should return an object containing all of
the fields to validate.

Built-in validators
-------------------

* `required()`: must be non-empty
* `email()`: must be formatted as an email address
* `minLength(n)`: must be at least `n` characters long
* `minSelections(n)`: for checkboxes, at least `n` must have been checked

Adding custom validators
------------------------

You can add custom validators using `FormValidator.registerValidator`.

For example, the following validator will ensure that the entered number is a
multiple of the number provided at configuration time:

```
FormValidator.registerValidator('multipleOf', (factor) => ({
  validate: value => {
    const number = Number(value);
    return !isNaN(number) && number % factor;
  },
  messageData: () => ({ factor }),
  messages: {
    en: '{label} must be a multiple of {factor}'
  }
}));
```
