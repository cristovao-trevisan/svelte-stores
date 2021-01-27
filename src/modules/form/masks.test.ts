import { maskCPF } from './masks';

test('maskCPF', () => {
  expect(maskCPF('52309818062')).toBe('523.098.180-62');
  expect(maskCPF('523098180621234')).toBe('523.098.180-62');
  expect(maskCPF('523.098.18062')).toBe('523.098.180-62');
  expect(maskCPF('523.098')).toBe('523.098');
  expect(maskCPF('523.0$8')).toBe('523.08');
});
