"use client";

import { useEffect, useState } from "react";
import { useSocket } from "@/lib/socket";
import { cn } from "@/lib/utils";

type Table = {
  id: number;
  name: string;
  status: "AVAILABLE" | "OCCUPIED" | "RESERVED";
  x: number;
  y: number;
};

export default function TableMap() {
  const socket = useSocket();
  const [tables, setTables] = useState<Table[]>([]);

  useEffect(() => {
    fetch("http://localhost:3001/tables")
      .then((res) => res.json())
      .then((data) => setTables(data))
      .catch((err) => console.error("Failed to fetch tables", err));

    if (!socket) return;

    socket.on("table_update", ({ tableId, status }) => {
      setTables((prev) =>
        prev.map((t) => (t.id === tableId ? { ...t, status } : t))
      );
    });

    return () => {
      socket.off("table_update");
    };
  }, [socket]);

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Sơ đồ bàn (Live)</h2>
      <div className="grid grid-cols-4 gap-4">
        {tables.map((table) => (
          <div
            key={table.id}
            className={cn(
              "h-32 rounded-xl flex items-center justify-center text-white font-bold text-xl cursor-pointer transition-colors",
              table.status === "AVAILABLE" && "bg-green-500 hover:bg-green-600",
              table.status === "OCCUPIED" && "bg-red-500",
              table.status === "RESERVED" && "bg-yellow-500"
            )}
            onClick={() => {
               window.location.href = `/pos/order/${table.id}`;
            }}
          >
            {table.name}
            <div className="text-sm font-normal mt-1 ml-2">({table.status})</div>
          </div>
        ))}
      </div>
    </div>
  );
}
