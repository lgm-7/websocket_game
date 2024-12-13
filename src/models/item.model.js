const items = {};

export const resetItem = (userId) => {
  items[userId] = [];
};

//아이템 획득기록
export const checkgetItem = (userId, item) => {
  if (!items[userId]) {
    return (items[userId] = []);
  }
  items[userId].push(item);
};

export const getItems = (userId) => {
  return items[userId];
};
