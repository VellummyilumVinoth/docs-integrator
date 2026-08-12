import ballerinax/whatsapp.business;

final business:Client whatsappBusinessClient = check new ({auth: {token: whatsappBusinessToken}});
