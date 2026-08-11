---
title: WhatsApp Business
description: React to WhatsApp Business Cloud webhook events, such as inbound messages, status updates, and account or template lifecycle changes, using pre-built event handlers.
keywords: [wso2 integrator, whatsapp business, whatsapp webhook, event integration, webhook listener, meta cloud api]
---

import ThemedImage from '@theme/ThemedImage';
import useBaseUrl from '@docusaurus/useBaseUrl';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# WhatsApp Business

WhatsApp Business event integrations receive webhook notifications from the WhatsApp Business Cloud API and trigger handler functions as messages arrive and account, template, or phone number state changes occur. Use them to build chatbots, automate customer replies, and track message delivery and template quality in real time.

:::note
The WhatsApp Business webhook listener must be reachable from the internet. For local development, use a tunneling tool such as [ngrok](https://ngrok.com) to create a public URL for your local port. In production, deploy the integration to a publicly accessible host.

After starting the integration, configure the webhook in the **Meta App Dashboard** under **WhatsApp → Configuration → Webhooks**: set the **Callback URL** to your listener's public URL, set a **Verify token** matching `verifyToken`, and subscribe to the fields you want to receive.
:::

## Creating a WhatsApp Business events service

<Tabs>
<TabItem value="ui" label="Visual Designer" default>

1. Click **+ Add Artifact** in the canvas or click **+** next to **Entry Points** in the sidebar.
2. In the **Artifacts** panel, select **WhatsApp Business** under **Event Integration**.
3. In the creation form, fill in the following fields:

   | Field | Description | Default |
   |---|---|---|
   | **Verify Token** | The verification token configured in the Meta App dashboard. | Required |
   | **App Secret** | The Meta app secret, used to verify inbound webhook notifications via `X-Hub-Signature-256`. | Required |
   | **Webhook Listener Port** | The port on which the webhook listener accepts incoming HTTP requests. | `8090` |

   Expand **Advanced Configurations** to set the listener name.

   | Field | Description | Default |
   |---|---|---|
   | **Listener Name** | Identifier for the listener created with this service. | `whatsappListener` |

4. Click **Create**.

5. WSO2 Integrator opens the service in the **Service Designer**. The canvas shows the attached listener pill and the **Event Handlers** section with the pre-added handlers for inbound messages and account updates.

   <ThemedImage
       alt="WSO2 Integrator design canvas showing the WhatsApp Business listener connected to the WhatsAppService with its event handlers"
       sources={{
           light: useBaseUrl('/img/develop/integration-artifacts/event/whatsapp-business/step-overview.png'),
           dark: useBaseUrl('/img/develop/integration-artifacts/event/whatsapp-business/step-overview.png'),
       }}
   />

   Select **Show More Resources** to reveal every available handler.

   <ThemedImage
       alt="WhatsApp Business Service Designer with all event handlers listed under Event Handlers"
       sources={{
           light: useBaseUrl('/img/develop/integration-artifacts/event/whatsapp-business/step-service-designer.png'),
           dark: useBaseUrl('/img/develop/integration-artifacts/event/whatsapp-business/step-service-designer.png'),
       }}
   />

   Click any handler to open it in the flow diagram view and implement the logic.

</TabItem>
<TabItem value="code" label="Ballerina Code">

```ballerina
import ballerinax/whatsapp.business as whatsapp;
import ballerina/log;

configurable string verifyToken = ?;
configurable string appSecret = ?;
configurable int listenerPort = 8090;

listener whatsapp:Listener whatsappListener = new (listenerPort, verifyToken = verifyToken, appSecret = appSecret);

service whatsapp:WhatsAppService on whatsappListener {

    remote function onMessages(whatsapp:MessagesNotification notification) returns error? {
        if notification is whatsapp:Messages {
            foreach whatsapp:InboundMessage message in notification.messages {
                log:printInfo("Inbound WhatsApp message received", sender = message.'from, messageId = message.messageId);
            }
        } else {
            foreach whatsapp:MessageStatusUpdate statusUpdate in notification.statuses {
                log:printInfo("WhatsApp message status update", messageId = statusUpdate.messageId, status = statusUpdate.status);
            }
        }
    }

    remote function onAccountUpdate(whatsapp:AccountUpdate update) returns error? {
        log:printInfo("WhatsApp account update received", wabaId = update.wabaId, event = update.event);
    }
}
```

Save this as `main.bal` and run `bal run` from the project directory. Configure your Meta app's webhook callback URL to point at the listener and use the same `verifyToken` and `appSecret` values in the Meta App Dashboard.

</TabItem>
</Tabs>

## Listener configuration

<Tabs>
<TabItem value="ui" label="Visual Designer" default>

Click the listener pill on the canvas to open the **WhatsApp.business Listener Configuration** panel.

<ThemedImage
    alt="WhatsApp Business Listener Configuration panel showing Name, Listen To, Verify Token, and App Secret fields"
    sources={{
        light: useBaseUrl('/img/develop/integration-artifacts/event/whatsapp-business/step-configuration.png'),
        dark: useBaseUrl('/img/develop/integration-artifacts/event/whatsapp-business/step-configuration.png'),
    }}
/>

| Field | Description | Default |
|---|---|---|
| **Name** | Identifier for the listener. | `whatsappListener` |
| **Listen To** | A port number to bind a new `http:Listener` to, or an existing `http:Listener`. | Required |
| **Verify Token** | The verification token configured in the Meta App dashboard. | Required |
| **App Secret** | The Meta app secret, used to verify inbound webhook notifications. | Required |

Click **Save** to apply updates.

</TabItem>
<TabItem value="code" label="Ballerina Code">

The listener is declared at the module level and requires both `verifyToken` and `appSecret`. There is no way to start it without them.

```ballerina
listener whatsapp:Listener whatsappListener = new (
    listenerPort,
    verifyToken = verifyToken,
    appSecret = appSecret
);
```

`whatsapp:ListenerConfig` fields:

| Field | Type | Default | Description |
|---|---|---|---|
| `verifyToken` | `string` | Required | The verification token configured in the Meta App dashboard. |
| `appSecret` | `string` | Required | The Meta app secret, used to verify the `X-Hub-Signature-256` header on inbound webhook notifications. |

</TabItem>
</Tabs>

## Event handlers

WhatsApp Business Cloud has ten webhook fields, one per `WhatsAppService` handler, plus an eleventh `onError` handler that fires whenever one of the ten returns an error while being dispatched. Declare only the handlers you need. A field whose handler you didn't declare is logged and dropped.

| Handler | Webhook field | Triggered when |
|---|---|---|
| `onMessages` | `messages` | An inbound message or an outbound message status update arrives. Narrow the `MessagesNotification` parameter with `notification is Messages` to tell the two apart. |
| `onAccountReviewUpdate` | `account_review_update` | A WhatsApp Business Account (WABA) review decision changes. |
| `onAccountUpdate` | `account_update` | An account-lifecycle or compliance change occurs. |
| `onBusinessCapabilityUpdate` | `business_capability_update` | A WABA's messaging or phone-number capability limits change. |
| `onMessageTemplateQualityUpdate` | `message_template_quality_update` | A message template's quality score changes. |
| `onMessageTemplateStatusUpdate` | `message_template_status_update` | A message template's status changes (approved, rejected, disabled, and so on). |
| `onPhoneNumberNameUpdate` | `phone_number_name_update` | A phone number's display-name review outcome is available. |
| `onPhoneNumberQualityUpdate` | `phone_number_quality_update` | A phone number's messaging throughput or quality tier changes. |
| `onSecurity` | `security` | A two-step-verification PIN change or reset request occurs for a phone number. |
| `onTemplateCategoryUpdate` | `template_category_update` | A message template's category changes, or is about to change. |
| `onError` | N/A | Any of the handlers above returned an error while being dispatched. |

## Error handling

If a handler returns an error, the WhatsApp listener logs the error and continues processing subsequent events. Declare `onError` to react to a handler failure beyond logging.

<Tabs>
<TabItem value="ui" label="Visual Designer" default>

Add an **Error Handler** block inside the handler flow to define recovery logic. Errors that escape the handler are caught by the listener and logged automatically.

</TabItem>
<TabItem value="code" label="Ballerina Code">

```ballerina
service whatsapp:WhatsAppService on whatsappListener {

    remote function onMessages(whatsapp:MessagesNotification notification) returns error? {
        do {
            // handle the notification
        } on fail error err {
            log:printError("Failed to handle onMessages event", err);
        }
    }

    remote function onError(whatsapp:HandlerError handlerError) returns error? {
        log:printError("Failed to process a WhatsApp webhook event",
            'error = handlerError.'error, 'field = handlerError.'field);
    }
}
```

Return `error?` from a handler to allow unhandled errors to propagate to the listener, which logs them and dispatches to `onError` if declared. Return `()` to suppress them.

</TabItem>
</Tabs>

## What's next

- [Telegram](telegram.md) — react to Telegram Bot API webhook updates
- [Google Chat](google-chat.md) — react to Google Chat interaction events
- [Connections](../supporting/connections.md) — reuse WhatsApp Business credentials across services
- [WhatsApp Business connector reference](../../../connectors/catalog/communication/whatsapp-business/overview.md) — full connector API reference
- [WhatsApp Business setup guide](../../../connectors/catalog/communication/whatsapp-business/setup-guide.md) — create a Meta app and configure the webhook
