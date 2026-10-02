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
  grade?: string;
  certificateId?: string;
  status: 'Nguyên bản' | 'Đã xác thực' | 'Đã bán';
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
    name: 'Pikachu Promo',
    category: 'Pokemon',
    price: 2490000,
    grade: '9.5',
    certificateId: '#123456',
    status: 'Đã xác thực',
    image: 'https://images.unsplash.com/photo-1613771404784-3a5686aa2be3?q=80&w=300&auto=format&fit=crop', // placeholder
  },
  {
    id: 'p2',
    name: 'Charizard Base Set',
    category: 'Pokemon',
    price: 8990000,
    grade: '10',
    certificateId: '#991208',
    status: 'Đã xác thực',
    image: 'https://images.unsplash.com/photo-1613771404784-3a5686aa2be3?q=80&w=300&auto=format&fit=crop',
  },
  {
    id: 'p3',
    name: 'Illustration Rare Museum',
    category: 'Pokemon',
    price: 790000,
    status: 'Nguyên bản',
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

const savedState = loadState();

export const store = proxy<AppState>(savedState || initialState);

// Subscribe to changes and save to localStorage
if (typeof window !== 'undefined') {
  import('valtio').then(({ subscribe }) => {
    subscribe(store, () => {
      localStorage.setItem('cardvault_state', JSON.stringify(store));
    });
  });
}

// Actions
export const login = (user: User) => {
  store.user = user;
};

export const logout = () => {
  store.user = null;
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
