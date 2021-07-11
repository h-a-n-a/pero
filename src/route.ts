import { existsSync, readdirSync, statSync } from 'fs'
import { join } from 'path'

export enum IdentifierType {
  'COLON' = 'COLON',
  'VARIADIC' = 'VARIADIC',
}

const IDENTIFIER_MAP: Record<IdentifierType, string> = {
  [IdentifierType.COLON]: ':',
  [IdentifierType.VARIADIC]: '...',
}

export interface PathOptions {
  // absolute root path
  root: string
}

export interface Route {
  identifierType: IdentifierType | null
  isDir: boolean
  path: string
  relPath: string
  name: string
  rawName: string
  children: Route[]
}

type NameParsed = Pick<Route, 'identifierType' | 'rawName' | 'name'>

const parseDirectoryName = (rawName: string): NameParsed => {
  const startsWith = rawName.startsWith.bind(rawName) as String['startsWith']

  for (const [identifierType, identifier] of Object.entries(IDENTIFIER_MAP) as [
    IdentifierType,
    string
  ][]) {
    if (startsWith(identifier)) {
      return {
        name: rawName.replace(identifier, ''),
        rawName,
        identifierType,
      }
    }
  }

  return {
    rawName,
    name: rawName,
    identifierType: null,
  }
}

const genPath = (root: string, relPath = '.'): Route[] => {
  const currentDir = readdirSync(root, {
    withFileTypes: true,
  })

  return currentDir.reduce<Route[]>((routes, content) => {
    const isDir = content.isDirectory()
    const rawName = content.name
    const absPath = join(root, rawName)
    const innerRelPath = join(relPath, rawName)

    const nameParsed = isDir
      ? parseDirectoryName(rawName)
      : {
          rawName,
          name: rawName,
          identifierType: null,
        }

    return [
      ...routes,
      {
        ...nameParsed,
        isDir,
        path: absPath,
        relPath: innerRelPath,
        children: isDir ? genPath(absPath, innerRelPath) : ([] as Route[]),
      },
    ]
  }, [])
}

export const getRoute = (options: PathOptions): Route[] => {
  const { root } = options

  const rootPath = root

  if (!existsSync(rootPath)) return []
  if (!statSync(rootPath).isDirectory()) return []

  return genPath(root)
}
