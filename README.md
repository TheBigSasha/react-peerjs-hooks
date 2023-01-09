# PeerJS React Hooks

Use PeerJS in React with an interface somewhat similar to Appolo Client and the usual useState hooks.

# Hosting a P2P Session:

Call the useHostPeerSession hook with the type of the state you want to share. The hook returns an array with the following values:

1. The states of your peers
2. The state of the host (your state)
3. A function to set your state (and send it to your peers)
4. Your unique ID among peers, which is also the peerID used to join
5. The number of connected people in your session
6. A function to fetch a new ID for yourself, which is also the peerID used to join
7. Any possible error which may have occurred

```tsx
 const [
    peerStates, myState, setMyState, myID, numConnections, forceNewID, error ] =
     useHostMultiPeerSession<Host, Joiner>({
      name: "Host",
      question: "What is your favorite color?",
      options: ["Red", "Blue", "Green"],
    });

```

# Joining a P2P Session:

Given someone else's ID, call the useJoinPeerSession hook with the type of the state you want to share. The hook returns an array with the following values:

1. The states of your peers
2. The state of the host
3. Your state
4. A function to set your state (and send it to your peers)
5. Your unique ID among peers
6. The number of connected people in your session
7. Any possible error which may have occurred

```tsx
  const [peerStates, hostState, myState, setMyState, myID, numConnections, error] =
    useJoinMultiPeerSession<Host, Joiner>(peerID, {
      name: "Jebediah",
      choice: "Red"
    });
```

### Extra Details
In the above code, the following are used for the types `Host` and `Joiner`
```tsx
interface Host {
 name: string;
 question: string;
 options: string[];
}

interface Joiner {
 name: string;
 choice: string;
}
```
