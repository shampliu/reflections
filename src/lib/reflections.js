export const MIRROR_TYPE = {
  VERTICAL: 0,
  HORIZONTAL: 1,
};

export function calculateSingleReflection(obj, eye, mirror) {
  if (mirror.type === MIRROR_TYPE.VERTICAL) {
    // (yE - y) / (xE - x) = -(y - yO) / (x - xO)

    const d1 = eye.x - mirror.x;
    const d2 = mirror.x - obj.x;

    const y = (d1 * obj.y - d2 * eye.y) / (d1 - d2);

    return { x: mirror.x, y };
  }

  if (mirror.type === MIRROR_TYPE.HORIZONTAL) {
    const n1 = eye.y - mirror.y;
    const n2 = -(mirror.y - obj.y);

    const x = (n2 * eye.x - n2 * mirror.x - n1 * mirror.x) / -n1;
    return { x, y: mirror.y };
  }
}

export function calculateDoubleReflection(obj, eye, m1, m2) {
  if (m1.type === MIRROR_TYPE.VERTICAL && m2.type === MIRROR_TYPE.VERTICAL) {
    const d1 = m1.x - eye.x;
    const d2 = m2.x - m1.x;
    const d3 = obj.x - m2.x;

    const m2y =
      (d2 * obj.y - (d3 * d2 * eye.y) / (d2 - d1)) /
      (d2 - d3 - (d3 * d1) / (d2 - d1));

    const m1y = (d2 * eye.y - d1 * m2y) / (d2 - d1);

    return {
      p1: {
        x: m1.x,
        y: m1y,
      },
      p2: {
        x: m2.x,
        y: m2y,
      },
    };
  }
}
