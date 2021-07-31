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

enum ExpressionSymbol {
  ANGEL_BRACKET_START = '<',
  ANGEL_BRACKET_CLOSE = '>',
  SQUARE_BRACKET_START = '[',
  SQUARE_BRACKET_END = ']'
}

const SQUARE_BRACKET_RE = /\[(.*)\]/
const ANGEL_BRACKET_RE = /<(.*)>/

export const parseArgument = (expression: string) => {
  let match: RegExpMatchArray | null
  if (match = expression.match(SQUARE_BRACKET_RE)) {
    return {
      required: false,
      argumentKey: match[1]
    }
  }

  if (match = expression.match(ANGEL_BRACKET_RE)) {
    return {
      required: true,
      argumentKey: match[1]
    }
  }

  return null
}
