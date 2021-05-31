export function extendArrayMetadata<T extends any[]>(
  key: string,
  metadata: T,
  target,
) {
  const previousValue = Reflect.getMetadata(key, target) || [];
  const value = [...previousValue, ...metadata];

  Reflect.defineMetadata(key, value, target);
}

export function extendMetadata<T>(key: string, metadata: T, target) {
  const previousValue = Reflect.getMetadata(key, target) || [];
  const value = [...previousValue, metadata];

  Reflect.defineMetadata(key, value, target);
}

export const getMetadata = <T>(key, ...targets): T => {
  for (let i = 0; i < targets.length; i++) {
    const metadata = Reflect.getMetadata(key, targets[i]);

    if (metadata) {
      return metadata;
    }
  }

  return (undefined as unknown) as T;
};
