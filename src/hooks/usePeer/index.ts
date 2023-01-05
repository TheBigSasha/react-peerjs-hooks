import { useEffect, useState } from "react";
import { generateID } from "./helper/generateID";


// Hook usage:
// const [partnerState, myState, setMyState, isConnected] = useJoinPeerSession<StateInterface>(peerID)

export function useJoinPeerSession<T>(
  peerID: string,
  initialState: T
): [T | undefined, T, (state: T) => void, boolean] {
  const [partnerState, setPartnerState] = useState<T | undefined>();
  const [myState, setMyState] = useState<T>(initialState);
  const [isConnected, setIsConnected] = useState(false);

  const [peer, setPeer] = useState<any>();

  useEffect(() => {
    import("peerjs").then(({ default: Peer }) => {
      const peer = new Peer();
      setPeer(peer);
      peer.on("open", () => {
        const conn = peer.connect(peerID);
        conn.on("open", () => {
          {  /*@ts-ignore*/}
          conn.on("data", (data: T) => {
            setPartnerState(data);
          });
          setIsConnected(true);
        });
      });
    });
  }, [peerID]);

  useEffect(() => {
    if (peer) {
      {/*@ts-ignore*/}
      peer.on("connection", (conn) => {
        conn.on("data", (data: T) => {
          setPartnerState(data);
        });
        setIsConnected(true);
      });

      peer.on("error", (err: string) => {
        console.error(err);
      });

      peer.on("data", (data: T) => {
        setPartnerState(data);
      });

      {/*@ts-ignore*/}
      peer.on("error", (err) => {
        console.error(err);
      });

      peer.on("close", () => {
        setIsConnected(false);
      });

      peer.on("open", () => {
        const conn = peer.connect(peerID);

        conn.on("data", (data: T) => {
          setPartnerState(data);
          setIsConnected(true);
        });
      });
    }
  }, [peer, peerID]);

  useEffect(() => {
    if (isConnected && myState) {
      peer?.connections[peerID][0].send(myState);
    }
  }, [myState, isConnected, peer, peerID]);

  return [partnerState, myState, setMyState, isConnected];
}

// Hook usage:
// const [partnerState, myState, setMyState, isConnected, myID] = useHostPeerSession<StateInterface>()

export function useHostPeerSession<T>(
  initialState: T
): [T | undefined, T, (state: T) => void, boolean, string] {
  const [partnerState, setPartnerState] = useState<T | undefined>();
  const [myState, setMyState] = useState<T>(initialState);
  const [isConnected, setIsConnected] = useState(false);
  const [myID, setMyID] = useState("");

  const [peer, setPeer] = useState<any>();

  const conns = peer?.connections.length;

  useEffect(
    () => {
      const shouldGetNewID = myID === "";
      const IDToUse = shouldGetNewID ? generateID() : myID;
      console.log(`IDToUse: ${IDToUse}`);

      if (peer && !shouldGetNewID) {
        return;
      } else {
        if (peer && shouldGetNewID) {
          peer.destroy();
        }

        import("peerjs").then(({ default: Peer }) => {
          const peer = new Peer(IDToUse);
          setPeer(peer);
          peer.on("open", (id) => {
            setMyID(id);
            peer.on("connection", (conn) => {
              {/*@ts-ignore*/}
              conn.on("data", (data: T) => {
                setPartnerState(data);
              });

              setIsConnected(true);
            });
          });
          peer.on("error", (err) => {
            console.error(err);
          });

          peer.on("close", () => {
            setIsConnected(false);
          });

          peer.on("disconnected", () => {
            setIsConnected(false);
          }
        );
        });
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [myID, conns]
  );

  const connections = Object.values(peer?.connections || {});

  useEffect(() => {
    if (isConnected && myState && connections) {
      connections.forEach((conn: any) => {
        if(conn && conn[0]){
            conn[0].send(myState);
        }
        else 
        {
            setIsConnected(false);
        }
      });
    }
  }, [myState, isConnected, connections, connections.length]);

  return [partnerState, myState, setMyState, isConnected, myID];
}
