import { PhoneRecorder } from '@/components/PhoneRecorder';

export default function PhonesPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-cardboard to-white p-8">
      <div className="max-w-6xl mx-auto">
        <header className="text-center mb-12">
          <h1 className="text-4xl font-serif text-soot mb-4">
            Unfinished Endings
          </h1>
          <p className="text-lg text-soot/70">
            Connect with voices from the archive
          </p>
        </header>

        <PhoneRecorder />
        
        <footer className="mt-12 text-center text-sm text-soot/50">
          <p>A living archive of loss and memory</p>
        </footer>
      </div>
    </div>
  );
}
