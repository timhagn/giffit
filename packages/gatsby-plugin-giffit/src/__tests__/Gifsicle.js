import Gifsicle from '../Gifsicle'
const path = require('path')
const fs = require('fs')

describe('Gifsicle', () => {
  it('should produce a smaller file when used with -O3', done => {
    const gifsicle = new Gifsicle(['-w', '-O3']),
      chunks = []

    fs.createReadStream(path.resolve(__dirname, 'images/nom.gif'))
      .pipe(gifsicle)
      .on('error', done)
      .on('data', function(chunk) {
        chunks.push(chunk)
      })
      .on('end', () => {
        const output = Buffer.concat(chunks)
        expect(output.length).toBeGreaterThan(0)
        expect(output.length).toBeLessThan(2093064)
        done()
      })
  })

  it('should not emit data events while stream is paused', done => {
    const gifsicle = new Gifsicle(['-w', '-O3']),
      chunks = []

    const fail = () => {
      done(new Error('Gifsicle emitted data events while stream was paused.'))
    }

    gifsicle.pause()
    gifsicle.on('data', fail).on('error', done)

    fs.createReadStream(path.resolve(__dirname, 'images/nom.gif')).pipe(
      gifsicle
    )

    setTimeout(() => {
      gifsicle.removeListener('data', fail)
      gifsicle
        .on('data', function(chunk) {
          chunks.push(chunk)
        })
        .on('end', () => {
          const output = Buffer.concat(chunks)
          expect(output.length).toBeGreaterThan(0)
          expect(output.length).toBeLessThan(2093064)
          done()
        })

      gifsicle.resume()
    }, 1000)
  })

  it('should emit an error when processing an invalid image', done => {
    const gifsicle = new Gifsicle()

    gifsicle
      .on('error', () => {
        done()
      })
      .on('data', () => {
        done(
          new Error(
            'Gifsicle emitted a `data` event when an error was expected.'
          )
        )
      })
      .on('end', () => {
        done(
          new Error(
            'Gifsicle emitted a `end` event when an error was expected.'
          )
        )
      })

    gifsicle.end(Buffer.from('finished', 'utf-8'))
  })

  it('should emit an error when processing with an invalid option', done => {
    const gifsicle = new Gifsicle(['--unrecognized-option'])
    let seenError = false

    gifsicle
      .on('error', function(err) {
        if (seenError) {
          done(new Error('More than one error event was emitted.'))
        } else {
          seenError = true
          setTimeout(done, 100)
        }
      })
      .on('data', () => {
        done(
          new Error(
            'Gifsicle emitted a `data` event when an error was expected.'
          )
        )
      })
      .on('end', () => {
        done(
          new Error(
            'Gifsicle emitted a `end` event when an error was expected.'
          )
        )
      })

    gifsicle.end(Buffer.from('finished', 'utf8'))
  })

  describe('#destroy', () => {
    describe('when called before the child process is launched', () => {
      it('should kill the underlying child process', () => {
        const gifsicle = new Gifsicle(['-w', '-O3'])

        gifsicle.write('GIF89a')
        gifsicle.destroy()
        expect(gifsicle.process).toBeFalsy()
        expect(gifsicle.bufferedChunks).toBeFalsy()
      })
    })

    describe('when called after the child process is launched', () => {
      it('should kill the underlying child process', done => {
        const gifsicle = new Gifsicle(['-w', '-O3'])

        gifsicle.write('GIF89a')
        setTimeout(function waitForChildProcess() {
          if (gifsicle.process) {
            gifsicle.destroy()
            expect(gifsicle.process).toBeFalsy()
            expect(gifsicle.bufferedChunks).toBeFalsy()
            done()
          } else {
            setTimeout(waitForChildProcess, 20)
          }
        }, 20)
      })
    })
  })
})
