import ballerina/log;
import ballerinax/googleapis.chat;

public function main() returns error? {
    do {
        chat:Message chatMessage = check chatClient->/spaces/[string `spaces/AAAAAAAAAAA`]/messages.post({text: "Hello from Ballerina!"});
        log:printInfo(chatMessage.toString());
    } on fail error e {
        log:printError("Error occurred", 'error = e);
        return e;
    }
}
