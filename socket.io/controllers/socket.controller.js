const startGame = async (socket) => {
  try {
    console.log(socket.id);
  } catch (error) {
    console.error("error occured during start game", error?.message);

    return;
  }
};

const moneyInserted = async () => {
  try {
  } catch (error) {
    console.error("error occured during money inserted", error?.message);

    return;
  }
};
const pressedSpinButton = async () => {
  try {
  } catch (error) {
    console.error("error occured during spin button ", error?.message);

    return;
  }
};
const pressedPlayAgain = async () => {
  try {
  } catch (error) {
    console.error("error occured during play again", error?.message);

    return;
  }
};

const exitGame = async () => {
  try {
  } catch (error) {
    console.error("error occured during exit game", error?.message);

    return;
  }
};

module.exports = {
  startGame,
  exitGame,
  moneyInserted,
  pressedSpinButton,
  pressedPlayAgain,
};
