import { useEffect } from 'react';
import { Receipt, Printer, Send, X, ShieldCheck, ShieldAlert } from 'lucide-react';

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
        const text = `*A.Z SHOP - Official Gold Receipt*\n\nOrder ID: #${order.displayId || order.id}\nCustomer: ${order.customerName}\nTotal Amount: ${formatPrice(order.total)}\nStatus: ${order.status}\n\n*Items:*\n${order.items?.map((i: any) => `- ${i.name} (x${i.quantity})`).join('\n')}\n\n*Gold Policy:*\n3 Masha deduction per 1 Tola applies on returns.\n\nThank you for choosing A.Z Shop!`;

        const phone = String(order.customerPhone || '').replace(/\+/g, '').replace(/\s/g, '');
        const whatsappUrl = `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
        window.open(whatsappUrl, '_blank');
    };

    useEffect(() => {
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, []);

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
            <div className="bg-white text-slate-900 w-full max-w-2xl rounded-sm shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
                <div className="p-4 border-b flex justify-between items-center bg-slate-50 no-print">
                    <h3 className="font-bold text-slate-500 uppercase text-xs tracking-widest flex items-center gap-2">
                        <Receipt className="w-4 h-4 text-slate-400" />
                        Official Jewellery Invoice
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

                <div id="printable-receipt" className="p-12 overflow-y-auto space-y-10 print:p-0">
                    {/* CERTIFICATE HEADER */}
                    <div className="text-center space-y-4 pb-10 border-b-2 border-slate-900 relative">
                        <div className="absolute top-0 right-0 opacity-10">
                            <ShieldCheck className="w-24 h-24 text-slate-900" />
                        </div>
                        <div className="flex flex-col items-center gap-2">
                            <img src="/logo_az.png?v=2" alt="A.Z Shop Logo" className="w-20 h-20 object-cover rounded-full border-2 border-slate-900 shadow-xl mb-2" />
                            <h1 className="text-5xl font-black tracking-tighter text-slate-900 uppercase">A.Z Shop</h1>
                        </div>
                        <div className="flex items-center justify-center gap-4">
                            <div className="h-px w-10 bg-slate-300" />
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.5em]">Premium Gold & Diamond Collection</p>
                            <div className="h-px w-10 bg-slate-300" />
                        </div>
                        <div className="text-[11px] text-slate-400 font-bold uppercase tracking-widest leading-relaxed">
                            Phathi Joyianwali, Piplan, Mianwali<br />
                            Direct: +92 307 8520514 | testmyshop3@gmail.com
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-12 text-sm pt-4">
                        <div className="space-y-6">
                            <div>
                                <h4 className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Authenticated Recipient:</h4>
                                <div className="space-y-1">
                                    <p className="text-lg font-black text-slate-900 leading-tight uppercase tracking-tight">{order.customerName}</p>
                                    <p className="text-slate-500 font-medium text-xs max-w-[200px] leading-relaxed uppercase">{order.customerAddress}</p>
                                    <p className="text-slate-400 text-[10px] font-bold tracking-widest">{order.customerPhone}</p>
                                </div>
                            </div>
                        </div>
                        <div className="space-y-6 text-right">
                            <div>
                                <h4 className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Vault Reference:</h4>
                                <div className="space-y-1">
                                    <p className="text-sm font-black text-slate-900 uppercase tracking-tighter italic">Case ID: #{order.displayId || order.id}</p>
                                    <p className="text-slate-500 text-[11px] font-bold uppercase tracking-widest">Date: {new Date(order.createdAt).toLocaleDateString(undefined, { day: '2-digit', month: 'long', year: 'numeric' })}</p>
                                    <div className="flex justify-end gap-2 mt-2">
                                        <span className="px-2 py-0.5 bg-slate-100 text-[9px] font-black uppercase text-slate-500 border border-slate-200">{order.paymentMethod}</span>
                                        <span className={`px-2 py-0.5 text-[9px] font-black uppercase border ${order.paymentStatus === 'Paid' ? 'bg-green-50 text-green-600 border-green-100' : 'bg-amber-50 text-amber-600 border-amber-100'}`}>{order.paymentStatus}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="pt-6">
                        <table className="w-full text-left text-sm border-collapse">
                            <thead>
                                <tr className="border-b-2 border-slate-900">
                                    <th className="py-4 font-black uppercase text-[10px] tracking-[0.2em] text-slate-400">Jewellery Specifications</th>
                                    <th className="py-4 font-black uppercase text-[10px] tracking-[0.2em] text-center text-slate-400">Gold/Weight Profile</th>
                                    <th className="py-4 font-black uppercase text-[10px] tracking-[0.2em] text-right text-slate-400">Market Valuation</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {order.items?.map((item: any, idx: number) => (
                                    <tr key={idx} className="group">
                                        <td className="py-6">
                                            <div className="font-black text-slate-900 uppercase tracking-tight text-base mb-1">{item.name}</div>
                                            <div className="flex items-center gap-2">
                                                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Qty: {item.quantity}</span>
                                                <div className="h-1 w-1 rounded-full bg-slate-200" />
                                                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Rate: {formatPrice(item.price)}</span>
                                            </div>
                                        </td>
                                        <td className="py-6 text-center">
                                            <div className="inline-flex gap-2 text-[10px] font-black text-slate-700 uppercase tracking-tighter bg-slate-50 px-3 py-1 rounded-full border border-slate-100">
                                                {item.weightTola > 0 && <span>{item.weightTola}T</span>}
                                                {item.weightMasha > 0 && <span>{item.weightMasha}M</span>}
                                                {item.weightRati > 0 && <span>{item.weightRati}R</span>}
                                                {(item.weightTola === 0 && item.weightMasha === 0 && item.weightRati === 0) && <span className="text-slate-300">—</span>}
                                            </div>
                                        </td>
                                        <td className="py-6 text-right font-black text-slate-900 text-base">
                                            {formatPrice(item.price * item.quantity)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="space-y-4 border-t-2 border-slate-900 pt-8">
                        <div className="flex justify-end">
                            <div className="w-full max-w-[280px] space-y-3">
                                <div className="flex justify-between text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                    <span>Labour (Making Charges):</span>
                                    <span className="text-slate-600 font-bold">{formatPrice(order.userFee || 0)}</span>
                                </div>
                                <div className="flex justify-between text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                    <span>Tax & Processing:</span>
                                    <span className="text-slate-600 font-bold">{formatPrice(order.shippingFee || 0)}</span>
                                </div>
                                <div className="h-px bg-slate-100 my-2" />
                                <div className="flex justify-between items-center">
                                    <span className="text-xs font-black uppercase tracking-[0.3em] text-slate-900">Total Settlement</span>
                                    <span className="text-3xl font-black text-slate-900 tracking-tighter">{formatPrice(order.total || 0)}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-slate-50 p-8 rounded-xl border border-slate-100 space-y-6">
                        <div className="flex items-center gap-3 border-b border-slate-200 pb-3">
                            <ShieldAlert className="w-5 h-5 text-slate-900" />
                            <p className="font-black text-slate-900 uppercase tracking-[0.2em] text-[10px]">Transmission & Return Protocol</p>
                        </div>
                        <div className="space-y-4 text-[11px] font-bold text-slate-600 uppercase tracking-tight leading-relaxed text-justify">
                            <p>
                                Upon return, a standard deduction (Kat) of 3 Masha per 1 Tola will be applied based on the
                                prevailing market gold rate at the point of exchange.
                            </p>
                            <p>
                                Craftsmanship and labor expenses are non-refundable. This official certification must
                                be presented for all post-purchase inquiries, exchanges, or claims.
                            </p>
                        </div>
                    </div>

                    <div className="pt-16 pb-12 flex justify-between items-end">
                        <div className="space-y-8">
                            <div className="text-[9px] font-black text-slate-300 uppercase tracking-[0.3em]">Authorized by A.Z Shop</div>
                            <div className="w-48 border-b-2 border-slate-900" />
                            <div className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Authorized Signature</div>
                        </div>
                        <div className="text-right space-y-8">
                            <div className="text-[9px] font-black text-slate-300 uppercase tracking-[0.3em]">Client Acceptance</div>
                            <div className="w-48 border-b-2 border-slate-900 ml-auto" />
                            <div className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Consignee Acknowledgment</div>
                        </div>
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
