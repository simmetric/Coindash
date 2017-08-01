/// <reference path="../definitions/react.d.ts" />
/// <reference path="../definitions/react-dom.d.ts" />
/// <reference path="../definitions/highcharts.d.ts" />
/// <reference path="../definitions/highstock.d.ts" />
/// <reference path="../interfaces.ts" />
/// <reference path="../model.ts" />
/// <reference path="favoritepair.tsx" />
/// <reference path="details.tsx" />

namespace dash.components {
    export class Dash extends React.Component<IDashProps, IDashState> {
        ohlcTicker : any;
        tradesTicker : any;
        pairSearch : HTMLInputElement;

        constructor(props: IDashProps) {
            super(props);
            this.state = {
                isLoading : true,
                activePair : null,
                favoritePairs : []
            }

            this.props.model.initialize();
            this.props.model.subscribe(this.setDefaultFavoritePairs, "pairsLoaded");
        }

        setDefaultFavoritePairs=() => {
            const defaultFavoritePairs = [
                "XETHZEUR",
                "XETHZUSD",
                "XXBTZEUR",
                "XXBTZUSD",
                "XETHXXBT"
            ];

            this.props.model.pairs.forEach((pair) => {
                if (defaultFavoritePairs.some((favorite)=>favorite == pair.name)) {
                    this.state.favoritePairs.push(pair);
                }
            });

            this.updateFavorites();
            this.ohlcTicker = setInterval(this.updateFavorites, 10000);

            this.selectPair(this.state.favoritePairs[0]);

            this.setState({isLoading : false});
        }

        updateFavorites=() => {
            this.state.favoritePairs.forEach((pair) => {
                this.props.model.getIntradayOhlc(pair);
            });
            
            if (this.state.activePair != null) {
                this.props.model.getTrades(this.state.activePair);
            }
        }

        public selectPair=(pairToSelect) => {
            this.setState({
                activePair : pairToSelect
            });

            this.render();
        }

        public addPairToFavorites=(pairToAdd) => {
            this.state.favoritePairs.push(pairToAdd);

            this.render();
        }

        public removePairFromFavorites=(pairToRemove) => {
            this.setState({
                activePair : this.state.activePair.name == pairToRemove.name ? null : this.state.activePair,
                favoritePairs : this.state.favoritePairs.filter(pair => pair.name != pairToRemove.name)
            });
        }

        componentDidUpdate() {
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
                onSelect: (result) => {
                    this.addPairToFavorites(result);
                    this.selectPair(result);
                    if (this.pairSearch != null) {
                        this.pairSearch.value = "";
                    }
                }
            });
        }

        public render() {
            var activePair = this.state.activePair;
            var activeOhlc = activePair != null ? (this.props.model.ohlc[activePair.name].current != null) ? this.props.model.ohlc[activePair.name].current : null : null;
            var dimmerState = ((this.state.isLoading) ? "active " : "");

            var pairs = this.state.favoritePairs.map(function (pair) {
                var pairOhlc = this.props.model.ohlc[pair.name].current;

                return (
                    <FavoritePair
                        name={pair.name}
                        base={pair.base.name}
                        baseAltName={pair.base.altName}
                        quote={pair.quote.name}
                        quoteAltName={pair.quote.altName}
                        open={pairOhlc != null ? pairOhlc[1] : null}
                        close={pairOhlc != null ? pairOhlc[4] : null}
                        displayDecimals={pair.quote.displayDecimals}
                        onActivatePair={this.selectPair.bind(this, pair)}
                        onRemoveFromFavorites={this.removePairFromFavorites.bind(this, pair)}
                        isActive={pair === this.state.activePair}
                    />
                );
            }, this);

            if (this.state.favoritePairs.length < 5)
            {
                pairs.push(
                    <div id="pairSearch" className="ui search item">
                        <div className="ui transparent icon input">
                            <input className="prompt" ref={(input) => { this.pairSearch = input;}} type="text" placeholder="Search pair" />
                            <i className="search link icon"></i>
                        </div>
                        <div className="results"></div>
                    </div>);              
            }

            var details = (activePair != null) ? (
                <Details
                    pairName={activePair.altName}
                    open={activeOhlc != null ? activeOhlc[1] : null}
                    close={activeOhlc != null ? activeOhlc[4] : null}
                    displayDecimals={activePair.quote.displayDecimals}
                    pair={activePair}
                    ohlc={this.props.model.ohlc[activePair.name]}
                    trades={this.props.model.trades[activePair.name].slice(0, 20)}
                    onRefresh={this.render.bind(this)}
                    />
            ) : (<div></div>);

            return (
                <section>
                    <div className="ui inverted teal main menu">
                        <div className="header item">
                            <i className="line chart icon"></i>
                            Coindash
                        </div>                        
                    </div>

                    <div className="ui menu">
                        {pairs}
                    </div>

                    <div className={"ui " + dimmerState + " dimmer"}>
                        <div className="ui large text loader">Loading</div>
                    </div>
                    
                    <div className="details">
                        {details}
                    </div>
                </section>
            );
        }
    }

    var model = new dash.model.DashModel("dash.model");

    model.subscribe(render);
    render();

    function render() {
        ReactDOM.render(
            <Dash model={model} />, 
            $("#output")[0]
        );
    }
}