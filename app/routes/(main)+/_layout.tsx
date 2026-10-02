import { Outlet } from 'react-router';
import { FloatingActions } from '~/components/layout/FloatingActions';
import { Footer } from '~/components/layout/Footer';
import { Header } from '~/components/layout/Header';

export default function MainLayout() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
      <FloatingActions />
    </div>
  );
}
