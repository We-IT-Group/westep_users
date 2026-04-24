import {Home, Search, Shop, Message, Profile, HomeBg, ShopBg, SearchBg, MessageBg, ProfileBg} from "../../assets/icon";
import {Link, useLocation} from "react-router-dom";


const icons = [
    {
        path: "/",
        defaultIcon: <Home width={24} height={24}/>,
        activeIcon: <HomeBg width={24} height={24} className='text-primary-500'/>
    },
    {
        path: "/search",
        defaultIcon: <Search width={24} height={24}/>,
        activeIcon: <SearchBg width={24} height={24} className='text-primary-500'/>
    },
    {
        path: "/shopping",
        defaultIcon: <Shop width={24} height={24}/>,
        activeIcon: <ShopBg width={24} height={24} className='text-primary-500'/>
    },
    {
        path: "/message",
        defaultIcon: <Message width={24} height={24}/>,
        activeIcon: <MessageBg width={24} height={24} className='text-primary-500'/>
    },
    {
        path: "/profile",
        defaultIcon: <Profile width={24} height={24}/>,
        activeIcon: <ProfileBg width={24} height={24} className='text-primary-500'/>
    }
]


function MobileNavigation() {
    const location = useLocation();

    return (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[92%] max-w-md lg:hidden z-[100] animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="rounded-[32px] backdrop-blur-xl bg-white/80 dark:bg-slate-900/90 flex items-center justify-between p-3 px-6 border border-white/40 dark:border-white/10 shadow-[0_8px_32px_-4px_rgba(0,0,0,0.1)] dark:shadow-[0_8px_32px_-4px_rgba(0,0,0,0.5)]">
                {icons.map((icon) => {
                    const isActive = icon.path === "/" 
                        ? location.pathname === "/" 
                        : location.pathname.startsWith(icon.path);

                    if (isActive) {
                        return (
                            <div key={icon.path} className="relative flex items-center justify-center p-2 rounded-2xl bg-blue-50 dark:bg-blue-900/30 transition-all duration-300">
                                {icon.activeIcon}
                                <div className="absolute -bottom-1 w-1 h-1 bg-blue-600 dark:bg-blue-400 rounded-full" />
                            </div>
                        );
                    }

                    return (
                        <Link 
                            key={icon.path} 
                            to={icon.path} 
                            className="p-2 rounded-2xl text-slate-400 dark:!text-white hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all"
                        >
                            {icon.defaultIcon}
                        </Link>
                    );
                })}
            </div>
        </div>
    );
}

export default MobileNavigation;