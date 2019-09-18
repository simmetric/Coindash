enum CurrencyType {
    natural,
    digital
}

interface ICurrency {
    name : string;
    altName : string;
    decimals : number;
    displayDecimals : number;
    type : CurrencyType;
}

interface ICurrencyPair {
    name : string;
    altName : string;
    base : ICurrency;
    quote : ICurrency;
    pairDecimals : number;
}

interface IOhlcTick {
    time : number;
    open : number;
    high : number;
    low :  number;
    close : number;
}

interface ITrade {
    time : Date;
    price : number;
    volume : number;
}

interface IOhlcHistory {
    current : Array<number>;
    previous : Array<number>;
    intradayRecords : Array<Array<number>>;
    weeklyRecords : Array<Array<number>>;
    monthlyRecords : Array<Array<number>>;
}

interface ICurrencyPairProps {
    name : string;
    base : string,
    baseAltName : string;
    quote : string,
    quoteAltName : string;
    open : number;
    close : number;
    displayDecimals : number;
    isActive : boolean;
    onActivatePair : () => void;
    onRemoveFromFavorites : () => void;
}

interface ICurrencyPairState {
}

interface IQuoteProps {
    open : number;
    close : number;
    displayDecimals : number;
}

interface IQuoteState {

}

interface IDetailsProps {
    pair: ICurrencyPair;
    pairName: string;
    open: number;
    close: number;
    displayDecimals: number;
    ohlc: IOhlcHistory;
    trades: Array<ITrade>;
    onRefresh : () => void;
}

interface IDetailsState {
    chartView: ChartView; 
}

interface IDashProps {
    model : IDashModel;
}

interface IDashState {
    isLoading : boolean;
    activePair : ICurrencyPair;
    favoritePairs : Array<ICurrencyPair>;
}

interface IDashModel {
    key : any;
    currencies : Array<ICurrency>;
    pairs : Array<ICurrencyPair>;
    ohlc : { [key : string]: IOhlcHistory };
    trades : { [key : string]: Array<ITrade>};
    subscribers : {[event: string]: Array<any>};
    initialize();
    getIntradayOhlc(pair: ICurrencyPair);
    getWeeklyOhlc(pair: ICurrencyPair);
    getTrades(pair: ICurrencyPair);
    subscribe(callback : any, event? : string);
    notify(event? : string);
}

enum ChartView {
    Intraday,
    Weekly,
    Monthly,
    All
}