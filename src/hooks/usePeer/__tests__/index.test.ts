import { renderHook, act } from '@testing-library/react-hooks';
import { useJoinPeerSession, useHostPeerSession } from '../index';

describe('usePeer', () => {
  it('should be defined', () => {
    expect(useHostPeerSession).toBeDefined();
    expect(useJoinPeerSession).toBeDefined();
  });

  it('should return the correct values', () => {
    const { result } = renderHook(() => useHostPeerSession({}));
    expect(result.current[0]).toBeUndefined();
    expect(result.current[1]).toEqual({});
    expect(result.current[2]).toBeInstanceOf(Function);
    expect(result.current[3]).toBe(false);
    expect(result.current[4]).toBe('');
  });

  it('should update the state', () => {
    const { result } = renderHook(() => useHostPeerSession({}));
    act(() => {
      result.current[2]({ foo: 'bar' });
    });
    expect(result.current[1]).toEqual({ foo: 'bar' });
  });
});
