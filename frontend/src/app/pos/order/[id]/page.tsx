import OrderInterface from "@/components/OrderInterface";

export default function OrderPage({ params }: { params: { id: string } }) {
  return <OrderInterface tableId={params.id} />;
}
