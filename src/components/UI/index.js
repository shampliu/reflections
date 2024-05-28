"use client";

import { clamp } from "@/lib/util";
import { MODE } from "../Sketch";
import cn from "classnames";
import {
  mirrors,
  eye,
  bounds,
  obj,
  ray,
  rays,
  gameState,
  SETTINGS,
} from "../Sketch/globals";
import { useEffect } from "react";
import gsap from "gsap";

export const UI = ({ settings, setSettings }) => {
  const startGame = () => {
    eye.x = Math.random() * (bounds.max.x - bounds.min.x) + bounds.min.x;
    eye.y = Math.random() * (bounds.max.y - bounds.min.y) + bounds.min.y;
    obj.x = Math.random() * (bounds.max.x - bounds.min.x) + bounds.min.x;
    obj.y = Math.random() * (bounds.max.y - bounds.min.y) + bounds.min.y;

    eye.x = clamp(
      eye.x,
      bounds.min.x + SETTINGS.BOUNDS_PADDING,
      bounds.max.x - SETTINGS.BOUNDS_PADDING
    );

    obj.x = clamp(
      obj.x,
      bounds.min.x + SETTINGS.BOUNDS_PADDING,
      bounds.max.x - SETTINGS.BOUNDS_PADDING
    );

    // ray.lines

    rays.forEach(
      (r) => (r.virtualRoomOpacity = SETTINGS.INACTIVE_VIRTUAL_ROOM_OPACITY)
    );

    gameState.prevTargetIdx = gameState.currentTargetIdx;
    while (
      gameState.currentTargetIdx === null ||
      gameState.currentTargetIdx === gameState.prevTargetIdx
    ) {
      gameState.currentTargetIdx = Math.floor(Math.random() * rays.length);
    }

    rays[gameState.currentTargetIdx].virtualRoomOpacity = 0.5;

    resetAim();
  };

  const resetAim = () => {
    ray.currentIdx = 0;
    ray.lastMirrorIdx = -1;
    ray.lines.forEach((l) => {
      l.start.x = null;
      l.start.y = null;
      l.end.x = null;
      l.end.y = null;
    });
    gameState.isFiring = false;
    gameState.isAiming = true;
  };

  const toggleVirtualRooms = () => {
    setSettings({
      ...settings,
      showAllVirtualRooms: !settings.showAllVirtualRooms,
    });
  };

  const toggleMode = (newMode) => {
    let m = newMode;
    if (newMode === undefined) {
      m = settings.currentMode === MODE.GUESS ? MODE.SANDBOX : MODE.GUESS;
    }

    rays.forEach(
      (r) =>
        (r.virtualRoomOpacity =
          newMode === MODE.GUESS ? SETTINGS.INACTIVE_VIRTUAL_ROOM_OPACITY : 0)
    );

    setSettings({
      ...settings,
      currentMode: m,
    });
  };

  const changeMirrors = (delta) => {
    setSettings({
      ...settings,
      numMirrors: clamp(settings.numMirrors + delta, 1, mirrors.length),
    });
  };

  useEffect(() => {
    gsap.to(rays, {
      progress: function (i) {
        return settings.highlightedRays[i];
      },
    });
  }, [settings.highlightedRays]);

  useEffect(() => {
    gsap.to(rays, {
      virtualRoomOpacity: settings.showAllVirtualRooms * 0.25,
    });
  }, [settings.showAllVirtualRooms]);

  let inner;
  if (settings.currentMode === MODE.GUESS) {
    inner = (
      <>
        <div className="button" onClick={startGame}>
          Start New Game
        </div>
        <div className="button" onClick={resetAim}>
          Retry Current
        </div>
      </>
    );
  } else {
    inner = (
      <>
        <div className={"flex justify-between items-center"}>
          <div>Mirrors</div>
          <div className="flex flex-row gap-x-2">
            <div className="button" onClick={() => changeMirrors(-1)}>
              -
            </div>
            <div className="button" onClick={() => changeMirrors(1)}>
              +
            </div>
          </div>
        </div>

        <div className="button" onClick={toggleVirtualRooms}>
          Toggle Virtual Rooms
        </div>

        <div>Show Rays</div>
        <div className="flex flex-row gap-x-1">
          <div
            className="button w-full"
            onClick={() => {
              const newArr = settings.highlightedRays.slice().fill(false);
              setSettings({
                ...settings,
                highlightedRays: newArr,
              });
            }}
          >
            None
          </div>
          {settings.highlightedRays.map((isHighlighted, i) => {
            return (
              <div
                className={cn("button", isHighlighted && "active")}
                onClick={() => {
                  const newArr = settings.highlightedRays.slice();
                  newArr[i] = !newArr[i];

                  setSettings({
                    ...settings,
                    highlightedRays: newArr,
                  });
                }}
              >
                {i + 1}
              </div>
            );
          })}
          <div
            className="button w-full"
            onClick={() => {
              const newArr = settings.highlightedRays.slice().fill(true);
              setSettings({
                ...settings,
                highlightedRays: newArr,
              });
            }}
          >
            All
          </div>
        </div>
      </>
    );
  }

  return (
    <div className="fixed top-[1vw] right-[1vw] w-[400px] flex-col flex gap-y-4">
      <div className="border">
        <div className="flex flex-row">
          <div
            className={cn(
              "tab",
              settings.currentMode === MODE.SANDBOX && "active"
            )}
            onClick={() => toggleMode(MODE.SANDBOX)}
          >
            Sandbox
          </div>
          <div
            className={cn(
              "tab",
              settings.currentMode === MODE.GUESS && "active"
            )}
            onClick={() => toggleMode(MODE.GUESS)}
          >
            Game
          </div>
        </div>
        <div className="p-4 bg-gray-100 flex-col flex gap-y-4">{inner}</div>
      </div>
      <div className="border p-4 flex flex-col gap-y-2 bg-white">
        <div>Legend</div>
        <div className="flex flex-row gap-x-2 items-center">
          <div className="w-[25px] h-[25px] bg-black border"></div>
          <div>Object</div>
        </div>
        <div className="flex flex-row gap-x-2 items-center">
          <div className="w-[25px] h-[25px] bg-white border"></div>
          <div>Eye</div>
        </div>
        <div className="flex flex-row gap-x-2 items-center">
          <div className="w-[25px] h-[25px] bg-[lightblue] border"></div>
          <div>Mirror</div>
        </div>
      </div>
    </div>
  );
};
