# PeerJS React Hooks
Use PeerJS in React with an interface somewhat similar to Appolo Client and the usual useState hooks.

# Hosting a P2P Session:
Call the useHostPeerSession hook with the type of the state you want to share. The hook returns an array with the following values:

1. The state of the partner
2. The state of the host
3. A function to set the state of the host
4. A boolean indicating if the host is connected to the partner
5. The ID of the host (which you send to someone who wants to join)


```tsx
  const [partnerState, myState, setMyState, isConnected, myID] =
    useHostPeerSession<StateInterface>({
      message: "Hi I'm hosting",
      color: "#00e5ff",
    });
```

# Joining a P2P Session:
Given someone else's ID, call the useJoinPeerSession hook with the type of the state you want to share. The hook returns an array with the following values:

1. The state of your partner
2. Your state
3. A function to set your state (and send it to your partner)
4. A boolean indicating if you are connected to your partner


```tsx
  const [partnerState, myState, setMyState, isConnected] =
    useJoinPeerSession<StateInterface>(peerID, {
      message: "Hi there I joined",
      color: "#ff7700",
    });
```