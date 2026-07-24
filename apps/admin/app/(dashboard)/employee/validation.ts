export const validation = {
  name: (value: string) => value.trim().length >= 2,
  email: (value: string) => /.+@.+\..+/.test(value),
  phone: (value: string) => value.trim().length >= 8,
  role: (value: string) => value.trim().length > 0,
}

