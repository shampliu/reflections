import { MIRROR_TYPE } from "@/lib/reflections";

export const bounds = {
  min: {
    x: null,
    y: null,
  },
  max: {
    x: null,
    y: null,
  },
};

export const obj = {
  x: null,
  y: null,
  w: 25,
  h: 25,
};

export const eye = {
  x: null,
  y: null,
  w: 25,
  h: 25,
};

export const mirrors = [
  {
    x: null,
    y: null,
    w: 8,
    h: 150,
    type: MIRROR_TYPE.VERTICAL,
    //
  },
  {
    x: null,
    y: null,
    w: 8,
    h: 150,
    type: MIRROR_TYPE.VERTICAL,
  },
  // {
  //   x: null,
  //   y: null,
  //   w: 100,
  //   h: 5,
  //   type: MIRROR_TYPE.HORIZONTAL,
  // },
];

export const SETTINGS = {
  FIRING_SPEED: 2,
  MAX_RAY_LENGTH: 400,
  LINE_WEIGHT: 3,
  LINE_DASH: [5, 5],
  OBJECT_COLOR: "black",
  BOUNDS_PADDING: 25,
  INACTIVE_VIRTUAL_ROOM_OPACITY: 0.05,
};

export const gameState = {
  currentTargetIdx: null,
  isAiming: false,
  isFiring: false,
  prevTargetIdx: null,
};

export const ray = {
  direction: null,
  currentIdx: 0,
  lines: [
    {
      start: null,
      end: null,
    },
    {
      start: null,
      end: null,
    },
    {
      start: null,
      end: null,
    },
  ],
  lastMirrorIdx: -1,
};

export const rays = [
  {
    progress: 0,
    color: "blue",
    virtualRoomOpacity: 0,

    // TODO: these values are hardcoded, compare these to the value of ray to see if the user traced the same path
    lastMirrorIdx: 0,
    currentIdx: 1,
  },
  {
    progress: 0,
    color: "orange",
    virtualRoomOpacity: 0,

    lastMirrorIdx: 1,
    currentIdx: 1,
  },
  {
    progress: 0,
    color: "red",
    virtualRoomOpacity: 0,

    lastMirrorIdx: 1,
    currentIdx: 2,
  },
  {
    progress: 0,
    color: "purple",
    virtualRoomOpacity: 0,

    lastMirrorIdx: 0,
    currentIdx: 2,
  },
];
