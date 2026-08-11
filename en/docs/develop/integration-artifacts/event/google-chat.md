---
title: Google Chat
description: React to Google Chat interaction events, such as messages, card clicks, dialog submissions, and app-home opens, using pre-built event handlers.
keywords: [wso2 integrator, google chat, google workspace, event integration, webhook listener, chat app]
---

import ThemedImage from '@theme/ThemedImage';
import useBaseUrl from '@docusaurus/useBaseUrl';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Google Chat

Google Chat event integrations receive interaction events directly from Google Chat over HTTP and trigger handler functions as users message, add, or interact with your Chat app. Use them to build Chat apps, bots, and interactive cards without polling any API.

:::note
The Google Chat listener must be reachable over a public HTTPS URL. For local development, use a tunneling tool such as [ngrok](https://ngrok.com) to create a public URL for your local port.

After starting the integration, configure your Chat app in the **Google Cloud Console** under **Google Chat API → Configuration**: set the **HTTP endpoint URL** to your listener's public URL and choose an **Authentication audience** that matches your service's `@chat:ServiceConfig` annotation. See the [setup guide](../../../connectors/catalog/communication/google-chat/setup-guide.md) for details.
:::

## Creating a Google Chat events service

<Tabs>
<TabItem value="ui" label="Visual Designer" default>

1. Click **+ Add Artifact** in the canvas or click **+** next to **Entry Points** in the sidebar.
2. In the **Artifacts** panel, select **Google Chat** under **Event Integration**.
3. In the creation form, fill in the following fields:

   | Field | Description | Default |
   |---|---|---|
   | **Config** | Authentication configuration for the internal Chat API client: a service account, OAuth 2.0, or bearer token config. | Required |
   | **Listen On** | The port or HTTP listener to listen on. | `8000` |
   | **Endpoint URL** or **Project Number** | The audience the listener validates incoming bearer tokens against. Must match the **Authentication audience** configured for your Chat app. | Required |

   Expand **Advanced Configurations** to set the listener name.

   | Field | Description | Default |
   |---|---|---|
   | **Listener Name** | Identifier for the listener created with this service. | `chatListener` |

4. Click **Create**.

5. WSO2 Integrator opens the service in the **Service Designer**. The canvas shows the attached listener pill and the **Event Handlers** section with the pre-added handlers for messages and space membership changes.

   <ThemedImage
       alt="WSO2 Integrator design canvas showing the Google Chat listener connected to the ChatService with its event handlers"
       sources={{
           light: useBaseUrl('/img/develop/integration-artifacts/event/google-chat/step-overview.png'),
           dark: useBaseUrl('/img/develop/integration-artifacts/event/google-chat/step-overview.png'),
       }}
   />

   <ThemedImage
       alt="Google Chat Service Designer with all event handlers listed under Event Handlers"
       sources={{
           light: useBaseUrl('/img/develop/integration-artifacts/event/google-chat/step-service-designer.png'),
           dark: useBaseUrl('/img/develop/integration-artifacts/event/google-chat/step-service-designer.png'),
       }}
   />

   Click any handler to open it in the flow diagram view and implement the logic.

</TabItem>
<TabItem value="code" label="Ballerina Code">

```ballerina
import ballerinax/googleapis.chat;
import ballerina/log;

configurable chat:ServiceAccountFileConfig serviceAccountAuth = ?;
configurable string endpointUrl = ?;
configurable int listenerPort = 8090;

listener chat:Listener chatListener = new (listenerPort, {auth: serviceAccountAuth});

@chat:ServiceConfig {
    endpointUrl: endpointUrl
}
service chat:ChatService on chatListener {

    remote function onMessage(chat:MessageEvent event, chat:MessageCaller caller) returns error? {
        string text = event.message.text ?: "";
        log:printInfo("Google Chat message received", text = text);
        check caller->respond({text: "Echo: " + text});
    }

    remote function onAddedToSpace(chat:ChatEvent event, chat:MessageCaller caller) returns error? {
        log:printInfo("Google Chat app added to space");
        check caller->respond({text: "Thanks for adding me!"});
    }
}
```

Save this as `main.bal` and run `bal run` from the project directory. Configure your Chat app's **HTTP endpoint URL** to point at the listener and make sure **Authentication audience** matches the `@chat:ServiceConfig` annotation.

</TabItem>
</Tabs>

## Listener configuration

<Tabs>
<TabItem value="ui" label="Visual Designer" default>

Click the listener pill on the canvas to open the **Googleapis.chat Listener Configuration** panel.

<ThemedImage
    alt="Google Chat Listener Configuration panel showing Name, Listen On, and Config fields"
    sources={{
        light: useBaseUrl('/img/develop/integration-artifacts/event/google-chat/step-configuration.png'),
        dark: useBaseUrl('/img/develop/integration-artifacts/event/google-chat/step-configuration.png'),
    }}
/>

| Field | Description | Default |
|---|---|---|
| **Name** | Identifier for the listener. | `chatListener` |
| **Listen On** | The port or HTTP listener to listen on. | `8000` |
| **Config** | Configuration including auth credentials for the internal Chat API client. | Required |

Click **Save** to apply updates.

The service-level authentication audience is configured separately via the `@chat:ServiceConfig` annotation on the service, not in this panel. Set it when creating the service, or edit the annotation in the Ballerina code.

</TabItem>
<TabItem value="code" label="Ballerina Code">

```ballerina
listener chat:Listener chatListener = new (listenerPort, {auth: serviceAccountAuth});
```

`chat:ListenerConfig` fields:

| Field | Type | Default | Description |
|---|---|---|---|
| `auth` | <code>ServiceAccountAuthConfig&#124;OAuth2Config&#124;http:BearerTokenConfig</code> | Required | Authentication for the internal Chat API client (service account, OAuth2, or bearer token). |
| `httpListenerConfig` | `http:ListenerConfiguration` | `{}` | Optional inbound HTTP listener settings. |

The service-level `@chat:ServiceConfig` annotation configures which bearer-token audience the listener validates:

```ballerina
@chat:ServiceConfig {
    endpointUrl: "https://my-app.example.com"
}
service chat:ChatService on chatListener {
    // ...
}
```

Use `projectNumber` instead of `endpointUrl` if your Chat app's **Authentication audience** is set to **Project Number**.

</TabItem>
</Tabs>

## Event handlers

`chat:ChatService` exposes one optional handler per Chat event type. Implement only the ones you need.

| Handler | Triggered when |
|---|---|
| `onMessage` | A user sends a message, @mentions the app, or invokes a slash command. |
| `onAddedToSpace` | The app is added to a space. |
| `onRemovedFromSpace` | The app is removed from a space. |
| `onCardClicked` | A user clicks a button or interactive element on a card. |
| `onWidgetUpdated` | A widget requests an autocomplete or similar update. |
| `onAppCommand` | A user invokes a Chat app command. |
| `onAppHome` | A user opens the app's home page. |
| `onSubmitForm` | A user submits a dialog or form. |

Each handler receives the event and, for most event types, an event-specific caller (`chat:MessageCaller`, `chat:CardClickedCaller`, `chat:AppHomeCaller`, or `chat:SubmitFormCaller`) pre-configured with the event's space context. Use the caller to `respond` synchronously within the event window, or to call Chat APIs asynchronously (`sendMessage`, `updateMessage`, `deleteMessage`, `getSpace`).

## Error handling

If a handler returns an error, the Google Chat listener logs the error.

<Tabs>
<TabItem value="ui" label="Visual Designer" default>

Add an **Error Handler** block inside the handler flow to define recovery logic. Errors that escape the handler are caught by the listener and logged automatically.

</TabItem>
<TabItem value="code" label="Ballerina Code">

```ballerina
service chat:ChatService on chatListener {

    remote function onMessage(chat:MessageEvent event, chat:MessageCaller caller) returns error? {
        do {
            check caller->respond({text: "Echo: " + (event.message.text ?: "")});
        } on fail error err {
            log:printError("Failed to handle onMessage event", err);
        }
    }
}
```

Return `error?` from a handler to allow unhandled errors to propagate to the listener. Return `()` to suppress them.

</TabItem>
</Tabs>

## What's next

- [WhatsApp Business](whatsapp-business.md) — react to WhatsApp Business Cloud webhook events
- [Telegram](telegram.md) — react to Telegram Bot API webhook updates
- [Connections](../supporting/connections.md) — reuse Google Chat credentials across services
- [Google Chat connector reference](../../../connectors/catalog/communication/google-chat/overview.md) — full connector API reference
- [Google Chat setup guide](../../../connectors/catalog/communication/google-chat/setup-guide.md) — create a GCP project and configure the Chat app
