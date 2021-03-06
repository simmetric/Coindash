class Test {
    private Counter = 0;
    private Message: string;
    private CounterHolder: number;

    constructor(message: string) {
        this.Message = message;
        this.CounterHolder = setInterval(this.updateCounter, 1000)
    }

    updateCounter=() => {
        this.Counter++;
        this.showMessage();
    }

    showMessage=() => {
        console.log(this.Message + " " + this.Counter);
    }

    stopCounter=() => {
        clearInterval(this.CounterHolder);
    }
}