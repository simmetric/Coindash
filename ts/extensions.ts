interface Array<T> {
    find(predicate: (search: T) => boolean) : T;
}
interface Date {
    getStartOfWeek(): Date;
}

Date.prototype.getStartOfWeek = function (){
    let self = this as Date;
    console.log("getStartOfWeek begins with: " + self);
    let day = self.getDay(), diff = self.getDate() - day + (day == 0 ? -6 : 1);
    console.log("diff: " + diff);
    let newDate = new Date(self.setDate(diff));
    console.log("result: " + newDate);
    return newDate;
}