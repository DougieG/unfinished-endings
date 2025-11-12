import WitnessWall from '@/components/WitnessWall';
import ArchiveCore from '@/components/ArchiveCore';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-cardboard">
      <header className="py-8 text-center border-b border-soot/10">
        <h1 className="text-5xl font-serif text-soot mb-2">
          Unfinished Endings
        </h1>
        <p className="text-lg font-sans text-soot/60">
          A living archive of loss and memory
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 min-h-[calc(100vh-120px)]">
        <div className="border-r border-soot/10">
          <WitnessWall />
        </div>
        <div>
          <ArchiveCore />
        </div>
      </div>
    </div>
  );
}
