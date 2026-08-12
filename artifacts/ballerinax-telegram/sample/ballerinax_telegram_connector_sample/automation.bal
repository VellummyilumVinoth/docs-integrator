import ballerina/log;
import ballerinax/telegram;

public function main() returns error? {
    do {
        telegram:Message telegramMessage = check telegramClient->sendMessage(123456789, "Hello from Ballerina!");
        log:printInfo(telegramMessage.toString());
    } on fail error e {
        log:printError("Error occurred", 'error = e);
        return e;
    }
}
