export const isObject = (item: unknown): item is object => {
  return item != null && typeof item === 'object'
}
