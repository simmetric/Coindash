/// <reference path="interfaces.ts" />
/// <reference path="components/favoritepair.tsx" />
/// <reference path="kraken.ts" />
namespace dash.model {

    var TradeablePair = dash.components.FavoritePair;
    export class DashModel implements IDashModel {
        public key: string;
        public currencies: Array<ICurrency>;
        public pairs: Array<ICurrencyPair>;
        public ohlc: { [key: string]: IOhlcHistory };
        public trades: { [key: string]: Array<ITrade> };
        public subscribers: { [event: string]: Array<any> };

        private kraken: Kraken;

        constructor(key) {
            this.key = key;
            this.currencies = [];
            this.pairs = [];
            this.subscribers = {};
            this.subscribers[""] = [];
            this.ohlc = {};
            this.trades = {};

            this.kraken = new Kraken();
        }

        public initialize = async () => {
            //load currencies
            let currenciesJson = await this.kraken.getCurrencies();
            this.loadCurrencies(currenciesJson);
            //afterwards, load currency pairs
            let pairsJson = await this.kraken.getTradeablePairs();
            this.loadPairs(pairsJson);
        }

        public loadCurrencies = (jsonData) => {
            Object.keys(jsonData.result).forEach(key => {
                var currency = jsonData.result[key];
                if (key.indexOf("K") < 0) {
                    //exclude fee currency
                    var currencyObject: ICurrency = {
                        name: key,
                        altName: currency.altname,
                        decimals: currency.decimals,
                        displayDecimals: currency.display_decimals,
                        type: null
                    };
                    currencyObject.type = (key.indexOf("Z") == 0) ? CurrencyType.natural : CurrencyType.digital;

                    this.currencies.push(currencyObject);
                }
            });

            this.notify("currenciesLoaded");
        }

        public loadPairs = (jsonData) => {
            Object.keys(jsonData.result).forEach(key => {
                var pair = jsonData.result[key];
                var baseCurrency = this.currencies.filter((cur) => cur.name == pair.base)[0];
                var quoteCurrency = this.currencies.filter((cur) => cur.name == pair.quote)[0];

                if (key.indexOf(".d") < 0) {
                    this.pairs.push({
                        name: key,
                        altName: baseCurrency.altName + " / " + quoteCurrency.altName,
                        base: baseCurrency,
                        quote: quoteCurrency,
                        pairDecimals: pair.pair_decimals
                    });

                    //initialize ohlc map
                    this.ohlc[key] = {
                        current: null,
                        previous: null,
                        intradayRecords: [],
                        weeklyRecords: [],
                        monthlyRecords: []
                    };

                    //initialize trades map
                    this.trades[key] = [];
                }
            });

            this.notify("pairsLoaded");
        }

        public getIntradayOhlc = async (pairToSelect: ICurrencyPair) => {
            let json = await this.kraken.getOhlc(
                pairToSelect,
                this.ohlc[pairToSelect.name].current != null ?
                    this.ohlc[pairToSelect.name].current[0] / 1000 :
                    new Date(Date.now()).getTime() / 1000,
                15,
            );
            this.loadIntradayOhlc(json);
        }

        public getWeeklyOhlc = async (pairToSelect: ICurrencyPair) => {
            let json = await this.kraken.getOhlc(
                pairToSelect,
                new Date(Date.now()).getStartOfWeek().getTime() / 1000,
                240,
            );
            this.loadWeeklyOhlc(json);
        }

        private loadIntradayOhlc = (jsonData) => {
            var key = Object.keys(jsonData.result)[0];

            if (jsonData.result[key].length > 0) {
                jsonData.result[key].forEach(record => {
                    this.ohlc[key].intradayRecords.push([
                        parseFloat(record[0]) * 1000,
                        parseFloat(record[1]),
                        parseFloat(record[2]),
                        parseFloat(record[3]),
                        parseFloat(record[4])
                    ]);
                });

                this.ohlc[key].previous = this.ohlc[key].current;
                this.ohlc[key].current = this.ohlc[key].intradayRecords[this.ohlc[key].intradayRecords.length - 1];

                this.notify();
            }
        }

        private loadWeeklyOhlc = (jsonData) => {
            var key = Object.keys(jsonData.result)[0];

            if (jsonData.result[key].length > 0) {
                jsonData.result[key].forEach(record => {
                    this.ohlc[key].weeklyRecords.push([
                        parseFloat(record[0]) * 1000,
                        parseFloat(record[1]),
                        parseFloat(record[2]),
                        parseFloat(record[3]),
                        parseFloat(record[4])
                    ]);
                });

                this.ohlc[key].previous = this.ohlc[key].current;
                this.ohlc[key].current = this.ohlc[key].weeklyRecords[this.ohlc[key].weeklyRecords.length - 1];

                this.notify();
            }
        }

        public getTrades = async (pairToSelect) => {
            let json = await this.kraken.getTrades(
                pairToSelect,
                this.trades[pairToSelect.name].length ?
                    this.trades[pairToSelect.name][this.trades[pairToSelect.name].length - 1].time.getTime() / 1000 : null,
                );
            this.loadTrades(json);
        }

        private loadTrades = (jsonData) => {
            var key = Object.keys(jsonData.result)[0];
            jsonData.result[key].reverse().forEach(record => {
                this.trades[key].push({
                    time: new Date(parseFloat(record[2]) * 1000),
                    price: parseFloat(record[0]),
                    volume: parseFloat(record[1])
                });
            });

            this.notify();
        }

        public subscribe = (callback, event = "") => {
            if (this.subscribers[event] == undefined) {
                this.subscribers[event] = [];
            }
            this.subscribers[event].push(callback);
        }

        notify = (event = "") => {
            if (event != "") {
                this.subscribers[""].forEach(function (callback) { callback(); });
            }
            if (this.subscribers[event] != undefined) {
                this.subscribers[event].forEach(function (callback) { callback(); });
            }
        }
    }
}