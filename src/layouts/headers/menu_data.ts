interface DataType {
    id: number;
    title: string;
    link: string;
    has_dropdown?: boolean;
    sub_menus?: {
        link: string;
        title: string;
    }[];
}

// menu data
const menu_data: DataType[] = [
    {
        id: 1,
        title: "Home",
        link: "/",
        has_dropdown: false,
    },
    {
        id: 2,
        title: "Courses",
        link: "/courses",
        has_dropdown: false,
    },

    {
        id: 3,
        title: "Pages",
        link: "#",
        has_dropdown: true,
        sub_menus: [
            {link: "/home-2", title: "Home Two"},
            {link: "/courses", title: "Course Style1"},
            {link: "/courses-2", title: "Course Style2"},
            {link: "/course-details", title: "Course Details"},
            {link: "/grid-blog", title: "Grid Blog"},
            {link: "/standard-blog", title: "Standard Blog"},
            {link: "/blog-details", title: "Blog Details"},
            {link: "/subscription", title: "Obuna"},
            {link: "/musobaqa", title: "Musobaqa"},
            {link: "/login", title: "Login"},
            {link: "/register", title: "Register"},
            {link: "/about", title: "About"},
            {link: "/instructors", title: "Instructors"},
            {link: "/erorr", title: "404 || Error"},
        ],
    },
];
export default menu_data;
