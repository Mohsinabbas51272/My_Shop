import { Receipt, Printer, Send, X } from 'lucide-react';

interface OrderReceiptProps {
    order: any;
    formatPrice: (price: number) => string;
    onClose: () => void;
    onSendToDashboard?: () => void;
    isAdmin?: boolean;
}

const OrderReceipt = ({ order: rawOrder, formatPrice, onClose, onSendToDashboard, isAdmin }: OrderReceiptProps) => {
    const order = {
        ...rawOrder,
        items: typeof rawOrder.items === 'string'
            ? (() => { try { return JSON.parse(rawOrder.items); } catch (e) { return []; } })()
            : (rawOrder.items || [])
    };

    const handlePrint = () => {
        window.print();
    };

    const handleShare = async () => {
        const text = `*My Shop Official Receipt*\n\nOrder ID: #${order.displayId || order.id}\nCustomer: ${order.customerName}\nTotal Amount: ${formatPrice(order.total)}\nStatus: ${order.status}\n\n*Items:*\n${order.items?.map((i: any) => `- ${i.name} (x${i.quantity})`).join('\n')}\n\n*Gold Policy:*\n3 Masha deduction per 1 Tola applies on returns.\n\nThank you for shopping with My Shop!`;

        const phone = String(order.customerPhone || '').replace(/\+/g, '').replace(/\s/g, '');
        const whatsappUrl = `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
        window.open(whatsappUrl, '_blank');
    };

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
            <div className="bg-white text-slate-900 w-full max-w-2xl rounded-sm shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
                <div className="p-4 border-b flex justify-between items-center bg-slate-50 no-print">
                    <h3 className="font-bold text-slate-500 uppercase text-xs tracking-widest flex items-center gap-2">
                        <Receipt className="w-4 h-4 text-slate-400" />
                        Official Shop Receipt
                    </h3>
                    <div className="flex gap-2">
                        {isAdmin && onSendToDashboard && !order.isFinalReceiptSent && (
                            <button
                                onClick={onSendToDashboard}
                                className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-blue-700 transition-all shadow-lg"
                                title="Send to User Dashboard"
                            >
                                <Send className="w-3.5 h-3.5" />
                                Send to Dashboard
                            </button>
                        )}
                        <button onClick={handlePrint} className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-600" title="Print / Save PDF">
                            <Printer className="w-5 h-5" />
                        </button>
                        <button onClick={handleShare} className="p-2 hover:bg-slate-200 rounded-full transition-colors text-green-600" title="Send to WhatsApp">
                            <Send className="w-5 h-5" />
                        </button>
                        <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors text-red-500">
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                <div id="printable-receipt" className="p-8 overflow-y-auto space-y-8 print:p-0">
                    <div className="text-center space-y-2 pb-8 border-b border-slate-100">
                        <h1 className="text-4xl font-black tracking-tighter text-slate-900 uppercase text-center">My Shop</h1>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em] text-center">Jewelry & Gems Enterprise</p>
                        <div className="text-xs text-slate-500 font-medium text-center">
                            Phathi Joyianwali, tehsil Piplan, District Mianwali<br />
                            Contact: +923078520514 | testmyshop3@gmail.com
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-8 text-sm">
                        <div className="space-y-4">
                            <div>
                                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Bill To:</h4>
                                <p className="font-bold text-slate-900">{order.customerName}</p>
                                <p className="text-slate-500 leading-relaxed text-xs">{order.customerAddress}</p>
                                <p className="text-slate-500 text-xs">{order.customerPhone}</p>
                            </div>
                        </div>
                        <div className="space-y-4 text-right">
                            <div>
                                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Receipt Info:</h4>
                                <p className="font-bold text-slate-900">Order ID: #{order.displayId || order.id}</p>
                                <p className="text-slate-500 text-xs">Date: {new Date(order.createdAt).toLocaleDateString()}</p>
                                <p className="text-slate-500 text-xs">Payment: {order.paymentMethod} ({order.paymentStatus})</p>
                            </div>
                        </div>
                    </div>

                    <table className="w-full text-left text-sm border-collapse">
                        <thead>
                            <tr className="border-b-2 border-slate-900">
                                <th className="py-3 font-black uppercase text-[10px] tracking-widest">Detail</th>
                                <th className="py-3 font-black uppercase text-[10px] tracking-widest text-center">Weight</th>
                                <th className="py-3 font-black uppercase text-[10px] tracking-widest text-right">Amount</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {order.items?.map((item: any, idx: number) => (
                                <tr key={idx}>
                                    <td className="py-4">
                                        <div className="font-bold text-slate-900">{item.name}</div>
                                        <div className="text-[10px] text-slate-400 uppercase">Qty: {item.quantity}</div>
                                    </td>
                                    <td className="py-4 text-center">
                                        <div className="flex justify-center gap-1.5 text-[10px] font-bold text-slate-600">
                                            {item.weightTola > 0 && <span>{item.weightTola}T</span>}
                                            {item.weightMasha > 0 && <span>{item.weightMasha}M</span>}
                                            {item.weightRati > 0 && <span>{item.weightRati}R</span>}
                                        </div>
                                    </td>
                                    <td className="py-4 text-right font-bold text-slate-900">
                                        {formatPrice(item.price * item.quantity)}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    <div className="space-y-2 border-t border-slate-900 pt-4">
                        <div className="flex justify-between text-xs text-slate-500">
                            <span>Platform Fee:</span>
                            <span>{formatPrice(order.userFee || 0)}</span>
                        </div>
                        <div className="flex justify-between text-xs text-slate-500">
                            <span>Shipping & Handling:</span>
                            <span>{formatPrice(order.shippingFee || 0)}</span>
                        </div>
                        <div className="flex justify-between items-center pt-2">
                            <span className="text-sm font-black uppercase tracking-widest">Grand Total</span>
                            <span className="text-2xl font-black text-slate-900">{formatPrice(order.total || 0)}</span>
                        </div>
                    </div>

                    <div className="bg-slate-50 p-4 border-l-4 border-slate-900 text-[10px] italic text-slate-500 space-y-2">
                        <p className="font-bold text-slate-700 not-italic uppercase tracking-widest text-left">Gold Return Policy:</p>
                        <p className="text-left">A deduction (Kat) of 3 Masha per 1 Tola will be applied on the current market gold rate at the time of return.</p>
                        <p className="text-left">No refund for making/labor charges. Original receipt mandatory for all claims.</p>
                    </div>

                    <div className="pt-12 pb-8 flex justify-between items-center text-[10px] font-bold uppercase tracking-widest text-slate-400">
                        <div className="border-t border-slate-300 w-32 pt-2 text-center">Customer Sign</div>
                        <div className="border-t border-slate-300 w-32 pt-2 text-center">Authorized Stamp</div>
                    </div>
                </div>
            </div>

            <style>{`
                @media print {
                    body * { display: none !important; }
                    #white-container { background: white !important; }
                    #printable-receipt, #printable-receipt * { display: block !important; visibility: visible !important; }
                    #printable-receipt { position: absolute; left: 0; top: 0; width: 100%; border: none !important; box-shadow: none !important; color: black !important; }
                    .no-print { display: none !important; }
                    .text-center { text-align: center !important; }
                    .text-right { text-align: right !important; }
                    .text-left { text-align: left !important; }
                }
            `}</style>
        </div>
    );
};

export default OrderReceipt;
