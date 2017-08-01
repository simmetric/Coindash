var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
// The require and define functions are defined directly as self-contained
// top-level functions to ensure hoisting makes them available at any point in
// the "bundle" produced by the TypeScript compiler, this is done in order to 
// avoid developers using AMD.ts to force inclusion/ execution order and work 
// against the compiler itself.
// NOTE: The code below purposely uses loose equality checks (==) against null
// to detect both null and undefined.
// TODO: Support reloading/re-defining modules
function require(dependencies, definition) {
    // A definition of a require call is nothing more than a nameless AMD
    // module, treat it as such.
    // TODO: make this concurrent
    define("require." + Date.now() + "." + Math.random(), dependencies, definition);
}
function define(name, dependencies, definition) {
    function processDefinition(name, dependencies, definition, state) {
        // Exclude require and exports as dependencies, both will be injected
        // in resolve
        var deps = (dependencies.length > 0 && dependencies[0] === "require" && dependencies[1] === "exports") ?
            (dependencies.slice(2)) : dependencies;
        if (deps.length === 0) {
            state.modules[name] = resolve(name, [], definition);
            processUpstreamDependencies(name, state);
        }
        else {
            // Register an initializer which will manage executing a module's
            // definition when all of it's dependencies are eventually available
            if (!(name in state.trackers)) {
                state.trackers[name] = track.bind(null, name, deps, definition, state);
            }
            // Build an inverse dependency map, this allows initializers to
            // track when all the module's definition become available
            deps.forEach(function (dependency) {
                if (!(dependency in state.inverseDependencyMap))
                    state.inverseDependencyMap[dependency] = {};
                state.inverseDependencyMap[dependency][name] = null; // the value for a given key is irrelevant
                processUpstreamDependencies(dependency, state);
            });
        }
    }
    // Tracks the status of the definition of a module's dependencies    
    function track(name, dependencies, definition, state) {
        // When all depdendencies are defined, then execute the module's
        // definition and notify all the upstream dependencies
        if (dependencies.filter(function (dependency) { return !(dependency in state.modules); }).length === 0) {
            state.modules[name] = resolve(name, dependencies.map(function (dependency) { return state.modules[dependency]; }), definition);
            processUpstreamDependencies(name, state);
            state.trackers[name] = null;
        }
    }
    function processUpstreamDependencies(name, state) {
        if (name in state.inverseDependencyMap) {
            Object.keys(state.inverseDependencyMap[name]).forEach(function (parent) {
                if (state.trackers[parent] != null)
                    state.trackers[parent]();
            });
        }
    }
    function resolve(name, dependencies, definition) {
        var exported = {}, returned = definition.apply(null, (definition.length === dependencies.length + 2) ?
            [require, exported].concat(dependencies) : dependencies);
        return Object.keys(exported).length === 0 ? returned : exported;
    }
    if (name == null || dependencies == null || definition == null) {
        throw new Error("Missing or wrong parameters for module definition: name " + name + " - dependencies " + dependencies + " - definition " + definition);
    }
    processDefinition(name, dependencies, definition, define.__state__);
}
(function (define) {
    // The state is kept as a property of the top-level define function to
    // ensure it's available at the same time the function is and to avoid
    // polluting the global scope.    
    define.__state__ = { inverseDependencyMap: {}, modules: {}, trackers: {} };
})(define || (define = {}));
var CurrencyType;
(function (CurrencyType) {
    CurrencyType[CurrencyType["natural"] = 0] = "natural";
    CurrencyType[CurrencyType["digital"] = 1] = "digital";
})(CurrencyType || (CurrencyType = {}));
var ChartView;
(function (ChartView) {
    ChartView[ChartView["Intraday"] = 0] = "Intraday";
    ChartView[ChartView["Weekly"] = 1] = "Weekly";
    ChartView[ChartView["Monthly"] = 2] = "Monthly";
    ChartView[ChartView["All"] = 3] = "All";
})(ChartView || (ChartView = {}));
/// <reference path="definitions/jquery.d.ts" />
var DefaultCallCost = 1;
var LedgerCallCost = 2;
// Wrapper for the kraken.com public API
var Kraken = (function () {
    function Kraken() {
        var _this = this;
        this.callCount = 0;
        this.callMax = 15;
        this.baseUri = "https://api.kraken.com/0/public/";
        this.decreaseCallCount = function () {
            if (_this.callCount > 0)
                _this.callCount--;
        };
        this.canMakeCall = function (callCost) {
            if (_this.callCount + callCost < _this.callMax) {
                _this.callCount += callCost;
                return true;
            }
            return false;
        };
        this.getCurrencies = function (callback) {
            _this.makeCall("Assets", callback);
        };
        this.getTradeablePairs = function (callback) {
            _this.makeCall("AssetPairs", callback);
        };
        this.getOhlc = function (pair, since, interval, callback) {
            if (interval === void 0) { interval = 15; }
            _this.makeCall("OHLC?pair=" + pair.name + "&interval=" + interval + ((since != null) ? "&since=" + since : ""), callback);
        };
        this.getTrades = function (pair, since, callback) {
            _this.makeCall("Trades?pair=" + pair.name + "&interval=15" + ((since != null) ? "&since=" + since : ""), callback);
        };
        this.callUpdater = setInterval(this.decreaseCallCount, 1000);
    }
    Kraken.prototype.makeCall = function (relativeUrl, callback) {
        while (!this.canMakeCall(DefaultCallCost)) { }
        console.log(relativeUrl + " (" + this.callCount + ")");
        $.getJSON(this.baseUri + relativeUrl, callback);
    };
    return Kraken;
}());
/// <reference path="../definitions/react.d.ts" />
/// <reference path="../interfaces.ts" />
var dash;
(function (dash) {
    var components;
    (function (components) {
        var Quote = (function (_super) {
            __extends(Quote, _super);
            function Quote(props) {
                var _this = _super.call(this, props) || this;
                _this.state = {};
                return _this;
            }
            Quote.prototype.componentDidUpdate = function () {
            };
            Quote.prototype.render = function () {
                var activePairClosingPrice = "-";
                var activePairPriceDiffColor = "blue";
                var activePairPriceDiffIcon = "right";
                if (this.props.open != null && this.props.close != null) {
                    var activePairClosingPrice = this.props.close.toFixed(this.props.displayDecimals);
                    if (this.props.close > this.props.open) {
                        activePairPriceDiffColor = "green";
                        activePairPriceDiffIcon = "up";
                    }
                    else if (this.props.close < this.props.open) {
                        activePairPriceDiffColor = "red";
                        activePairPriceDiffIcon = "down";
                    }
                }
                return (React.createElement("div", { id: "quote" + this.context, className: "ui " + activePairPriceDiffColor + " label" },
                    React.createElement("i", { className: "chevron " + activePairPriceDiffIcon + " icon" }),
                    activePairClosingPrice));
            };
            return Quote;
        }(React.Component));
        components.Quote = Quote;
    })(components = dash.components || (dash.components = {}));
})(dash || (dash = {}));
/// <reference path="../definitions/react.d.ts" />
/// <reference path="../interfaces.ts" />
/// <reference path="quote.tsx" />
var dash;
(function (dash) {
    var components;
    (function (components) {
        var FavoritePair = (function (_super) {
            __extends(FavoritePair, _super);
            function FavoritePair(props) {
                var _this = _super.call(this, props) || this;
                _this.state = {};
                return _this;
            }
            FavoritePair.prototype.componentDidUpdate = function (prevProps, prevState) {
                if (this.props.close != null && prevProps.close != null &&
                    prevProps.close.toFixed(this.props.displayDecimals) != this.props.close.toFixed(this.props.displayDecimals)) {
                    $("#quote_" + this.props.name).transition("pulse");
                }
            };
            FavoritePair.prototype.shouldComponentUpdate = function (nextProps, nextState) {
                return this.props.close == null ||
                    nextProps.close.toFixed(this.props.displayDecimals) != this.props.close.toFixed(this.props.displayDecimals) ||
                    this.props.isActive != nextProps.isActive;
            };
            FavoritePair.prototype.render = function () {
                var _this = this;
                var selectionIndicator = null;
                var selectionClass = ((this.props.isActive) ? "primary active " : "") +
                    "link item";
                return (React.createElement("div", { id: "quote_" + this.props.name, className: selectionClass, onClick: function (e) { return _this.props.onActivatePair(); } },
                    this.props.baseAltName,
                    " / ",
                    this.props.quoteAltName,
                    React.createElement(components.Quote, { open: this.props.open, close: this.props.close, displayDecimals: this.props.displayDecimals }),
                    "\u00A0",
                    React.createElement("i", { onClick: function (e) { return _this.props.onRemoveFromFavorites(); }, className: "remove icon" })));
            };
            return FavoritePair;
        }(React.Component));
        components.FavoritePair = FavoritePair;
    })(components = dash.components || (dash.components = {}));
})(dash || (dash = {}));
/// <reference path="interfaces.ts" />
/// <reference path="components/favoritepair.tsx" />
/// <reference path="kraken.ts" />
var dash;
(function (dash) {
    var model;
    (function (model) {
        var TradeablePair = dash.components.FavoritePair;
        var DashModel = (function () {
            function DashModel(key) {
                var _this = this;
                this.initialize = function () {
                    //load currencies
                    _this.kraken.getCurrencies(_this.loadCurrencies);
                    //afterwards, load currency pairs
                };
                this.loadCurrencies = function (jsonData) {
                    Object.keys(jsonData.result).forEach(function (key) {
                        var currency = jsonData.result[key];
                        if (key.indexOf("K") < 0) {
                            //exclude fee currency
                            var currencyObject = {
                                name: key,
                                altName: currency.altname,
                                decimals: currency.decimals,
                                displayDecimals: currency.display_decimals,
                                type: null
                            };
                            currencyObject.type = (key.indexOf("Z") == 0) ? CurrencyType.natural : CurrencyType.digital;
                            _this.currencies.push(currencyObject);
                        }
                    });
                    //load currency pairs
                    _this.kraken.getTradeablePairs(_this.loadPairs);
                    _this.notify("currenciesLoaded");
                };
                this.loadPairs = function (jsonData) {
                    Object.keys(jsonData.result).forEach(function (key) {
                        var pair = jsonData.result[key];
                        var baseCurrency = _this.currencies.filter(function (cur) { return cur.name == pair.base; })[0];
                        var quoteCurrency = _this.currencies.filter(function (cur) { return cur.name == pair.quote; })[0];
                        if (key.indexOf(".d") < 0) {
                            _this.pairs.push({
                                name: key,
                                altName: baseCurrency.altName + " / " + quoteCurrency.altName,
                                base: baseCurrency,
                                quote: quoteCurrency,
                                pairDecimals: pair.pair_decimals
                            });
                            //initialize ohlc map
                            _this.ohlc[key] = {
                                current: null,
                                previous: null,
                                intradayRecords: [],
                                weeklyRecords: [],
                                monthlyRecords: []
                            };
                            //initialize trades map
                            _this.trades[key] = [];
                        }
                    });
                    _this.notify("pairsLoaded");
                };
                this.getIntradayOhlc = function (pairToSelect) {
                    _this.kraken.getOhlc(pairToSelect, _this.ohlc[pairToSelect.name].current != null ?
                        _this.ohlc[pairToSelect.name].current[0] / 1000 :
                        (function (now) { return new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime() / 1000; }(new Date(Date.now()))), 15, _this.loadIntradayOhlc);
                };
                this.loadIntradayOhlc = function (jsonData) {
                    var key = Object.keys(jsonData.result)[0];
                    jsonData.result[key].forEach(function (record) {
                        _this.ohlc[key].intradayRecords.push([
                            parseFloat(record[0]) * 1000,
                            parseFloat(record[1]),
                            parseFloat(record[2]),
                            parseFloat(record[3]),
                            parseFloat(record[4])
                        ]);
                    });
                    _this.ohlc[key].previous = _this.ohlc[key].current;
                    _this.ohlc[key].current = _this.ohlc[key].intradayRecords[_this.ohlc[key].intradayRecords.length - 1];
                    _this.notify();
                };
                this.getTrades = function (pairToSelect) {
                    _this.kraken.getTrades(pairToSelect, _this.trades[pairToSelect.name].length ?
                        _this.trades[pairToSelect.name][_this.trades[pairToSelect.name].length - 1].time.getTime() / 1000 : null, _this.loadTrades);
                };
                this.loadTrades = function (jsonData) {
                    var key = Object.keys(jsonData.result)[0];
                    jsonData.result[key].reverse().forEach(function (record) {
                        _this.trades[key].push({
                            time: new Date(parseFloat(record[2]) * 1000),
                            price: parseFloat(record[0]),
                            volume: parseFloat(record[1])
                        });
                    });
                    _this.notify();
                };
                this.subscribe = function (callback, event) {
                    if (event === void 0) { event = ""; }
                    if (_this.subscribers[event] == undefined) {
                        _this.subscribers[event] = [];
                    }
                    _this.subscribers[event].push(callback);
                };
                this.notify = function (event) {
                    if (event === void 0) { event = ""; }
                    if (event != "") {
                        _this.subscribers[""].forEach(function (callback) { callback(); });
                    }
                    if (_this.subscribers[event] != undefined) {
                        _this.subscribers[event].forEach(function (callback) { callback(); });
                    }
                };
                this.key = key;
                this.currencies = [];
                this.pairs = [];
                this.subscribers = {};
                this.subscribers[""] = [];
                this.ohlc = {};
                this.trades = {};
                this.kraken = new Kraken();
            }
            return DashModel;
        }());
        model.DashModel = DashModel;
    })(model = dash.model || (dash.model = {}));
})(dash || (dash = {}));
var Test = (function () {
    function Test(message) {
        var _this = this;
        this.Counter = 0;
        this.updateCounter = function () {
            _this.Counter++;
            _this.showMessage();
        };
        this.showMessage = function () {
            console.log(_this.Message + " " + _this.Counter);
        };
        this.stopCounter = function () {
            clearInterval(_this.CounterHolder);
        };
        this.Message = message;
        this.CounterHolder = setInterval(this.updateCounter, 1000);
    }
    return Test;
}());
// var test = new Test("hoi");
// test.showMessage();
// test.showMessage(); 
/// <reference path="../definitions/react.d.ts" />
/// <reference path="../interfaces.ts" />
var dash;
(function (dash) {
    var components;
    (function (components) {
        var Details = (function (_super) {
            __extends(Details, _super);
            function Details() {
                var _this = _super !== null && _super.apply(this, arguments) || this;
                _this.refresh = function (e) {
                    _this.props.onRefresh();
                };
                _this.showGraph = function () {
                    $(".details .tab").removeClass("active");
                    $(".details button").removeClass("active");
                    $(".details button#graphButton").addClass("active");
                    $(".tab#ohlcchart").addClass("active");
                };
                _this.showTrades = function () {
                    $(".details .tab").removeClass("active");
                    $(".details button").removeClass("active");
                    $(".details button#tradesButton").addClass("active");
                    $(".tab#trades").addClass("active");
                };
                _this.setChartView = function (chartView) {
                    _this.setState({
                        chartView: chartView
                    });
                };
                _this.drawOhlcChart = function () {
                    if (_this.props.pair != null) {
                        _this.chart = new Highcharts.Chart({
                            title: {
                                text: ""
                            },
                            chart: {
                                renderTo: "ohlcchart"
                            },
                            series: [{
                                    name: _this.props.pair.altName + " price",
                                    type: "ohlc",
                                    data: _this.props.ohlc.intradayRecords
                                }],
                            xAxis: {
                                type: "datetime",
                                minTickInterval: 1000
                            },
                            yAxis: {
                                title: "Price"
                            }
                        });
                    }
                };
                _this.componentDidUpdate = function () {
                    _this.drawOhlcChart();
                };
                _this.componentWillUnmount = function () {
                    _this.chart.destroy();
                };
                return _this;
            }
            Details.prototype.render = function () {
                var _this = this;
                var tradeList = this.props.trades.map(function (trade) {
                    return (React.createElement("tr", null,
                        React.createElement("td", null,
                            trade.time.toLocaleDateString(),
                            " ",
                            trade.time.toLocaleTimeString()),
                        React.createElement("td", null, trade.price.toFixed(_this.props.displayDecimals)),
                        React.createElement("td", null, trade.volume),
                        React.createElement("td", null, (trade.price * trade.volume).toFixed(_this.props.displayDecimals))));
                });
                return (React.createElement("div", { className: "ui raised teal segment" },
                    React.createElement("div", { className: "ui secondary menu" },
                        React.createElement("div", { className: "header item" },
                            this.props.pairName,
                            React.createElement(components.Quote, { open: this.props.open, close: this.props.close, displayDecimals: this.props.displayDecimals })),
                        React.createElement("div", { className: "right menu" },
                            React.createElement("div", { className: "item" },
                                React.createElement("div", { className: "ui buttons" },
                                    React.createElement("button", { id: "graphButton", className: "ui active icon button", onClick: function (e) { return _this.showGraph(); } },
                                        React.createElement("i", { className: "line graph icon" })),
                                    React.createElement("button", { id: "tradesButton", className: "ui icon button", onClick: function (e) { return _this.showTrades(); } },
                                        React.createElement("i", { className: "list icon" })))),
                            React.createElement("div", { className: "item" },
                                React.createElement("button", { className: "ui icon button", onClick: function (e) { return _this.refresh(e); } },
                                    React.createElement("i", { className: "refresh icon", id: "detailloadicon" }))))),
                    React.createElement("div", { className: "ui bordered tab active" },
                        React.createElement("div", { className: "ui tiny buttons" },
                            React.createElement("button", { id: "intradayButton", className: "tiny ui active button", onClick: function (e) { return _this.setChartView(ChartView.Intraday); } }, "Intraday"),
                            React.createElement("button", { id: "tradesButton", className: "tiny ui button", onClick: function (e) { return _this.setChartView(ChartView.Weekly); } }, "Weekly"),
                            React.createElement("button", { id: "tradesButton", className: "tiny ui button", onClick: function (e) { return _this.setChartView(ChartView.Monthly); } }, "Monthly"),
                            React.createElement("button", { id: "tradesButton", className: "tiny ui button", onClick: function (e) { return _this.setChartView(ChartView.All); } }, "All")),
                        React.createElement("div", { className: "ui divider" }),
                        React.createElement("div", { id: "ohlcchart" })),
                    React.createElement("div", { className: "ui bordered tab", id: "trades" },
                        React.createElement("h2", null,
                            "Recent trades in ",
                            this.props.pairName),
                        React.createElement("table", { className: "ui celled table" },
                            React.createElement("thead", null,
                                React.createElement("tr", null,
                                    React.createElement("th", null, "Time"),
                                    React.createElement("th", null, "Price"),
                                    React.createElement("th", null, "Volume"),
                                    React.createElement("th", null, "Trade value"))),
                            React.createElement("tbody", null, tradeList)))));
            };
            return Details;
        }(React.Component));
        components.Details = Details;
    })(components = dash.components || (dash.components = {}));
})(dash || (dash = {}));
/// <reference path="../definitions/react.d.ts" />
/// <reference path="../definitions/react-dom.d.ts" />
/// <reference path="../definitions/highcharts.d.ts" />
/// <reference path="../definitions/highstock.d.ts" />
/// <reference path="../interfaces.ts" />
/// <reference path="../model.ts" />
/// <reference path="favoritepair.tsx" />
/// <reference path="details.tsx" />
var dash;
(function (dash) {
    var components;
    (function (components) {
        var Dash = (function (_super) {
            __extends(Dash, _super);
            function Dash(props) {
                var _this = _super.call(this, props) || this;
                _this.setDefaultFavoritePairs = function () {
                    var defaultFavoritePairs = [
                        "XETHZEUR",
                        "XETHZUSD",
                        "XXBTZEUR",
                        "XXBTZUSD",
                        "XETHXXBT"
                    ];
                    _this.props.model.pairs.forEach(function (pair) {
                        if (defaultFavoritePairs.some(function (favorite) { return favorite == pair.name; })) {
                            _this.state.favoritePairs.push(pair);
                        }
                    });
                    _this.updateFavorites();
                    _this.ohlcTicker = setInterval(_this.updateFavorites, 10000);
                    _this.selectPair(_this.state.favoritePairs[0]);
                    _this.setState({ isLoading: false });
                };
                _this.updateFavorites = function () {
                    _this.state.favoritePairs.forEach(function (pair) {
                        _this.props.model.getIntradayOhlc(pair);
                    });
                    if (_this.state.activePair != null) {
                        _this.props.model.getTrades(_this.state.activePair);
                    }
                };
                _this.selectPair = function (pairToSelect) {
                    _this.setState({
                        activePair: pairToSelect
                    });
                    _this.render();
                };
                _this.addPairToFavorites = function (pairToAdd) {
                    _this.state.favoritePairs.push(pairToAdd);
                    _this.render();
                };
                _this.removePairFromFavorites = function (pairToRemove) {
                    _this.setState({
                        activePair: _this.state.activePair.name == pairToRemove.name ? null : _this.state.activePair,
                        favoritePairs: _this.state.favoritePairs.filter(function (pair) { return pair.name != pairToRemove.name; })
                    });
                };
                _this.state = {
                    isLoading: true,
                    activePair: null,
                    favoritePairs: []
                };
                _this.props.model.initialize();
                _this.props.model.subscribe(_this.setDefaultFavoritePairs, "pairsLoaded");
                return _this;
            }
            Dash.prototype.componentDidUpdate = function () {
                var _this = this;
                $(".ui.search").search({
                    source: this.props.model.pairs,
                    searchFullText: false,
                    searchFields: [
                        "name",
                        "altName",
                        "base.altName",
                        "quote.altName"
                    ],
                    fields: {
                        title: "altName"
                    },
                    onSelect: function (result) {
                        _this.addPairToFavorites(result);
                        _this.selectPair(result);
                        if (_this.pairSearch != null) {
                            _this.pairSearch.value = "";
                        }
                    }
                });
            };
            Dash.prototype.render = function () {
                var _this = this;
                var activePair = this.state.activePair;
                var activeOhlc = activePair != null ? (this.props.model.ohlc[activePair.name].current != null) ? this.props.model.ohlc[activePair.name].current : null : null;
                var dimmerState = ((this.state.isLoading) ? "active " : "");
                var pairs = this.state.favoritePairs.map(function (pair) {
                    var pairOhlc = this.props.model.ohlc[pair.name].current;
                    return (React.createElement(components.FavoritePair, { name: pair.name, base: pair.base.name, baseAltName: pair.base.altName, quote: pair.quote.name, quoteAltName: pair.quote.altName, open: pairOhlc != null ? pairOhlc[1] : null, close: pairOhlc != null ? pairOhlc[4] : null, displayDecimals: pair.quote.displayDecimals, onActivatePair: this.selectPair.bind(this, pair), onRemoveFromFavorites: this.removePairFromFavorites.bind(this, pair), isActive: pair === this.state.activePair }));
                }, this);
                if (this.state.favoritePairs.length < 5) {
                    pairs.push(React.createElement("div", { id: "pairSearch", className: "ui search item" },
                        React.createElement("div", { className: "ui transparent icon input" },
                            React.createElement("input", { className: "prompt", ref: function (input) { _this.pairSearch = input; }, type: "text", placeholder: "Search pair" }),
                            React.createElement("i", { className: "search link icon" })),
                        React.createElement("div", { className: "results" })));
                }
                var details = (activePair != null) ? (React.createElement(components.Details, { pairName: activePair.altName, open: activeOhlc != null ? activeOhlc[1] : null, close: activeOhlc != null ? activeOhlc[4] : null, displayDecimals: activePair.quote.displayDecimals, pair: activePair, ohlc: this.props.model.ohlc[activePair.name], trades: this.props.model.trades[activePair.name].slice(0, 20), onRefresh: this.render.bind(this) })) : (React.createElement("div", null));
                return (React.createElement("section", null,
                    React.createElement("div", { className: "ui inverted teal main menu" },
                        React.createElement("div", { className: "header item" },
                            React.createElement("i", { className: "line chart icon" }),
                            "Coindash")),
                    React.createElement("div", { className: "ui menu" }, pairs),
                    React.createElement("div", { className: "ui " + dimmerState + " dimmer" },
                        React.createElement("div", { className: "ui large text loader" }, "Loading")),
                    React.createElement("div", { className: "details" }, details)));
            };
            return Dash;
        }(React.Component));
        components.Dash = Dash;
        var model = new dash.model.DashModel("dash.model");
        model.subscribe(render);
        render();
        function render() {
            ReactDOM.render(React.createElement(Dash, { model: model }), $("#output")[0]);
        }
    })(components = dash.components || (dash.components = {}));
})(dash || (dash = {}));
//# sourceMappingURL=dash.js.map