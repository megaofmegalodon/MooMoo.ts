import Client from "./Client";
import Socket from "./Socket";

declare const turnstile: Turnstile.Turnstile;

export default class CaptchaManager {
    private static widgetId: string | null | undefined = null;

    static renderChallenge(wsAddress: string) {
        if (typeof turnstile !== "undefined") {
            const elem = document.createElement("div");
            elem.style.position = "absoulate";
            elem.style.top = "20px";
            elem.style.left = "20px";
            elem.style.zIndex = "99999999";
            document.body.appendChild(elem);

            this.widgetId = turnstile.render(elem, {
                sitekey: "0x4AAAAAAAMYHI96GFiJzMmp",
                theme: "light",
                "error-callback": (err) => console.error(err),
                callback: (token: string) => {
                    Client.socket = new Socket(`${wsAddress}?token=cf:${encodeURIComponent(token)}`);
                    Client.hookEvents();
                    elem.remove();
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
