import EventCall from "./call";
import EventManager from "./manager";
import EventStackEvent from "./type";

class EventStack<T extends any[] = any[]>{
    event_managers: EventManager<T>[] = [];
    runner: ((... arg: T) => void)|undefined = undefined;
    name: string|undefined = undefined;
    expiration_date: number|undefined = undefined;
    maximum_call: number|undefined = undefined;
    tags: string[] = [];
    calls: EventCall<T>[] = [];

    static from<T extends any[] = any[]>(from: EventStackEvent<T>): EventStack<T> {
        if (from instanceof EventStack){
            return from;
        }

        return this.fromRunner<T>(from);
    }

    static maximum<T extends any[] = any[]>(from: EventStackEvent<T>, maximum: number): EventStack<T> {
        const result = this.from<T>(from);

        result.setMaximumCall(maximum);

        return result;
    }

    static next<T extends any[] = any[]>(from: EventStackEvent<T>): EventStack<T> {
        return this.maximum<T>(from,1);
    }

    static once<T extends any[] = any[]>(from: EventStackEvent<T>): EventStack<T> {
        return this.maximum<T>(from,1);
    }

    static fromRunner<T extends any[] = any[]>(funct: ((... arg: T) => void)): EventStack<T> {
        return (new this as EventStack<T>).setFunction(funct);
    }

    setAvailableCall(call = 1): this {
        this.setMaximumCall(this.countCalled() + call);

        return this;
    }

    addCall(call: EventCall<T>|EventCall<T>[]): this {
        if (Array.isArray(call)){
            for(const item of call){
                this.addCall(item);
            }

            return this;
        }

        if (this.hasCall(call)){
            return this;
        }

        this.calls.push(call);
        call.addStack(this);

        return this;
    }

    removeCall(call: EventCall<T>|EventCall<T>[]): this {
        if (Array.isArray(call)){
            for(const item of call){
                this.removeCall(item);
            }

            return this;
        }

        while(true){
            const index = this.calls.indexOf(call);
            if (index < 0){
                break;
            }

            this.calls.slice(index,1);
            call.removeStack(this);
        }

        return this;
    }

    getCalls(): EventCall<T>[] {
        return this.calls;
    }

    getExecutedCalls(): EventCall<T>[]{
        return this.getCalls().filter(call => call.hasBeenCalled());
    }

    hasCall(call: EventCall<T>): boolean {
        return this.getCalls().indexOf(call) >= 0;
    }

    run(call: EventCall<T>): this {
        if (this.hasRunner()){
            if (typeof call === "undefined"){
                const e = new EventCall();
                e.addStack(this);
                e.run();

                return this;
            }

            (this.getRunner())(... call.getParameters());
        }

        return this;
    }

    bind(runner: ((... arg: T) => void)): this {
        return this.setFunction(runner);
    }

    setFunction(runner: ((... arg: T) => void)): this {
        if (this.runner === runner){
            return this;
        }

        this.removeRunner();
        this.runner = runner;

        return this;
    }

    hasRunner(): boolean {
        return typeof this.runner !== "undefined";
    }

    getRunner(): ((... arg: T) => void) {
        if (!this.hasRunner()){
            throw new Error();
        }

        return this.runner;
    }

    removeRunner(): this {
        this.runner = null;

        return this;
    }

    getMaximumCall(): number {
        if (!this.hasMaximumCall()){
            throw new Error();
        }

        return this.maximum_call;
    }

    hasMaximumCall(): boolean {
        return this.maximum_call !== null;
    }

    setMaximumCall(maximum_call: number): this {
        if (this.maximum_call === maximum_call){
            return this;
        }

        this.removeMaximumCall();
        this.maximum_call = maximum_call;

        return this;
    }

    removeMaximumCall(): this {
        this.maximum_call = null;

        return this;
    }

    getExpirationDate(): number {
        if (!this.hasExpirationDate()){
            throw new Error();
        }

        return this.expiration_date;
    }

    hasExpirationDate(): boolean {
        return typeof this.expiration_date !== "undefined";
    }

    setExpirationDate(expiration_date: number): this {
        if (this.expiration_date === expiration_date){
            return this;
        }

        this.removeExpirationDate();
        this.expiration_date = expiration_date;

        return this;
    }

    removeExpirationDate(): this {
        this.expiration_date = null;

        return this;
    }

    getName(): string {
        if (!this.hasName()){
            throw new Error();
        }

        return this.name;
    }

    hasName(): boolean {
        return typeof this.name !== "undefined";
    }

    setName(name: string): this {
        if (this.name === name){
            return this;
        }

        for(const manager of this.getEventGestures()){
            if (manager.hasStackName(name)){
                throw new Error();
            }
        }

        this.removeName();
        this.name = name;

        return this;
    }

    removeName(): this {
        this.name = null;

        return this;
    }

    addEventGesture(event_manager: EventManager<T>): this {
        if (Array.isArray(event_manager)){
            for(const item of event_manager){
                this.addEventGesture(item);
            }

            return this;
        }

        if (this.hasEventGesture(event_manager)){
            return this;
        }

        this.event_managers.push(event_manager);
        event_manager.addStack(this);

        return this;
    }

    getEventGestures(): EventManager<T>[] {
        return this.event_managers;
    }

    hasEventGesture(event_manager: EventManager<T>): boolean{
        return this.getEventGestures().indexOf(event_manager) >= 0;
    }

    addTag(tag: string|string[]): this {
        if (Array.isArray(tag)){
            for(const item of tag){
                this.addTag(item);
            }

            return this;
        }

        if (this.hasTag(tag)){
            return this;
        }

        this.tags.push(tag);

        return this;
    }

    getTags(): string[] {
        return this.tags;
    }

    removeTag(tag: string|string[]): this {
        if (Array.isArray(tag)){
            for(const item of tag){
                this.removeTag(item);
            }

            return this;
        }

        while(true){
            const index = this.tags.indexOf(tag);
            if (index >= 0){
                this.tags.slice(index,1);
            }else{
                break;
            }
        }

        return this;
    }

    hasTag(tag: string): boolean {
        return this.getTags().indexOf(tag) >= 0;
    }

    countCalled(): number {
        return this.getCalls().length;
    }

    isAlive(date = performance.now()): boolean {
        if (this.hasMaximumCall() && this.getMaximumCall() > this.countCalled()){
            return false;
        }

        if (this.hasExpirationDate() && this.getExpirationDate() < date){
            return false;
        }

        return true;
    }
}

export default EventStack;