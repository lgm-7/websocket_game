import { getStage, setStage, getItems } from '../models/stage.model.js';
import { getGameAssets } from '../init/assets.js';

export const moveStageHandler = (userId, payload) => {
  // 유저의 현재 스테이지 배열을 가져오고, 최대 스테이지 ID를 찾는다.
  let currentStages = getStage(userId);
  if (!currentStages.length) {
    return { status: 'fail', message: 'No stages found for user' };
  }

  // 오름차순 정렬 후 가장 큰 스테이지 ID 확인 = 가장 상위의 스테이지 = 현재 스테이지
  currentStages.sort((a, b) => a.id - b.id);
  const currentStage = currentStages[currentStages.length - 1];

  // payload 의 currentStage 와 비교
  if (currentStage.id !== payload.currentStage) {
    return { status: 'fail', message: 'Current stage mismatch' };
  }

  const { stages } = getGameAssets();
  const currentStageInfo = stages.data.find((stage) => stage.id === payload.currentStage);
  const targetStageInfo = stages.data.find((stage) => stage.id === payload.targetStage);

  // 점수 검증
  console.log(targetStageInfo);
  const serverTime = Date.now();
  const itemsScore = getItems(userId);
  const totalScore = currentStageInfo.scorePerSecond * serverTime + itemsScore;

  // 스테이지 정해진 점수, 다음스테이지 이동 지연
  if (targetStageInfo.score > totalScore) {
    return { status: 'fail', message: 'Invalid elapsed time' };
  }

  // 게임 에셋에서 다음 스테이지의 존재 여부 확인

  if (!stages.data.some((stage) => stage.id === payload.targetStage)) {
    return { status: 'fail', message: 'Target stage does not exist' };
  }

  // 유저의 다음 스테이지 정보 업데이트 + 현재 시간
  setStage(userId, payload.targetStage, serverTime);
  return { status: 'success' };
};
