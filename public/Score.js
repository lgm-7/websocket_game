import { sendEvent } from './Socket.js';

class Score {
  score = 0;
  HIGH_SCORE_KEY = 'highScore';
  currentStage = 1000;
  stageChange = {};

  constructor(ctx, scaleRatio, stageTable, itemTable, itemController) {
    this.ctx = ctx;
    this.canvas = ctx.canvas;
    this.scaleRatio = scaleRatio;
    this.stageTable = stageTable;
    this.itemTable = itemTable;
    this.itemController = itemController;
  }

  update(deltaTime) {
    const currentStageInfo = this.stageTable.find((stage) => stage.id === this.currentStage);
    const scorePerSecond = currentStageInfo ? currentStageInfo.scorePerSecond : 1;
    this.score += deltaTime * 0.001 * scorePerSecond;

    for (let i = 0; i < this.stageTable.length; i++) {
      const stage = this.stageTable[i];

      if (
        Math.floor(this.score) >= stage.score && //점수달성
        !this.stageChange[stage.id] //해당스테이지 변경여부 false인 경우만 스테이지 넘어감
      ) {
        const previousStage = this.currentStage;
        this.currentStage = stage.id;

        // 스테이지 변경여부
        this.stageChange[stage.id] = true;

        sendEvent(11, { currentStage: previousStage, targetStage: this.currentStage });

        if (this.itemController) {
          this.itemController.setCurrentStage(this.currentStage);
        }

        //스테이지 넘어갔으면 반복탈출
        break;
      }
    }
  }

  getItem(itemId) {
    const checkItem = this.itemTable.find((item) => item.id === itemId); //얻은 아이템id
    if (checkItem) {
      this.score += checkItem.score;
      sendEvent(12, { itemId, timestamp: Date.now() });
    }
  }

  reset() {
    this.score = 0;
    this.currentStage = 1000;

    // 모든 스테이지에 변경여부 초기화
    Object.keys(this.stageChange).forEach((id) => {
      this.stageChange[id] = false;
    });
  }

  setHighScore() {
    const highScore = Number(localStorage.getItem(this.HIGH_SCORE_KEY));
    if (this.score > highScore) {
      localStorage.setItem(this.HIGH_SCORE_KEY, Math.floor(this.score));
    }
  }

  getScore() {
    return this.score;
  }

  draw() {
    const highScore = Number(localStorage.getItem(this.HIGH_SCORE_KEY));
    const y = 20 * this.scaleRatio;

    const fontSize = 20 * this.scaleRatio;
    this.ctx.font = `${fontSize}px serif`;
    this.ctx.fillStyle = '#525250';

    const scoreX = this.canvas.width - 75 * this.scaleRatio;
    const highScoreX = scoreX - 125 * this.scaleRatio;

    const scorePadded = Math.floor(this.score).toString().padStart(6, 0);
    const highScorePadded = highScore.toString().padStart(6, 0);

    this.ctx.fillText(scorePadded, scoreX, y);
    this.ctx.fillText(`HI ${highScorePadded}`, highScoreX, y);
  }
}

export default Score;
