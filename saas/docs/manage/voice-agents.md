---
title: Voice Agents
---

# Voice Agents

:::info Feature preview
Voice agents are in feature preview. Behavior and configuration options may change before general availability.

A voice agent lets users talk to an AI agent instead of typing. WSO2 Cloud deploys a voice pipeline in front of your AI agent: it streams the user's audio through [LiveKit](https://livekit.io/), converts speech to text, sends the text to the AI agent over WebSocket, and speaks the agent's reply back using a text-to-speech provider.

You don't write any extra code. The voice pipeline is created and deployed as a separate integration from the AI agent's overview page.

:::info Prerequisites
- A paid WSO2 Cloud subscription. On the free tier, **Enable Voice Agents** is disabled with the tooltip *Upgrade your plan to enable Voice Agents.*
- An AI agent integration deployed in WSO2 Cloud that exposes a **WebSocket** endpoint. Without one, **Enable Voice Agents** is disabled with the tooltip *Add a WebSocket endpoint to this AI Agent to enable voice.* See [Expose an AI agent over WebSocket](#expose-an-ai-agent-over-websocket).
- A LiveKit project: the LiveKit URL (for example, `wss://your-project.livekit.cloud`), an API key, and an API secret. See [LiveKit credentials](https://docs.livekit.io/deploy/agents/secrets/#livekit-credentials).
- API keys for your speech-to-text and text-to-speech providers. For OpenAI, create a key on the [OpenAI API keys](https://platform.openai.com/api-keys) page.

## Expose an AI agent over WebSocket

The voice pipeline sends each transcribed user utterance to the AI agent as a chat message and speaks the returned string. Attach the agent to a `voice:CloudVoiceListener` from the `ballerinax/ai.wso2.integration` package and implement `onChatMessage`:

```ballerina
import ballerinax/ai.wso2.integration as voice;

listener voice:CloudVoiceListener voiceListener = new (8080);

isolated service voice:VoiceService on voiceListener {
    isolated remote function onChatMessage(voice:ChatMessage message) returns string|error {
        return check mathTutorAgent.run(message.message, message.sessionId);
    }
}
```

In this example, `mathTutorAgent` is an AI agent with `add`, `subtract`, `multiply`, and `divide` tools and short-term memory. Passing `message.sessionId` to the agent keeps the conversation context for the duration of a voice session.

Deploy the integration to WSO2 Cloud so its WebSocket endpoint is running.

Write the agent's system prompt for speech: ask for short replies (one or two sentences) with no Markdown, lists, or code. Long or formatted replies take longer to synthesize and sound unnatural when read aloud.

## Enable the Voice Agents preview

1. Click your profile icon in the top-right corner of the console and select **Feature Preview**.

    <ThemedImage
        alt="Feature Preview option in the user profile menu"
        sources={{
            light: useBaseUrl('/img/manage/cloud/voice-agents-v5.1/user-menu-feature-preview-v5.1.png'),
            dark: useBaseUrl('/img/manage/cloud/voice-agents-v5.1/user-menu-feature-preview-v5.1.png'),
        }}
    />

2. Turn on **Voice Agents**, then close the dialog.

    <ThemedImage
        alt="Feature Preview dialog with Voice Agents turned on"
        sources={{
            light: useBaseUrl('/img/manage/cloud/voice-agents-v5.1/feature-preview-voice-agents-enabled-v5.1.png'),
            dark: useBaseUrl('/img/manage/cloud/voice-agents-v5.1/feature-preview-voice-agents-enabled-v5.1.png'),
        }}
    />

## Create a voice agent

Open the AI agent integration's **Overview** page and click **Enable Voice Agents** (on the right, under **Lifecycle Status**).

<ThemedImage
    alt="Enable Voice Agents on the AI agent overview page"
    sources={{
        light: useBaseUrl('/img/manage/cloud/voice-agents-v5.1/enable-voice-agents-v5.1.png'),
        dark: useBaseUrl('/img/manage/cloud/voice-agents-v5.1/enable-voice-agents-v5.1.png'),
    }}
/>

A four-step wizard opens. The current AI agent is preselected as the target, so you don't need to choose an agent.

### Step 1: Configure LiveKit

LiveKit handles the real-time audio connection between the user's browser and the voice pipeline.

1. Enter the **LiveKit URL**, for example `wss://your-project.livekit.cloud`.
2. Enter the **API Key** and **API Secret** of your LiveKit project.
3. Click **Next**.

To find these values, see [LiveKit credentials](https://docs.livekit.io/deploy/agents/secrets/#livekit-credentials). The wizard also links to this page from **How to get your LiveKit URL, API key & secret?**

<ThemedImage
    alt="Configure LiveKit step"
    sources={{
        light: useBaseUrl('/img/manage/cloud/voice-agents-v5.1/configure-livekit-v5.1.png'),
        dark: useBaseUrl('/img/manage/cloud/voice-agents-v5.1/configure-livekit-v5.1.png'),
    }}
/>

### Step 2: Configure speech to text

1. Select a speech-to-text (STT) provider: **Deepgram**, **AssemblyAI**, **Cartesia**, **ElevenLabs**, or **OpenAI**.
2. Select the **Model** and **Language**.
3. Enter the provider's API key. For OpenAI, create one on the [OpenAI API keys](https://platform.openai.com/api-keys) page. The wizard links to each provider's key page from **How to get your `<provider>` API key?**
4. Click **Next**.

<ThemedImage
    alt="Configure Speech to Text step with OpenAI selected"
    sources={{
        light: useBaseUrl('/img/manage/cloud/voice-agents-v5.1/configure-speech-to-text-v5.1.png'),
        dark: useBaseUrl('/img/manage/cloud/voice-agents-v5.1/configure-speech-to-text-v5.1.png'),
    }}
/>

### Step 3: Configure text to speech

1. Select a text-to-speech (TTS) provider: **Cartesia**, **ElevenLabs**, **Deepgram**, or **OpenAI**.
2. Select the **Model**, **Voice**, and **Language**. Cartesia and ElevenLabs also accept a custom voice ID.
3. Enter the provider's API key. You can reuse the same [OpenAI API key](https://platform.openai.com/api-keys) for both speech to text and text to speech.
4. Click **Next**.

For OpenAI, the available models are **GPT-4o Mini TTS**, **TTS-1**, and **TTS-1 HD**, and the available voices are Alloy, Ash, Ballad, Coral, Echo, Fable, Nova, Onyx, Sage, and Shimmer.

<ThemedImage
    alt="Configure Text to Speech step with OpenAI TTS-1 and the Alloy voice"
    sources={{
        light: useBaseUrl('/img/manage/cloud/voice-agents-v5.1/configure-text-to-speech-v5.1.png'),
        dark: useBaseUrl('/img/manage/cloud/voice-agents-v5.1/configure-text-to-speech-v5.1.png'),
    }}
/>

### Step 4: Tune and deploy

The defaults work for most agents. Adjust them if needed:

| Setting | Default | Description |
|---|---|---|
| **Text Output / Transcription** | On | Publishes the conversation transcript to the client alongside the audio. |
| **User Away Timeout** | `15` s | Ends the session after this much silence from the user. |
| **Min Consecutive Speech Delay** | `200` ms | Minimum gap between consecutive agent utterances. |
| **Close on Participant Disconnect** | On | Closes the LiveKit room when the user leaves. |
| **CORS Allowed Origins** | `*` | Origins allowed to request session tokens from the voice agent. Restrict this for production. |
| **Token Time-to-Live (TTL)** | `3600` s | How long a session token stays valid. |

**Advanced Settings** expose voice activity detection (VAD), turn detection and endpointing, barge-in (interrupting the agent while it speaks), and noise cancellation.

<ThemedImage
    alt="Tune and Deploy step"
    sources={{
        light: useBaseUrl('/img/manage/cloud/voice-agents-v5.1/tune-and-deploy-v5.1.png'),
        dark: useBaseUrl('/img/manage/cloud/voice-agents-v5.1/tune-and-deploy-v5.1.png'),
    }}
/>

Click **Deploy Voice Agent**.

<ThemedImage
    alt="Advanced Settings and the Deploy Voice Agent button"
    sources={{
        light: useBaseUrl('/img/manage/cloud/voice-agents-v5.1/tune-and-deploy-advanced-v5.1.png'),
        dark: useBaseUrl('/img/manage/cloud/voice-agents-v5.1/tune-and-deploy-advanced-v5.1.png'),
    }}
/>

WSO2 Cloud creates a new integration named **`<agent name> - Voice Agent`** (type **Voice Agent**) in the same project and deploys it to the Development environment. The voice agent connects to the AI agent's WebSocket URL through the `TARGET_AGENT_WS_URL` configuration. The AI agent's overview page now shows **Voice Agent Enabled**, which links to the new voice agent.

<ThemedImage
    alt="WSO2 Cloud creating the voice agent integration"
    sources={{
        light: useBaseUrl('/img/manage/cloud/voice-agents-v5.1/creating-voice-agent-v5.1.png'),
        dark: useBaseUrl('/img/manage/cloud/voice-agents-v5.1/creating-voice-agent-v5.1.png'),
    }}
/>

Wait until the **Development** card on the voice agent's overview page shows **Active**. The card's **Voice Tester** is then ready to use.

<ThemedImage
    alt="Voice agent overview with the Development environment Active and the Voice Tester"
    sources={{
        light: useBaseUrl('/img/manage/cloud/voice-agents-v5.1/voice-agent-development-active-v5.1.png'),
        dark: useBaseUrl('/img/manage/cloud/voice-agents-v5.1/voice-agent-development-active-v5.1.png'),
    }}
/>

## Test the voice agent

Each environment card on the voice agent's overview page has a **Voice Tester**. You can also open it from **Test** > **Voice Agent** in the left navigation.

<ThemedImage
    alt="Voice Agent Tester on the Test page"
    sources={{
        light: useBaseUrl('/img/manage/cloud/voice-agents-v5.1/test-voice-agent-v5.1.png'),
        dark: useBaseUrl('/img/manage/cloud/voice-agents-v5.1/test-voice-agent-v5.1.png'),
    }}
/>

1. Click **Start Session** and allow microphone access when the browser asks. The tester shows **LIVE** and **Conversation Active** when it's connected.

    <ThemedImage
        alt="Voice Agent Tester with a live session"
        sources={{
            light: useBaseUrl('/img/manage/cloud/voice-agents-v5.1/voice-tester-session-live-v5.1.png'),
            dark: useBaseUrl('/img/manage/cloud/voice-agents-v5.1/voice-tester-session-live-v5.1.png'),
        }}
    />

2. Speak to the agent. The transcript of the conversation appears in the tester, and you hear the agent's reply.
3. Click **Stop Session** to end the conversation.

For the math tutor example, try:

- *"Hi! What can you help me with?"*
- *"What is 245 plus 378?"*
- *"Now multiply that by twelve."*

<ThemedImage
    alt="Voice Agent Tester showing the conversation transcript"
    sources={{
        light: useBaseUrl('/img/manage/cloud/voice-agents-v5.1/voice-tester-session-v5.1.png'),
        dark: useBaseUrl('/img/manage/cloud/voice-agents-v5.1/voice-tester-session-v5.1.png'),
    }}
/>

## Promote to production (optional)

When you're ready to use the voice agent in production, click **Promote** on the voice agent's overview page. Choose **Use Development configuration** or **Define new configuration values**, click **Next**, and wait until the **Production** card shows **Active**.

<ThemedImage
    alt="Promote dialog for the voice agent"
    sources={{
        light: useBaseUrl('/img/manage/cloud/voice-agents-v5.1/promote-dialog-v5.1.png'),
        dark: useBaseUrl('/img/manage/cloud/voice-agents-v5.1/promote-dialog-v5.1.png'),
    }}
/>

## Troubleshooting

### The reply text appears before the audio

The transcript is published as soon as the AI agent returns its full reply, but the audio has to wait for text-to-speech synthesis. To reduce the gap:

- Keep the agent's replies short and voice-friendly: one or two sentences with no Markdown or lists.
- Use a low-latency TTS model. For OpenAI, **TTS-1** is faster than **TTS-1 HD** or **GPT-4o Mini TTS**. Cartesia and Deepgram Aura are also fast.

### The agent doesn't respond

- Open the voice agent's **Development** card, click **Configure**, and check that `TARGET_AGENT_WS_URL` points to the AI agent's running WebSocket URL. When the voice agent is created, it prefers the AI agent's Production URL. If the AI agent isn't running in Production, set the Development URL manually and redeploy.
- Check the AI agent's own logs for errors, such as a missing LLM model or API key configuration.

### The session ends on its own

A session ends when the user is silent for longer than **User Away Timeout**, or when the user leaves and **Close on Participant Disconnect** is on. Log entries such as `publisher data channel '_reliable' closed unexpectedly` followed by `disconnected from room with reason: RoomClosed` are part of normal room teardown, not an error.
