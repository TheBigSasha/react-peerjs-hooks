import { SetStateAction, useEffect, useState } from 'react';
import { generateID } from './helper/generateID';

// True if the object has all the properties of the type T
function checkType<T extends object>(object: any): Boolean {
  return Object.keys(object).every((key) => {
    return key in (object as T);
  });
}

// Hook usage:

export interface PeerDataPair<T> {
  id: string;
  data: T;
}

type PeerDataPairWithConn<T> = PeerDataPair<T> & { conn: any };

type Internal<T> = T & { __peerHookInternalID: string };

// const [peerStates, myState, setMyState, myID, numConnections, getNewID, error] = useHostMultiPeerSession<HostStateType, PeerStateType>(initialState)
export function useHostMultiPeerSession<HostState, PeerState>(
  initialState: HostState,
): [
  PeerDataPair<PeerState>[],
  HostState,
  (state: HostState) => void,
  string,
  number,
  () => void,
  string?,
] {
  const [peerStates, setPeerStates] = useState<PeerDataPairWithConn<PeerState>[]>(
    [],
  );
  const [myState, setMyState] = useState<Internal<HostState>>({
    ...initialState,
    __peerHookInternalID: '',
  });
  const [error, setError] = useState<string | undefined>();
  const [peer, setPeer] = useState<any>();

  const myID = myState.__peerHookInternalID;
  const setMyID = (id: string) => {
    setMyState({ ...myState, __peerHookInternalID: id });
  };

  const setStateExternal = (state: HostState) => {
    setMyState({ ...state, __peerHookInternalID: myID });
  };

  const stateExternal = { ...myState, __peerHookInternalID: undefined };

  const getNewID = () => {
    const newID = generateID();
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('TBS_REACT_HOOK_PEERID', newID);
    }
    setMyID(newID);
  };

  useEffect(() => {
    if (myID === '') {
      getNewID();
    }
  }, []);

  const conns = peer?.connections.length || 0;
  useEffect(() => {
    if (myID === '') {
      return;
    }
    const IDToUse = myID;
    import('peerjs').then(({ default: Peer }) => {
      const peer = new Peer(IDToUse);
      setPeer(peer);
      peer.on('error', (err) => {
        setError(err.message);
      });
      peer.on('open', (id) => {
        setMyID(id);
        if (typeof window !== 'undefined') {
          window.localStorage.setItem('TBS_REACT_HOOK_PEERID', id);
        }
      });
    });
  }, [myID]);

  const peerIsAvailable: Boolean = peer !== undefined;

  useEffect(() => {
    if (peerIsAvailable) {
      peer.on('connection', (conn: any) => {
        conn.on('data', (data: unknown) => {
          if (!checkType<Internal<PeerState>>(data)) {
            setError(`Received data of incorrect type`);
            return;
          } else {
            const peerState = data as Internal<PeerState>;
            setPeerStates((prev: PeerDataPairWithConn<PeerState>[]) => {
              const newState = prev.filter((state) => state.id !== conn.peer);
              newState.push({
                id: peerState.__peerHookInternalID,
                data: peerState,
                conn: conn.peer,
              });
              return newState;
            });
          }
        });
        conn.on('close', () => {
          setPeerStates((prev: PeerDataPairWithConn<PeerState>[]) => {
            return prev.filter((state) => state.conn !== conn.peer);
          });
        });
        conn.on('error', (err: { message: SetStateAction<string | undefined> }) => {
          setError(err.message);
        });
        conn.on('disconnected', (id: string) => {
          setPeerStates((prev: PeerDataPairWithConn<PeerState>[]) => {
            return prev.filter((state) => state.conn !== id);
          });
        });

        conn.on('open', () => {
          conn.send(myState);
        });
      });
      peer.on('open', (id: string) => {
        setMyID(id);
      });
    }
  }, [peerIsAvailable, peer]);

  const connections = Object.values(peer?.connections || {});

  const connectionsDeepForEffect: string = connections
    .map((conn: any) => conn[0]?.peer)
    .join('-');

  // publish state to all connections
  useEffect(
    () => {
      if (myState && connections) {
        connections.forEach((conn: any) => {
          if (conn && conn[0]) {
            conn[0].send(myState);
          } else {
            setError(
              `Connection lost to peer ${conn.peer} when trying to send state`,
            );
          }
        });
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [myState, connections, connectionsDeepForEffect, myID],
  );

  return [
    peerStates.map((peerstate) => {
      return {
        ...peerstate,
        conn: undefined,
        data: { ...peerstate.data, __peerHookInternalID: undefined },
      };
    }),
    stateExternal,
    setStateExternal,
    myID,
    conns,
    getNewID,
    error,
  ];
}

// const [peerStates, myState, setMyState, myID, numConnections, error] = useJoinMultiPeerSession<StateInterface>(peerID, initialState)

export function useJoinMultiPeerSession<HostState, PeerState>(
  peerID: string,
  initialState: PeerState,
  minPeerIDLength?: number,
): [
  PeerDataPair<PeerState>[],
  HostState | undefined,
  PeerState,
  (state: PeerState) => void,
  string,
  number,
  string?,
] {
  let pastID = '';
  useEffect(() => {
    if (typeof window !== 'undefined') {
      pastID = window.localStorage.getItem('TBS_REACT_HOOK_PEERID_JOIN') || '';
      if (pastID === '') {
        pastID = generateID();
        window.localStorage.setItem('TBS_REACT_HOOK_PEERID_JOIN', pastID);
      }
    }
  }, []);

  const minPeerLen = minPeerIDLength || 5;

  const [peerStates, setPeerStates] = useState<
    PeerDataPairWithConn<Internal<PeerState>>[]
  >([]);

  const [myState, setMyState] = useState<Internal<PeerState>>({
    ...initialState,
    __peerHookInternalID: pastID,
  });

  const [hostState, setHostState] = useState<HostState>();
  const [error, setError] = useState<string | undefined>();
  const [peer, setPeer] = useState<any>();

  const setStateExternal = (state: PeerState) => {
    setMyState({ ...state, __peerHookInternalID: pastID });
  };

  const stateExternal = { ...myState, __peerHookInternalID: undefined };

  const conns = peer?.connections.length || 0;

  useEffect(() => {
    if (peerID.length < minPeerLen) {
      console.error(
        'peerID is too short to attempt connection, specify `minPeerIDLength` to change',
      );
      return;
    }
    import('peerjs').then(({ default: Peer }) => {
      if (peer) peer.destroy();
      const peerLocal = new Peer();
      setPeer(peerLocal);
      peerLocal.on('open', () => {
        const conn = peerLocal.connect(peerID);
        conn.on('open', () => {
          conn.send(myState);
          setError(undefined);
        });
        conn.on('data', (data: unknown) => {
          if (
            checkType<Internal<HostState>>(data) &&
            (data as Internal<HostState>).__peerHookInternalID === peerID
          ) {
            const hostState = data as Internal<HostState>;
            setHostState({ ...hostState, __peerHookInternalID: undefined });
          } else if (checkType<Internal<PeerState>>(data)) {
            const peerState = data as Internal<PeerState>;
            setPeerStates((prev: PeerDataPairWithConn<Internal<PeerState>>[]) => {
              const newState = prev.filter((state) => state.id !== conn.peer);
              newState.push({
                id: peerState.__peerHookInternalID,
                data: peerState,
                conn: conn.peer,
              });
              return newState;
            });
            setError(undefined);
          } else {
            setError(`Received data of incorrect type`);
          }
        });
        conn.on('close', () => {
          setPeerStates((prev: PeerDataPairWithConn<Internal<PeerState>>[]) => {
            return prev.filter((state) => state.conn !== conn.peer);
          });
          setError(undefined);
        });
        conn.on('error', (err: { message: SetStateAction<string | undefined> }) => {
          setError(err.message);
        });
      });
    });
  }, [peerID]);

  const connections = Object.values(peer?.connections || {});

  // publish state to all connections
  useEffect(
    () => {
      if (myState && connections) {
        connections.forEach((conn: any) => {
          if (conn && conn[0]) {
            conn[0].send(myState);
          } else {
            setError(`Connection lost to peer ${conn.peer} - previous Peer ID ${
              peerStates.filter((state) => state.id === conn.peer)[0]?.data
                .__peerHookInternalID
            }
          )} when trying to send state`);
          }
        });
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [myState, connections, connections.length],
  );

  return [
    peerStates.map((state) => {
      return {
        ...state,
        conn: undefined,
        data: { ...state.data, __peerHookInternalID: undefined },
      };
    }),
    hostState,
    stateExternal,
    setStateExternal,
    myState.__peerHookInternalID,
    conns,
    error,
  ];
}

/*
  our goal with the multi peer hook is to allow for a host to create a session and then allow other peers to join that session
  we hide the use of internal IDs from the user and instead use the peerID to identify the host
  the host will be able to send a state to all peers and the peers will be able to send a state to the host
  peers are identified by their internal ID, which is generated by the hook and stored in local storage
  this allows for peers to reconnect to the session even if they refresh the page or close the tab and their state will be preserved
  TODO: restore state on reconnect when joining (have host dispatch your state back to you when you rejoin after previously being connected)  
*/
