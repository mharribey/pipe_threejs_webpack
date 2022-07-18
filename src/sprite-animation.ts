import * as THREE from 'three'
import Animation from "./animation";
import EventCall from './event/call';
import EventStack from './event/stack';

const sprite = (texture: THREE.Texture,x = 1,y = 1,count = x * y,fps = 24) => {
    const canvas: HTMLCanvasElement = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    canvas.height = texture.image.height;
    canvas.width = texture.image.width;

    const canvasTexture = new THREE.CanvasTexture(canvas)

    const update = () => {
        const x = state.frame%state.x;
        const y = Math.floor(state.frame/state.x);

        texture.offset.set(
            x/state.x,
            y/state.y,
        )

        const dim = {
            width: canvas.width,
            height: canvas.height,
        };
        const dimF = {
            width: dim.width * (1/state.x),
            height: dim.height * (1/state.y),
        };

        ctx.clearRect(0,0,canvas.width,canvas.height);
        ctx.drawImage(texture.image, x*dimF.width,y*dimF.height,dimF.width,dimF.height,0,0,dim.width,dim.height);
        canvasTexture.needsUpdate = true;
    };

    const animation = new Animation()
    animation.setDuration(count / fps * 1000);
    animation.bind((coef) => {
        const frame = Math.floor(coef*count);
        if (frame !== state.frame){
            state.frame = frame;
            update();
        }
    });

    let state = {
        fps: fps,
        x: x,
        y: y,
        frame: 0,
    };


    update();
    return {
        setFrame(frame: number){
            animation.stop();

            animation.update((frame%count) / count);
        },
        isPaused(){
            return animation.isPaused();
        },
        isRunning(){
            return animation.isRunning();
        },
        getDuration(){
            return animation.getDuration();
        },
        stop(){
            animation.stop();
        },
        start(repeat?: number){
            animation.start(repeat);
        },
        pause(){
            animation.pause();
        },
        onEnd(event: EventStack[]|EventStack|((call: EventCall) => void)[]|((call: EventCall) => void)){
            animation.onEnd(event);
        },
        texture: canvasTexture,
    }
};


export default sprite;