import EventStack from "./stack";

type EventStackEvent<T extends any[] = any[]> = ((... arg: T) => void)|EventStack<T>;

export default EventStackEvent;