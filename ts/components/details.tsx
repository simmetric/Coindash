/// <reference path="../definitions/react.d.ts" />
/// <reference path="../interfaces.ts" />

namespace dash.components {
    export class Details extends React.Component<IDetailsProps, IDetailsState> {

        chart: Highcharts.ChartObject;
        refresh = () => {
            this.props.onRefresh();
        }

        showGraph = () => {
            $(".details .tab").removeClass("active");
            $(".details button").removeClass("active");

            $(".details button#graphButton").addClass("active");
            $(".tab#ohlcchart").addClass("active");
        }

        showTrades = () => {
            $(".details .tab").removeClass("active");
            $(".details button").removeClass("active");

            $(".details button#tradesButton").addClass("active");
            $(".tab#trades").addClass("active");
        }

        setChartView = (chartView: ChartView) => {
            this.setState({
                chartView: chartView
            });
        }

        drawOhlcChart = () => {
            let chartData = this.props.ohlc.intradayRecords;
            let currentChartView = this.state != null ? this.state.chartView : ChartView.Intraday;
            switch (currentChartView) {
                case ChartView.Monthly:
                    chartData = this.props.ohlc.weeklyRecords;
                    break;
                case ChartView.Weekly:
                    chartData = this.props.ohlc.monthlyRecords;
                    break;
            }

            if (this.props.pair != null) {
                this.chart = new Highcharts.Chart({
                    title: {
                        text: ""
                    },
                    chart: {
                        renderTo: "chartarea"
                    },
                    series: [{
                        name: this.props.pair.altName + " price",
                        type: "ohlc",
                        data: chartData
                    }],
                    xAxis: {
                        type: "datetime",
                        minTickInterval: 1000
                    },
                    yAxis: {
                        title: {
                            text: "Price"
                        }
                    }
                });
            }
        }

        componentDidUpdate = () => {
            this.drawOhlcChart();
        }

        public componentWillUnmount = () => {
            this.chart.destroy();
        }

        render() {
            var tradeList = this.props.trades.map(trade => {
                return (
                    <tr>
                        <td>{trade.time.toLocaleDateString()} {trade.time.toLocaleTimeString()}</td>
                        <td>{trade.price.toFixed(this.props.displayDecimals)}</td>
                        <td>{trade.volume}</td>
                        <td>{(trade.price * trade.volume).toFixed(this.props.displayDecimals)}</td>
                    </tr>
                );
            });

            return (
                <div className="ui raised teal segment">
                    <div className="ui secondary menu">
                        <div className="header item">
                            {this.props.pairName}
                            <Quote
                                open={this.props.open}
                                close={this.props.close}
                                displayDecimals={this.props.displayDecimals}
                            />
                        </div>
                        <div className="right menu">
                            <div className="item">
                                <div className="ui buttons">
                                    <button id="graphButton" className="ui active icon button" onClick={e => this.showGraph()}>
                                        <i className="line graph icon"></i>
                                    </button>
                                    <button id="tradesButton" className="ui icon button" onClick={e => this.showTrades()}>
                                        <i className="list icon"></i>
                                    </button>
                                </div>
                            </div>
                            <div className="item">
                                <button className="ui icon button"
                                    onClick={() => this.refresh()}>
                                    <i className="refresh icon" id="detailloadicon"></i>
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="ui bordered tab active" id="ohlcchart">
                        <div className="ui tiny buttons">
                            <button id="intradayButton" className={this.state != null && this.state.chartView == ChartView.Intraday ? "tiny active ui button" : "tiny ui button"} onClick={e => this.setChartView(ChartView.Intraday)}>
                                Intraday
                            </button>
                            <button id="tradesButton" className={this.state != null && this.state.chartView == ChartView.Weekly ? "tiny active ui button" : "tiny ui button"} onClick={e => this.setChartView(ChartView.Weekly)}>
                                Weekly
                            </button>
                            <button id="tradesButton" className={this.state != null && this.state.chartView == ChartView.Monthly ? "tiny active ui button" : "tiny ui button"} onClick={e => this.setChartView(ChartView.Monthly)}>
                                Monthly
                            </button>
                            <button id="tradesButton" className={this.state != null && this.state.chartView == ChartView.All ? "tiny active ui button" : "tiny ui button"} onClick={e => this.setChartView(ChartView.All)}>
                                All
                            </button>
                        </div>
                        <div className="ui divider"></div>
                        <div id="chartarea"></div>
                    </div>
                    <div className="ui bordered tab" id="trades">
                        <h2>Recent trades in {this.props.pairName}</h2>
                        <table className="ui celled table">
                            <thead>
                                <tr>
                                    <th>Time</th>
                                    <th>Price</th>
                                    <th>Volume</th>
                                    <th>Trade value</th>
                                </tr>
                            </thead>
                            <tbody>
                                {tradeList}
                            </tbody>
                        </table>
                    </div>
                </div>
            );
        }
    }
}