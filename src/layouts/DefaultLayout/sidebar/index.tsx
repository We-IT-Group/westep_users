import {NavLink} from 'react-router-dom';
import {Home, Lesson, ShoppingCart} from "../../../assets/icon";
import {Trophy} from "lucide-react";
import {useSidebar} from "../../SidebarContext.tsx";
import WestepLogo from "../../../ui/WestepLogo.tsx";


export const links = [
    {path: "/", title: "Asosiy", icon: Home},
    {path: "/courseDetails", title: "Darslar", icon: Lesson},
    {path: "/musobaqa", title: "Musobaqa", icon: Trophy},
    {path: "/subscription", title: "Obuna", icon: ShoppingCart}
]

const Sidebar = () => {
    const {isMobileOpen, toggleMobileSidebar, isExpanded} = useSidebar();

    return (
        <aside
            className={`sidebar ${(isMobileOpen && isExpanded) ? 'open' : ''}`}
        >
            <div className={'d-none d-md-flex align-items-center justify-content-center'} style={{height: '100px'}}>
                <div className="d-flex px-4 justify-content-center align-items-center">
                    <WestepLogo
                        className="w-[150px]"
                        lightModeClassName="object-contain"
                        darkModeClassName="object-contain"
                    />
                </div>
            </div>

            {/* Sidebar Menu */}
            <nav className="mt-3 px-2">
                <ul className="list-unstyled">
                    {links.map(({path, icon: Icon, title}: {
                                    path: string;
                                    icon: React.ElementType;
                                    title: string;
                                },
                                index: number) => (
                        <li key={index} className="mb-5">
                            <NavLink
                                to={path}
                                onClick={() => {
                                    if (isMobileOpen && isExpanded) {
                                        toggleMobileSidebar()
                                    }
                                }}
                                className={({isActive}) =>
                                    `d-flex gap-1 align-items-center fs-6 px-3 py-3 rounded ${
                                        isActive
                                            ? 'bg-info text-dark rounded-4'
                                            : 'text-secondary'
                                    }`
                                }
                            >
                                <Icon width={24} height={24}/>
                                <p className={'m-0'} style={{fontSize: '12px'}}>
                                    {title}
                                </p>
                            </NavLink>
                        </li>
                    ))}
                </ul>
            </nav>
        </aside>
    );
};

export default Sidebar;
