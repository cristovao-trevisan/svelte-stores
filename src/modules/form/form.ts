import { derived, get, writable, Writable, Readable } from 'svelte/store';
import { wait } from '../../util';

type Action<T, R> = (params: T) => Promise<R>
type Validator<T> = (v: T) => Promise<Error|void> | Error | void
type Mask<T> = (v: T) => T
// eslint-disable-next-line no-unused-vars
export type Errors<T> = { [k in keyof T]?: Error }
export type FieldsDeclaration<T> = { [k in keyof T]?: FieldDeclaration<T[k]> }

export interface Form<T, R> {
  values: Writable<T>
  errors: Writable<Errors<T>>
  submitError: Readable<Error>
  valid: Readable<boolean>
  validating: Readable<boolean>
  submitting: Readable<boolean>
  dirty: Readable<boolean>
  submit(): Promise<R>
}

interface FieldDeclaration<T> {
  initialValue?: T
  validators?: Validator<T>[]
  mask?: Mask<T>
  [k: string]: unknown
}

interface FormOptions {
  actionThrows?: boolean
  /** Throttle time in milliseconds */
  throttle?: number
  /** If trues, validates before submitting. Takes precedence over `validateOnChange`  */
  validateNotDirty?: boolean
  /** Validates on change, defaults to true */
  validateOnChange?: boolean 
}


const defaultFormOptions: FormOptions = {
  actionThrows: false,
  validateNotDirty: false,
  validateOnChange: true,
};

export const errValidationFailed = new Error('validation-failed');

export function createForm<T, R = void>(fields: FieldsDeclaration<T>, action: Action<T, R>, opts = defaultFormOptions) : Form<T, R> {
  opts = { ...defaultFormOptions, ...opts };
  const initialValues = {} as T;
  for (const field in fields) {
    if (fields[field].initialValue === undefined) initialValues[field] = null;
    else initialValues[field] = fields[field].initialValue;
  }
  const values = writable<T>(initialValues);
  const errors = writable<Errors<T>>({});
  const submitError = writable<Error>(null);
  const valid = derived(errors, es => !Object.values(es).some(e => !!e));
  const validating = writable(false);
  const submitting = writable(false);
  const dirty = writable(false);
  let validationPromise: Promise<boolean>;

  async function validateField(value: T[keyof T], field: FieldDeclaration<T[keyof T]>) {
    const { validators } = field;
    if (!validators) return null;

    for (const validator of validators) {
      try {
        const err = await validator(value);
        if (err) return err;
      } catch(err) {
        return err as Error;
      }
    }
  }

  async function validate() {
    const v = get(values) as T;
    let hasError = false;

    validating.set(true);
    if (opts.throttle) await wait(opts.throttle);
    for (const field in fields) {
      const err = await validateField(v[field], fields[field]);
      if (err) hasError = true;
      errors.update(s => ({ ...s, [field]: err }));
    }
    validating.set(false);

    return hasError;
  }
  function runValidations() {
    if (validationPromise) return validationPromise;
    validationPromise = validate().finally(() => {
      validationPromise = null;
    });
    return validationPromise;
  }

  if (opts.validateOnChange) {
    values.subscribe(() => {
      if (!opts.validateNotDirty && !get(dirty)) return;
      runValidations();
    });
  }

  const fieldsWithMask: Array<keyof T> = [];
  for (const field in fields) {
    if (fields[field].mask) fieldsWithMask.push(field);
  }
  if (fieldsWithMask.length > 0) {
    const valuesCache: T = { ...initialValues };
    values.subscribe(($values) => {
      fieldsWithMask.forEach(field => {
        const mask = fields[field].mask;
        if (mask && valuesCache[field] !== $values[field]) {
          const masked = mask($values[field]);
          values.update(v => ({ ...v, [field]: masked }));
          valuesCache[field] = masked;
        }
      });
    });
  }

  async function submit() {
    try {
      dirty.set(true);
      if (await runValidations()) throw errValidationFailed;
      
      submitting.set(true);
      const v = get(values) as T;
      const res = await action(v).finally(() => submitting.set(false));
      submitError.set(null);
      return res;
    } catch (e) {
      if (e !== errValidationFailed) submitError.set(e);
      if (opts.actionThrows) throw e;
      return null;
    }
  }

  return {
    values, errors,
    valid, dirty,
    validating, submitting,
    submit, submitError,
  };
}
