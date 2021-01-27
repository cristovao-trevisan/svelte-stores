export const required = (v: unknown) => {
  if (v === undefined || v === null || v === '' || v === 0) {
    return new Error('Campo Obrigatório');
  }
};

const emailRegex = /^[-!#$%&'*+/0-9=?A-Z^_a-z`{|}~](\.?[-!#$%&'*+/0-9=?A-Z^_a-z`{|}~])*@[a-zA-Z0-9](-*\.?[a-zA-Z0-9])*\.[a-zA-Z](-?[a-zA-Z0-9])+$/;

export const errInvalidEmail = new Error('Email inválido');
export const email = (e: string) => {
  if (e.length > 256) return errInvalidEmail;
  if (!emailRegex.test(e)) return errInvalidEmail;
};

export const oneOf= <T> (items: T[]) => (v: T) => {
  if (!items.includes(v)) new Error('Campo inválido');
};

export const errInvalidCPF = new Error('CPF inválido');
export function validCPF(cpf: string) {
  cpf = cpf.replace(/[.-]/g, '');
  let sum = 0, rest = 0;

  for (let i = 1; i <= 9; i++) sum = sum + parseInt(cpf.substring(i-1, i)) * (11 - i);
  rest = (sum * 10) % 11;

  if ((rest == 10) || (rest == 11))  rest = 0;
  if (rest != parseInt(cpf.substring(9, 10)) ) return errInvalidCPF;

  sum = 0;
  for (let i = 1; i <= 10; i++) sum = sum + parseInt(cpf.substring(i-1, i)) * (12 - i);
  rest = (sum * 10) % 11;

  if ((rest == 10) || (rest == 11))  rest = 0;
  if (rest != parseInt(cpf.substring(10, 11) ) ) return errInvalidCPF;
}
