/**
 * Exclude keys from object
 * @param obj
 * @param keys
 * @returns object without excluded keys
 */
const exclude = <Type, Key extends keyof Type>(obj: Type, keys: Key[]): Omit<Type, Key> => {
  const clone = { ...obj };
  for (const key of keys) {
    delete clone[key];
  }
  return clone;
};

export default exclude;
