import EventStack from "./stack";
import EventManager from "./manager";

class EventCall<T extends any[] = any[]>{
    events_stacks: EventStack[] = [];
    event_manager: EventManager|undefined = undefined;
    called_at: undefined|number = undefined;
    parameters: T|undefined = undefined;

    run(date = performance.now()): this {
        this.setCalledAt(date);

        for(const stack of this.getStacks()){
            stack.run(this);
        }

        return this;
    }

    addStack(stack: EventStack|EventStack[]): this {
        if (Array.isArray(stack)){
            for(const item of stack){
                this.addStack(item);
            }

            return this;
        }

        if (this.hasStack(stack)){
            return this;
        }

        if (this.hasBeenCalled()){
            throw new Error("You cannot add stack when the event has been called.");
        }

        this.events_stacks.push(stack);
        stack.addCall(this);

        return this;
    }

    getStacks(): EventStack[] {
        return this.events_stacks;
    }

    removeStack(stack: EventStack|EventStack[]): this {
        if (Array.isArray(stack)){
            for(const item of stack){
                this.removeStack(item);
            }

            return this;
        }

        if (this.hasBeenCalled()){
            throw new Error();
        }

        while(true){
            const index = this.events_stacks.indexOf(stack);
            if (index < 0){
                break;
            }

            this.events_stacks.slice(index,1);
            stack.removeCall(this);
        }

        return this;
    }

    hasStack(stack: EventStack): boolean {
        return this.getStacks().indexOf(stack) >= 0;
    }

    getEventManager(): EventManager {
        if (!this.hasEventManager()){
            throw new Error();
        }

        return this.event_manager;
    }

    hasEventManager(): boolean {
        return typeof this.event_manager !== "undefined";
    }

    setEventManager(event_manager: EventManager): this{
        if (this.event_manager === event_manager){
            return this;
        }

        this.removeEventManager();

        this.event_manager = event_manager;

        return this;
    }

    removeEventManager(): this {
        if (this.hasBeenCalled()){
            throw new Error("You cannot detach the event manager to the current event call, because the current event call has been called");
        }

        this.event_manager = null;

        return this;
    }

    getParameters(): T {
        return this.parameters;
    }

    setParameters(parameters: T){
        if (this.hasBeenCalled()){
            throw new Error("You cannot set the parameters values, because the current event call has been called");
        }

        this.parameters = parameters;

        return this;
    }

    getCalledAt(): number {
        if (!this.hasBeenCalled()){
            throw new Error("You cannot get when the event has been called, because the event has not been called.");
        }

        return this.called_at;
    }

    setCalledAt(called_at = performance.now()): this {
        if (this.hasBeenCalled()){
            throw new Error("You edit when the event has been fired because the event call already have been called.");
        }

        this.called_at = called_at;

        return this;
    }

    hasBeenCalled(): boolean{
        return typeof this.called_at !== "undefined";
    }
}

export default EventCall;