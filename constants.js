module.exports = {
  WinningCombinationsEnum: {
    1: [
      [1, 1, 1],
      [2, 2, 2],
      [3, 3, 3],
      [4, 4, 4],
      [5, 5, 5],
      [6, 6, 6],
      [7, 7, 7],
    ],
  },

  WinningTypes: {
    jackpot: "JACKPOT",
    threeOfKind: "THREE_OF_KIND",
    twoOfKind: "TWO_OF_KIND",
  },

  LostType: {
    lost: "LOST",
  },

  WinningTypesReturn: {
    jackpot: 45,
    threeOfKind: 9,
    twoOfKind: 2,
  },

  LostTypeReturn: {
    lost: -1,
  },
};
