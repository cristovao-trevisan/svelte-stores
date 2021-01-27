import { validCPF, errInvalidCPF } from './validators';

test('validCPF', () => {
  const validCPFList = ['523.098.180-62', '685.299.010-96', '39588680026'];
  const invalidCPFList = ['523.098.180-61', '685.299.010-00', '39588680024', '', '1234', '12$5'];

  validCPFList.slice(0, 1).forEach(cpf => expect(validCPF(cpf)).toBe(undefined));
  invalidCPFList.forEach(cpf => expect(validCPF(cpf)).toBe(errInvalidCPF));
});
