/// <reference path="interfaces.ts" />
/// <reference path="components/favoritepair.tsx" />
/// <reference path="kraken.ts" />
namespace dash.model {

    var TradeablePair = dash.components.FavoritePair;
    export class DashModel implements IDashModel {
        public key : string;
        public currencies : Array<ICurrency>;
        public pairs : Array<ICurrencyPair>;
        public ohlc : { [key : string]: IOhlcHistory };
        public trades : { [key : string]: Array<ITrade> };
        public subscribers : {[event: string]: Array<any> };

        private kraken : Kraken;

        constructor(key) {
            this.key = key;
            this.currencies = [];
            this.pairs = [];
            this.subscribers = {};
            this.subscribers[""] = [];
            this.ohlc = { };
            this.trades = { };

            this.kraken = new Kraken();
        }

        public initialize=() => {
            //load currencies
            this.kraken.getCurrencies(this.loadCurrencies);
            //afterwards, load currency pairs
        }

        public loadCurrencies=(jsonData) => {
            Object.keys(jsonData.result).forEach(key => {
                var currency = jsonData.result[key];
                if(key.indexOf("K") < 0) {
                    //exclude fee currency
                    var currencyObject : ICurrency = {
                        name: key,
                        altName : currency.altname,
                        decimals : currency.decimals,
                        displayDecimals : currency.display_decimals,
                        type: null
                    };
                    currencyObject.type = (key.indexOf("Z") == 0) ? CurrencyType.natural : CurrencyType.digital;                

                    this.currencies.push(currencyObject);
                }
            });

            //load currency pairs
            this.kraken.getTradeablePairs(this.loadPairs);

            this.notify("currenciesLoaded");
        }

        public loadPairs=(jsonData) => {
            Object.keys(jsonData.result).forEach(key => {
                var pair = jsonData.result[key];
                var baseCurrency = this.currencies.filter((cur) => cur.name == pair.base)[0];
                var quoteCurrency = this.currencies.filter((cur) => cur.name == pair.quote)[0];

                if(key.indexOf(".d") < 0) {
                    this.pairs.push({
                        name: key,
                        altName: baseCurrency.altName + " / " + quoteCurrency.altName,
                        base: baseCurrency,
                        quote: quoteCurrency,
                        pairDecimals: pair.pair_decimals
                    });
                    
                    //initialize ohlc map
                    this.ohlc[key] = {
                        current : null,
                        previous : null,
                        intradayRecords : [],
                        weeklyRecords : [],
                        monthlyRecords : []
                    };

                    //initialize trades map
                    this.trades[key] = [];
                }
            });

            this.notify("pairsLoaded");
        }

        public getIntradayOhlc=(pairToSelect) => {
            this.kraken.getOhlc(
                pairToSelect,
                this.ohlc[pairToSelect.name].current != null ? 
                    this.ohlc[pairToSelect.name].current[0]/1000 : 
                    (function(now) { return new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime() / 1000 }(new Date(Date.now()))),
                    15,
                this.loadIntradayOhlc);
        }

        public loadIntradayOhlc=(jsonData) => {
            var key = Object.keys(jsonData.result)[0];

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

        public getTrades=(pairToSelect) => {
            this.kraken.getTrades(
                pairToSelect, 
                this.trades[pairToSelect.name].length ? 
                    this.trades[pairToSelect.name][this.trades[pairToSelect.name].length - 1].time.getTime() /1000 : null,
                this.loadTrades);
        }

        public loadTrades=(jsonData) => {
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

        public subscribe=(callback, event = "") => {
            if(this.subscribers[event] == undefined){
                this.subscribers[event] = [];
            }
            this.subscribers[event].push(callback);
        }

        notify=(event = "") => {
            if (event != "")
            {
                this.subscribers[""].forEach(function (callback) { callback(); });
            }
            if (this.subscribers[event] != undefined) {
                this.subscribers[event].forEach(function (callback) { callback(); });
            }
        }
    }
}