---
title: Telegram
description: React to Telegram Bot API webhook updates, such as messages, callback queries, and inline queries, using pre-built event handlers for each update type.
keywords: [wso2 integrator, telegram, telegram bot, event integration, webhook listener, telegram bot api]
---

import ThemedImage from '@theme/ThemedImage';
import useBaseUrl from '@docusaurus/useBaseUrl';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Telegram

Telegram event integrations receive webhook updates from the Telegram Bot API and trigger handler functions as messages, callback queries, and other update types arrive. Use them to build chatbots, handle inline keyboard interactions, and automate replies without polling `getUpdates`.

:::note
The Telegram webhook listener must be reachable over HTTPS from the internet. For local development, use a tunneling tool such as [ngrok](https://ngrok.com) to create a public HTTPS URL for your local port.

Create a bot and get a token by messaging [@BotFather](https://t.me/BotFather) on Telegram and sending `/newbot`. See the [setup guide](../../../connectors/catalog/communication/telegram/setup-guide.md) for details.
:::

## Creating a Telegram events service

<Tabs>
<TabItem value="ui" label="Visual Designer" default>

1. Click **+ Add Artifact** in the canvas or click **+** next to **Entry Points** in the sidebar.
2. In the **Artifacts** panel, select **Telegram** under **Event Integration**.
3. In the creation form, fill in the following fields:

   | Field | Description | Default |
   |---|---|---|
   | **Bot Token** | The bot token from BotFather, used to derive the secret token and authenticate the listener. Also required with **Public URL** for webhook auto-registration. | Required |
   | **Public URL** | This listener's public HTTPS URL, used to auto-register the webhook when set together with **Bot Token**. | `()` |
   | **Webhook Listener Port** | The port on which the webhook listener accepts incoming HTTP requests. | `8090` |

   Expand **Advanced Configurations** to set the listener name.

   | Field | Description | Default |
   |---|---|---|
   | **Listener Name** | Identifier for the listener created with this service. | `telegramListener` |

4. Click **Create**.

5. WSO2 Integrator opens the service in the **Service Designer**. The canvas shows the attached listener pill and the **Event Handlers** section with the pre-added handlers for messages and edited messages.

   <ThemedImage
       alt="WSO2 Integrator design canvas showing the Telegram listener connected to the TelegramService with its event handlers"
       sources={{
           light: useBaseUrl('/img/develop/integration-artifacts/event/telegram/step-overview.png'),
           dark: useBaseUrl('/img/develop/integration-artifacts/event/telegram/step-overview.png'),
       }}
   />

   <ThemedImage
       alt="Telegram Service Designer with all event handlers listed under Event Handlers"
       sources={{
           light: useBaseUrl('/img/develop/integration-artifacts/event/telegram/step-service-designer.png'),
           dark: useBaseUrl('/img/develop/integration-artifacts/event/telegram/step-service-designer.png'),
       }}
   />

   Click any handler to open it in the flow diagram view and implement the logic.

</TabItem>
<TabItem value="code" label="Ballerina Code">

```ballerina
import ballerinax/telegram;
import ballerina/log;

configurable string botToken = ?;
configurable string publicUrl = ?;
configurable int listenerPort = 8090;

listener telegram:Listener telegramListener = new (listenerPort, token = botToken, publicUrl = publicUrl);

service telegram:TelegramService on telegramListener {

    remote function onMessage(telegram:Message message) returns error? {
        log:printInfo("Telegram message received", chatId = message.chat.id, text = message.text);
    }

    remote function onCallbackQuery(telegram:CallbackQuery callbackQuery) returns error? {
        log:printInfo("Telegram callback query received", queryId = callbackQuery.id, data = callbackQuery.data);
    }
}
```

Save this as `main.bal` and run `bal run` from the project directory. Passing both `token` and `publicUrl` registers the webhook automatically when the listener starts. No separate `Client->setWebhook` call is needed.

</TabItem>
</Tabs>

## Listener configuration

<Tabs>
<TabItem value="ui" label="Visual Designer" default>

Click the listener pill on the canvas to open the **Telegram Listener Configuration** panel.

<ThemedImage
    alt="Telegram Listener Configuration panel showing Name, Listen To, Bot Token, Public URL, Secret Token, and Service Url fields"
    sources={{
        light: useBaseUrl('/img/develop/integration-artifacts/event/telegram/step-configuration.png'),
        dark: useBaseUrl('/img/develop/integration-artifacts/event/telegram/step-configuration.png'),
    }}
/>

| Field | Description | Default |
|---|---|---|
| **Name** | Identifier for the listener. | `telegramListener` |
| **Listen To** | A port number to bind a new `http:Listener` to, or an existing `http:Listener`. | Required |
| **Bot Token** | The bot token to derive the secret token from; also required with **Public URL** for auto-registration. | `()` |
| **Public URL** | This listener's public HTTPS URL, used to auto-register the webhook when set with **Bot Token**. | `()` |
| **Secret Token** | The secret token to authenticate inbound updates against, used directly instead of deriving one from **Bot Token**. | `()` |
| **Service Url** | The Telegram Bot API base URL; override only for tests or a proxy. | `https://api.telegram.org` |

Click **Save** to apply updates.

</TabItem>
<TabItem value="code" label="Ballerina Code">

`telegram:ListenerConfig` requires either `secretToken` or `token`.

```ballerina
listener telegram:Listener telegramListener = new (
    listenerPort,
    token = botToken,
    publicUrl = publicUrl
);
```

| Field | Type | Default | Description |
|---|---|---|---|
| `secretToken` | `string?` | `()` | The secret token to authenticate inbound updates against, used directly. |
| `token` | `string?` | `()` | The bot token to derive the secret token from; also required with `publicUrl` for auto-registration. |
| `publicUrl` | `string?` | `()` | This listener's public HTTPS URL, used to auto-register the webhook when set with `token`. |
| `serviceUrl` | `string` | `https://api.telegram.org` | The Telegram Bot API base URL; override only for tests or a proxy. |

</TabItem>
</Tabs>

## Event handlers

Telegram delivers nine update types, one per `TelegramService` handler. All are optional. Implement only the ones your bot needs. Telegram's `allowed_updates` already keeps unsupported update types from reaching your webhook; among the nine supported types, an update whose handler you didn't declare is logged and dropped after reaching the listener.

| Handler | Triggered when |
|---|---|
| `onMessage` | A new incoming message arrives. |
| `onEditedMessage` | An existing message is edited. |
| `onChannelPost` | A new channel post is published. |
| `onEditedChannelPost` | An existing channel post is edited. |
| `onCallbackQuery` | A user presses an inline keyboard button. |
| `onInlineQuery` | A user sends a new inline query. |
| `onPoll` | A poll's state changes. |
| `onPreCheckoutQuery` | A user confirms a payment, just before it's charged. |
| `onShippingQuery` | A user provides a shipping address for an invoice with flexible pricing. |

## Error handling

If a handler returns an error, the Telegram listener logs the error and continues processing subsequent updates.

<Tabs>
<TabItem value="ui" label="Visual Designer" default>

Add an **Error Handler** block inside the handler flow to define recovery logic. Errors that escape the handler are caught by the listener and logged automatically.

</TabItem>
<TabItem value="code" label="Ballerina Code">

```ballerina
service telegram:TelegramService on telegramListener {

    remote function onMessage(telegram:Message message) returns error? {
        do {
            log:printInfo("Telegram message received", chatId = message.chat.id);
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
- [Google Chat](google-chat.md) — react to Google Chat interaction events
- [Connections](../supporting/connections.md) — reuse Telegram credentials across services
- [Telegram connector reference](../../../connectors/catalog/communication/telegram/overview.md) — full connector API reference
- [Telegram setup guide](../../../connectors/catalog/communication/telegram/setup-guide.md) — create a bot and configure the webhook
