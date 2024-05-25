import { Sketch } from "@/components/Sketch/index";
import Image from "next/image";

export default function Home() {
  return (
    <main className="flex min-h-screen justify-center p-24">
      <div className="z-10 max-w-2xl w-full items-center justify-between font-mono text-sm ">
        Brilliant: Reflections
        <div>
          Note: the maximum number of reflections we support currently is 2
        </div>
        <Sketch />
      </div>
    </main>
  );
}
