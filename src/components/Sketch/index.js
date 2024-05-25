"use client";

import {
  MIRROR_TYPE,
  calculateDoubleReflection,
  calculateSingleReflection,
} from "@/lib/reflections";
import { clamp } from "@/lib/util";
import dynamic from "next/dynamic";
import { useState, useEffect, useRef } from "react";
import cn from "classnames";
import gsap from "gsap";
const importFunction = () => import("react-p5").then((mod) => mod.default);

let P5Sketch = null;
if (typeof window !== "undefined") {
  P5Sketch = dynamic(importFunction, { ssr: false });
}

const bounds = {
  min: {
    x: null,
    y: null,
  },
  max: {
    x: null,
    y: null,
  },
};

// TODO: this is hardcoded
const sceneConfig = [
  {
    color: "blue",
  },
  {
    color: "orange",
  },
  {
    color: "red",
  },
  {
    color: "purple",
  },
];

const obj = {
  x: null,
  y: null,
  w: 25,
  h: 25,
};

const eye = {
  x: null,
  y: null,
  w: 25,
  h: 25,
};

const mirrors = [
  {
    x: null,
    y: null,
    w: 5,
    h: 100,
    type: MIRROR_TYPE.VERTICAL,
    //
  },
  {
    x: null,
    y: null,
    w: 5,
    h: 100,
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

let rayTarget = {
  isActive: false,
  x: null,
  y: null,
  reflections: null,
};

let ray = {
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

const SETTINGS = {
  FIRING_SPEED: 2,
  MAX_RAY_LENGTH: 400,
  RAY_HIT_BOUNDARY: 1,
  LINE_WEIGHT: 3,
  LINE_DASH: [5, 5],
  OBJECT_COLOR: null,
  BOUNDS_PADDING: 25,
};

const MODE = {
  SANDBOX: 0,
  GUESS: 1,
};

const STATE = {
  numMirrors: 1,
  showVirtualRooms: false,
  showAllRays: false,
  currentMode: MODE.SANDBOX,
  //   isAiming: false
};

let draggingTarget;
let offsetX, offsetY;
let isAiming = true;
let isFiring = false;

function checkHit(src, dst, boundX, boundY) {
  return Math.abs(src.x - dst.x) < boundX && Math.abs(src.y - dst.y) < boundY;
}

function checkMousePressed(p5, obj) {
  if (
    p5.mouseX > obj.x - obj.w / 2 &&
    p5.mouseX < obj.x + obj.w / 2 &&
    p5.mouseY > obj.y - obj.h / 2 &&
    p5.mouseY < obj.y + obj.h / 2
  ) {
    draggingTarget = obj;
    offsetX = obj.x - p5.mouseX;
    offsetY = obj.y - p5.mouseY;
  }
}

function drawVirtualRoom(p5, point, ray, mirrors) {
  const m1 = mirrors[0];
  const numReflections = mirrors.length;

  p5.push();

  p5.drawingContext.globalAlpha = 0.5;
  p5.fill(SETTINGS.OBJECT_COLOR);

  p5.push();
  p5.stroke(SETTINGS.OBJECT_COLOR);
  p5.drawingContext.setLineDash(SETTINGS.LINE_DASH);

  const newX = point.x + ray.x,
    newY = point.y + ray.y;
  p5.line(point.x, point.y, newX, newY);

  p5.pop();

  // draw object
  p5.push();
  p5.translate(newX, newY);
  if (m1.type === MIRROR_TYPE.VERTICAL) {
    p5.scale(Math.pow(-1, numReflections), 1);
  } else if (m1.type === MIRROR_TYPE.HORIZONTAL) {
    p5.scale(1, Math.pow(-1, numReflections));
  }
  drawObject(p5);
  p5.pop();

  // draw eye
  p5.push();
  if (m1.type === MIRROR_TYPE.VERTICAL) {
    const dx = m1.x - eye.x;
    let x = m1.x + dx;
    // TODO: this is hardcoded
    if (numReflections === 2) {
      x += (mirrors[1].x - eye.x) * -2;
      // x += (bounds.max.x - bounds.min.x) * Math.sign(dx);
    }

    p5.translate(x, eye.y);
    p5.scale(Math.pow(-1, numReflections), 1);
  } else if (m1.type === MIRROR_TYPE.HORIZONTAL) {
    p5.translate(eye.x, m1.y - eye.y + m1.y);
    p5.scale(1, Math.pow(-1, numReflections));
  }
  drawEye(p5);
  p5.pop();

  // draw mirror
  // TODO: hardcoded
  if (m1.type === MIRROR_TYPE.VERTICAL && numReflections === 2) {
    const m2 = mirrors[1];
    const newX = m1.x + (m1.x - m2.x);

    p5.rect(newX, m2.y, m2.w, m2.h);
  }

  p5.pop();
}

function drawSingleReflection(p5, obj, eye, m) {
  p5.push();
  p5.strokeWeight(SETTINGS.LINE_WEIGHT);
  p5.stroke("red");
  p5.fill("red");
  const p1 = calculateSingleReflection(obj, eye, m);

  if (STATE.showAllRays) {
    p5.line(obj.x, obj.y, p1.x, p1.y);
    p5.line(p1.x, p1.y, eye.x, eye.y);
    // draw directional arrow
    drawDirectionalArrow(p5, eye.x, eye.y, eye.x - p1.x, eye.y - p1.y);
  }

  p5.pop();

  // draw virtual room
  if (STATE.showVirtualRooms) {
    const d = p5.dist(p1.x, p1.y, obj.x, obj.y);

    const v = p5
      .createVector(p1.x - eye.x, p1.y - eye.y)
      .normalize()
      .mult(d);

    drawVirtualRoom(p5, p1, v, [m]);
  }
}

function drawDirectionalArrow(p5, x, y, dx, dy) {
  p5.push();
  p5.strokeWeight(SETTINGS.LINE_WEIGHT);
  p5.translate(x, y);
  const angle = p5.atan2(dy, dx);
  p5.rotate(angle);
  p5.triangle(0, 0, -10, -5, -10, 5);
  p5.pop();
}

function drawObject(p5) {
  p5.push();
  p5.fill(SETTINGS.OBJECT_COLOR);

  p5.rotate(p5.HALF_PI);
  p5.triangle(-obj.w / 2, obj.h / 2, obj.w / 2, obj.h / 2, 0, -obj.h / 2);
  p5.pop();
}

function drawEye(p5) {
  p5.push();
  p5.fill("white");
  p5.circle(0, 0, eye.w);
  p5.pop();
}

function drawDoubleReflection(p5, obj, eye, m1, m2) {
  const { p1, p2 } = calculateDoubleReflection(obj, eye, m1, m2);

  p5.push();
  p5.strokeWeight(SETTINGS.LINE_WEIGHT);
  p5.fill("yellow");
  p5.stroke("yellow");

  if (STATE.showAllRays) {
    p5.line(p1.x, p1.y, p2.x, p2.y);
    p5.line(p1.x, p1.y, eye.x, eye.y);
    p5.line(obj.x, obj.y, p2.x, p2.y);

    drawDirectionalArrow(p5, eye.x, eye.y, eye.x - p1.x, eye.y - p1.y);
  }
  p5.pop();

  // draw virtual room
  if (STATE.showVirtualRooms) {
    const d =
      p5.dist(p1.x, p1.y, p2.x, p2.y) + p5.dist(obj.x, obj.y, p2.x, p2.y);
    const v = p5
      .createVector(p1.x - eye.x, p1.y - eye.y)
      .normalize()
      .mult(d);
    drawVirtualRoom(p5, p1, v, [m1, m2]);
  }
}

export const Sketch = (props) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const setup = (p5, canvasParentRef) => {
    SETTINGS.OBJECT_COLOR = p5.color("black");

    ray.direction = p5.createVector(0, 0);

    ray.lines.forEach((l) => {
      l.start = p5.createVector(0, 0);
      l.end = p5.createVector(0, 0);
    });

    // use parent to render the canvas in this ref
    // (without that p5 will render the canvas outside of your component)
    const { width: w } = canvasParentRef.getBoundingClientRect();

    const canvas = p5.createCanvas(w, w).parent(canvasParentRef);

    const { width, height } = p5;
    const leftBound = width / 2 - width / 10;
    const rightBound = width / 2 + width / 10;
    const upperBound = height / 2 - height / 8;
    const lowerBound = height / 2 + height / 8;

    p5.rectMode(p5.CENTER);
    obj.x = width / 2;
    obj.y = upperBound;

    eye.x = width / 2;
    eye.y = lowerBound;

    bounds.min.x = leftBound;
    bounds.max.x = rightBound;
    bounds.min.y = upperBound;
    bounds.max.y = lowerBound;

    mirrors[0].x = rightBound;
    mirrors[0].y = height / 2;

    mirrors[1].x = leftBound;
    mirrors[1].y = height / 2;

    // mirrors[2].x = width / 2;
    // mirrors[2].y = upperBound;
  };

  const draw = (p5) => {
    p5.background(220);
    // p5.strokeWeight(4);

    p5.push();
    p5.translate(obj.x, obj.y);
    drawObject(p5);
    p5.pop();

    p5.push();
    p5.translate(eye.x, eye.y);
    drawEye(p5);
    p5.pop();

    for (let i = 0; i < STATE.numMirrors; i++) {
      const m = mirrors[i];
      p5.push();
      // p5.noStroke();
      p5.fill("lightblue");
      p5.rect(m.x, m.y, m.w, m.h);
      p5.pop();

      // TODO:
      // drawSingleReflection(p5, obj, eye, m);

      // for (let j = 0; j < STATE.numMirrors, j !== i; j++) {
      //   drawDoubleReflection(p5, obj, eye, mirrors[j], m);
      //   drawDoubleReflection(p5, obj, eye, m, mirrors[j]);
      // }
    }

    // TODO: config is hardcoded
    drawSingleReflection(p5, obj, eye, mirrors[0]);
    drawSingleReflection(p5, obj, eye, mirrors[1]);
    drawDoubleReflection(p5, obj, eye, mirrors[1], mirrors[0]);
    drawDoubleReflection(p5, obj, eye, mirrors[0], mirrors[1]);

    if (STATE.currentMode === MODE.GUESS) {
      if (isAiming) {
        ray.direction.set(p5.mouseX - obj.x, p5.mouseY - obj.y).normalize();

        const line = ray.lines[ray.currentIdx];
        line.start.set(obj.x, obj.y);

        line.end.set(
          line.start.x + ray.direction.x * 50,
          line.start.y + ray.direction.y * 50
        );
      }

      // sum up length
      let length = 0;
      p5.push();
      p5.fill("yellow");
      p5.stroke("yellow");
      p5.strokeWeight(SETTINGS.LINE_WEIGHT);
      for (let i = 0; i <= ray.currentIdx; i++) {
        const line = ray.lines[i];

        p5.line(line.start.x, line.start.y, line.end.x, line.end.y);

        length += p5.dist(line.start.x, line.start.y, line.end.x, line.end.y);
      }

      const lastLine = ray.lines[ray.currentIdx];
      drawDirectionalArrow(
        p5,
        lastLine.end.x,
        lastLine.end.y,
        ray.direction.x,
        ray.direction.y
      );
      p5.pop();

      if (isFiring) {
        if (length >= SETTINGS.MAX_RAY_LENGTH) {
          // stop
        } else if (
          rayTarget.isActive &&
          checkHit(rayTarget, lastLine.end, 25, 25)
        ) {
          // success
        } else {
          lastLine.end.set(
            lastLine.end.x + ray.direction.x * SETTINGS.FIRING_SPEED,
            lastLine.end.y + ray.direction.y * SETTINGS.FIRING_SPEED
          );
        }

        // check mirror intersection
        mirrors.forEach((m, i) => {
          // skip if it already hit mirror
          if (i === ray.lastMirrorIdx) {
            return;
          }

          if (m.type === MIRROR_TYPE.VERTICAL) {
            if (checkHit(lastLine.end, m, 1, m.h / 2)) {
              // bounce it
              ray.direction.x *= -1;
              ray.lastMirrorIdx = i;
              lastLine.end.x = m.x;

              ray.currentIdx++;
              ray.lines[ray.currentIdx].start.x = lastLine.end.x;
              ray.lines[ray.currentIdx].start.y = lastLine.end.y;
              ray.lines[ray.currentIdx].end.x = lastLine.end.x;
              ray.lines[ray.currentIdx].end.y = lastLine.end.y;
            }
          } else if (m.type === MIRROR_TYPE.HORIZONTAL) {
          }
        });
      }
    }
  };

  const mouseReleased = () => {
    draggingTarget = null;
  };

  const mouseDragged = (p5) => {
    if (draggingTarget) {
      const { min, max } = bounds;
      draggingTarget.x = clamp(
        p5.mouseX + offsetX,
        min.x + SETTINGS.BOUNDS_PADDING,
        max.x - SETTINGS.BOUNDS_PADDING
      );
      draggingTarget.y = clamp(p5.mouseY + offsetY, min.y, max.y);
    }
  };

  const mousePressed = (p5) => {
    checkMousePressed(p5, obj);
    checkMousePressed(p5, eye);

    if (STATE.currentMode === MODE.GUESS && isAiming) {
      isAiming = false;

      isFiring = true;
    }
  };

  const addMirror = () => {
    STATE.numMirrors = Math.min(mirrors.length, STATE.numMirrors + 1);
  };

  const removeMirror = () => {
    STATE.numMirrors = Math.max(1, STATE.numMirrors - 1);
  };

  const startAiming = () => {
    ray.currentIdx = 0;
    ray.lastMirrorIdx = -1;
    ray.lines.forEach((l) => {
      l.start.x = null;
      l.start.y = null;
      l.end.x = null;
      l.end.y = null;
    });
    // ray.lines
    isAiming = true;
  };

  const toggleVirtualRooms = () => {
    STATE.showVirtualRooms = !STATE.showVirtualRooms;
  };

  const toggleMode = () => {
    STATE.currentMode =
      STATE.currentMode === MODE.GUESS ? MODE.SANDBOX : MODE.GUESS;
    // STATE.mode
  };

  if (!mounted) return null;

  const buttonClassName = "cursor-pointer hover:bg-black hover:text-white";

  const ui = (
    <div className="fixed top-[1vw] right-[1vw] w-[250px] border">
      <div className="flex flex-row border-b">
        <div className="tab">Sandbox</div>
        <div className="tab">Game</div>
      </div>
      <div className="p-4">
        <div className={"flex justify-between items-center row"}>
          <div>Mirrors</div>
          <div className="flex flex-row">
            <div className="button" onClick={removeMirror}>
              -
            </div>
            <div className="button" onClick={addMirror}>
              +
            </div>
          </div>
        </div>

        <div className="button" onClick={startAiming}>
          aim
        </div>
        <div className="button" onClick={toggleVirtualRooms}>
          toggle virtual rooms
        </div>
        <div className="button" onClick={toggleMode}>
          toggle mode
        </div>
        <div
          className="button"
          onClick={() => {
            STATE.showAllRays = !STATE.showAllRays;
          }}
        >
          toggle rays
        </div>
      </div>
    </div>
  );

  return (
    <div>
      <P5Sketch
        setup={setup}
        draw={draw}
        mouseReleased={mouseReleased}
        mouseDragged={mouseDragged}
        mousePressed={mousePressed}
        className={"rounded-xl overflow-hidden"}
      />
      {ui}
    </div>
  );
};
