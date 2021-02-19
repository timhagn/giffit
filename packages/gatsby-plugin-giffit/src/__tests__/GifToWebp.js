import { getFileObject } from './mocks/mock'

const path = require(`path`)
const fs = require(`fs-extra`)
jest.mock(`../scheduler`)

jest.mock(`async/queue`, () => () => {
  return {
    push: jest.fn(),
  }
})

fs.ensureDirSync = jest.fn()

const {
  base64,
  fluid,
  fixed,
  queueImageResizing,
  getImageSize,
} = require(`../index.js`)
import GifToWebp from '../GifToWebp'
import * as temp from "temp"

describe(`GifToWebp`, () => {
  const args = {
    duotone: false,
    grayscale: false,
    rotate: false,
  }
  const METADATA_ALL = `-metadata all`
  const METADATA_NONE = `-metadata none`
  const absolutePath = path.join(__dirname, `images/test.gif`)
  const testFile = getFileObject(absolutePath)

  // constructor()
  it(`should create new instance from file object`, () => {
    const processGif = new GifToWebp(testFile)
    expect(processGif.file).toEqual(absolutePath)
  })

  it(`should create new instance from file string`, () => {
    const processGif = new GifToWebp(absolutePath)
    expect(processGif.file).toEqual(absolutePath)
  })

  it(`should create new instance from file and bar description string`, () => {
    const processGif = new GifToWebp(absolutePath, `[:bar]`)
    expect(processGif.file).toEqual(absolutePath)
    expect(processGif.bar.fmt).toEqual(`[:bar]`)
  })

  // withMetadata()
  it(`should add option to keep metadata`, () => {
    const processGif = new GifToWebp(absolutePath)
    processGif.withMetadata()
    expect(processGif.gif2webpArgs).toContain(METADATA_ALL)
  })

  it(`should add option to strip metadata`, () => {
    const processGif = new GifToWebp(absolutePath)
    processGif.withMetadata(false)
    expect(processGif.gif2webpArgs).toContain(METADATA_NONE)
  })

  it(`should add option to keep metadata if strip option present`, () => {
    const processGif = new GifToWebp(absolutePath)
    processGif.withMetadata(false)
    processGif.withMetadata()
    expect(processGif.gif2webpArgs).toContain(METADATA_ALL)
  })

  it(`should add option to strip metadata if keep option present`, () => {
    const processGif = new GifToWebp(absolutePath)
    processGif.withMetadata()
    processGif.withMetadata(false)
    expect(processGif.gif2webpArgs).toContain(METADATA_NONE)
  })

  it(`should add option to strip metadata only once`, () => {
    const processGif = new GifToWebp(absolutePath)
    processGif.withMetadata(false)
    processGif.withMetadata(false)
    expect(processGif.gif2webpArgs).toContain(METADATA_NONE)
  })

  // resize()
  it(`resize should fail without width & height`, () => {
    const processGif = new GifToWebp(absolutePath)
    expect(processGif.resize()).toBeFalsy()
  })

  it(`should add option to resize with width & height`, () => {
    const expected = [[`--resize`, `10x10`]]
    const processGif = new GifToWebp(absolutePath)
    processGif.resize(10, 10)
    expect(processGif.gifsicleArgs).toEqual(expect.arrayContaining(expected))
  })

  it(`should add option to resize with only width`, () => {
    const expected = [[`--resize-width`, 10]]
    const processGif = new GifToWebp(absolutePath)
    processGif.resize(10)
    expect(processGif.gifsicleArgs).toEqual(expect.arrayContaining(expected))
  })

  it(`should change resize options`, () => {
    const expected = [[`--resize-width`, 10]]
    const processGif = new GifToWebp(absolutePath)
    processGif.resize(10, 10)
    processGif.resize(10)
    expect(processGif.gifsicleArgs).toEqual(expect.arrayContaining(expected))
  })

  it(`should add option to resize with only height`, () => {
    const expected = [[`--resize-height`, 10]]
    const processGif = new GifToWebp(absolutePath)
    processGif.resize(null, 10)
    expect(processGif.gifsicleArgs).toEqual(expect.arrayContaining(expected))
  })

  // toBase64()
  it(`toBase64() should fail without file`, async () => {
    const processGif = new GifToWebp(``)
    expect.assertions(1)
    await expect(processGif.toBase64()).rejects.toThrow(
      `"url" option is required.`
    )
  })

  // toGif()
  it(`toGif() should fail without file`, async () => {
    const processGif = new GifToWebp(``)
    expect.assertions(1)
    await expect(processGif.toGif()).rejects.toThrow(
      `ENOENT: no such file or directory, stat`
    )
  })

  it(`toGif() should process file`, async () => {
    const processGif = new GifToWebp(testFile)
    processGif.resize(20)
    const tempFileName = temp.path({ suffix: '.gif' })
    await processGif.toGif(tempFileName)
    const tempExists = fs.existsSync(tempFileName)
    expect(tempExists).toBeTruthy()
    // if (tempExists) fs.unlinkSync(tempFileName)
  })

  // toWebp()
  it(`toWebp() should fail without file`, async () => {
    const processGif = new GifToWebp(``)
    expect.assertions(1)
    await expect(processGif.toWebp()).rejects.toThrow(
      `ENOENT: no such file or directory, stat`
    )
  })

  it(`toWebp() should process file`, async () => {
    const processGif = new GifToWebp(testFile)
    processGif.resize(20)
    const tempOutputPath = temp.path({ suffix: '.webp' })
    await processGif.toWebp(tempOutputPath)
    const tempExists = fs.existsSync(tempOutputPath)
    expect(tempExists).toBeTruthy()
    // if (tempExists) fs.unlinkSync(tempOutputPath)
  })

  // createProgressWatcher()
  it(`createProgressWatcher() should fail without file`, () => {
    const processGif = new GifToWebp(``)
    expect(() => processGif.createProgressWatcher()).toThrow(
      `The \"path\" argument must be of type string or an instance of Buffer or URL. Received undefined`
    )
  })

  it(`createProgressWatcher() shouldn't fail with files`, () => {
    const processGif = new GifToWebp(``)
    processGif.createProgressWatcher(absolutePath, absolutePath)
    const originalFileStatus = fs.statSync(absolutePath)
    const total = Math.floor(originalFileStatus.size / 1024)
    expect(processGif.bar.total).toEqual(total)
  })
})
