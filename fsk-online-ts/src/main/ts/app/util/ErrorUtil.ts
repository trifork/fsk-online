export default class ErrorUtil {
    public static getMessage(error: unknown) {
        if (error instanceof Error) {
            if (error.message) {
                try {
                    const jsonMessage = JSON.parse(error.message);
                    const message = jsonMessage.message;
                    return message || error.message;
                } catch (parseError) {
                    return (parseError as Error).message;
                }
            }
        }
        return "Der er sket en fejl";
    }
}
