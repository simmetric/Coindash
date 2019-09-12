/// <reference path="definitions/jquery.d.ts" />

const DefaultCallCost = 1;
const LedgerCallCost = 2

// Wrapper for the kraken.com public API
class Kraken {
    private callCount = 0;
    private callMax = 15;
    private callUpdater: number;
    private proxyUri = "https://krakenproxy.azurewebsites.net/proxy/?url=";
    private baseUri = "https://api.kraken.com/0/public/";

    constructor() {
        this.callUpdater = setInterval(this.decreaseCallCount, 1000);
    }

    decreaseCallCount = () => {
        if (this.callCount > 0) this.callCount--;
    }

    canMakeCall = (callCost) => {
        if (this.callCount + callCost < this.callMax) {
            this.callCount += callCost;
            return true;
        }

        return false;
    }

    getCurrencies = (callback) => {
        this.makeCall(
            "Assets",
            callback
        );
    }

    getTradeablePairs = (callback) => {
        this.makeCall(
            "AssetPairs",
            callback
        );
    }

    getOhlc = (pair, since, interval = 15, callback) => {
        this.makeCall(
            "OHLC?pair=" + pair.name + "&interval=" + interval + ((since != null) ? "&since=" + since : ""),
            callback
        );
    }

    getTrades = (pair, since, callback) => {
        this.makeCall(
            "Trades?pair=" + pair.name + "&interval=15" + ((since != null) ? "&since=" + since : ""),
            callback
        );
    }

    private makeCall(relativeUrl, callback) {
        while (!this.canMakeCall(DefaultCallCost)) { }

        console.log(relativeUrl + " (" + this.callCount + ")");

        var url = new URL(relativeUrl, this.baseUri);

        var script = document.createElement("script");
        script.src = this.baseUri + relativeUrl

        fetch(this.proxyUri + encodeURI(this.baseUri + relativeUrl), {
            headers: new Headers(
                {
                    "Accept": "application/json",
                    "Authorization": "Basic NWE0YTY2OGEzMGUwNGVhMWI0OThjYTdkODMyYmEyZjc6NzJmMDYzYzllNzU4NDIyN2FmMTIwZmE3NzA4NjI4MTc="
                }
            )
        }).then(response => {
            if (response.ok) {
                return response.json();
            }
            else {
                return response.text();
            }
        }).then(callback).catch(error => {
            console.error(error);
        });
    }
}