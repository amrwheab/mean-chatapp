import { TestBed } from '@angular/core/testing';

import { MsgGuard } from './msg.guard';

describe('MsgGuard', () => {
  let guard: MsgGuard;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    guard = TestBed.inject(MsgGuard);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });
});
