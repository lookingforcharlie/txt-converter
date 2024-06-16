#!/usr/bin/env ts-node

import chalk from 'chalk'
import { Command } from 'commander'
import { createHash } from 'crypto'
import fs from 'fs'
import path from 'path'
const ProgressBar = require('progress')

const program = new Command()

const bar = new ProgressBar('Generating [:bar]', { total: 14 })

// Create file name
function generateHashedFilename(input: string): string {
  return (
    createHash('sha256')
      .update(input + 'magicball')
      .digest('hex') + '.txt'
  )
}

function readAndTransformFile(sourcePath: string): string {
  try {
    const content = fs.readFileSync(sourcePath, { encoding: 'utf-8' })
    return content.toUpperCase()
  } catch (err) {
    console.error('Error reading the file:', err)
    process.exit(1)
  }
}

function saveToFile(
  transformedContent: string,
  targetFolder: string,
  sourceFileName: string
): void {
  // Check if targetFolder exists; if not, create it
  if (!fs.existsSync(targetFolder)) {
    console.log(
      chalk.green(`Target folder ${targetFolder} not found. Creating...`)
    )
    fs.mkdirSync(targetFolder, { recursive: true }) // Ensures creation of all directory levels
    console.log(chalk.green(`Folder created at ${targetFolder}`))
  }
  const hashedFilename = generateHashedFilename(sourceFileName)
  const fullPath = path.join(targetFolder, hashedFilename)

  try {
    const timer = setInterval(function () {
      bar.tick()
      if (bar.complete) {
        fs.writeFileSync(fullPath, transformedContent)
        console.log(`File saved successfully to ${fullPath}`)
        clearInterval(timer)
      }
    }, 100)
  } catch (err) {
    console.error('Error writing the file:', err)
    process.exit(1)
  }
}

program
  .name('ytc')
  .description('Download youtube video and converter it to mp4')
  .version('0.8.0')

program
  .command('gen')
  .description('Generate a xml file')
  .option(
    '-s, --sourceFile <string>',
    'des: input the path with sourcefile name'
  )
  .requiredOption('-t, --targetFolder <string>', 'des: input the path')
  .action((options) => {
    const sourcePath = path.resolve(options.sourceFile) // Convert to absolute path
    console.log(chalk.magenta(`sourcePath is: ${sourcePath}`))

    const targetPath = path.resolve(options.targetFolder) // Convert to absolute path
    console.log(chalk.magenta(`TargetPath is: ${targetPath}`))

    const transformedContent = readAndTransformFile(sourcePath)
    const sourceFileName = path.basename(sourcePath)

    saveToFile(transformedContent, targetPath, sourceFileName)
  })

console.log('process argv: ', process.argv)

program.parse()
