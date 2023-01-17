# PeerJS React Hooks

Use PeerJS in React with an interface somewhat similar to Appolo Client and the usual useState hooks.

The concept is that peer to peer states should be:
1. Strongly typed
2. Published to independent channels
3. Easy to use

### Strongly Typed
In this library, a peer to peer state is defined by a host state, and a joiner state. These can be the same thing, however it is usually useful for the host to be responsbile for controlling state to do with the "scene" at large, with joiners only being able to put in requests.

*Example*: In a game, where we play as democratic pirates who move their ship in the agreed upon position at any time. 

```tsx
interface HostState{
 shipCoords: {
  x: number,
  y: number
 }
}
```

```tsx
interface GuestState{
 preferredDirection: "left" | "right" | "back" | "forward"
}
```

In this case, the host side code will, at each tick of the game, look through all of the guest states and pick the most popular direction, and update the ship's coordinates accordingly.

When the game logic changes the ship position, it is sent to all peers as HostState

When the peers change their vote, they are able to indirectly affect the game for everyone.

In any case, the state of the peers can be used to construct a universal state by way of a **reducer**.

Typical way to update universal state (every time the host recieves a change to peer states) `reducer(PeerStates, HostState) => HostState`

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
