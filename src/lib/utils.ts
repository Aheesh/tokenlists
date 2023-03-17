import { getAddress } from 'ethers'
import path from 'path'
import fs from 'fs'
import { OverwritesForList, TokensForList } from '../types'
import { TokenList } from '@uniswap/token-lists'

export async function sleep(time: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, time)
  })
}

export function isSameAddress(address1: string, address2: string): boolean {
  if (!address1 || !address2) return false
  return getAddress(address1) === getAddress(address2)
}

export function safeStringify(obj: any): string {
  return JSON.stringify(
    obj,
    (key, value) => (typeof value === 'bigint' ? value.toString() : value),
    4
  )
}

export function getTokenlistsToBuild(): string[] {
  const tokenlistsPath = path.resolve(__dirname, '../tokenlists')
  const items = fs.readdirSync(tokenlistsPath, { withFileTypes: true })
  return items.filter((item) => item.isDirectory()).map((item) => item.name)
}

export async function getTokenlistSrc(tokenlistName: string): Promise<{
  metadata: Pick<TokenList, 'name' | 'logoURI' | 'keywords' | 'version'>
  tokens: TokensForList
  overwrites: OverwritesForList
  existingTokenList: TokenList | undefined
}> {
  const tokenlistPath = [__dirname, '../tokenlists', tokenlistName]
  const metadataPath = path.resolve(...tokenlistPath, 'metadata.json')
  const tokensPath = path.resolve(...tokenlistPath, 'tokens')
  const overwritesPath = path.resolve(...tokenlistPath, 'overwrites')
  const existingListPath = path.resolve(
    __dirname,
    '../../generated',
    tokenlistName + '.tokenlist.json'
  )

  let metadata, tokens, overwrites, existingTokenList

  try {
    metadata = require(metadataPath)
  } catch (error) {
    throw new Error(`Metadata file not found for tokenlist: ${tokenlistName}`)
  }
  try {
    tokens = await import(tokensPath)
  } catch (error) {
    throw new Error(`Tokens file not found for tokenlist: ${tokenlistName}`)
  }
  try {
    overwrites = await import(overwritesPath)
  } catch (error) {
    throw new Error(`Overwrites file not found for tokenlist: ${tokenlistName}`)
  }
  try {
    existingTokenList = require(existingListPath)
  } catch (error) {
    existingTokenList = undefined
  }

  return {
    metadata,
    tokens: tokens.tokens,
    overwrites: overwrites.overwrites,
    existingTokenList,
  }
}