export default class ErrorUtil {
    public static getMessage(error: Error) {
        if (error) {
            if (error.message) {
                try {
                    const jsonMessage = JSON.parse(error.message);
                    const message = jsonMessage.message;
                    return message || error.message;
                } catch (error) {
                    return error.message;
                }
            }
        }
        return "Der er sket en fejl";
    }
}
