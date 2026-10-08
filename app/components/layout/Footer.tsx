import { Link } from 'react-router';

export function Footer() {
  return (
    <footer className="bg-[#17191d] pt-11 text-[#e4e7eb] dark:bg-[#080a0c]">
      <div className="container grid grid-cols-1 gap-9 pb-9 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <div className="mb-3 text-[19px] font-black text-white">CARDVAULT</div>
          <p className="mb-3 text-xs leading-[1.75] text-[#a7adb6]">
            Nền tảng xác thực và giao dịch dành cho người sưu tầm — nơi hồ sơ thẻ, giá trị và trải nghiệm sở hữu được kết nối.
          </p>
          <p className="text-xs leading-[1.75] text-[#a7adb6]">
            <b className="text-white">Hotline:</b> 09xx xxx xxx
            <br />
            <b className="text-white">Email:</b> support@cardvault.vn
            <br />
            <b className="text-white">Địa chỉ:</b> Hà Nội, Việt Nam
          </p>
          <div className="mt-4 flex gap-2">
            {['f', 'Z', '▶', '◎'].map((icon, idx) => (
              <div
                key={idx}
                className="grid h-[34px] w-[34px] cursor-pointer place-items-center rounded-[10px] border border-white/10 bg-white/5 text-xs font-black transition hover:bg-white/10"
              >
                {icon}
              </div>
            ))}
          </div>
        </div>

        <div>
          <div className="mb-3.5 text-[13px] font-black">VỀ CARDVAULT</div>
          <div className="flex flex-col gap-2.5">
            <Link to="/products" className="text-xs text-[#a7adb6] transition hover:text-white">
              Cửa hàng
            </Link>
            <Link to="/grading" className="text-xs text-[#a7adb6] transition hover:text-white">
              Thẩm định thẻ
            </Link>
            <Link to="/graded-cards" className="text-xs text-[#a7adb6] transition hover:text-white">
              Thẻ đã kiểm định
            </Link>
            <Link to="/blog" className="text-xs text-[#a7adb6] transition hover:text-white">
              Bài viết
            </Link>
            <Link to="/about" className="text-xs text-[#a7adb6] transition hover:text-white">
              Về CardVault
            </Link>
          </div>
        </div>

        <div>
          <div className="mb-3.5 text-[13px] font-black">KHÁM PHÁ</div>
          <div className="flex flex-col gap-2.5">
            <Link to="/products?cat=pokemon" className="text-xs text-[#a7adb6] transition hover:text-white">
              Pokemon
            </Link>
            <Link to="/products?cat=onepiece" className="text-xs text-[#a7adb6] transition hover:text-white">
              One Piece
            </Link>
            <Link to="/products?cat=yugioh" className="text-xs text-[#a7adb6] transition hover:text-white">
              Yu-Gi-Oh!
            </Link>
            <Link to="/products?filter=verified" className="text-xs text-[#a7adb6] transition hover:text-white">
              Thẻ đã xác thực
            </Link>
            <Link to="/products?filter=raw" className="text-xs text-[#a7adb6] transition hover:text-white">
              Thẻ nguyên bản
            </Link>
            <Link to="/products?cat=accessories" className="text-xs text-[#a7adb6] transition hover:text-white">
              Phụ kiện & bảo quản
            </Link>
          </div>
        </div>

        <div>
          <div className="mb-3.5 text-[13px] font-black">CHÍNH SÁCH</div>
          <div className="flex flex-col gap-2.5">
            <Link to="/policy" className="text-xs text-[#a7adb6] transition hover:text-white">
              Chính sách bảo mật
            </Link>
            <Link to="/terms" className="text-xs text-[#a7adb6] transition hover:text-white">
              Điều khoản sử dụng
            </Link>
            <Link to="/policy" className="text-xs text-[#a7adb6] transition hover:text-white">
              Chính sách mua hàng
            </Link>
            <Link to="/policy" className="text-xs text-[#a7adb6] transition hover:text-white">
              Chính sách vận chuyển
            </Link>
            <Link to="/policy" className="text-xs text-[#a7adb6] transition hover:text-white">
              Chính sách đổi trả
            </Link>
          </div>
        </div>
      </div>
      <div className="border-t border-white/10 py-3.5 text-[11px] text-[#858b94]">
        <div className="container flex flex-col justify-between gap-5 sm:flex-row">
          <span>© 2026 CardVault. All rights reserved.</span>
          <span>Xác thực giá trị. Kết nối cộng đồng sưu tầm.</span>
        </div>
      </div>
    </footer>
  );
}
