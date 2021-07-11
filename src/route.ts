import { existsSync, readdirSync, statSync } from 'fs'
import { join } from 'path'

export interface RouteOptions {
  // absolute root path
  root: string
  ignorePattern?: RegExp
}

export interface Route {
  isDir: boolean
  path: string
  relPath: string
  name: string
  children: Route[]
}

const FILE_NAME_RE = /^index\.(ts|js)$/

const genPath = ({ root, ignorePattern }: RouteOptions, relPath = '.'): Route[] => {
  const currentDir = readdirSync(root, {
    withFileTypes: true
  })

  return currentDir.reduce<Route[]>((routes, content) => {
    const isDir = content.isDirectory()
    const name = content.name
    const absPath = join(root, name)
    const innerRelPath = join(relPath, name)

    if (ignorePattern && name.match(ignorePattern)) return routes
    if (!isDir && !name.match(FILE_NAME_RE)) return routes

    return [
      ...routes,
      {
        name,
        isDir,
        path: absPath,
        relPath: innerRelPath,
        children: isDir ? genPath({ root: absPath, ignorePattern }, innerRelPath) : ([] as Route[])
      }
    ]
  }, [])
}

export const getRoute = (options: RouteOptions): Route[] => {
  const { root, ignorePattern } = options

  const rootPath = root

  if (!existsSync(rootPath)) return []
  if (!statSync(rootPath).isDirectory()) return []

  return genPath({ root, ignorePattern })
}
