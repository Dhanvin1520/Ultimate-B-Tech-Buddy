👾Live Website: https://ultimate-b-tech-buddy-6bha.vercel.app/

## Video chat configuration

The WebRTC video lounge now supports configurable ICE (STUN/TURN) servers so hosted environments like Render can relay media for everyone, even when participants sit behind strict NAT or firewall rules.

Add a JSON array of `RTCIceServer` objects to the frontend environment (e.g., `.env`, Render dashboard) under `VITE_ICE_SERVERS`:

```
VITE_ICE_SERVERS='[
	{"urls": "turn:my-turn.example.com:3478", "username": "user", "credential": "pass"},
	{"urls": "stun:stun.l.google.com:19302"}
]'
```

If `VITE_ICE_SERVERS` is not provided, the app falls back to Google's public STUN servers plus OpenRelay's public TURN nodes. For production, supply your own TURN credentials (Twilio, Cloudflare, Coturn, etc.) for the most reliable multi-party calls.
