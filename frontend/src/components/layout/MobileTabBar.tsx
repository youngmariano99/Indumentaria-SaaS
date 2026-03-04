import { NavLink } from "react-router-dom";
import { House, Package, Users, List, ShoppingCart } from "@phosphor-icons/react";
import styles from "./MobileTabBar.module.css";
import { useVisualViewport } from "../../hooks/useVisualViewport";

interface Props {
    onOpenDrawer: () => void;
}

export function MobileTabBar({ onOpenDrawer }: Props) {
    const { isKeyboardOpen } = useVisualViewport();

    return (
        <nav className={`${styles.tabBar} ${isKeyboardOpen ? styles.keyboardOpen : ''}`}>
            <NavLink
                to="/dashboard"
                className={({ isActive }) => `${styles.tabItem} ${isActive ? styles.tabItemActive : ''}`}
            >
                <House size={24} weight="fill" />
                <span>Inicio</span>
            </NavLink>

            <NavLink
                to="/catalogo"
                className={({ isActive }) => `${styles.tabItem} ${isActive ? styles.tabItemActive : ''}`}
            >
                <Package size={24} weight="fill" />
                <span>Stock</span>
            </NavLink>

            <NavLink
                to="/pos"
                className={styles.posTabItem}
            >
                <div className={styles.posButton}>
                    <ShoppingCart size={24} weight="fill" color="currentColor" />
                </div>
            </NavLink>

            <NavLink
                to="/clientes"
                className={({ isActive }) => `${styles.tabItem} ${isActive ? styles.tabItemActive : ''}`}
            >
                <Users size={24} weight="fill" />
                <span>Clientes</span>
            </NavLink>

            <button
                type="button"
                className={styles.tabItem}
                style={{ background: 'transparent', border: 'none' }}
                onClick={onOpenDrawer}
            >
                <List size={24} weight="bold" />
                <span>Más</span>
            </button>
        </nav>
    );
}
