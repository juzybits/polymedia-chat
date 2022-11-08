import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import '../css/Home.less';

export function Home(props: any) {
    useEffect(() => {
        document.title = 'Polymedia';
        main();
    }, []);

    return <div id='page' className='teaser'>

        <h1><a href='https://twitter.com/polymedia_app'>polymedia</a></h1>

        <canvas></canvas>

    </div>;
}

class Ball {
    constructor(x, y, velX, velY, color, radius) {
        this.x = x;
        this.y = y;
        this.velX = velX;
        this.velY = velY;
        this.color = color;
        this.radius = radius;
    }

    draw() {
        ctx.beginPath();
        ctx.fillStyle = this.color;
        ctx.arc(this.x, this.y, this.radius, 0, 2 * Math.PI);
        ctx.fill();
    }

    update() {
        if ((this.x + this.radius) >= canvas.width) {
            this.velX = -(this.velX);
        }
        if ((this.x - this.radius) <= 0) {
            this.velX = -(this.velX);
        }
        if ((this.y + this.radius) >= canvas.height) {
            this.velY = -(this.velY);
        }
        if ((this.y - this.radius) <= 0) {
            this.velY = -(this.velY);
        }
        this.x += this.velX;
        this.y += this.velY;
    }
}

function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function drawBalls() {
    ctx.fillStyle = 'rgb(20 20 20)';
    ctx.fillRect(0, 0,  canvas.width, canvas.height);

    for (const ball of balls) {
        ball.draw();
        ball.update();
    }
}

function loop() {
    drawBalls();
    requestAnimationFrame(loop);
}

function main() {
    window.canvas = document.querySelector('canvas');
    window.ctx = canvas.getContext('2d');

    const canvasW = canvas.width = window.innerWidth;
    const canvasH = canvas.height = window.innerHeight;

    const screenSize = (canvasW < canvasH) ? canvasW : canvasH;
    const radius = Math.floor(screenSize/4.5);
    let red = 'rgba(240, 80, 50, 0.5)';
    let green = 'rgba(0, 220, 0, 0.5)';
    let blue = 'rgba(0, 180, 255, 0.5)';
    const vel = () => {
        let velocity = randomInt(1, 3);
        const negate = !!randomInt(0, 1);
        if (negate) {
            velocity *= -1;
        }
        return velocity;
    };

    window.balls = [];
    balls.push(new Ball( canvasW/2, canvasH/2 - radius/2, vel(), vel(), red, radius ));
    balls.push(new Ball( canvasW/2 - radius/2, canvasH/2 + radius/2, vel(), vel(), green, radius ));
    balls.push(new Ball( canvasW/2 + radius/2, canvasH/2 + radius/2, vel(), vel(), blue, radius ));

    drawBalls();
    setTimeout(loop, 1000);
}
