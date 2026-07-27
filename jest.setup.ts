import '@testing-library/jest-dom'
import { ReadableStream, TransformStream, WritableStream } from 'node:stream/web'
import { TextDecoder, TextEncoder } from 'node:util'

Object.assign(globalThis, { ReadableStream, TransformStream, WritableStream, TextDecoder, TextEncoder })
