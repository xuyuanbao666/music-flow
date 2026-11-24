import test from 'node:test'
import assert from 'node:assert/strict'
import jwt from 'jsonwebtoken'
import { authenticatedUser, jwtSecret } from '../src/security.js'
const secret = 'test-only-secret-for-authentication-regression-2026'
process.env.JWT_SECRET = secret
test('requires a strong configured signing secret', () => {
  process.env.JWT_SECRET = 'short'
  try { assert.throws(jwtSecret) } finally { process.env.JWT_SECRET = secret }
})
test('valid JWT binds user', () => {
  assert.equal(authenticatedUser('Bearer ' + jwt.sign({ userId: 'alice' }, secret)), 'alice')
})
test('rejects invalid, expired, wrong-key and missing-subject JWTs', () => {
  assert.equal(authenticatedUser(undefined), null)
  assert.equal(authenticatedUser('Bearer local'), null)
  assert.equal(authenticatedUser('Bearer ' + jwt.sign({ userId: 'alice' }, 'incorrect-key')), null)
  assert.equal(authenticatedUser('Bearer ' + jwt.sign({ userId: 'alice' }, secret, { expiresIn: -1 })), null)
  assert.equal(authenticatedUser('Bearer ' + jwt.sign({}, secret)), null)
})
