import ballerinax/telegram;

final telegram:Client telegramClient = check new ({token: telegramBotToken});
