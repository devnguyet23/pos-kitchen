import TableMap from "@/components/TableMap";

export default function PosPage() {
  return (
    <main className="min-h-screen bg-gray-100">
      <header className="bg-white p-4 shadow mb-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-blue-800">POS System</h1>
        <div className="space-x-4">
            <a href="/kds" className="text-blue-600 hover:underline">Go to KDS</a>
        </div>
      </header>
      <TableMap />
    </main>
  );
}
