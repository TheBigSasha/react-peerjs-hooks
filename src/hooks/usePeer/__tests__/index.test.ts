import { useHostMultiPeerSession, useJoinMultiPeerSession } from '../index';

describe('usePeer', () => {
  it('should be defined', () => {
    expect(useHostMultiPeerSession).toBeDefined();
    expect(useJoinMultiPeerSession).toBeDefined();
  });
});
