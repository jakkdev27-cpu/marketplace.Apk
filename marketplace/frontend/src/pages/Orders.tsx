import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import api from "../api/client";
import { formatPrice } from "../utils/format";

interface OrderLine {
  productId: string;
  productName: string;
  quantity: number;
  unitPriceMinor: number;
}

interface SellerOrder {
  id: string;
  orderId: string;
  shopId: string;
  shopName: string;
  status: string;
  subtotalMinor: number;
  currency: string;
  items: OrderLine[];
}

interface Order {
  id: string;
  status: string;
  totalMinor: number;
  currency: string;
  liveSessionId?: string;
  createdAt: string;
  sellerOrders: SellerOrder[];
}

export default function Orders() {
  const { data, isPending, error } = useQuery({
    queryKey: ["orders"],
    queryFn: async () => (await api.get<Order[]>("/orders")).data,
  });

  const orders: Order[] = data ?? [];

  if (isPending) {
    return <div className="text-center py-12">Chargement des commandes…</div>;
  }

  if (error) {
    return (
      <div className="text-center py-12 text-red-500">
        Erreur de chargement des commandes.
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Mes commandes</h1>
        <Link
          to="/products"
          className="text-sm font-medium text-blue-600 hover:underline"
        >
          Continuer mes achats
        </Link>
      </div>

      {orders.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-300 bg-white p-10 text-center text-gray-600">
          Aucune commande pour le moment.
        </div>
      ) : (
        <div className="space-y-5">
          {orders.map((order) => (
            <div
              key={order.id}
              className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm"
            >
              <div className="flex flex-col gap-3 border-b border-gray-100 pb-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="text-sm text-gray-500">
                    Commande #{order.id.slice(0, 8).toUpperCase()}
                  </p>
                  <p className="text-lg font-semibold">
                    {new Date(order.createdAt).toLocaleDateString("fr-FR")}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
                    {order.status}
                  </span>
                  <span className="text-lg font-bold">
                    {formatPrice(order.totalMinor, order.currency)}
                  </span>
                </div>
              </div>

              <div className="mt-4 space-y-4">
                {order.sellerOrders.map((sellerOrder) => (
                  <div
                    key={sellerOrder.id}
                    className="rounded-xl bg-gray-50 p-4"
                  >
                    <div className="mb-3 flex items-center justify-between">
                      <h2 className="font-semibold text-gray-800">
                        {sellerOrder.shopName}
                      </h2>
                      <span className="text-sm text-gray-500">
                        {sellerOrder.status}
                      </span>
                    </div>

                    <div className="space-y-2">
                      {sellerOrder.items.map((item) => (
                        <div
                          key={`${sellerOrder.id}-${item.productId}`}
                          className="flex items-center justify-between gap-4 text-sm text-gray-700"
                        >
                          <div>
                            <p className="font-medium">{item.productName}</p>
                            <p className="text-gray-500">
                              Qté : {item.quantity}
                            </p>
                          </div>
                          <p>
                            {formatPrice(
                              item.unitPriceMinor * item.quantity,
                              sellerOrder.currency,
                            )}
                          </p>
                        </div>
                      ))}
                    </div>

                    <div className="mt-3 text-right text-sm font-semibold text-gray-800">
                      Sous-total :{" "}
                      {formatPrice(
                        sellerOrder.subtotalMinor,
                        sellerOrder.currency,
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
