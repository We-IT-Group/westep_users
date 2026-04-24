import { Navigate } from 'react-router-dom';
import { lazy } from "react";


const MainPage = lazy(() => import("../pages/MainPage.tsx"));
const Logout = lazy(() => import("../components/auth/Logout.tsx"));
const CoursePage = lazy(() => import("../pages/CoursePage.tsx"));
const Success = lazy(() => import("../components/auth/Success.tsx"));
const Profile = lazy(() => import("../pages/ProfilePage.tsx"));
const RoadMapCoursePage = lazy(() => import("../pages/RoadMapCoursePage.tsx"));
const HomeOne = lazy(() => import("../components/homes/home"));
const HomeTwo = lazy(() => import("../components/homes/home-2"));
const About = lazy(() => import("../components/about"));
const AllCoursesPage = lazy(() => import("../pages/courseCatalog/AllCoursesPage.tsx"));
const MyCourses = lazy(() => import("../components/courses"));
const CoursesTwo = lazy(() => import("../components/courses-2"));
const CourseDetails = lazy(() => import("../components/course-details"));
const GridBlog = lazy(() => import("../components/grid-blog"));
const StandardBlog = lazy(() => import("../components/standard-blog"));
const BlogDetails = lazy(() => import("../components/blog-details"));
const Cart = lazy(() => import("../components/cart"));
const Checkout = lazy(() => import("../components/checkout"));
const Instructors = lazy(() => import("../components/instructors"));
const Contact = lazy(() => import("../components/contact"));
const Login = lazy(() => import("../components/auth/login"));
const Error = lazy(() => import("../components/error"));
const Password = lazy(() => import("../components/auth/password"));
const ForgotPassword = lazy(() => import("../components/auth/forgot-password"));
const VerifyCode = lazy(() => import("../components/auth/sms-code"));
const ResetPassword = lazy(() => import("../components/auth/reset-password"));
const CreatePassword = lazy(() => import("../components/auth/createPassword"));
const Register = lazy(() => import("../components/auth/register"));
const TestMode = lazy(() => import("../pages/test/TestMode.tsx"));
const TestHistory = lazy(() => import("../pages/test/TestHistory.tsx"));
const TestDetail = lazy(() => import("../pages/test/TestDetail.tsx"));
const CoursePurchase = lazy(() => import("../pages/coursePurchase/CoursePurchase.tsx"));
const QuizHistoryPage = lazy(() => import("../pages/quizHistory/QuizHistoryPage.tsx"));
const NotificationsPage = lazy(() => import("../pages/NotificationsPage.tsx"));

const authProtectedRoutes = [
    { path: "/", element: <MainPage />, title: "Home" },
    { path: "/courses/:courseId/:id/*", element: <CoursePage />, title: "Lessons" },
    { path: "/roadmap/:id", element: <RoadMapCoursePage />, title: "RoadMapCourse" },
    { path: "/profile", element: <Profile />, title: "Profile" },
    { path: "/test/:testId", element: <TestMode />, title: "Test Mode" },
    { path: "/test-history", element: <TestHistory />, title: "Test History" },
    { path: "/test-result/:sessionId", element: <TestDetail />, title: "Test Result" },
    { path: "/course-purchase/:courseId", element: <CoursePurchase />, title: "Course Purchase" },
    { path: "/quiz-history", element: <QuizHistoryPage />, title: "Quiz History" },
    { path: "/notifications", element: <NotificationsPage />, title: "Notifications" },
    { path: "/notifications/:notificationId", element: <NotificationsPage />, title: "Notification Detail" },

    { path: "/home-1", element: <HomeOne /> },
    { path: "/home-2", element: <HomeTwo />, title: "Home 2" },
    { path: "/about", element: <About />, title: "About" },
    { path: "/courses", element: <AllCoursesPage />, title: "Courses" },
    { path: "/my-courses", element: <MyCourses />, title: "My Courses" },
    { path: "/courses-2", element: <CoursesTwo />, title: "Courses 2" },
    { path: "/course-details", element: <CourseDetails />, title: "Course Details" },
    { path: "/grid-blog", element: <GridBlog />, title: "Grid Blog" },
    { path: "/standard-blog", element: <StandardBlog />, title: "Standard Blog" },
    { path: "/blog-details", element: <BlogDetails />, title: "Blog Details" },
    { path: "/cart", element: <Cart />, title: "Cart" },
    { path: "/checkout", element: <Checkout />, title: "Checkout" },
    { path: "/instructors", element: <Instructors />, title: "Instructors" },
    { path: "/contact", element: <Contact />, title: "Contact" },
    { path: "*", element: <Error /> },
    {
        path: '/',
        exact: true,
        component: <Navigate to="/" />,
    },
    { path: '*', component: <Navigate to="/" /> },
];

const publicRoutes = [
    { path: "/login", element: <Login /> },
    { path: "/register", element: <Register /> },
    { path: "/password", element: <Password /> },
    { path: "/forgot-password", element: <ForgotPassword /> },
    { path: "/verify-code", element: <VerifyCode /> },
    { path: "/reset-password", element: <ResetPassword /> },
    { path: "/create-password", element: <CreatePassword /> },
    { path: "/success", element: <Success /> },
    { path: "/logout", element: <Logout /> },
];

export { authProtectedRoutes, publicRoutes };
