import { Sketch } from "@/components/Sketch/index";
import Image from "next/image";

export default function Home() {
  return (
    <main className="flex min-h-screen justify-center p-24">
      <div className="z-10 max-w-2xl w-full items-center justify-between font-mono text-sm ">
        <h1 className="text-xl font-bold">Reflections</h1>
        <div>
          - start by exploring in sandbox mode (drag the object/eye, change
          number of mirrors, toggle rays, toggle virtual rooms)
        </div>

        <div>
          - try game mode next, press "Start" to begin and try to guess the ray
          path used to create the highlighted virtual room
        </div>
        <div className="mb-8">
          - note: maximum number of reflections supported currently is 2
        </div>
        <Sketch />
      </div>
    </main>
  );
}
