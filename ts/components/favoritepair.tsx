/// <reference path="../definitions/react.d.ts" />
/// <reference path="../interfaces.ts" />
/// <reference path="quote.tsx" />

namespace dash.components {

    export class FavoritePair extends React.Component<ICurrencyPairProps, ICurrencyPairState> {
        constructor(props: ICurrencyPairProps) {
            super(props);
            this.state = { };
        }

        componentDidUpdate(prevProps, prevState) {
            if (this.props.close != null && prevProps.close != null && 
                prevProps.close.toFixed(this.props.displayDecimals) != this.props.close.toFixed(this.props.displayDecimals))
            {
                $("#quote_" + this.props.name).transition("pulse");
            }
        }

        shouldComponentUpdate(nextProps, nextState) {
            return this.props.close == null ||
                nextProps.close.toFixed(this.props.displayDecimals) != this.props.close.toFixed(this.props.displayDecimals) ||
                this.props.isActive != nextProps.isActive;                
        }

        render() {
            var selectionIndicator = null;
            var selectionClass = ((this.props.isActive) ? "primary active " : "") + 
                "link item";

            return (
                <div id={"quote_" + this.props.name} className={selectionClass} onClick={e => this.props.onActivatePair()}>
                    {this.props.baseAltName} / {this.props.quoteAltName}                    

                    <Quote
                        open={this.props.open}
                        close={this.props.close}
                        displayDecimals={this.props.displayDecimals}
                    />
                    &nbsp;
                    <i onClick={e => this.props.onRemoveFromFavorites() } className="remove icon"></i>
                </div>
            );
        }
    }
}