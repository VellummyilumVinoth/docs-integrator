import ballerina/log;
import ballerinax/whatsapp.business;

public function main() returns error? {
    do {
        business:MessageResponsePayload businessMessageresponsepayload = check whatsappBusinessClient->sendMessage("1234567890", {to: "1234567890", text: {body: "Hello from Ballerina!"}});
        log:printInfo(businessMessageresponsepayload.toString());
    } on fail error e {
        log:printError("Error occurred", 'error = e);
        return e;
    }
}
