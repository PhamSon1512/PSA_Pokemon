import { ArrowUp, MessageCircle } from 'lucide-react';

export function FloatingActions() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="fixed right-4 bottom-4 z-50 flex flex-col gap-2.5">
      <button
        onClick={() => {}}
        className="border-line grid h-11 w-11 cursor-pointer place-items-center rounded-full border bg-white font-black text-[#343a44] shadow-[0_10px_22px_rgba(0,0,0,0.15)] transition hover:bg-gray-50"
        title="Kết nối Zalo"
      >
        Z
      </button>
      <button
        onClick={() => {}}
        className="border-line grid h-11 w-11 cursor-pointer place-items-center rounded-full border bg-white font-black text-[#343a44] shadow-[0_10px_22px_rgba(0,0,0,0.15)] transition hover:bg-gray-50"
        title="Kết nối Messenger"
      >
        <MessageCircle className="h-5 w-5" />
      </button>
      <button
        onClick={scrollToTop}
        className="bg-brand border-brand grid h-11 w-11 cursor-pointer place-items-center rounded-full border font-black text-white shadow-[0_10px_22px_rgba(0,0,0,0.15)] transition hover:opacity-90"
        title="Lên đầu trang"
      >
        <ArrowUp className="h-5 w-5" />
      </button>
    </div>
  );
}
