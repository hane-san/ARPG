import test from 'node:test';
import assert from 'node:assert/strict';

test('main protection probe: intentional failure, never merge this branch',()=>{
  assert.fail('Intentional required-check probe. Close this PR after verifying the merge is blocked.');
});
