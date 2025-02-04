let faceMesh;
let video;
let faces = [];
let options = { maxFaces: 1, refineLandmarks: false, flipHorizontal: false };
let pipesImg = [];
let birdImg;
let bird;
let score = 0;
let state = "start";
let pipes = [];
function preload() {
  // Load the faceMesh model
  faceMesh = ml5.faceMesh(options);
  pipesImg[0] = loadImage("1.png");
  pipesImg[1] = loadImage("2.png");

  birdImg = loadImage("bird.png");
}

function setup() {
  createCanvas(1000, 700);
  // Create the webcam video and hide it
  video = createCapture(VIDEO);
  video.size(640, 480);
  video.hide();
  // Start detecting faces from the webcam video
  faceMesh.detectStart(video, gotFaces);
  textAlign(CENTER, CENTER);
  birdImg.resize(70, 0);
  pipesImg[0].resize(90, 0);

  pipesImg[1].resize(90, 0);
}
function gameInit() {
  // 游戏初始化
  score = 0;
  bird = new Bird(100, height / 2);
  pipes = [];
  // 设置管道
  let pipeX = 600;
  pipes.push(new Pipe(pipeX + 0, 700, 1));
  pipes.push(new Pipe(pipeX + 210, 50, -1));
  pipes.push(new Pipe(pipeX + 510, 550, 1));
  pipes.push(new Pipe(pipeX + 510, 550, 1));
  pipes.push(new Pipe(pipeX + 950, 150, -1));
}
function draw() {
  imageMode(CENTER);
// 根据游戏状态切换不同页面
  switch (state) {
    case "start":
      start();
      break;
    case "data":
      collectData();
      break;
    case "game":
      game();
      break;
    case "end":
      end();
      break;
  }
}

function start() {
  // 游戏开始页面
  background(74, 185, 196);
  fill(255);
  noStroke();
  textStyle(BOLD);
  textSize(80);
  text("Browppy Bird", width / 2, 190);
  textStyle(NORMAL);
  textSize(20);
  text("Shake your brows to make the bird fly", width / 2, 300);
  image(birdImg, width / 2, 400);
  button(width / 2, 550, "Play", 65);
}
function end() {
  // 游戏结束页面
  background(74, 185, 196);
  fill(255);
  noStroke();
  textStyle(BOLD);
  textSize(80);
  text("Game Over", width / 2, 330);
  textStyle(NORMAL);
  textSize(20);
  text("Score:" + score, width / 2, 400);
  button(width / 2, 550, "Back", 65);
}
function button(x, y, name, s) {
  // 绘制按钮
  rectMode(CENTER);
  textSize(s * 0.7);
  fill(255);
  if (checkButton(x, y, name, s)) {
    // 检测鼠标是否在按钮上 是的话改变按钮颜色
    fill(200);
  }
  stroke(90);
  strokeWeight(4);
  rect(x, y, textWidth(name) * 2, s, 15);
  strokeWeight(2);
  fill(90);
  text(name, x, y + s * 0.07);
}
function checkButton(x, y, name, s) {
  // 检测鼠标是否在按钮上的函数
  if (abs(mouseX - x) < textWidth(name) && abs(mouseY - y) < s / 2) {
    gameInit();
    return true;
  }
  return false;
}

function game() {
  background(74, 185, 196);

  image(video, width / 2, height / 2, 1000, 751);
  for (let i = 0; i < pipes.length; i++) {
    pipes[i].move();
    pipes[i].display();
  }
  bird.display();

  eyeBrowControl();
  drawScore(860, 50, 50);
}
let eyeBrowData = [];
// 收集用户脸部数据
function collectData() {
  background(106, 183, 193);
  image(video, width / 2, height / 2, 1000, 751);
  if (faces.length > 0) {
    let eyeBrowY, eyeY, faceHei;
    // 计算3个重要数据
    eyeBrowY = faces[0].leftEyebrow.keypoints[6].y;
    eyeY = faces[0].leftEye.keypoints[12].y;
    faceHei = abs(
      faces[0].faceOval.keypoints[1].y - faces[0].faceOval.keypoints[19].y
    );
    let newData = abs(eyeBrowY - eyeY) / faceHei;
    if (eyeBrowData.length < 180) {
      // 将数据添加到数组
      eyeBrowData.push(newData);
    } else {
      // 算出均值 作为基准
      let sum = 0;
      for (let i = 0; i < eyeBrowData.length; i++) {
        sum += eyeBrowData[i];
      }
      sum /= eyeBrowData.length;
      baseData = sum;
      state = "game";
    }
  }
  // 绘制进度条
  fill(255);
  textSize(30);
  stroke(0);
  strokeWeight(2);
  text("Loading...", width / 2, height / 2);
  stroke(0, 150);
  strokeWeight(13);
  line(width * 0.3, height * 0.7, width * 0.7, height * 0.7);
  strokeWeight(8);
  stroke(255, 150);
  
  line(
    width * 0.3,
    height * 0.7,
    map(eyeBrowData.length, 0, 180, width * 0.3, width * 0.7),
    height * 0.7
  );
}
function eyeBrowControl() {
  // 用挑眉控制鸟
  if (faces.length > 0) {
    // 计算数据
    let eyeBrowY, eyeY, faceHei;
    eyeBrowY = faces[0].leftEyebrow.keypoints[6].y;
    eyeY = faces[0].leftEye.keypoints[12].y;
    faceHei = abs(
      faces[0].faceOval.keypoints[1].y - faces[0].faceOval.keypoints[19].y
    );
    let newData = abs(eyeBrowY - eyeY) / faceHei;
// 判断是否挑眉
    if (newData / baseData > 1.12) {
      if (bird.state == 0) {
        // 改变鸟的运动
        bird.velY = -5;
        bird.angle = -0.2;
      }
    }
  }
}
function drawScore(x, y, s) {
  // 绘制分数
  rectMode(CENTER);
  textSize(s * 0.7);
  fill(255);
  stroke(90);
  strokeWeight(4);
  rect(x, y, textWidth("Score:" + score) * 1.5, s, 15);
  strokeWeight(2);
  fill(90);
  text("Score:" + score, x, y + s * 0.07);
}

// Callback function for when faceMesh outputs data
function gotFaces(results) {
  // Save the output to the faces variable
  faces = results;
}
function mousePressed() {
  // 鼠标点击切换页面
  switch (state) {
    case "start":
      if (checkButton(width / 2, 550, "Play", 65)) {
        state = "data";
      }
      break;
    case "end":
      if (checkButton(width / 2, 550, "Back", 65)) {
        state = "game";
      }
      break;
  }
}

class Bird {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.velY = 0;
    this.angle = 0;
    this.state = 0;
  }
  display() {
    
    push();
    // 控制鸟的绘制位置和旋转
    translate(this.x, this.y);
    rotate(this.angle);
    this.y += this.velY;
    // 鸟未死亡时缓慢下坠
    if (this.velY < 3 && this.state == 0) {
      this.velY += 0.5;
    } else if (this.state == 1) {
      // 死亡极速下坠
      this.velY += 1.5;
    }
    // 缓动鸟的朝向
    this.angle = lerp(this.angle, 0.2, 0.08);

    image(birdImg, 0, 0);
    pop();
    // 鸟碰撞后的运动变化
    if (this.collision() && this.state == 0) {
      this.state = 1;
      this.velY = -8;
      this.angle = 9;
    }
    if (this.y > height) {
      state = "end";
    }
  }
  collision() {
    // 检测管道碰撞
    for (let i = 0; i < pipes.length; i++) {
      if (
        this.x + 30 > pipes[i].x - pipes[i].w / 2 &&
        this.x - 30 < pipes[i].x + pipes[i].w / 2 &&
        this.y + 22 > pipes[i].y - pipes[i].h / 2 &&
        this.y - 22 < pipes[i].y + pipes[i].h / 2
      ) {
        return true;
      }
    }
  }
}
class Pipe {
  constructor(x, y, dir) {
    this.x = x;
    this.y = y;
    this.dir = dir;
    this.w = pipesImg[0].width;
    this.h = pipesImg[0].height;
    this.pass = false;
  }
  display() {
    // 绘制管道
    push();
    translate(this.x, this.y);
    if (this.dir == 1) {
      image(pipesImg[0], 0, 0);
    } else {
      image(pipesImg[1], 0, 0);
    }
    pop();
  }
  move() {
    this.x -= 2;
    // 使管道移动 并且到屏幕左侧后移动到右侧
    if (this.x < -100) {
      this.x = width + 150;
      this.pass = false;
    }
    // 被鸟穿过后加分
    if (!this.pass && this.x < bird.x) {
      score += 10;
      this.pass = true;
    }
  }
}
