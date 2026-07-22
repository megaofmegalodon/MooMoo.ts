import Client from "./Client";
import Socket from "./Socket";

declare const turnstile: Turnstile.Turnstile;

export default class CaptchaManager {
    private static widgetId: string | null | undefined = null;

    static renderChallenge(wsAddress: string) {
        if (typeof turnstile !== "undefined") {
            this.widgetId = turnstile.render(document.getElementById("turnstileWidget")!, {
                sitekey: "0x4AAAAAAAMYHI96GFiJzMmp",
                theme: "light",
                "error-callback": (err) => console.error(err),
                callback: (token: string) => {
                    Client.socket = new Socket(`${wsAddress}?token=cf:${encodeURIComponent(token)}`);
                    Client.hookEvents();
                },
                "expired-callback": (token: string) => console.log("exp: " + token)
            });
        }
    }

    static reset() {
        if (!this.widgetId) return;

        turnstile.reset(this.widgetId);
        this.widgetId = null;
    }
}
