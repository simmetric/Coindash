/// <reference path="../definitions/react.d.ts" />
/// <reference path="../interfaces.ts" />

namespace dash.components {
    export class Quote extends React.Component<IQuoteProps, IQuoteState> {
        constructor(props: IQuoteProps) {
            super(props);
            this.state = {};
        }

        componentDidUpdate() {

        }

        render() {
            var activePairClosingPrice = "-";
            var activePairPriceDiffColor = "blue"
            var activePairPriceDiffIcon = "right"

            if(this.props.open != null && this.props.close != null) {
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

            return (
                <div id={"quote" + this.context} className={"ui " + activePairPriceDiffColor + " label"}>
                    <i className={"chevron " + activePairPriceDiffIcon + " icon"}></i>
                    {activePairClosingPrice}
                </div>
            )
        }
    }
}