import EventManager from "./event/manager";
import EventStack from "./event/stack";
import EventCall from "./event/call";

type AnimationGroup = {[key: string] : any}

class Animation{
    /**
     * @description The title when the animation started.
     */
    started_at: number|null = null;

    /**
     * @description Save the pause position of the animation (in case if the animation is in pause)
     */
    pause_position: number|null = null;

    /**
     * @description Save the duration in seconds of the animation.
     */
    duration: number|null = null;

    _event: number|null = null;


    /**
     * @description Save the easing function of the animation
     */
    _easing: ((coef: number) => number) = (coef) => coef;

    /**
     * @description Save the easing function of the binder function. The function will give a coefficient (between 0 & 1, where 0 is the beginning of the function and 1 the end of the function) in parameter and will be xeceuted on each animation update.
     */
    _binder: ((coef: number) => void) = () => {};

    /**
     * @description Save the number of description of the animation.
     */
    repeat: number = 0;

    /**
     * @description Save how many times the animations has been repeated.
     */
    repeated: number|null = null;

    /**
     * @description Save the {@link EventManager|EventManager} instance to fire an end event
     */
    end_event = new EventManager();

    /**
     * @description Save the {@link EventManager|EventManager} instance to fire a start event
     */
    start_event = new EventManager();

    /**
     * @description Save the {@link EventManager|EventManager} instance to fire a begin event
     */
    begin_event = new EventManager();

    /**
     * @description Save the {@link EventManager|EventManager} instance to fire a resume event
     */
    resume_event = new EventManager();

    /**
     * @description Save the {@link EventManager|EventManager} instance to fire a abord event
     */
    abord_event = new EventManager();

    /**
     * @description Save the {@link EventManager|EventManager} instance to fire a stop event
     */
    stop_event = new EventManager();

    /**
     * @description Save the {@link EventManager|EventManager} instance to fire a pause event
     */
    pause_event = new EventManager();

    /**
     * @description Save the {@link EventManager|EventManager} instance to fire a repeat event
     */
    repeat_event = new EventManager();

    /**
     * @description Save the attached {@link AnimationGroup|AnimationGroup} instance to the current {@link Animation|Animation} instance
     */
    manager: AnimationGroup|null = null;

    /**
     * @description Detach the {@link AnimationGroup|AnimationGroup} instance to the current {@link Animation|Animation} instance
     * @return {Animation} Return the current {@link Animation|Animation} instance
     */
    removeManager(){
        if (this.hasManager()) {
            const _manager = this.getManager();

            this.manager = null;

            _manager.removeAnimation(this);
        }

        return this;
    }

    /**
     * @description Get the attached {@link AnimationGroup|AnimationGroup} instance of the current {@link Animation|Animation} instance
     * @return {Animation} Return the attached {@link AnimationGroup|AnimationGroup} instance of the current {@link Animation|Animation} instance
     */
    getManager(){
        if (!this.hasManager()){
            throw new Error("You cannot get the animation group manager because the current animation instance do not have animation group attached");
        }

        return this.manager!;
    }

    /**
     * @description Check if the current {@link Animation|Animation} instance has a {@link AnimationGroup|AnimationGroup} instance attached or not
     * @return {boolean} Return a boolean if the current {@link Animation|Animation} instance has a {@link AnimationGroup|AnimationGroup} instance attached or not
     */
    hasManager(){
        return this.manager !== null;
    }

    /**
     * @description Attach the {@link AnimationGroup|AnimationGroup} instance to the current {@link Animation|Animation} instance
     * @return {Animation} Return the current {@link Animation|Animation} instance
     */
    setManager(manager: AnimationGroup){
        if (!manager.hasAnimation(this)){
            manager.addAnimation(this);

            return this;
        }

        if (this.hasManager() && this.getManager() === manager){
            return this;
        }

        this.removeManager();
        this.manager = manager;

        return this;
    }

    /**
     * @description Jump the attached {@link AnimationGroup|AnimationGroup} instance to the current {@link Animation|Animation} instance
     * @return {Animation} Return the current {@link Animation|Animation} instance
     */
    jumpToAnimation(){
        this.getManager().jumpToAnimation(this);

        return this;
    }

    /**
     * @description Allow to get the timeline of the attached {@link AnimationGroup|AnimationGroup} instance to jump to the start the current {@link Animation|Animation} instance
     * @return {number} Return the timeline of the attached {@link AnimationGroup|AnimationGroup} instance to jump to the start the current {@link Animation|Animation} instance
     */
    getStartAnimationTimeline(){
        return this.getManager().getStartAnimationTimeline(this);
    }

    /**
     * @description Allow to get the timeline of the attached {@link AnimationGroup|AnimationGroup} instance to jump to the end the current {@link Animation|Animation} instance
     * @return {number} Return the timeline of the attached {@link AnimationGroup|AnimationGroup} instance to jump to the end the current {@link Animation|Animation} instance
     */
    getEndAnimationTimeline(){
        return this.getManager().getEndAnimationTimeline(this);
    }

    /**
     * @description Allow to get the timeline of the {@link AnimationGroup|AnimationGroup} instance to jump to the end the current {@link Animation|Animation} instance
     * @return {number} Return the current {@link Animation|Animation} instance position into the attached {@link AnimationGroup|AnimationGroup} instance
     */
    getAnimationNumber(): number{
        return this.getManager().getAnimationNumber(this);
    }

    static Easing: {[key: string]: ((coef: number) => number)} = {};

    /**
     * @description Allow to clone the current {@link Animation|Animation} instance
     * @return {Animation} Return the cloned {@link Animation|Animation} instance
     */
    clone(){
        // @ts-ignore
        return Object.assign( Object.create( Object.getPrototypeOf(this)), this);
    }

    /**
     * @description Allow to add callback when the current {@link Animation|Animation} instance will repeat
     * @param stack The {@link EventStack|EventStack} instance or the function to execute when the current {@link Animation|Animation} instance will repeat
     * @return {Animation} Return the current {@link Animation|Animation} instance
     */
    onRepeat(stack: EventStack[]|EventStack|((call: EventCall) => void)[]|((call: EventCall) => void)){
        this.getRepeatEventManager().addStack(stack);
        
        return this;
    }

    /**
     * @return {Animation} Return the current {@link Animation|Animation} instance
     * @param {EventManager} repeat_event The event manager to set when the current {@link Animation|Animation} repeat
     * @description Link a {@link EventManager|EventManager} instance to fire when the current {@link Animation|Animation} repeat
     */
    setRepeatEventManager(repeat_event: EventManager){
        this.repeat_event = repeat_event;
        
        return this;
    }

    /**
     * @description Get the {@link EventManager|EventManager} instance of the current {@link Animation|Animation} instance when the current {@link Animation|Animation} instance will repeat
     * @return Return the {@link EventManager|EventManager} instance of the current {@link Animation|Animation} instance when the current {@link Animation|Animation} instance will repeat
     */
    getRepeatEventManager(){
        return this.repeat_event;
    }

    /**
     * @description Fire the repeat event of the current {@link Animation|Animation} instance
     * @return {Animation} Return the current {@link Animation|Animation} instance
     */
    callOnRepeat(){
        this.getRepeatEventManager().run([this]);
        
        return this;
    }

    /**
     * @description Allow to add callback when the current {@link Animation|Animation} instance will pause
     * @param stack The {@link EventStack|EventStack} instance or the function to execute when the current {@link Animation|Animation} instance will pause
     * @return {Animation} Return the current {@link Animation|Animation} instance
     */
    onPause(stack: EventStack[]|EventStack|((call: EventCall) => void)[]|((call: EventCall) => void)){
        this.getPauseEventManager().addStack(stack);

        return this;
    }

    /**
     * @return {Animation} Return the current {@link Animation|Animation} instance
     * @param {EventManager} repeat_event The event manager to set when the current {@link Animation|Animation} pause
     * @description Link a {@link EventManager|EventManager} instance to fire when the current {@link Animation|Animation} pause
     */
    setPauseEventManager(pause_event: EventManager){
        this.pause_event = pause_event;

        return this;
    }

    /**
     * @description Get the {@link EventManager|EventManager} instance of the current {@link Animation|Animation} instance when the current {@link Animation|Animation} instance will pause
     * @return Return the {@link EventManager|EventManager} instance of the current {@link Animation|Animation} instance when the current {@link Animation|Animation} instance will pause
     */
    getPauseEventManager(){
        return this.pause_event;
    }

    /**
     * @description Fire the pause event of the current {@link Animation|Animation} instance
     * @return {Animation} Return the current {@link Animation|Animation} instance
     */
    callOnPause(){
        this.getPauseEventManager().run([this]);

        return this;
    }

    /**
     * @description Allow to add callback when the current {@link Animation|Animation} instance will end
     * @param stack The {@link EventStack|EventStack} instance or the function to execute when the current {@link Animation|Animation} instance will end
     * @return {Animation} Return the current {@link Animation|Animation} instance
     */
    onEnd(stack: EventStack[]|EventStack|((call: EventCall) => void)[]|((call: EventCall) => void)){
        this.getEndEventManager().addStack(stack);

        return this;
    }

    /**
     * @return {Animation} Return the current {@link Animation|Animation} instance
     * @param {EventManager} repeat_event The event manager to set when the current {@link Animation|Animation} end
     * @description Link a {@link EventManager|EventManager} instance to fire when the current {@link Animation|Animation} end
     */
    setEndEventManager(end_event: EventManager){
        this.end_event = end_event;

        return this;
    }

    /**
     * @description Get the {@link EventManager|EventManager} instance of the current {@link Animation|Animation} instance when the current {@link Animation|Animation} instance will end
     * @return Return the {@link EventManager|EventManager} instance of the current {@link Animation|Animation} instance when the current {@link Animation|Animation} instance will end
     */
    getEndEventManager(){
        return this.end_event;
    }

    /**
     * @description Fire the end event of the current {@link Animation|Animation} instance
     * @return {Animation} Return the current {@link Animation|Animation} instance
     */
    callOnEnd(){
        this.getEndEventManager().run([this]);

        return this;
    }

    /**
     * @description Allow to add callback when the current {@link Animation|Animation} instance will resume
     * @param stack The {@link EventStack|EventStack} instance or the function to execute when the current {@link Animation|Animation} instance will resume
     * @return {Animation} Return the current {@link Animation|Animation} instance
     */
    onResume(stack: EventStack[]|EventStack|((call: EventCall) => void)[]|((call: EventCall) => void)){
        this.getResumeEventManager().addStack(stack);

        return this;
    }

    /**
     * @return {Animation} Return the current {@link Animation|Animation} instance
     * @param {EventManager} repeat_event The event manager to set when the current {@link Animation|Animation} resume
     * @description Link a {@link EventManager|EventManager} instance to fire when the current {@link Animation|Animation} resume
     */
    setResumeEventManager(resume_event: EventManager){
        this.resume_event = resume_event;

        return this;
    }

    /**
     * @description Get the {@link EventManager|EventManager} instance of the current {@link Animation|Animation} instance when the current {@link Animation|Animation} instance will resume
     * @return Return the {@link EventManager|EventManager} instance of the current {@link Animation|Animation} instance when the current {@link Animation|Animation} instance will resume
     */
    getResumeEventManager(){
        return this.resume_event;
    }

    /**
     * @description Fire the resume event of the current {@link Animation|Animation} instance
     * @return {Animation} Return the current {@link Animation|Animation} instance
     */
    callOnResume(){
        this.getResumeEventManager().run([this]);

        return this;
    }

    /**
     * @description Allow to add callback when the current {@link Animation|Animation} instance will stop (when the current {@link Animation|Animation} instance is aborded or when the current {@link Animation|Animation} instance is ended)
     * @param stack The {@link EventStack|EventStack} instance or the function to execute when the current {@link Animation|Animation} instance will stop (when the current {@link Animation|Animation} instance is aborded or when the current {@link Animation|Animation} instance is ended)
     * @return {Animation} Return the current {@link Animation|Animation} instance
     */
    onStop(stack: EventStack[]|EventStack|((call: EventCall) => void)[]|((call: EventCall) => void)){
        this.getStopEventManager().addStack(stack);

        return this;
    }

    /**
     * @return {Animation} Return the current {@link Animation|Animation} instance
     * @param {EventManager} repeat_event The event manager to set when the current {@link Animation|Animation} stop (when the current {@link Animation|Animation} instance is aborded or when the current {@link Animation|Animation} instance is ended)
     * @description Link a {@link EventManager|EventManager} instance to fire when the current {@link Animation|Animation} stop (when the current {@link Animation|Animation} instance is aborded or when the current {@link Animation|Animation} instance is ended)
     */
    setStopEventManager(stop_event: EventManager){
        this.stop_event = stop_event;

        return this;
    }

    /**
     * @description Get the {@link EventManager|EventManager} instance of the current {@link Animation|Animation} instance when the current {@link Animation|Animation} instance will stop (when the current {@link Animation|Animation} instance is aborded or when the current {@link Animation|Animation} instance is ended)
     * @return Return the {@link EventManager|EventManager} instance of the current {@link Animation|Animation} instance when the current {@link Animation|Animation} instance will stop (when the current {@link Animation|Animation} instance is aborded or when the current {@link Animation|Animation} instance is ended)
     */
    getStopEventManager(){
        return this.stop_event;
    }

    /**
     * @description Fire the stop event of the current {@link Animation|Animation} instance (when the current {@link Animation|Animation} instance is aborded or when the current {@link Animation|Animation} instance is ended)
     * @return {Animation} Return the current {@link Animation|Animation} instance
     */
    callOnStop(){
        this.getStopEventManager().run([this]);

        return this;
    }

    /**
     * @description Allow to add callback when the current {@link Animation|Animation} instance will start
     * @param stack The {@link EventStack|EventStack} instance or the function to execute when the current {@link Animation|Animation} instance will start
     * @return {Animation} Return the current {@link Animation|Animation} instance
     */
    onStart(stack: EventStack[]|EventStack|((call: EventCall) => void)[]|((call: EventCall) => void)){
        this.getStartEventManager().addStack(stack);

        return this;
    }

    /**
     * @return {Animation} Return the current {@link Animation|Animation} instance
     * @param {EventManager} repeat_event The event manager to set when the current {@link Animation|Animation} start
     * @description Link a {@link EventManager|EventManager} instance to fire when the current {@link Animation|Animation} start
     */
    setStartEventManager(start_event: EventManager){
        this.start_event = start_event;

        return this;
    }

    /**
     * @description Get the {@link EventManager|EventManager} instance of the current {@link Animation|Animation} instance when the current {@link Animation|Animation} instance will start
     * @return Return the {@link EventManager|EventManager} instance of the current {@link Animation|Animation} instance when the current {@link Animation|Animation} instance will start
     */
    getStartEventManager(){
        return this.start_event;
    }

    /**
     * @description Fire the start event of the current {@link Animation|Animation} instance
     * @return {Animation} Return the current {@link Animation|Animation} instance
     */
    callOnStart(){
        this.getStartEventManager().run([this]);

        return this;
    }

    /**
     * @description Allow to add callback when the current {@link Animation|Animation} instance will begin (when the current {@link Animation|Animation} instance start or when the current {@link Animation|Animation} instance resume)
     * @param stack The {@link EventStack|EventStack} instance or the function to execute when the current {@link Animation|Animation} instance will begin (when the current {@link Animation|Animation} instance start or when the current {@link Animation|Animation} instance resume)
     * @return {Animation} Return the current {@link Animation|Animation} instance
     */
    onBegin(stack: EventStack[]|EventStack|((call: EventCall) => void)[]|((call: EventCall) => void)){
        this.getBeginEventManager().addStack(stack);

        return this;
    }

    /**
     * @return {Animation} Return the current {@link Animation|Animation} instance
     * @param {EventManager} repeat_event The event manager to set when the current {@link Animation|Animation} begin (when the current {@link Animation|Animation} instance start or when the current {@link Animation|Animation} instance resume)
     * @description Link a {@link EventManager|EventManager} instance to fire when the current {@link Animation|Animation} begin (when the current {@link Animation|Animation} instance start or when the current {@link Animation|Animation} instance resume)
     */
    setBeginEventManager(begin_event: EventManager){
        this.begin_event = begin_event;

        return this;
    }

    /**
     * @description Get the {@link EventManager|EventManager} instance of the current {@link Animation|Animation} instance when the current {@link Animation|Animation} instance will begin (when the current {@link Animation|Animation} instance start or when the current {@link Animation|Animation} instance resume)
     * @return Return the {@link EventManager|EventManager} instance of the current {@link Animation|Animation} instance when the current {@link Animation|Animation} instance will begin (when the current {@link Animation|Animation} instance start or when the current {@link Animation|Animation} instance resume)
     */
    getBeginEventManager(){
        return this.begin_event;
    }

    /**
     * @description Fire the begin event of the current {@link Animation|Animation} instance (when the current {@link Animation|Animation} instance start or when the current {@link Animation|Animation} instance resume)
     * @return {Animation} Return the current {@link Animation|Animation} instance
     */
    callOnBegin(){
        this.getBeginEventManager().run([this]);

        return this;
    }

    /**
     * @description Allow to add callback when the current {@link Animation|Animation} instance will abord
     * @param stack The {@link EventStack|EventStack} instance or the function to execute when the current {@link Animation|Animation} instance will abord
     * @return {Animation} Return the current {@link Animation|Animation} instance
     */
    onAbord(stack: EventStack[]|EventStack|((call: EventCall) => void)[]|((call: EventCall) => void)){
        this.getAbordEventManager().addStack(stack);

        return this;
    }

    /**
     * @return {Animation} Return the current {@link Animation|Animation} instance
     * @param {EventManager} repeat_event The event manager to set when the current {@link Animation|Animation} abord
     * @description Link a {@link EventManager|EventManager} instance to fire when the current {@link Animation|Animation} abord
     */
    setAbordEventManager(abord_event: EventManager){
        this.abord_event = abord_event;

        return this;
    }

    /**
     * @description Get the {@link EventManager|EventManager} instance of the current {@link Animation|Animation} instance when the current {@link Animation|Animation} instance will abord
     * @return Return the {@link EventManager|EventManager} instance of the current {@link Animation|Animation} instance when the current {@link Animation|Animation} instance will abord
     */
    getAbordEventManager(){
        return this.abord_event;
    }

    /**
     * @description Fire the abord event of the current {@link Animation|Animation} instance
     * @return {Animation} Return the current {@link Animation|Animation} instance
     */
    callOnAbord(){
        this.getAbordEventManager().run([this]);

        return this;
    }


    /**
     * @description Reset the number of repetition of the current {@link Animation|Animation} instance
     * @return {Animation} Return the current {@link Animation|Animation} instance
     * @internal
     */
    resetRepeated(){
        this.setRepeated(0);

        return this;
    }

    /**
     * @description Set the number of repetition of the current {@link Animation|Animation} instance
     * @return {Animation} Return the current {@link Animation|Animation} instance
     * @internal
     */
    setRepeated(repeated: number){
        this.repeated = repeated;

        return this;
    }

    /**
     * @description Get the number of repetition of the current {@link Animation|Animation} instance
     * @return {number} Return the number of repetition of the current {@link Animation|Animation} instance
     */
    getRepeated(){
        return this.repeated;
    }

    /**
     * @description Get the number of repetition of the current {@link Animation|Animation} instance will do. If the value is -1, the current {@link Animation|Animation} will repeat infinitely
     * @return {number} Return the number of repetition of the current {@link Animation|Animation} instance will do. If the value is -1, the current {@link Animation|Animation} will repeat infinitely
     */
    getRepeat(){
        return this.repeat;
    }

    /**
     * @description Set the number of repetition of the current {@link Animation|Animation} instance will do. If the value is -1, the current {@link Animation|Animation} will repeat infinitely
     * @return {Animation} Return the current {@link Animation|Animation} instance
     */
    setRepeat(repeat: number){
        this.repeat = repeat;

        return this;
    }

    /**
     * @description The current {@link Animation|Animation} instance won't repeat
     * @return {Animation} Return the current {@link Animation|Animation} instance
     */
    noRepeat(){
        this.setRepeat(0);

        return this;
    }

    /**
     * @description The current {@link Animation|Animation} instance will repeat infinitely
     * @return {Animation} Return the current {@link Animation|Animation} instance
     */
    repeatInfinitely(){
        this.setRepeat(-1);

        return this;
    }

    /**
     * @description Get the function binder of the current {@link Animation|Animation} instance
     * @return {(coef: number) => void} Return the function binder of the current {@link Animation|Animation} instance
     */
    getBinder(){
        return this._binder!;
    }

    /**
     * @description Set the function binder of the current {@link Animation|Animation} instance
     * @param _binder The function binder to set into the current {@link Animation|Animation} instance
     * @return {Animation} Return the current {@link Animation|Animation} instance
     */
    setBinder(_binder: (coef: number) => void){
        this._binder = _binder.bind(this);

        return this;
    }

    /**
     * @description Set the function binder of the current {@link Animation|Animation} instance
     * @param _binder The function binder to set into the current {@link Animation|Animation} instance
     * @return {Animation} Return the current {@link Animation|Animation} instance
     */
    bind(_binder: (coef: number) => void){
        this.setBinder(_binder);

        return this;
    }


    /**
     * @description Get the time when the current {@link Animation|Animation} instance has started his animation (include the pause position if the current {@link Animation|Animation} instance is paused instead of {@link getStartedAt|getStartedAt} method)
     * @return {number} Return the time when the current {@link Animation|Animation} instance has started his animation
     */
    startedAt(){
        if (this.isPaused()){
            return performance.now() - (this.getPausePosition() * this.getDuration());
        }

        return this.getStartedAt();
    }

    /**
     * @description Get the played duration of the animation
     * @return Return the played duration of the animation
     */
    getAnimationDurationPosition(){
        return performance.now() - this.startedAt();
    }

    /**
     * @description Get the current {@link Animation|Animation} instance timeline position (For example, if the value is 3.5, the animation has been repeated 3 times and is positioned at the middle of the animation)
     * @return {number} Return the current {@link Animation|Animation} instance timeline position (For example, if the value is 3.5, the animation has been repeated 3 times and is positioned at the middle of the animation)
     */
    getTimeLine(){
        if (this.isPaused()){
            return this.getPausePosition();
        }

        if (!this.hasStartedAt()){
            return 0;
        }

        const duration = this.getDuration();
        if (duration <= 0){
            return 0;
        }

        return this.getAnimationDurationPosition() / duration;
    }

    /**
     * @description Get the current {@link Animation|Animation} instance binder position (the value is between 0 and 1, where 0 is the beginning and 1 the end of the animation)
     * @return {number} Return the current {@link Animation|Animation} instance binder position (the value is between 0 and 1, where 0 is the beginning and 1 the end of the animation)
     */
    getLinearCoeficient(){
        return this.getTimeLine() % 1;
    }

    /**
     * @description Compute the number of repetition of the current {@link Animation|Animation} instance from his timeline position
     * @return {number} Return the computed number of repetition of the current {@link Animation|Animation} instance from his timeline position
     */
    getCurrentRepeat(){
        return Math.floor(this.getTimeLine());
    }

    /**
     * @description Get the current {@link Animation|Animation} instance binder position where the value has been easing
     * @return {number} Return the current {@link Animation|Animation} instance binder position where the value has been easing
     */
    getCoeficient(){
        return this.ease(this.getLinearCoeficient());
    }

    /**
     * @description Get the value who has been easing by the current {@link Animation|Animation} instance
     * @return {number} Return the value who has been easing by the current {@link Animation|Animation} instance
     * @param value The number value to ease
     */
    ease(value: number){
        return this.getEasing()(value);
    }

    /**
     * @description Get easing function of the current {@link Animation|Animation} instance
     * @return {(coef: number) => number} Return easing function of the current {@link Animation|Animation} instance
     */
    getEasing(){
        return this._easing!;
    }

    /**
     * @description Get easing function of the current {@link Animation|Animation} instance
     * @param _easing The easing function to set into the current {@link Animation|Animation} instance
     * @return {Animation} Return the current {@link Animation|Animation} instance
     */
    setEasing(_easing: ((coef: number) => number)){
        this._easing = _easing;

        return this;
    }

    /**
     * @description Get easing function of the current {@link Animation|Animation} instance
     * @param _easing The easing function to set into the current {@link Animation|Animation} instance
     * @return {Animation} Return the current {@link Animation|Animation} instance
     */
    easing(_easing: ((coef: number) => number)){
        return this.setEasing(_easing);
    }

    /**
     * @description Update only the current {@link Animation|Animation} instance with a specific binder position
     * @param coef The binder position to update the current {@link Animation|Animation} instance
     * @return {Animation} Return the current {@link Animation|Animation} instance
     */
    _update(coef = this.getCoeficient()){
        this.getBinder()(coef);

        return this;
    }

    /**
     * @description Update the current {@link Animation|Animation} instance with a specific binder position
     * @param coef The binder position to update the current {@link Animation|Animation} instance
     * @return {Animation} Return the current {@link Animation|Animation} instance
     */
    update(coef = this.getCoeficient()){
        this._update(coef);

        if (this.hasManager()){
            const start = this.getStartAnimationTimeline();
            const end = this.getEndAnimationTimeline();

            this.getManager().superUpdate((end - start) * coef + start);
        }

        return this;
    }

    /**
     * @description Get the pause position of the current {@link Animation|Animation} instance
     * @return {number} Return the pause position of the current {@link Animation|Animation} instance
     */
    getPausePosition(){
    	if (!this.hasPausePosition()){
    		throw new Error("You cannot get the pause animation position because the current animation istance do not have pause position value");
    	}

    	return this.pause_position!;
    }

    /**
     * @description Remove the pause position of the current {@link Animation|Animation} instance
     * @return {Animation} Return the current {@link Animation|Animation} instance
     * @internal
     */
    removePausePosition(){
        this.pause_position = null;

        return this;
    }

    /**
     * @description Check if the current {@link Animation|Animation} instance have a pause position
     * @return {boolean} Return a boolean if the current {@link Animation|Animation} instance have a pause position
     */
    hasPausePosition(){
    	return this.pause_position !== null;
    }

    /**
     * @description Set the pause position of the current {@link Animation|Animation} instance
     * @param pause_position The timeline pause position to set into the current {@link Animation|Animation} instance
     * @param update_parent A boolean to specify if you should update the attached {@link AnimationGroup|AnimationGroup} instance or not
     * @return {Animation} Return the current {@link Animation|Animation} instance
     * @internal
     */
    setPausePosition(pause_position: number,update_parent = true){
        if (this.hasPausePosition() && this.getPausePosition() === pause_position){
            return this;
        }

    	this.pause_position = pause_position;

        if (update_parent){
            this.update();
        }else{
            this._update();
        }

    	return this;
    }

    /**
     * @description Get the time when current {@link Animation|Animation} instance has been started
     * @return {number} Return the time when current {@link Animation|Animation} instance has been started
     */
    getStartedAt(){
    	if (!this.hasStartedAt()){
    		throw new Error();
    	}

    	return this.started_at!;
    }

    /**
     * @description Remove the time when current {@link Animation|Animation} instance has been started
     * @return {Animation} Return the current {@link Animation|Animation} instance
     * @internal
     */
    removeStartedAt(){
        this.started_at = null;

        return this;
    }

    /**
     * @description Check if the current {@link Animation|Animation} instance have a start time position
     * @return {boolean} Return a boolean if the current {@link Animation|Animation} instance have a start time position
     */
    hasStartedAt(){
    	return this.started_at !== null;
    }

    /**
     * @description Set the time when current {@link Animation|Animation} instance has been started
     * @param started_at The time when the current {@link Animation|Animation} instance has been started
     * @return {Animation} Return the current {@link Animation|Animation} instance
     * @internal
     */
    setStartedAt(started_at: number){
    	this.started_at = started_at;

    	return this;
    }

    /**
     * @description Get the time duration of the current {@link Animation|Animation} instance
     * @return {number} Return he time duration of the current {@link Animation|Animation} instance
     */
    getDuration(){
        return this.duration!;
    }

    /**
     * @description Reset the time duration of the current {@link Animation|Animation} instance
     * @return {Animation} Return the current {@link Animation|Animation} instance
     */
    resetDuration(){
    	this.setDuration(0);

    	return this;
    }

    /**
     * @description Set the time duration of the current {@link Animation|Animation} instance
     * @param duration The time duration of the current {@link Animation|Animation} instance to set
     * @return {Animation} Return the current {@link Animation|Animation} instance
     */
    setDuration(duration: number){
    	this.duration = duration;

    	return this;
    }

    /**
     * @description Check if the current {@link Animation|Animation} instance is running or not
     * @return {boolean} Return if the current {@link Animation|Animation} instance is running or not
     */
    isRunning(){
    	return this.hasStartedAt() && !this.isPaused();
    }

    /**
     * @description Check if the current {@link Animation|Animation} instance is paused or not
     * @return {boolean} Return if the current {@link Animation|Animation} instance is paused or not
     */
    isPaused(){
    	return this.hasPausePosition();
    }

    /**
     * @description Set the timeline position of the current {@link Animation|Animation} instance
     * @param timeline The timeline position to set into the current {@link Animation|Animation} instance
     * @param update_parent A boolean to specify if you should update the attached {@link AnimationGroup|AnimationGroup} instance or not
     * @return {Animation} Return the current {@link Animation|Animation} instance
     * @internal
     */
    setStartedAtTimeline(timeline: number,update_parent = true){
        this.setStartedAt(performance.now() - (timeline * this.getDuration()));

        if (update_parent){
            this.update();
        }else{
            this._update();
        }

        return this;
    }

    /**
     * @description Set the timeline position of the current {@link Animation|Animation} instance
     * @param timeline The timeline position to set into the current {@link Animation|Animation} instance
     * @param update_parent A boolean to specify if you should update the attached {@link AnimationGroup|AnimationGroup} instance or not
     * @return {Animation} Return the current {@link Animation|Animation} instance
     */
    setTimeline(timeline: number,update_parent = true){
        if (this.isRunning()){
            this.setStartedAtTimeline(timeline,update_parent);
        }else{
            this.setPausePosition(timeline,update_parent);
        }

        return this;
    }

    /**
     * @description Set the coeficient position to set into the current {@link Animation|Animation} instance
     * @param coef The coeficient position to set into the current {@link Animation|Animation} instance
     * @param update_parent A boolean to specify if you should update the attached {@link AnimationGroup|AnimationGroup} instance or not
     * @return {Animation} Return the current {@link Animation|Animation} instance
     */
    setPosition(coef: number,update_parent = true){
        return this.setTimeline(this.getCurrentRepeat() + coef,update_parent);
    }

    /**
     * @description Build the LensStudio UpdateEvent to run the current {@link Animation|Animation} instance
     * @return {Animation} Return the current {@link Animation|Animation} instance
     * @internal
     */
    buildEvent(){
        this.removeEvent();

        const update = () => {
            const current_repeat = this.getCurrentRepeat();
            const repeat = this.getRepeat();

            if (current_repeat !== this.getRepeated()){
                if ((current_repeat > repeat || current_repeat < 0) && repeat !== -1){
                    this._end();
                    return;
                }

                this.setRepeated(current_repeat);
                this.callOnRepeat();
            }

            this.update();

            const event = requestAnimationFrame(update);
            this.setEvent(event);
        };

        update();

        return this;
    }

    /**
     * @description Attach the LensStudio UpdateEvent to run the current {@link Animation|Animation} instance
     * @return {Animation} Return the current {@link Animation|Animation} instance
     * @internal
     */
    setEvent(event: number){
        this._event = event;

        return this;
    }

    /**
     * @description Get the attached the LensStudio UpdateEvent to run the current {@link Animation|Animation} instance
     * @return {Animation} Return the current {@link Animation|Animation} instance
     * @internal
     */
    getEvent(): number{
        if (!this.hasEvent()){
            throw new Error("You cannot get the _event frame because is value is null");
        }

        return this._event!;
    }

    /**
     * @description Check if the current {@link Animation|Animation} instance has a LensStudio UpdateEvent attached
     * @return {boolean} Return a boolean if the current {@link Animation|Animation} instance has a LensStudio UpdateEvent attached
     * @internal
     */
    hasEvent(){
        return this._event !== null;
    }

    /**
     * @description Pause the current {@link Animation|Animation} instance (if the current {@link Animation|Animation} instance is not running)
     * @return {Animation} Return the current {@link Animation|Animation} instance
     */
    pause(){
        if (this.isRunning() && !this.isPaused()){
            this.setPausePosition(this.getTimeLine());

            this.removeEvent();
            this.removeStartedAt();

            this.callOnPause();
        }

        if (this.hasManager()){
            this.getManager().pause();
        }

        return this;
    }

    /**
     * @description Resume if the current {@link Animation|Animation} instance is paused or start the current {@link Animation|Animation} instance (if the current {@link Animation|Animation} instance is not running)
     * @return {Animation} Return the current {@link Animation|Animation} instance
     */
    resume(){
        if (!this.isPaused()){
            return this.start();
        }

        if (this.hasManager()){
            this.getManager().pause();
        }

        const pause = this.getPausePosition();
        this.removePausePosition();

        this.setStartedAtTimeline(pause);
        this.setRepeated(this.getCurrentRepeat());

        if (this.hasManager()){
            this.getManager().switchActualAnimation(this);
        }

        this.buildEvent();

        this.callOnBegin();
        this.callOnResume();

        return this;
    }

    /**
     * @description Start the current {@link Animation|Animation} instance from the beginning (if the current {@link Animation|Animation} instance is not running)
     * @return {Animation} Return the current {@link Animation|Animation} instance
     */
    start(repeat?: number){
        if (this.hasManager()){
            this.getManager().stop();
        }

        if (!this.isRunning()){
            this.stop();

            if (typeof repeat === "number"){
                this.setRepeat(repeat);
            }

            this.setRepeated(0);
            this.setStartedAt(performance.now());

            if (this.hasManager()){
                this.getManager().switchActualAnimation(this);
            }

            this.buildEvent();

            this.callOnBegin();
            this.callOnStart();
        }

        return this;
    }

    /**
     * @description Remove and destroy the attached the LensStudio UpdateEvent to run the current {@link Animation|Animation} instance
     * @return {Animation} Return the current {@link Animation|Animation} instance
     * @internal
     */
    removeEvent(){
        if (this.hasEvent()){
            cancelAnimationFrame(this.getEvent())
        }

        this._event = null;

        return this;
    }

    /**
     * @internal
     * @description Run the methods when the current {@link Animation|Animation} instance end
     * @return {Animation} Return the current {@link Animation|Animation} instance
     */
    _end(){
        this.update(this.ease(1));

        this.stop();

        this.callOnEnd();

        return this;
    }

    /**
     * @description Abord the current {@link Animation|Animation} instance from the beginning (if the current {@link Animation|Animation} instance is running)
     * @return {Animation} Return the current {@link Animation|Animation} instance
     */
    abord(){
        if (this.hasManager()){
            this.getManager().abord();
        }

        if (this.isRunning()){
            this.callOnAbord();

            this.stop();
        }

        return this;
    }

    /**
     * @description Stop the current {@link Animation|Animation} instance from the beginning (if the current {@link Animation|Animation} instance is running)
     * @return {Animation} Return the current {@link Animation|Animation} instance
     */
    stop(){
        const was_running = this.isRunning();

        this.removeEvent();
        this.removeStartedAt();
        this.removePausePosition();
        this.resetRepeated();

        if (was_running){
            this.callOnStop();
        }

        return this;
    }
}
export default Animation;
