import { getGameAssets } from '../init/assets.js';
import { clearStage, getStage, setStage } from '../models/stage.model.js';
import { resetItem, getItems } from '../models/item.model.js';

export const gameStart = (uuid, payload) => {
  const { stages } = getGameAssets();
  clearStage(uuid);
  setStage(uuid, stages.data[0].id, payload.timestamp);
  resetItem(uuid);

  return { status: 'success', handler: 2 };
};

export const gameEnd = (uuid, payload) => {
  // 클라이언트에서 받은 게임 종료 시 타임스탬프와 총 점수
  const { timestamp: gameEndTime, score } = payload;
  const stages = getStage(uuid);
  const userItems = getItems(uuid);
  const { stages: stageData, items: itemData } = getGameAssets();
  const stageTable = stageData.data;

  if (stages.length === 0) {
    return { status: 'fail', message: 'No stages found for user' };
  }

  let totalScore = 0;

  //현재스테이지 위치 인덱스 값
  stages.forEach((stage, index) => {
    let stageEndTime;
    if (index === stages.length - 1) {
      // 마지막 스테이지의 경우 종료 시간이 게임의 종료 시간
      stageEndTime = gameEndTime;
    } else {
      // 다음 스테이지의 시작 시간을 현재 스테이지의 종료 시간으로 사용
      stageEndTime = stages[index + 1].timestamp;
    }
    let stageDuration = (stageEndTime - stage.timestamp) / 1000; // 스테이지 지속 시간 (초 단위)

    // 현재 스테이지의 scorePerSecond를 가져옴
    const stageInfo = stageTable.find((s) => s.id === stage.id);
    const scorePerSecond = stageInfo ? stageInfo.scorePerSecond : 1;

    totalScore += stageDuration * scorePerSecond; // 각 스테이지의 scorePerSecond를 반영하여 점수 계산
  });

  // 아이템 획득 점수 추가
  userItems.forEach((userItem) => {
    const item = itemData.data.find((item) => item.id === userItem.id);
    if (item) {
      totalScore += item.score;
    }
  });

  // 점수와 타임스탬프 검증 (예: 클라이언트가 보낸 총점과 계산된 총점 비교)
  // 오차범위 5
  if (Math.abs(score - totalScore) > 5) {
    return { status: 'fail', message: 'Score verification failed' };
  }

  console.log(`totalScore: ${Math.floor(totalScore)}`);

  // 검증이 통과되면 게임 종료 처리
  return { status: 'success', message: 'Game ended successfully', score };
};
