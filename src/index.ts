
console.debug("AWAY RUNTIME - 0.0.21");

import { AVMPlayer } from "@awayfl/awayfl-player"


//@ts-ignore
export class DemoPlayer extends AVMPlayer {
    container: HTMLDivElement;
    constructor(container) {
        super({
            x:'0%', y: '0%', w: '100', h: '100%',
            files: [
                { path: "assets/fonts.swf", resourceType: "FONTS" },                
            ]
        });
        this.container = container;
    }

    private resizeCallback(event: any) {
        const sh = this.stageHeight;
        const sw = this.stageWidth;

        this.setStageDimensions(0,0, this.container.clientWidth, this.container.clientHeight);
        this.canvas.style.position = 'relative';
    }

    get canvas(): HTMLCanvasElement {
        return this.scene.renderer.context.container
    }

    loadBuffer(buffer: ArrayBuffer): Promise<void> {
        this._gameConfig.files.push({
            //@ts-ignore
            data: buffer, path: 'assets/game.swf', resourceType: "GAME"
        });

        return new Promise((res)=>{
            this.addEventListener('loaderComplete', () => res());
            this.loadNextResource();	
        });
    }

    play() {
        super.play();
        //@ts-ignore
        this.resizeCallback();
    }

    stop() {
        //@ts-ignore
        this._timer.stop();
        //@ts-ignore
        this._timer.setCallback(undefined, undefined);
        
        setTimeout(()=>{
            super.dispose();
        });
    }
}