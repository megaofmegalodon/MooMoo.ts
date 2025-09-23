type MooMooVerification = {
    algorithm: string;
    challenge: string;
    maxnumber: number;
    salt: string;
    signature: string;
}

export default class TokenGenerator {
    private static workerBlob: any;
    private static workJSBlob: any;

    private static selfFunc: any;

    static init() {
        this.selfFunc = (self.URL || self.webkitURL);

        this.workerBlob = "IWZ1bmN0aW9uKCl7InVzZSBzdHJpY3QiO2xldCBlPW5ldyBUZXh0RW5jb2Rlcjthc3luYyBmdW5jdGlvbiB0KHQsbixyKXt2YXIgbDtyZXR1cm4gbD1hd2FpdCBjcnlwdG8uc3VidGxlLmRpZ2VzdChyLnRvVXBwZXJDYXNlKCksZS5lbmNvZGUodCtuKSksWy4uLm5ldyBVaW50OEFycmF5KGwpXS5tYXAoZT0+ZS50b1N0cmluZygxNikucGFkU3RhcnQoMiwiMCIpKS5qb2luKCIiKX1mdW5jdGlvbiBuKGUsdD0xMil7bGV0IG49bmV3IFVpbnQ4QXJyYXkodCk7Zm9yKGxldCByPTA7cjx0O3IrKyluW3JdPWUlMjU2LGU9TWF0aC5mbG9vcihlLzI1Nik7cmV0dXJuIG59YXN5bmMgZnVuY3Rpb24gcih0LHI9IiIsbD0xZTYsbz0wKXtsZXQgYT0iQUVTLUdDTSIsYz1uZXcgQWJvcnRDb250cm9sbGVyLGk9RGF0ZS5ub3coKSx1PShhc3luYygpPT57Zm9yKGxldCBlPW87ZTw9bCYmIWMuc2lnbmFsLmFib3J0ZWQmJnMmJnc7ZSsrKXRyeXtsZXQgdD1hd2FpdCBjcnlwdG8uc3VidGxlLmRlY3J5cHQoe25hbWU6YSxpdjpuKGUpfSxzLHcpO2lmKHQpcmV0dXJue2NsZWFyVGV4dDpuZXcgVGV4dERlY29kZXIoKS5kZWNvZGUodCksdG9vazpEYXRlLm5vdygpLWl9fWNhdGNoe31yZXR1cm4gbnVsbH0pKCkscz1udWxsLHc9bnVsbDt0cnl7dz1mdW5jdGlvbiBlKHQpe2xldCBuPWF0b2IodCkscj1uZXcgVWludDhBcnJheShuLmxlbmd0aCk7Zm9yKGxldCBsPTA7bDxuLmxlbmd0aDtsKyspcltsXT1uLmNoYXJDb2RlQXQobCk7cmV0dXJuIHJ9KHQpO2xldCBmPWF3YWl0IGNyeXB0by5zdWJ0bGUuZGlnZXN0KCJTSEEtMjU2IixlLmVuY29kZShyKSk7cz1hd2FpdCBjcnlwdG8uc3VidGxlLmltcG9ydEtleSgicmF3IixmLGEsITEsWyJkZWNyeXB0Il0pfWNhdGNoe3JldHVybntwcm9taXNlOlByb21pc2UucmVqZWN0KCksY29udHJvbGxlcjpjfX1yZXR1cm57cHJvbWlzZTp1LGNvbnRyb2xsZXI6Y319bGV0IGw7b25tZXNzYWdlPWFzeW5jIGU9PntsZXR7dHlwZTpuLHBheWxvYWQ6byxzdGFydDphLG1heDpjfT1lLmRhdGEsaT1udWxsO2lmKCJhYm9ydCI9PT1uKWwmJmwuYWJvcnQoKSxsPXZvaWQgMDtlbHNlIGlmKCJ3b3JrIj09PW4pe2lmKCJvYmZ1c2NhdGVkImluIG8pe2xldHtrZXk6dSxvYmZ1c2NhdGVkOnN9PW98fHt9O2k9YXdhaXQgcihzLHUsYyxhKX1lbHNle2xldHthbGdvcml0aG06dyxjaGFsbGVuZ2U6ZixzYWx0OmR9PW98fHt9O2k9ZnVuY3Rpb24gZShuLHIsbD0iU0hBLTI1NiIsbz0xZTYsYT0wKXtsZXQgYz1uZXcgQWJvcnRDb250cm9sbGVyLGk9RGF0ZS5ub3coKSx1PShhc3luYygpPT57Zm9yKGxldCBlPWE7ZTw9byYmIWMuc2lnbmFsLmFib3J0ZWQ7ZSsrKXtsZXQgdT1hd2FpdCB0KHIsZSxsKTtpZih1PT09bilyZXR1cm57bnVtYmVyOmUsdG9vazpEYXRlLm5vdygpLWl9fXJldHVybiBudWxsfSkoKTtyZXR1cm57cHJvbWlzZTp1LGNvbnRyb2xsZXI6Y319KGYsZCx3LGMsYSl9bD1pLmNvbnRyb2xsZXIsaS5wcm9taXNlLnRoZW4oZT0+e3NlbGYucG9zdE1lc3NhZ2UoZSYmey4uLmUsd29ya2VyOiEwfSl9KX19fSgpOw==";
        this.workerBlob = Uint8Array.from(atob(this.workerBlob), char => char.charCodeAt(0));
        this.workJSBlob = new Blob([this.workerBlob], {
            type: "text/javascript;charset=utf-8"
        });
    }

    private static createWorker() {
        let objUrl = this.workJSBlob && this.selfFunc.createObjectURL(this.workJSBlob);

        let worker = new Worker(objUrl);

        worker.addEventListener("error", () => {
            this.selfFunc.revokeObjectURL(objUrl);
        });

        return worker;

    }

    private static async getChallenge(): Promise<MooMooVerification> {
        const response = await fetch("https://api.moomoo.io/verify", {
            headers: {}
        });

        const responseData = (await response.json()) as MooMooVerification;

        return responseData;
    }

    private static async getWorkerSolution(payload: MooMooVerification, maxNumber: number, workersCount: number = 8): Promise<any> {
        const workers: Worker[] = [];

        for (let i = 0; i < workersCount; i++) workers.push(this.createWorker()); // suppose to be 'ae' as parameter but is undefined

        const rangePerWorker = Math.ceil(maxNumber / workersCount);

        const results = await Promise.all(workers.map((worker, index) => {
            const start = index * rangePerWorker;

            return new Promise(resolve => {
                worker.addEventListener("message", (messageEvent) => {
                    if (messageEvent.data) {
                        for (let w of workers) {
                            if (w !== worker) {
                                w.postMessage({ type: "abort" });
                            }
                        }
                    }

                    resolve(messageEvent.data);
                });

                worker.postMessage({
                    payload: payload,
                    max: start + rangePerWorker,
                    start: start,
                    type: "work"
                });
            });
        }));

        for (let worker of workers) {
            worker.terminate();
        }

        return results.find(result => !!result) || null;
    }

    private static async validateChallenge(challengeData: MooMooVerification) {
        let solution = await this.getWorkerSolution(challengeData, challengeData.maxnumber);

        if (solution?.number !== undefined || "obfuscated" in challengeData) {
            return {
                challengeData: challengeData,
                solution: solution
            };
        }
    }

    private static createPayload(challengeData: MooMooVerification, solution: { number: number, took: number }) {
        return btoa(JSON.stringify({
            algorithm: challengeData.algorithm,
            challenge: challengeData.challenge,
            number: solution.number,
            salt: challengeData.salt,
            signature: challengeData.signature,
            test: challengeData ? !0 : void 0,
            took: solution.took
        }));
    }

    private static async executeRecaptcha() {
        try {
            const challengeData = await this.getChallenge();
            const { solution } = (await this.validateChallenge(challengeData)) as unknown as { solution: { number: number, took: number } };

            let payload = this.createPayload(challengeData, solution);

            return payload;
        } catch (e) {
            console.log(e);
        }
    }

    static async default() {
        try {
            return `alt:${(await this.executeRecaptcha()) as string}`;
        } catch (e) {
            console.log(e);
        }
    }
}

TokenGenerator.init();