export default class Bug {
    constructor(index, x, y, speed) {
        this.index = index;
        this.x = x;
        this.y = y;
        this.speed = speed;
        this.width = 160;
        this.height = 160;
        this.state = Math.floor(Math.random() * 6);
        this.img = new Image();
        this.img2 = new Image();
        if(this.state > 2) {
            this.img.src = './assets/img/bug-reverse.png';
            this.img2.src = './assets/img/bug2-reverse.png';
        }else {
            this.img.src = './assets/img/bug.png';
            this.img2.src = './assets/img/bug2.png';
        }
        this.motion = false;
        this.ctx = document.querySelector('.canvas-field').getContext('2d');
    }

    draw() {
        if(this.motion) {
            this.ctx.drawImage(this.img2, this.x, this.y, this.width, this.height);
        } else{
            this.ctx.drawImage(this.img, this.x, this.y, this.width, this.height);
        }
        }
    }