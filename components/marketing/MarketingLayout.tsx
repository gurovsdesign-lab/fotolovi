import type { ReactNode } from "react";
import Link from "next/link";
import { MarketingNavigation } from "./MarketingNavigation";
import styles from "./MarketingExperience.module.css";

export function MarketingLayout({ children }: { children: ReactNode }) {
  return (
    <div className={styles.shell}>
      <header className={styles.nav}>
        <div className={styles.navInner}>
          <Link href="/" className={styles.brand}>
            ФотоЛови
          </Link>
          <MarketingNavigation />
        </div>
      </header>
      {children}
      <footer className={styles.footer}>
        <div className={styles.footerInner}>
          <p className={styles.footerStatement}>Событие идёт сейчас. Экран должен жить вместе с ним.</p>
          <div className={styles.footerMeta}>
            <span>ФотоЛови</span>
            <div className={styles.footerLinks}>
              <Link href="/wedding">Свадьбы</Link>
              <Link href="/ideas/wedding">Идеи</Link>
              <Link href="/screen/wedding-screen-ideas">Проектор</Link>
              <Link href="/hosts">Ведущим</Link>
              <Link href="/privacy">Конфиденциальность</Link>
              <Link href="/login">Войти</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
