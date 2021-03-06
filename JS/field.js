import {bugState, bugMovement, Bug}from './canvas_bug.js';
import Carrot from './canvas_carrot.js';
import * as sound from './sound.js';
const main = document.querySelector('#main');

export const Step = Object.freeze({
    win: 'win',
    lose: 'lose',
    play: 'play',
    stop: 'stop',
});

export class Field {
    constructor(bugNum, carrotNum) {
        this.rafCnt = 0;
        this.bugNum = bugNum;
        this.carrotNum = carrotNum;
        this.bugList = [];
        this.carrotList = [];
        this.mousePos = {
            x: 0,
            y: 0,
        };
        this.rafId;
        this.timerId;
        this.step = Step.stop;
        this.canvas = document.querySelector('.canvas-field');
        this.ctx = this.canvas.getContext('2d');
        this.canvasWidth;
        this.canvasHeight;
        this.init();
        this.canvas.addEventListener('click', (e) => {
            this.gameClickHandler(e);
        });
        this.playState = false;
    }

    setStep(arg) {
        this.step = arg;
    }
    setTimerId(arg) {
        this.timerId = arg;
    }
    getPlayState() {
        return this.playState;
    }
    setPlayState(arg) {
        this.playState = arg;
    }
    setRafId(arg) {
        this.rafId = arg;
    }

    getCarrotList() {
        return this.carrotList;
    }

    gameClickHandler(e) {
        this.mousePos.x = e.offsetX;
        this.mousePos.y = e.offsetY;
            let selectedTarget;
            let carrot;
            for(let i=0; i<this.carrotList.length; i++) {
                carrot = this.carrotList[i];
                if(this.mousePos.x > carrot.x &&
                    this.mousePos.x < carrot.x + carrot.width &&
                    this.mousePos.y > carrot.y && 
                    this.mousePos.y < carrot.y + carrot.height) {
                        selectedTarget = carrot;
                    }
            }
    
            let bug;
            for(let i=0; i<this.bugList.length; i++) {
                bug = this.bugList[i];
                if(this.mousePos.x > bug.x &&
                    this.mousePos.x < bug.x + bug.width &&
                    this.mousePos.y > bug.y &&
                    this.mousePos.y < bug.y + bug.height) {
                        selectedTarget = bug;
                    }
            }
            if(selectedTarget && this.step === Step.play) {
                switch(selectedTarget.type) {
                    case 'bug': 
                        selectedTarget.setState(bugState.death);
                        selectedTarget.y += selectedTarget.height / 3;
                        sound.playBug();
                        this.step = Step.lose;
                    break;
                    case 'carrot': 
                        sound.playCarrot();
                        this.carrotList = this.carrotList.filter(carrot => {
                             return selectedTarget.index !== carrot.index
                        }
                        );
                    break;
                }
            }

    }

    generate() {
        let tempX;
        let tempY;
        let tempSpeed;
    
        for(let i=0; i<this.bugNum; i++) {
            tempX = Math.floor(Math.random() * (this.canvasWidth * 0.8));
            tempY = Math.floor(Math.random() * (this.canvasHeight * 0.8));
            tempSpeed = Math.floor(Math.random() * 4 + 1);
            if(this.bugList.length === this.bugNum) {
                this.bugList = [];
            }
            this.bugList.push(new Bug(i, tempX, tempY, tempSpeed));
        }
    
        for(let i=0; i<this.carrotNum; i++) {
            tempX = Math.floor(Math.random() * (this.canvasWidth * 0.8));
            tempY = Math.floor(Math.random() * (this.canvasHeight * 0.8));
            if(this.carrotList.length === this.carrotNum) {
                this.carrotList = [];
            }
            this.carrotList.push(new Carrot(i, tempX, tempY));
        }
        
    }
    
    render() {
        this.rafCnt++;
        this.ctx.clearRect(0,0,this.canvasWidth,this.canvasHeight);
        for(let carrot of this.carrotList) {
            carrot.draw();
        }

        switch(this.step) {
            case Step.win: 
                this.gameEnd();
                return;   
            case Step.lose: 
                for(let bug of this.bugList) {
                    bug.draw();
                }   
                this.gameEnd();
                return;
            case Step.play:
                for(let bug of this.bugList) {  
                    if(this.rafCnt % (Math.floor(20 / bug.speed)) === 0) {
                        bug.motion = !bug.motion;
                    }
            
                    switch(bug.movement.details) {
                        case bugMovement.East:
                            bug.x += bug.speed; 
                            break;
                        case bugMovement.NothEast: 
                            bug.x += bug.speed; 
                            bug.y -= bug.speed;
                            break;
                        case bugMovement.SouthEast:
                            bug.x += bug.speed; 
                            bug.y += bug.speed;
                            break;
                        case bugMovement.West:
                            bug.x -= bug.speed; 
                            break;
                        case bugMovement.NothWest:
                            bug.x -= bug.speed; 
                            bug.y -= bug.speed;
                            break;
                        case bugMovement.SouthWest:
                            bug.x -= bug.speed; 
                            bug.y += bug.speed;
                            break;
                    };
            
                    if(bug.x > this.canvasWidth) {
                        bug.x = -bug.width;
                    } else if(bug.x === -bug.width) {
                        bug.x = this.canvasHeight;
                    }
                    
                    if(bug.y > this.canvasHeight) {
                        bug.y = -bug.height;
                    } else if(bug.y === -bug.height) {
                        bug.y = this.canvasHeight;
                    }
                        bug.draw();
                }
                break;

            case Step.stop: 
                clearInterval(this.timerId);
                cancelAnimationFrame(this.rafId);
                main.classList.remove('playing');
                main.classList.add('pause');            
            return;
            default:
                    throw new Error('Not valid step');
        }
        this.rafId = requestAnimationFrame(() => this.render());
    }

    gameEnd(){
        sound.stopBackground();
        if(this.step === Step.win) {
            sound.playWin();
            main.dataset.result = 'win';
        } else if(this.step === Step.lose ) {
            sound.playBug();
            main.dataset.result = 'lose';
        }
        cancelAnimationFrame(this.rafId);
        clearInterval(this.timerId);
        this.playState = false;
        main.classList.remove('playing');
        main.classList.add('end');
        this.rafCnt = 0;
        this.carrotList = [];    
        this.generate();
    }


    init() {
        this.canvas.setAttribute('width', innerWidth);
        this.canvas.setAttribute('height',innerHeight / 2);
        this.canvasWidth = this.canvas.width;
        this.canvasHeight = this.canvas.height
    }
}
