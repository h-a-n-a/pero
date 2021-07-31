type KebabToCamelCase<T> =
  T extends string ?
    T extends `${infer First}-${infer Others}` ?
      `${First}${KebabToCamelCase<Capitalize<Others>>}`
    : T
  : any

export const kebabToCamelCase = <T extends string>(kebab: T) => {
  return kebab.replace(/-(.)/g, (_, $1) => $1.toUpperCase()) as KebabToCamelCase<T>
}

export const kebabKeyToCamelCase = (o: Record<string, any>) => {
  const output: Record<string, any> = {}
  const entries = Object.entries(o)

  for (const [key, value] of entries) {
    output[kebabToCamelCase(key)] = value
  }

  return output
}
