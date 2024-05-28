import { Sketch } from "@/components/Sketch/index";
import Image from "next/image";

export default function Home() {
  return (
    <main className="flex min-h-screen justify-center p-24">
      <div className="z-10 max-w-2xl w-full items-center justify-between font-mono text-sm ">
        <h1 className="text-xl font-bold">Reflections</h1>
        <div>
          - start in sandbox mode, drag the eye/object and toggle the
          mirrors/rays
        </div>
        <div>- add in mirrors</div>
        <div>- go into game mode last</div>
        <div className="mb-8">
          - note: maximum number of reflections supported currently is 2
        </div>
        <Sketch />
      </div>
    </main>
  );
}
