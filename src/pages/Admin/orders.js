import { useState, useEffect } from 'react';
import axios from 'axios';
import { Search, Settings, X } from 'lucide-react';
import Sidebar from '../../components/admin/sidebar';
import { collection, getDocs, doc, updateDoc } from "firebase/firestore";
import { db } from "../../firebase/firebase"; 
import { useLanguage } from '../../LanguageContext';

export default function OrderManagement() {
  const [searchQuery, setSearchQuery] = useState('');
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [orderItems, setOrderItems] = useState([]);
  const { language } = useLanguage();

  const translations = {
    en: {
      title: "Orders",
      searchPlaceholder: "Search orders...",
      orderID: "Order ID",
      totalAmount: "Total Amount",
      status: "Status",
      createdAt: "Created At",
      actions: "Actions",
      viewDetails: "View Details",
      orderInfo: "Order Information",
      customerInfo: "Customer Information",
      name: "Name",
      phone: "Phone",
      district: "District",
      landmark: "Landmark",
      fullAddress: "Full Address",
      product: "Product",
      variant: "Variant",
      qty: "Qty",
      description: "Description",
      arabicDescription: "Arabic Description",
      price: "Price",
      total: "Total",
    },
    ar: {
      title: "الطلبات",
      searchPlaceholder: "ابحث عن الطلبات...",
      orderID: "رقم الطلب",
      totalAmount: "المبلغ الإجمالي",
      status: "الحالة",
      createdAt: "تاريخ الإنشاء",
      actions: "الإجراءات",
      viewDetails: "عرض التفاصيل",
      orderInfo: "معلومات الطلب",
      customerInfo: "معلومات العميل",
      name: "الاسم",
      phone: "رقم الهاتف",
      district: "المنطقة",
      landmark: "المعلم",
      fullAddress: "العنوان الكامل",
      product: "المنتج",
      variant: "النوع",
      qty: "الكمية",
      description: "الوصف",
      arabicDescription: "الوصف بالعربية",
      price: "السعر",
      total: "الإجمالي",
    }
  };

  const t = translations[language] || translations.en;

  useEffect(()=>{
    fetchOrders();
  },[]);
  
  useEffect(() => {
  }, [selectedOrder]);


  const fetchOrders = async () => {
    try {
      const ordersSnapshot = await getDocs(collection(db, "orders"));
      const ordersList = ordersSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setOrders(ordersList);
    } catch (error) {
      console.error("Error fetching orders:", error);
    }
  };
  

  const handleOrderClick = (order) => {

    setSelectedOrder({
      id: order.id || "N/A",
      status: order.status || "Unknown",
      totalAmount: order.totalAmount || "0.00",
      paymentMethod: order.paymentMethod || "N/A",
      createdAt: order.createdAt?.seconds 
        ? new Date(order.createdAt.seconds * 1000).toLocaleString() 
        : "N/A",
      userId: order.userId || "Unknown",

      // Extract Address
      address: order.address
        ? {
            name: order.address.name || "N/A",
            phoneNumber: order.address.phoneNumber || "N/A",
            district: order.address.district || "N/A",
            landmark: order.address.landMark || "N/A",
            fullAddress: order.address.address || "N/A"
          }
        : { name: "N/A", phoneNumber: "N/A", district: "N/A", landmark: "N/A", fullAddress: "N/A" },

      // Extract Cart Items
      cartItems: order.cartItems
        ? order.cartItems.map((item) => ({
            id: item.id || "N/A",
            productName: item.productName || "Unknown Product",
            variantName: item.variantName || "Unknown Variant",
            quantity: item.quantity ? parseInt(item.quantity, 10) : 0,
            price: item.variantPrice ? parseFloat(item.variantPrice) : 0.00,
            imageUrl: item.productImageUrl || "/placeholder.png",
            description: item.discription || "No description available",
            arabicDescription: item.arabicDiscription || "N/A",
          }))
        : [],
    }); // 🔍 Debugging
};

  
  const handleStatusChange = async (orderId, newStatus) => {
    try {
      const orderRef = doc(db, "orders", orderId);
      await updateDoc(orderRef, { status: newStatus });
  
      // Update state instantly without refetching
      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order.id === orderId ? { ...order, status: newStatus } : order
        )
      );
      } catch (error) {
      console.error("Error updating order status:", error);
    }
  };
  
  const filteredOrders = orders.filter((order) =>
    (order.id?.toLowerCase().includes(searchQuery.toLowerCase()) || 
     order.status?.toLowerCase().includes(searchQuery.toLowerCase()))
  );
  

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-gray-50 z-10">
          <div className="px-6 py-4">
            <div className="flex flex-col space-y-4">
              <div className="flex items-center justify-between">
                <h1 className="text-2xl font-semibold text-gray-800">{t.title}</h1>
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    <input
                      type="text"
                      placeholder={t.searchPlaceholder}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 pr-4 py-2 w-64 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </header>
{/* Scrollable Content */}
<div className="flex-1 overflow-hidden bg-gray-100 p-6">
  <div className="bg-white rounded-lg shadow h-full flex flex-col">
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t.orderID}</th>
            <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t.totalAmount}</th>
            <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t.status}</th>
            <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t.createdAt}</th>
            <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t.actions}</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {filteredOrders.length === 0 ? (
            <tr>
              <td colSpan="5" className="px-6 py-4 text-center text-gray-500">
                {t.noOrders}
              </td>
            </tr>
          ) : (
            filteredOrders.map((order) => (
              <tr key={order.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-sm font-medium text-gray-900">#{order.id}</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-sm text-gray-900 font-medium">₹{order.totalAmount}</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <select
                    value={order.status}
                    onChange={(e) => handleStatusChange(order.id, e.target.value)}
                    className="text-sm border border-gray-300 rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <option value="Processing">Payment Processing</option>
                    <option value="paid">Paid</option>
                    <option value="Shipped">Shipped</option>
                    <option value="Delivered">Delivered</option>
                    <option value="Cancelled">Cancelled</option>
                    <option value="Returned">Returned</option>
                    <option value="failed">Payment Failed</option>
                  </select>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-sm text-gray-500">
                    {order.createdAt && order.createdAt.toDate ? order.createdAt.toDate().toLocaleString() : "N/A"}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <button
                    onClick={() => handleOrderClick(order)}
                    className="text-green-600 hover:text-green-700 hover:bg-green-50 px-3 py-1.5 rounded-lg border border-green-600 text-sm font-medium transition-colors duration-200"
                  >
                    {t.viewDetails}
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  </div>
</div>

{/* Order Details Modal */}
{selectedOrder && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
    <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-800">Order Details</h2>
        <button
          onClick={() => setSelectedOrder(null)}
          className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <div className="p-6 overflow-y-auto" style={{ maxHeight: 'calc(90vh - 120px)' }}>
        <div className="grid grid-cols-2 gap-8 mb-6">
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold mb-4 text-gray-900">{t.orderInfo}</h3>
            <p><strong>{t.orderID}:</strong> {selectedOrder.id || "N/A"}</p>
            <p><strong>{t.status}:</strong> {selectedOrder.status || "N/A"}</p>
            <p><strong>{t.createdAt}:</strong> {selectedOrder.createdAt}</p>
            <p><strong>{t.totalAmount}:</strong> ₹{selectedOrder.totalAmount || "N/A"}</p>
            <p><strong>{t.paymentMethod}:</strong> {selectedOrder.paymentMethod || "N/A"}</p>
            <p><strong>{t.userId}:</strong> {selectedOrder.userId || "N/A"}</p>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold mb-4 text-gray-900">{t.customerInfo}</h3>
            <p><strong>{t.name}:</strong> {selectedOrder.address?.name || "N/A"}</p>
            <p><strong>{t.phone}:</strong> {selectedOrder.address?.phoneNumber || "N/A"}</p>
            <p><strong>{t.district}:</strong> {selectedOrder.address?.district || "N/A"}</p>
            <p><strong>{t.landmark}:</strong> {selectedOrder.address?.landmark || "N/A"}</p>
            <p><strong>{t.fullAddress}:</strong> {selectedOrder.address?.fullAddress || "N/A"}</p>
          </div>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold mb-4 text-gray-900">{t.orderItems}</h3>
          {selectedOrder.cartItems.length === 0 ? (
            <p className="text-gray-500">{t.noItems}</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-white">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t.product}</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t.variant}</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t.qty}</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t.description}</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t.arabicDescription}</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">{t.price}</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">{t.total}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {selectedOrder.cartItems.map((item) => (
                    <tr key={item.id} className="bg-white">
                      <td className="px-4 py-3 text-sm text-gray-900">{item.productName}</td>
                      <td className="px-4 py-3 text-sm text-gray-500">{item.variantName}</td>
                      <td className="px-4 py-3 text-sm text-gray-500">{item.quantity}</td>
                      <td className="px-4 py-3 text-sm text-gray-500">{item.description || t.noDescription}</td>
                      <td className="px-4 py-3 text-sm text-gray-500">{item.arabicDescription || t.noDescription}</td>
                      <td className="px-4 py-3 text-sm text-gray-500 text-right">₹{parseFloat(item.price).toFixed(2)}</td>
                      <td className="px-4 py-3 text-sm font-medium text-gray-900 text-right">
                        ₹{(parseFloat(item.quantity) * parseFloat(item.price)).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  </div>
)}
      </div>
    </div>
  );
}