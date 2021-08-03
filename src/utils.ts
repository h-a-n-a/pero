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

export const parseFlagExp = (expression: string) => {
  const exp = expression.trim()
  let result: {
    flag: string | null
    flagAlias: string | null
    required: boolean
    argumentKey: string | null
  } = {
    flag: null,
    flagAlias: null,
    required: false,
    argumentKey: null
  }

  let cursor = 0

  while (cursor < exp.length) {
    const breakIndex = getBreakIndex(cursor)

    if (exp.startsWith('-', cursor)) {
      const next = exp[cursor + 1]
      const advancement = next === '-' ? 2 : 1
      const flagStart = cursor + advancement

      if (next === '-') {
        result.flagAlias = exp.slice(flagStart, breakIndex)
      } else {
        result.flag = exp.slice(flagStart, breakIndex)
      }

      advance(breakIndex - flagStart + advancement)
      continue
    }

    if (exp.startsWith('[', cursor) || exp.startsWith('<', cursor)) {
      const match = parseArgument(exp.slice(cursor))
      if (match?.argumentKey) {
        advance(match.argumentKey.length + 2 /* open/close symbol */)
        result = {
          ...result,
          ...match
        }
      }
      continue
    }

    if (breakIndex > cursor) {
      advance(breakIndex - cursor)
      continue
    }

    advance(1)
  }

  return result

  function advance (steps: number) {
    cursor += steps
  }

  function getBreakIndex (start: number) {
    let index
    if ((index = exp.indexOf(',', start)) > 0) {
      return index
    }

    if ((index = exp.indexOf(' ', start)) > 0) {
      return index
    }

    return exp.length
  }
}
