import * as yup from 'yup';

const schema = yup.object({
  role: yup.string().oneOf(['BUYER', 'VENDOR']).required(),
  email: yup
    .string()
    .required('Email is required')
    .email('Must be a valid email address'),
  password: yup
    .string()
    .required('Password is required')
    .min(8, 'Password must be at least 8 characters long'),
  shopName: yup.string().when('role', {
    is: 'VENDOR',
    then: (schema) => schema.required('Shop name is required'),
    otherwise: (schema) => schema.notRequired(),
  }),
  shopDescription: yup.string().optional(),
  logo: yup.mixed().optional(),
});

schema.validate({
  role: 'BUYER',
  email: 'test@example.com',
  password: 'password123',
}).then(console.log).catch(console.error);

schema.validate({
  role: 'VENDOR',
  email: 'test@example.com',
  password: 'password123',
}).then(console.log).catch(console.error);
