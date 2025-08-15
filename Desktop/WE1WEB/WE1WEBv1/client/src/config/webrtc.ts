// WebRTC Configuration for Production
export const getRTCConfiguration = (): RTCConfiguration => {
  const config: RTCConfiguration = {
    iceServers: [
      // Google's public STUN servers
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' },
      { urls: 'stun:stun2.l.google.com:19302' },
      { urls: 'stun:stun3.l.google.com:19302' },
      { urls: 'stun:stun4.l.google.com:19302' },
    ],
    iceCandidatePoolSize: 10,
    bundlePolicy: 'max-bundle',
    rtcpMuxPolicy: 'require'
  };

  // Add TURN servers for production (NAT traversal)
  if (process.env.NODE_ENV === 'production') {
    // Free TURN servers (limited bandwidth, use for testing)
    config.iceServers?.push(
      {
        urls: 'turn:openrelay.metered.ca:80',
        username: 'openrelayproject',
        credential: 'openrelayproject'
      },
      {
        urls: 'turn:openrelay.metered.ca:443',
        username: 'openrelayproject',
        credential: 'openrelayproject'
      }
    );

    // Production TURN servers (configure these with your own credentials)
    if (import.meta.env.VITE_TURN_SERVER_URL) {
      config.iceServers?.push({
        urls: import.meta.env.VITE_TURN_SERVER_URL,
        username: import.meta.env.VITE_TURN_USERNAME || '',
        credential: import.meta.env.VITE_TURN_CREDENTIAL || ''
      });
    }
  }

  return config;
};

// WebRTC constraints for different quality modes
export const getMediaConstraints = (quality: 'low' | 'medium' | 'high' = 'medium') => {
  const constraints: { [key: string]: MediaStreamConstraints } = {
    low: {
      video: {
        width: { max: 640 },
        height: { max: 480 },
        frameRate: { max: 15 }
      },
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true
      }
    },
    medium: {
      video: {
        width: { ideal: 1280, max: 1920 },
        height: { ideal: 720, max: 1080 },
        frameRate: { ideal: 30, max: 30 }
      },
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
        sampleRate: 48000
      }
    },
    high: {
      video: {
        width: { ideal: 1920 },
        height: { ideal: 1080 },
        frameRate: { ideal: 60 }
      },
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
        sampleRate: 48000,
        channelCount: 2
      }
    }
  };

  return constraints[quality];
};

// Data channel configuration
export const getDataChannelConfig = () => ({
  ordered: true,
  maxPacketLifeTime: 3000,
  maxRetransmits: 3,
  protocol: 'we1web-protocol',
  negotiated: false,
  id: undefined
});

// Connection health monitoring
export const getConnectionStats = async (peerConnection: RTCPeerConnection) => {
  const stats = await peerConnection.getStats();
  const report: any = {
    timestamp: Date.now(),
    connectionState: peerConnection.connectionState,
    iceConnectionState: peerConnection.iceConnectionState,
    signalingState: peerConnection.signalingState,
    candidates: { local: 0, remote: 0 },
    bytesReceived: 0,
    bytesSent: 0,
    packetsLost: 0,
    jitter: 0,
    roundTripTime: 0
  };

  stats.forEach((stat) => {
    if (stat.type === 'candidate-pair' && stat.state === 'succeeded') {
      report.roundTripTime = stat.currentRoundTripTime * 1000; // Convert to ms
    }
    if (stat.type === 'inbound-rtp') {
      report.bytesReceived += stat.bytesReceived || 0;
      report.packetsLost += stat.packetsLost || 0;
      report.jitter = stat.jitter || 0;
    }
    if (stat.type === 'outbound-rtp') {
      report.bytesSent += stat.bytesSent || 0;
    }
    if (stat.type === 'local-candidate') {
      report.candidates.local++;
    }
    if (stat.type === 'remote-candidate') {
      report.candidates.remote++;
    }
  });

  return report;
};