import crypto from 'crypto';

const CHARSET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

export const generateSessionCode = (length: number = 8): string => {
  const bytes = crypto.randomBytes(length);
  let code = '';

  for (let i = 0; i < length; i++) {
    const index = bytes[i] % CHARSET.length;
    code += CHARSET[index];
  }

  return code;
};