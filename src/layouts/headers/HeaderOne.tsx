import UserDropDown from "./UserDropDown.tsx";
import darkLogo from "../../assets/westep_dark_logo.png";
import lightLogo from "../../assets/westep_ligth-logo.png";
import {Link} from "react-router-dom";


export default function HeaderOne() {
    return (
        <>
            <header id="navigation" className="w-full hidden lg:block z-99999">
                <div className="max-w-[1600px] mx-auto flex items-center justify-between">

                    <div className="w-1/6 lg:w-1/4 flex">
                        <div className="flex items-center justify-center">
                            <Link to={'/'}>
                                <img src={darkLogo} alt="Westep" className="w-[120px] dark:hidden"/>
                                <img src={lightLogo} alt="Westep" className="hidden w-[120px] dark:block"/>
                            </Link>
                        </div>
                    </div>

                    <div className="hidden md:flex w-4/6 lg:w-1/2 justify-center p-0">
                        {/*<HeaderNavMenu />*/}
                    </div>

                    <div className="w-1/6 lg:w-1/4 flex justify-end">
                        <div className="flex gap-3">
                            <UserDropDown/>
                        </div>
                    </div>
                </div>
            </header>
        </>
    )
}
