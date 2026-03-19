export const validInput = {
  email: 'test@test.test',
  diffrentConfirmEmail: 'test1@test.test',
  password: 'T3sting1',
};

export const invalidEmailInput = {
  invalidEmailEmpty: {
    value: '',
    testDescription: 'User cannot register with invalid empty email',
  },
  invalidWhitespacedEmail: {
    value: '    ',
    testDescription: 'User cannot register with invalid whitespaced email',
  },
  invalidEmailWithoutPrefix: {
    value: '@test.com',
    testDescription: 'User cannot register with invalid email without prefix',
  },
  invalidEmailWithoutTLD: {
    value: 'test@test',
    testDescription: 'User cannot register with invalid email without TLD',
  },
  invalidEmailWithoutDomain: {
    value: 'test@com',
    testDescription: 'User cannot register with invalid email without domain',
  },
  invalidEmailWithDisallowedChars: {
    value: '##@test.com',
    testDescription:
      'User cannot register with invalid email with disallowed chars',
  },
};

export const invalidPasswordInput = {
  invalidPasswordEmpty: {
    value: '',
    testDescription: 'User cannot register with invalid empty password',
  },
  invalidEmptyWhitespacedPassword: {
    value: '    ',
    testDescription: 'User cannot register with invalid whitespaced password',
  },
  invalidTooShortPassword: {
    value: '1234',
    testDescription: 'User cannot register with invalid too short password',
  },
  invalidTooLongPassword: {
    value: '1234554321123455432112345543211234554321',
    testDescription: 'User cannot register with invalid too long password',
  },
};

export function uniqueEmail(prefix = 'motocare'): string {
  return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 10000)}@example.com`;
}
