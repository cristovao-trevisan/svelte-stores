import { createForm, FieldsDeclaration, Form, Errors } from './form';

interface TestInput {
  number: number
  string: string
  option?: boolean
}

const last = (mock: jest.Mock) => mock.mock.calls[mock.mock.calls.length - 1][0];
function formMocks<T> (form: Form<T, unknown>) {
  const values = jest.fn<unknown, T[]>();
  form.values.subscribe(values);
  const errors = jest.fn<unknown, Errors<T>[]>();
  form.errors.subscribe(errors);
  const dirty = jest.fn<unknown, boolean[]>();
  form.dirty.subscribe(dirty);
  const validating = jest.fn<unknown, boolean[]>();
  form.validating.subscribe(validating);
  const submitting = jest.fn<unknown, boolean[]>();
  form.submitting.subscribe(submitting);
  const submitError = jest.fn<unknown, Error[]>();
  form.submitError.subscribe(submitError);

  return { values, errors, dirty, validating, submitting, submitError };
}

describe('createForm', () => {
  test('complete path', async () => {
    const error = new Error('test');
    const validate = (x: unknown) => !x && error;
    const submit = jest.fn();
    const fields: FieldsDeclaration<TestInput> = {
      number: { initialValue: 0, validators: [validate] },
      string: { initialValue: '', validators: [validate] },
      option: {},
    };
    const form = createForm<TestInput>(fields, submit);
    const mocks = formMocks(form);
    
    // initial state
    expect(last(mocks.values)).toStrictEqual({ number: 0, string: '', option: null });
    // update a value
    form.values.update(f => ({ ...f, number: 1 }));
    expect(last(mocks.values)).toStrictEqual({ number: 1, string: '', option: null });
    // test validation
    expect(last(mocks.errors)).toMatchObject({}); // not yet validated
    await form.submit();
    expect(last(mocks.errors)).toMatchObject({ string: error });
    // update second and revalidate
    form.values.update(f => ({ ...f, string: 'test' }));
    expect(last(mocks.errors)).toMatchObject({});
    // submit should run action
    await form.submit();
    expect(mocks.submitting.mock.calls.length).toBe(2);
    expect(mocks.submitting.mock.calls[0][0]).toBe(false);
    expect(last(mocks.submitting)).toBe(true);
    expect(submit.mock.calls.length).toBe(1);
    expect(last(submit)).toStrictEqual({ number: 1, string: 'test', option: null });
    // set option and re-submit
    form.values.update(f => ({ ...f, option: true }));
    await form.submit();
    expect(last(submit)).toStrictEqual({ number: 1, string: 'test', option: true });
  });

  test('submit error', async () => {
    const error = new Error('test');
    const submit = jest.fn(() => { throw error; });
    const fields: FieldsDeclaration<TestInput> = {
      number: { initialValue: 0 },
      string: { initialValue: '' },
      option: {},
    };
    const form = createForm<TestInput>(fields, submit);
    const mocks = formMocks(form);

    await form.submit();
    expect(last(mocks.submitError)).toBe(error);
  });

  test('async validation', async () => {
    const error = new Error('test');
    const validate = async (x: unknown) => !x && error;
    const submit = jest.fn();
    const fields: FieldsDeclaration<TestInput> = {
      number: { initialValue: 0, validators: [validate] },
      string: { initialValue: '' }, option: {},
    };
    const form = createForm<TestInput>(fields, submit);
    const mocks = formMocks(form);

    await form.submit();
    expect(submit.mock.calls.length).toBe(0);
    expect(last(mocks.errors)).toMatchObject({ number: error });
    form.values.update(f => ({ ...f, number: 1 }));
    await form.submit();
    expect(submit.mock.calls.length).toBe(1);
    expect(last(mocks.errors)).toMatchObject({ number: undefined });
  });

  test('field not defined', async () => {
    const error = new Error('test');
    const validate = async (x: unknown) => !x && error;
    const submit = jest.fn();
    const fields: FieldsDeclaration<TestInput> = {
      number: { initialValue: 0, validators: [validate] },
    };
    const form = createForm<TestInput>(fields, submit);
    const mocks = formMocks(form);

    await form.submit();
    expect(submit.mock.calls.length).toBe(0);
    expect(last(mocks.errors)).toMatchObject({ number: error });
    form.values.update(f => ({ ...f, number: 1, string: 'test' }));
    await form.submit();
    expect(last(mocks.errors)).toMatchObject({ number: undefined });
    expect(last(mocks.values)).toStrictEqual({ number:1, string: 'test' });
  });

  test('masking', async () => {
    const replace$ = jest.fn((x: string) => x.replace(/\$/, 's'));
    const increment = jest.fn((x: number) => x + 1);
    const fields: FieldsDeclaration<TestInput> = {
      string: { initialValue: '', mask: replace$ },
      number: { initialValue: 0, mask: increment },
    };
    const form = createForm<TestInput>(fields, async () => { return; });
    const mocks = formMocks(form);
    // static mask
    expect(replace$.mock.calls.length).toBe(0);
    form.values.update(f => ({ ...f, string: 'te$t' }));
    expect(replace$.mock.calls.length).toBe(1);
    expect(last(mocks.values).string).toBe('test');
    // non-static mask
    expect(increment.mock.calls.length).toBe(0);
    form.values.update(f => ({ ...f, number: 665 }));
    expect(increment.mock.calls.length).toBe(1);
    expect(last(mocks.values).number).toBe(666);
  });
});
