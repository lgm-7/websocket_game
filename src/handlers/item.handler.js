import { getGameAssets } from '../init/assets.js';
import { getStage } from '../models/stage.model.js';
import { checkItem } from '../models/item.model.js';

//아이템 획득기록
export const checkItemGet = (userId, payload) => {
  const { items } = getGameAssets();
  const { timestamp, itemId } = payload;

  const item = items.data.find((item) => item.id === itemId);
  if (!item) {
    return { status: 'fail', message: 'Invalid item ID' };
  }

  const currentStages = getStage(userId);
  if (!currentStages.length) {
    return { status: 'fail', message: 'No stages found for user' };
  }

  checkItem(userId, { id: itemId, timestamp });
  return { status: 'success', handler: 12 };
};
