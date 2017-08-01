/// <reference path="definitions/jquery.d.ts" />

const DefaultCallCost = 1;
const LedgerCallCost = 2

// Wrapper for the kraken.com public API
class Kraken {
    private callCount = 0;
    private callMax = 15;
    private callUpdater : number;
    private baseUri = "https://api.kraken.com/0/public/";

    constructor() {
        this.callUpdater = setInterval(this.decreaseCallCount, 1000);
    }

    decreaseCallCount=() => {
        if(this.callCount > 0) this.callCount--;
    }

    canMakeCall=(callCost) => {
        if(this.callCount + callCost < this.callMax)
        {
            this.callCount += callCost;
            return true;
        }

        return false;
    }

    getCurrencies=(callback) => {
        this.makeCall(
            "Assets",
            callback
        );
    }

    getTradeablePairs=(callback) => {
        this.makeCall(
            "AssetPairs",
            callback
        );
    }

    getOhlc=(pair, since, interval = 15, callback) => {
        this.makeCall(
            "OHLC?pair=" + pair.name + "&interval=" + interval + ((since != null) ? "&since="+since : ""), 
            callback
        );
    }

    getTrades=(pair, since, callback) => {
        this.makeCall(
            "Trades?pair=" + pair.name + "&interval=15" + ((since != null) ? "&since="+since : ""), 
            callback
        );
    }

    private makeCall(relativeUrl, callback) {
        while(!this.canMakeCall(DefaultCallCost)) { }

        console.log(relativeUrl + " (" + this.callCount + ")");

        $.getJSON(
            this.baseUri + relativeUrl,
            callback
        );
    }
}