import { FHECounterDemo } from "./_components/FHECounterDemo";
import { UniversalSDKDemo } from "./_components/UniversalSDKDemo";

export default function Home() {
  return (
    <div className="flex flex-col gap-8 items-center sm:items-start w-full px-3 md:px-0">
      {/* Hero Section */}
      <div className="text-center mb-8 w-full">
        <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Universal FHEVM SDK
        </h1>
        <p className="text-xl text-gray-600 mb-6">
          Framework-agnostic toolkit for confidential dApps with wagmi-like API
        </p>
        <div className="flex flex-wrap justify-center gap-4 text-sm text-gray-500">
          <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full">🔒 End-to-End Encryption</span>
          <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full">⚡ Framework Agnostic</span>
          <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full">🎯 Wagmi-like API</span>
          <span className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full">🛡️ Production Ready</span>
        </div>
      </div>

      {/* Universal SDK Demo */}
      <div className="w-full">
        <h2 className="text-2xl font-bold mb-6 text-center">Universal SDK Demo</h2>
        <UniversalSDKDemo />
      </div>

      {/* Original FHECounter Demo */}
      <div className="w-full">
        <h2 className="text-2xl font-bold mb-6 text-center">FHECounter Contract Demo</h2>
        <FHECounterDemo />
      </div>
    </div>
  );
}
