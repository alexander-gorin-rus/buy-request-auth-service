export enum ErrorStatus {
  USER_EXIST = 'USER_EXIST',
  EMAIL_IS_NOT_VERIFIED = 'EMAIL_IS_NOT_VERIFIED',
  EMAIL_IS_ALREADY_VERIFIED = 'EMAIL_IS_ALREADY_VERIFIED',
  USER_NOT_EXIST = 'USER_NOT_EXIST',
  PASSWORD_ERROR = 'PASSWORD_ERROR',
  INCORRECT_CODE = 'INCORRECT_CODE',
  NO_ONE_TIME_CODE = 'NO_ONE_TIME_CODE',
  CODE_ALREADY_GENERATED = 'CODE_ALREADY_GENERATED',
  CODE_TIMEOUT = 'CODE_TIMEOUT',
  EMAIL_EXIST = 'EMAIL_EXIST',
}