import { proxy } from 'valtio';

export type Role = 'GUEST' | 'CUSTOMER' | 'ADMIN';

export type User = {
  id: string;
  name: string;
  email: string;
  role: Role;
  avatar?: string;
};

export type Product = {
  id: string;
  name: string;
  category: string;
  price: number;
  originalPrice?: number;
  discount?: number;
  sold: number;
  badges: string[];
  image: string;
};

export type GradingRequest = {
  id: string;
  customerName: string;
  cardName: string;
  set: string;
  status: string;
  createdAt: string;
  imageFront?: string;
  imageBack?: string;
};

export type AppState = {
  user: User | null;
  cart: { product: Product; quantity: number }[];
  notifications: { id: string; message: string; read: boolean; time: string }[];
  gradingRequests: GradingRequest[];
};

export const MOCK_PRODUCTS: Product[] = [
  {
    id: 'p1',
    name: 'Túi Mù (Mystery Bag) Pokemon TCG Chính Hãng - Tỉ lệ Hit Siêu Cao',
    category: 'Mystery Bag',
    price: 249000,
    originalPrice: 350000,
    discount: 28,
    sold: 3450,
    badges: ['Bán chạy', 'Hit Rate Cao'],
    image: 'https://images.unsplash.com/photo-1613771404784-3a5686aa2be3?q=80&w=300&auto=format&fit=crop', // placeholder
  },
  {
    id: 'p2',
    name: 'Hộp Đựng Thẻ Bài CardVault Pro Deck Box Nam Châm Cao Cấp',
    category: 'Phụ kiện bảo quản',
    price: 189000,
    originalPrice: 250000,
    discount: 24,
    sold: 1240,
    badges: ['Trợ giá', 'Mới'],
    image: 'https://images.unsplash.com/photo-1613771404784-3a5686aa2be3?q=80&w=300&auto=format&fit=crop',
  },
  {
    id: 'p3',
    name: 'Pack One Piece TCG Awakening of the New Era OP-05',
    category: 'One Piece',
    price: 150000,
    sold: 852,
    badges: ['Hàng giới hạn', 'Chính hãng'],
    image: 'https://images.unsplash.com/photo-1613771404784-3a5686aa2be3?q=80&w=300&auto=format&fit=crop',
  },
];

export const MOCK_NOTIFICATIONS = [
  { id: 'n1', message: 'Đơn kiểm định #CV-1024 đã được tiếp nhận', read: false, time: '2 phút trước' },
  { id: 'n2', message: 'Hồ sơ chứng nhận #123456 đã sẵn sàng', read: true, time: '1 giờ trước' },
];

export const MOCK_GRADING_REQUESTS: GradingRequest[] = [
  {
    id: 'CV-1024',
    customerName: 'Nguyễn Văn A',
    cardName: 'Pikachu Promo',
    set: 'SV 2026',
    status: 'Chờ khách gửi thẻ',
    createdAt: '2026-10-01',
  },
  {
    id: 'CV-1025',
    customerName: 'Trần Thị B',
    cardName: 'Blue-Eyes White Dragon',
    set: 'LOB',
    status: 'Đang thẩm định',
    createdAt: '2026-10-02',
  },
];

// Load initial state from localStorage if available (client-side only)
const loadState = () => {
  if (typeof window === 'undefined') return null;
  const saved = localStorage.getItem('cardvault_state');
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch (e) {}
  }
  return null;
};

const initialState: AppState = {
  user: null, // null means GUEST
  cart: [],
  notifications: MOCK_NOTIFICATIONS,
  gradingRequests: MOCK_GRADING_REQUESTS,
};

// Always start with initialState (safe for SSR).
// Client-side restoration happens via restoreFromStorage() below.
export const store = proxy<AppState>(initialState);

// Immediately restore from localStorage when running in browser.
// This runs at module evaluation time on the client.
if (typeof window !== 'undefined') {
  const saved = loadState();
  if (saved) {
    if (saved.user !== undefined) store.user = saved.user;
    if (saved.cart) store.cart = saved.cart;
    if (saved.notifications) store.notifications = saved.notifications;
    if (saved.gradingRequests) store.gradingRequests = saved.gradingRequests;
  }

  // Subscribe to changes and save to localStorage
  import('valtio').then(({ subscribe }) => {
    subscribe(store, () => {
      localStorage.setItem(
        'cardvault_state',
        JSON.stringify({
          user: store.user,
          cart: store.cart,
          notifications: store.notifications,
          gradingRequests: store.gradingRequests,
        }),
      );
    });
  });
}

// Explicit restore helper — call this from layouts as defensive init.
// Normalizes role to uppercase to match the store's Role type (ADMIN/CUSTOMER/GUEST).
export const restoreFromStorage = () => {
  if (typeof window === 'undefined') return;
  const saved = loadState();
  if (saved?.user !== undefined && saved.user !== null) {
    const rawRole = saved.user.role as string;
    const normalizedRole: Role =
      rawRole?.toLowerCase() === 'admin'
        ? 'ADMIN'
        : rawRole?.toLowerCase() === 'user'
          ? 'CUSTOMER'
          : (rawRole as Role) || 'CUSTOMER';
    store.user = { ...saved.user, role: normalizedRole };
  } else if (saved?.user === null) {
    store.user = null;
  }
};

// Actions
export const login = (user: User) => {
  store.user = user;
  // Persist immediately (don't wait for async subscriber) to avoid redirect race
  if (typeof window !== 'undefined') {
    try {
      const raw = localStorage.getItem('cardvault_state');
      const current = raw ? JSON.parse(raw) : {};
      localStorage.setItem('cardvault_state', JSON.stringify({ ...current, user }));
    } catch (e) {
      // If parse fails, fallback to overriding
      localStorage.setItem('cardvault_state', JSON.stringify({ user }));
    }
  }
};

export const logout = () => {
  store.user = null;
  if (typeof window !== 'undefined') {
    try {
      const raw = localStorage.getItem('cardvault_state');
      const current = raw ? JSON.parse(raw) : {};
      localStorage.setItem('cardvault_state', JSON.stringify({ ...current, user: null }));
    } catch (e) {
      localStorage.removeItem('cardvault_state');
    }
  }
};

export const addToCart = (product: Product) => {
  const existing = store.cart.find((item) => item.product.id === product.id);
  if (existing) {
    existing.quantity += 1;
  } else {
    store.cart.push({ product, quantity: 1 });
  }
};

export const removeFromCart = (productId: string) => {
  store.cart = store.cart.filter((item) => item.product.id !== productId);
};

export const updateCartQuantity = (productId: string, quantity: number) => {
  const existing = store.cart.find((item) => item.product.id === productId);
  if (existing) {
    existing.quantity = Math.max(1, quantity);
  }
};

export const clearCart = () => {
  store.cart = [];
};

export const markNotificationsAsRead = () => {
  store.notifications.forEach((n) => (n.read = true));
};

export const addGradingRequest = (req: Omit<GradingRequest, 'id' | 'createdAt' | 'status'>) => {
  const newReq: GradingRequest = {
    ...req,
    id: `CV-${1000 + store.gradingRequests.length + 1}`,
    createdAt: new Date().toISOString().split('T')[0],
    status: 'Yêu cầu đã được tiếp nhận',
  };
  store.gradingRequests.unshift(newReq);
};

export const updateGradingStatus = (id: string, status: string) => {
  const req = store.gradingRequests.find((r) => r.id === id);
  if (req) {
    req.status = status;
  }
};
