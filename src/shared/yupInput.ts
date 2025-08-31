import type { AnySchema, InferType } from 'yup';

export const yupInput =
  <S extends AnySchema>(schema: S) =>
  async (value: unknown) => {
    // 必要に応じて { abortEarly: false, stripUnknown: true } を使う
    const v = await schema.validate(value, { abortEarly: false });
    return v as InferType<S>;
  };
