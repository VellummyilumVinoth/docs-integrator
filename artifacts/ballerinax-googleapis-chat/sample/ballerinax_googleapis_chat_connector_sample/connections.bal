import ballerinax/googleapis.chat;

final chat:Client chatClient = check new ({auth: {private_key: googleChatPrivateKey, client_email: googleChatClientEmail}});
