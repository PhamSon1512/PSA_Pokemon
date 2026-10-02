import type { FC, ReactNode } from 'react';
import { Drawer } from 'vaul';

export const VaulDrawer: FC<{ children: ReactNode; title: ReactNode; trigger: ReactNode }> = ({ children, trigger, title }) => (
  <Drawer.Root>
    <Drawer.Trigger>{trigger}</Drawer.Trigger>
    <Drawer.Portal>
      <Drawer.Overlay className="fixed inset-0 z-10 bg-black/40" />
      <Drawer.Content className="fixed right-0 bottom-0 left-0 z-20 mt-24 flex h-fit flex-col rounded-t-2xl bg-gray-100 p-6 outline-none">
        <Drawer.Handle className="bg-gray-400" />
        <Drawer.Title>{title}</Drawer.Title>
        {children}
      </Drawer.Content>
    </Drawer.Portal>
  </Drawer.Root>
);
