import { createContext, useContext } from "react";

export const MenuContext = createContext({ openMenu: () => {} });

export const useDashboardMenu = () => useContext(MenuContext);
