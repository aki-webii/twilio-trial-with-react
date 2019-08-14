import * as React from "react";
import * as Video from "twilio-video";
import axios from "axios";

type TwilioIdentities = {
  identity: string;
  token: string;
};

const VideoComponent: React.FC = () => {
  const [roomName, setRoomName] = React.useState<string>("");
  const roomNameErr: boolean = roomName.trim().length === 0;
  const [
    twilioIdentities,
    setTwilioIdentities
  ] = React.useState<TwilioIdentities | null>(null);
  const [activeRoom, setActiveRoom] = React.useState(null);
  const hasJoinedRoom = activeRoom !== null;
  const [localMediaAvailable, setLocalMediaAvailable] = React.useState(false);
  const [previewTracks, setPreviewTracks] = React.useState(null);

  const remoteMediaRef = React.useRef<HTMLDivElement>();
  const localMediaRef = React.useRef<HTMLDivElement>();

  const joinRoom = () => {
    if (roomNameErr) {
      return false;
    }

    console.log(`Joining room ${roomName} ...`);
    let connectOptions: {
      name: string;
      tracks?: any;
    } = {
      name: roomName
    };

    if (previewTracks) {
      connectOptions.tracks = previewTracks;
    }

    // Join the Room with the token from the server and the
    // LocalParticipant's Tracks.
    Video.connect(twilioIdentities.token, connectOptions).then(
      roomJoined,
      error => {
        alert(`Could not connect to Twilio: ${error.message}`);
      }
    );
  };

  const getTracks = participant => {
    return Array.from(participant.tracks.values())
      .filter((publication: any) => publication.track)
      .map((publication: any) => publication.track);
  };

  // A new RemoteTrack was published to the Room.
  const trackPublished = (publication, container) => {
    if (publication.isSubscribed) {
      attachTrack(publication.track, container);
    }
    publication.on("subscribed", function(track) {
      console.log("Subscribed to " + publication.kind + " track");
      attachTrack(track, container);
    });
    publication.on("unsubscribed", detachTrack);
  };

  // A RemoteTrack was unpublished from the Room.
  function trackUnpublished(publication) {
    console.log(publication.kind + " track was unpublished.");
  }

  const participantConnected = (participant, container) => {
    participant.tracks.forEach(publication =>
      trackPublished(publication, container)
    );
    participant.on("trackPublished", publication =>
      trackPublished(publication, container)
    );
    participant.on("trackUnpublished", trackUnpublished);
  };

  // Attach the Track to the DOM.
  function attachTrack(track, container) {
    container.appendChild(track.attach());
  }

  const attachTracks = (tracks, container) => {
    tracks.forEach(track => {
      attachTrack(track, container);
    });
  };

  // Detach given track from the DOM
  function detachTrack(track) {
    track.detach().forEach(function(element) {
      element.remove();
    });
  }

  const detachParticipantTracks = participant => {
    var tracks = getTracks(participant);
    tracks.forEach(detachTrack);
  };

  const roomJoined = room => {
    // Called when a participant joins a room
    console.log("Joined as '" + twilioIdentities.identity + "'");
    setActiveRoom(room);
    setLocalMediaAvailable(true);

    // Attach LocalParticipant's Tracks, if not already attached.
    var previewContainer = localMediaRef.current;
    if (!localMediaRef.current.querySelector("video")) {
      attachTracks(getTracks(room.localParticipant), previewContainer);
    }

    // Attach the Tracks of the Room's Participants.
    room.participants.forEach(participant => {
      console.log("Already in Room: '" + participant.identity + "'");
      const remoteMediaContainer = remoteMediaRef.current;
      participantConnected(participant, remoteMediaContainer);
    });

    // When a Participant joins the Room, log the event.
    room.on("participantConnected", function(participant) {
      console.log("Joining: '" + participant.identity + "'");
      const remoteMediaContainer = remoteMediaRef.current;
      participantConnected(participant, remoteMediaContainer);
    });

    // When a Participant adds a Track, attach it to the DOM.
    room.on("trackAdded", (track, participant) => {
      console.log(participant.identity + " added track: " + track.kind);
      var previewContainer = remoteMediaRef.current;
      attachTracks([track], previewContainer);
    });

    // When a Participant removes a Track, detach it from the DOM.
    room.on("trackRemoved", (track, participant) => {
      console.log(participant.identity + " removed track: " + track.kind);
      detachTrack(track);
    });

    // When a Participant leaves the Room, detach its Tracks.
    room.on("participantDisconnected", participant => {
      console.log("Participant '" + participant.identity + "' left the room");
      detachParticipantTracks(participant);
    });

    // Once the LocalParticipant leaves the room, detach the Tracks
    // of all Participants, including that of the LocalParticipant.
    room.on("disconnected", () => {
      if (previewTracks) {
        previewTracks.forEach(track => {
          track.stop();
        });
      }
      detachParticipantTracks(room.localParticipant);
      room.participants.forEach(detachParticipantTracks);

      setActiveRoom(null);
      setLocalMediaAvailable(false);
    });
  };

  React.useEffect(() => {
    const url = `${process.env.BASE_URL}/token`;
    axios.get(url).then(results => {
      const { identity, token } = results.data;
      setTwilioIdentities({ identity, token });
    });
  }, []);

  const leaveRoom = () => {
    activeRoom.disconnect();
    setLocalMediaAvailable(false);
  };

  // Only show video track after user has joined a room
  let showLocalTrack = localMediaAvailable ? (
    <div className="flex-item">
      <div ref={localMediaRef} />
    </div>
  ) : (
    ""
  );
  // Hide 'Join Room' button if user has already joined a room.
  let joinOrLeaveRoomButton = hasJoinedRoom ? (
    <button onClick={leaveRoom}>Leave Room</button>
  ) : (
    <button onClick={joinRoom}>Join Room</button>
  );
  return (
    <div>
      <div className="flex-container">
        {showLocalTrack}
        <div className="flex-item">
          <input
            type="text"
            value={roomName}
            onChange={({ target }) => setRoomName(target.value)}
          />
          <br />
          {joinOrLeaveRoomButton}
        </div>
        <div className="flex-item" ref={remoteMediaRef} id="remote-media" />
      </div>
    </div>
  );
};

export default VideoComponent;
